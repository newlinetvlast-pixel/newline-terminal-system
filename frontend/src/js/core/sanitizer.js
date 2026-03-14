// ============ INPUT SANITIZER ============
class Sanitizer {
    static sanitizeName(name, maxLength = 50) {
        if (!name) return "";
        return String(name)
            .trim()
            .slice(0, maxLength)
            .replace(/[^a-zA-Z\s\-']/g, "");
    }

    static sanitizePassport(passport, maxLength = 20) {
        if (!passport) return "";
        return String(passport)
            .trim()
            .slice(0, maxLength)
            .toUpperCase()
            .replace(/[^A-Z0-9\-]/g, "");
    }

    static sanitizeNumber(num) {
        const n = parseFloat(num);
        return isNaN(n) ? 0 : n;
    }
}