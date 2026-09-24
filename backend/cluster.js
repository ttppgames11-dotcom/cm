// Connect Maratha Multi-Core High-Throughput Cluster Master
// Scales backend across all CPU cores for 10,00,000+ concurrent user traffic

import cluster from 'node:cluster';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NUM_WORKERS = process.env.CLUSTER_WORKERS ? parseInt(process.env.CLUSTER_WORKERS, 10) : os.cpus().length;

if (cluster.isPrimary || cluster.isMaster) {
  console.log(`\n======================================================`);
  console.log(`👑 CONNECT MARATHA ENTERPRISE CLUSTER MASTER STARTED`);
  console.log(`======================================================`);
  console.log(`⚙️ Master PID: ${process.pid}`);
  console.log(`🚀 Detected CPU Cores: ${os.cpus().length}`);
  console.log(`⚡ Spawning ${NUM_WORKERS} Worker Processes for High-Concurrency Handling...`);
  console.log(`======================================================\n`);

  const workerRestartCount = new Map();

  // Fork worker processes
  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = cluster.fork({ WORKER_ID: i + 1 });
    workerRestartCount.set(worker.id, 0);
  }

  // Handle worker lifecycle & zero-downtime auto-respawn
  cluster.on('online', (worker) => {
    console.log(`✅ [Cluster] Worker #${worker.id} (PID: ${worker.process.pid}) is ONLINE and accepting connections.`);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️ [Cluster Alert] Worker #${worker.id} (PID: ${worker.process.pid}) exited (Code: ${code}, Signal: ${signal}).`);

    const restarts = (workerRestartCount.get(worker.id) || 0) + 1;
    workerRestartCount.set(worker.id, restarts);

    if (restarts <= 10) {
      console.log(`🔄 [Cluster] Auto-spawning replacement worker in 200ms... (Restart count: ${restarts})`);
      setTimeout(() => {
        const newWorker = cluster.fork({ WORKER_ID: worker.id });
        workerRestartCount.set(newWorker.id, restarts);
      }, 200);
    } else {
      console.error(`🚨 [Cluster Critical] Worker #${worker.id} exceeded maximum restart attempts!`);
    }
  });

  // Graceful rolling shutdown
  const shutdown = (sig) => {
    console.log(`\n🛑 [Cluster] Received ${sig}. Initiating graceful shutdown of all workers...`);
    for (const id in cluster.workers) {
      cluster.workers[id].process.kill(sig);
    }
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

} else {
  // Worker process runs the Express API server
  import('./server.js')
    .then(() => {
      console.log(`🚀 [Worker #${cluster.worker.id}] Express server bound and processing traffic.`);
    })
    .catch((err) => {
      console.error(`❌ [Worker #${cluster.worker.id}] Failed to start Express server:`, err);
      process.exit(1);
    });
}
