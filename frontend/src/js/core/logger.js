class Logger {
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        if (data) {
            console.log(`[${timestamp}] [${level}] ${message}`, data);
        } else {
            console.log(`[${timestamp}] [${level}] ${message}`);
        }
    }

    info(msg, data) { this.log("INFO", msg, data); }
    warn(msg, data) { this.log("WARN", msg, data); }
    error(msg, data) { this.log("ERROR", msg, data); }
    debug(msg, data) { this.log("DEBUG", msg, data); }
}

const logger = new Logger();
