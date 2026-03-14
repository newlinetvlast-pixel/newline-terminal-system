// ============ API CONFIGURATION ============
const API_URL = "http://localhost:3000/api";

// ============ ESCAPE HTML ============
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
}

// ============ FORMAT CURRENCY ============
function formatCurrency(amount) {
    if (!amount && amount !== 0) return "0.00 KD";
    return `${parseFloat(amount).toFixed(2)} KD`;
}

// ============ FORMAT DATE TIME ============
function formatDateTime(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ============ FORMAT DATE ============
function formatDate(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// ============ SHOW NOTIFICATION ============
function showNotification(msg, type = "info") {
    const notif = document.createElement("div");
    notif.className = `notification notification-${type}`;
    notif.textContent = msg;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;

    const colors = {
        success: "#059669",
        error: "#dc2626",
        warning: "#ea580c",
        info: "#0891b2"
    };

    notif.style.backgroundColor = colors[type] || colors.info;
    document.body.insertBefore(notif, document.body.firstChild);

    setTimeout(() => notif.remove(), 4000);
}

// ============ DEBOUNCE ============
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============ DOWNLOAD JSON ============
function downloadJSON(data, filename = "data.json") {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============ LOCAL STORAGE HELPERS ============
function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
        logger.error("Error reading localStorage", err);
        return defaultValue;
    }
}

function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (err) {
        logger.error("Error writing localStorage", err);
        return false;
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (err) {
        logger.error("Error removing from localStorage", err);
        return false;
    }
}