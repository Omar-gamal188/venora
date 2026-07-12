// PM2 process file — run with: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "ecommerce-api",
      script: "src/index.js",
      instances: "max", // cluster mode: one worker per CPU
      exec_mode: "cluster",
      max_memory_restart: "512M",
      kill_timeout: 16000, // give graceful shutdown (15s) time to finish
      env: {
        NODE_ENV: "production",
      },
      out_file: "logs/pm2-out.log",
      error_file: "logs/pm2-error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
