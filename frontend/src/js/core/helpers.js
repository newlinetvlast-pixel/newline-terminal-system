// helpers.js

// API base URL
const API_URL = "http://localhost:3000/api";

// Helper functions
export function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

export function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString();
}

export function showNotification(message) {
    alert(message);
}

// Export API_URL too
export { API_URL };