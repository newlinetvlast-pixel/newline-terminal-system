class Logger {
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logMsg = `[${timestamp}] [${level}] ${message}`;
        
        if (data) {
            console.log(logMsg, data);
        } else {
            console.log(logMsg);
        }
    }

    info(msg, data) { this.log("INFO", msg, data); }
    warn(msg, data) { this.log("WARN", msg, data); }
    error(msg, data) { this.log("ERROR", msg, data); }
    debug(msg, data) { this.log("DEBUG", msg, data); }
}

module.exports = new Logger();