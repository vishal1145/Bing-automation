const fs = require("fs");

function logSession(data) {
  const logLine = `[${new Date().toISOString()}] ${JSON.stringify(data)}\n`;
  fs.appendFileSync("sessions.log", logLine);
}

module.exports = { logSession };
