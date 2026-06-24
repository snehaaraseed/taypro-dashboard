module.exports = {
  apps: [
    {
      name: "taypro-dashboard",
      script: "server.js",
      cwd: "/var/www/taypro-dashboard/.next/standalone",
      // Use both vCPUs on t3.large (2 workers ≈ 2× SSR throughput).
      instances: 2,
      exec_mode: "cluster",
      // Load secrets from standalone copy; avoid baking vars into `pm2 save` dump.
      env_file: "/var/www/taypro-dashboard/.next/standalone/.env.production",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        NODE_OPTIONS: "--max-old-space-size=896",
      },
      error_file: "/var/log/pm2/taypro-dashboard-error.log",
      out_file: "/var/log/pm2/taypro-dashboard.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "1100M",
      watch: false,
    },
  ],
};
