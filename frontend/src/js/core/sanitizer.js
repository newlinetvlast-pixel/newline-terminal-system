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

    static sanitizeDestination(dest, maxLength = 100) {
        if (!dest) return "";
        return String(dest)
            .trim()
            .slice(0, maxLength);
    }

    static sanitizeNumber(num) {
        const n = parseFloat(num);
        return isNaN(n) ? 0 : n;
    }

    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    static isValidPhone(phone) {
        return /^[0-9]{7,15}$/.test(phone.replace(/\D/g, ''));
    }
}