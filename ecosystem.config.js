// File: ecosystem.config.js

module.exports = {
    apps: [
      {
        name: 'markdown-to-gdoc',
        script: 'src/server.js',
        instances: 'max',
        exec_mode: 'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
          NODE_ENV: 'development'
        },
        env_production: {
          NODE_ENV: 'production'
        },
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true,
        error_file: 'logs/pm2-error.log',
        out_file: 'logs/pm2-out.log',
        time: true
      }
    ]
  };