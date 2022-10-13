module.exports = {
  apps: [
    {
      name: 'paper-data',
      script: './paper-data.js',
      args: 'schedule -p',
      log_file: '/logs/apps/paper-data.log',
      time: true,
      autorestart: false,
    },
  ],
};
