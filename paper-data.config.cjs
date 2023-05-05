module.exports = {
  apps: [
    {
      name: 'paper-data',
      script: './paper-data.js',
      args: 'schedule -p -m ./local/latest.min.json',
      combine_logs: true,
      out_file: '/logs/apps/paper-data.log',
      error_file: '/logs/apps/paper-data.err.log',
      time: true,
      autorestart: false,
    },
  ],
};
