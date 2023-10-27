module.exports = {
  apps: [
    {
      name: 'paper-data',
      script: './paper-data.js',
      args: '-fpld local',
      combine_logs: true,
      out_file: '/logs/apps/paper-data.log',
      error_file: '/logs/apps/paper-data.err.log',
      time: true,
      autorestart: false,
    },
  ],
};
