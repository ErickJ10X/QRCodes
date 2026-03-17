const { execSync } = require('child_process');

module.exports = async function () {
  execSync('bunx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env },
  });
};
