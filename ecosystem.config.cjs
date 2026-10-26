// PM2 Enterprise Production Ecosystem Configuration
// Connect Maratha High-Availability 1M User Cluster Setup

module.exports = {
  apps: [
    {
      name: 'connect-maratha-api',
      script: './backend/server.js',
      // Single instance: db.json and the sql.js SQLite file are held in process memory and
      // rewritten whole, so multiple instances would overwrite each other's data.
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000
      }
    },
    {
      name: 'connect-maratha-loadbalancer',
      script: './loadbalancer/balancer.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        LB_PORT: 8080,
        LB_ALGO: 'least-connections'
      }
    }
  ]
};
