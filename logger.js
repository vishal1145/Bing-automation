const fs = require("fs");

function logSession(data) {
  const logFile = "session_log.txt";
  const log = `[${new Date().toISOString()}] ${data}\n`;
  fs.appendFileSync(logFile, log);
}

module.exports = { logSession };
