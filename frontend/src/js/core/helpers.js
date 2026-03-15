
// HTML Escape
function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
}

// Format Currency (Kuwaiti Dinar)
function formatCurrency(amount) {
    if (!amount && amount !== 0) return "0.00 KD";
    return `${parseFloat(amount).toFixed(2)} KD`;
}

// Format Date Time
function formatDateTime(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Show Notification
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

// Debounce
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
