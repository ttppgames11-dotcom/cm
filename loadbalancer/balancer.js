// Connect Maratha Enterprise Layer-7 Reverse Proxy & High-Availability Load Balancer
// Distributes traffic across multiple backend instances with active health-checks and circuit breakers

import http from 'node:http';
import { URL } from 'node:url';

const LB_PORT = process.env.LB_PORT || 8080;

// Configurable backend target nodes
const TARGET_NODES = (process.env.BACKEND_NODES || 'http://127.0.0.1:5000,http://127.0.0.1:5001,http://127.0.0.1:5002')
  .split(',')
  .map(urlStr => {
    const parsed = new URL(urlStr.trim());
    return {
      url: parsed.origin,
      host: parsed.hostname,
      port: parseInt(parsed.port || (parsed.protocol === 'https:' ? '443' : '80'), 10),
      isHealthy: true,
      activeConnections: 0,
      totalRequests: 0,
      failedRequests: 0,
      lastLatencyMs: 0
    };
  });

// Balancing Algorithm: 'round-robin' | 'least-connections' | 'ip-hash'
const ALGORITHM = process.env.LB_ALGO || 'least-connections';

let roundRobinIndex = 0;

// Algorithm 1: Round Robin
function getNextRoundRobin() {
  const healthyNodes = TARGET_NODES.filter(n => n.isHealthy);
  if (healthyNodes.length === 0) return null;
  const node = healthyNodes[roundRobinIndex % healthyNodes.length];
  roundRobinIndex = (roundRobinIndex + 1) % healthyNodes.length;
  return node;
}

// Algorithm 2: Least Connections (Ideal for high concurrency)
function getNextLeastConnections() {
  const healthyNodes = TARGET_NODES.filter(n => n.isHealthy);
  if (healthyNodes.length === 0) return null;
  return healthyNodes.reduce((least, current) => 
    current.activeConnections < least.activeConnections ? current : least
  );
}

// Algorithm 3: IP Hash (Sticky session isolation)
function getNextIpHash(clientIp) {
  const healthyNodes = TARGET_NODES.filter(n => n.isHealthy);
  if (healthyNodes.length === 0) return null;
  let hash = 0;
  for (let i = 0; i < clientIp.length; i++) {
    hash = (hash << 5) - hash + clientIp.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % healthyNodes.length;
  return healthyNodes[idx];
}

function selectNode(clientIp) {
  if (ALGORITHM === 'least-connections') return getNextLeastConnections();
  if (ALGORITHM === 'ip-hash') return getNextIpHash(clientIp);
  return getNextRoundRobin();
}

// Background Health Checker & Circuit Breaker
function checkNodeHealth(node) {
  const startTime = Date.now();
  const req = http.get(`${node.url}/api/health`, { timeout: 3000 }, (res) => {
    node.lastLatencyMs = Date.now() - startTime;
    if (res.statusCode >= 200 && res.statusCode < 400) {
      if (!node.isHealthy) {
        console.log(`💚 [LoadBalancer] Node ${node.url} recovered and returned to active rotation.`);
      }
      node.isHealthy = true;
    } else {
      if (node.isHealthy) {
        console.warn(`💔 [LoadBalancer] Node ${node.url} responded with status ${res.statusCode}. Marking DOWN.`);
      }
      node.isHealthy = false;
    }
    res.resume();
  });

  req.on('error', (err) => {
    if (node.isHealthy) {
      console.warn(`💔 [LoadBalancer] Health check failed for ${node.url}: ${err.message}. Marking DOWN.`);
    }
    node.isHealthy = false;
  });

  req.on('timeout', () => {
    req.destroy();
    if (node.isHealthy) {
      console.warn(`💔 [LoadBalancer] Health check timed out for ${node.url}. Marking DOWN.`);
    }
    node.isHealthy = false;
  });
}

// Start periodic health checks every 10 seconds
setInterval(() => {
  TARGET_NODES.forEach(checkNodeHealth);
}, 10000).unref();

// Create Load Balancer Server
const server = http.createServer((req, res) => {
  const clientIp = req.headers['cf-connecting-ip'] || 
                   req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                   req.socket.remoteAddress || '127.0.0.1';

  // Status & Telemetry Dashboard Endpoint
  if (req.url === '/lb/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      loadBalancer: 'Connect Maratha High-Availability L7 Proxy',
      port: LB_PORT,
      algorithm: ALGORITHM,
      uptimeSeconds: Math.floor(process.uptime()),
      healthyNodesCount: TARGET_NODES.filter(n => n.isHealthy).length,
      totalNodesCount: TARGET_NODES.length,
      nodes: TARGET_NODES.map(n => ({
        url: n.url,
        isHealthy: n.isHealthy,
        activeConnections: n.activeConnections,
        totalRequests: n.totalRequests,
        failedRequests: n.failedRequests,
        lastLatencyMs: n.lastLatencyMs
      }))
    }, null, 2));
  }

  // Select target node
  const target = selectNode(clientIp);

  if (!target) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: false,
      error: 'सर्व्हर क्लस्टर सध्या अतिभारीत आहे किंवा बॅकएंड अनुपलब्ध आहे. (503 Service Unavailable: No healthy backend nodes)'
    }));
  }

  target.activeConnections++;
  target.totalRequests++;

  const proxyHeaders = {
    ...req.headers,
    'x-forwarded-for': clientIp,
    'x-forwarded-host': req.headers['host'] || '',
    'x-forwarded-proto': req.headers['x-forwarded-proto'] || 'http',
    'x-load-balancer': 'Connect-Maratha-L7-Proxy'
  };

  const proxyReq = http.request({
    hostname: target.host,
    port: target.port,
    path: req.url,
    method: req.method,
    headers: proxyHeaders,
    timeout: 30000
  }, (proxyRes) => {
    target.activeConnections = Math.max(0, target.activeConnections - 1);

    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    target.activeConnections = Math.max(0, target.activeConnections - 1);
    target.failedRequests++;
    console.error(`[LoadBalancer Proxy Error] Routing to ${target.url} failed:`, err.message);

    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'बॅकएंड गेटवे त्रुटी (Bad Gateway - Backend node connection error)',
        target: target.url
      }));
    }
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    target.activeConnections = Math.max(0, target.activeConnections - 1);
    target.failedRequests++;
    if (!res.headersSent) {
      res.writeHead(504, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'बॅकएंड गेटवे टाईमआऊट (Gateway Timeout)',
        target: target.url
      }));
    }
  });

  req.pipe(proxyReq);
});

// Start Load Balancer
if (process.env.NODE_ENV !== 'test') {
  server.listen(LB_PORT, () => {
    console.log(`\n======================================================`);
    console.log(`⚖️ CONNECT MARATHA L7 LOAD BALANCER RUNNING ON PORT ${LB_PORT}`);
    console.log(`======================================================`);
    console.log(`🎯 Routing Strategy: ${ALGORITHM.toUpperCase()}`);
    console.log(`🌐 Monitored Backends: ${TARGET_NODES.map(n => n.url).join(', ')}`);
    console.log(`📊 Live Telemetry URL: http://localhost:${LB_PORT}/lb/status`);
    console.log(`======================================================\n`);
  });
}

export default server;
