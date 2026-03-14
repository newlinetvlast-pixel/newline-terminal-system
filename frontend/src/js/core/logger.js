// ============ SIMPLE LOGGER ============
class Logger {
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}] ${message}`, data || "");
    }

    info(msg, data) { this.log("INFO", msg, data); }
    warn(msg, data) { this.log("WARN", msg, data); }
    error(msg, data) { this.log("ERROR", msg, data); }
    debug(msg, data) { this.log("DEBUG", msg, data); }
}

const logger = new Logger();