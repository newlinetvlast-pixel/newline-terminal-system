const REQUEST_TIMEOUT = 5000;

async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(error.error || error.errors?.[0] || response.statusText);
        }

        return response;
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === "AbortError") {
            throw new Error("Request timeout");
        }
        throw err;
    }
}

async function getTrips(limit = 100, offset = 0) {
    try {
        const res = await fetchWithTimeout(`${API_URL}/trips?limit=${limit}&offset=${offset}`);
        return await res.json();
    } catch (err) {
        logger.error("getTrips", err);
        return { success: false, data: [] };
    }
}

async function getTripById(id) {
    try {
        const res = await fetchWithTimeout(`${API_URL}/trips/${id}`);
        return await res.json();
    } catch (err) {
        logger.error("getTripById", err);
        return { success: false, data: null };
    }
}

async function addTrip(trip) {
    try {
        const res = await fetchWithTimeout(`${API_URL}/trips`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trip)
        });
        return await res.json();
    } catch (err) {
        logger.error("addTrip", err);
        return { success: false, error: err.message };
    }
}

async function updateTrip(id, data) {
    try {
        const res = await fetchWithTimeout(`${API_URL}/trips/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (err) {
        logger.error("updateTrip", err);
        return { success: false, error: err.message };
    }
}

async function deleteTrip(id) {
    try {
        const res = await fetchWithTimeout(`${API_URL}/trips/${id}`, {
            method: "DELETE"
        });
        return await res.json();
    } catch (err) {
        logger.error("deleteTrip", err);
        return { success: false, error: err.message };
    }
}

async function searchTrips(query) {
    try {
        const res = await fetchWithTimeout(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        return await res.json();
    } catch (err) {
        logger.error("searchTrips", err);
        return { success: false, data: [] };
    }
}

async function getStats() {
    try {
        const res = await fetchWithTimeout(`${API_URL}/stats`);
        return await res.json();
    } catch (err) {
        logger.error("getStats", err);
        return { success: false, data: { trips: 0, earnings: 0, average: 0 } };
    }
}

async function getDailyStats() {
    try {
        const res = await fetchWithTimeout(`${API_URL}/stats/daily`);
        return await res.json();
    } catch (err) {
        logger.error("getDailyStats", err);
        return { success: false, data: { trips: 0, earnings: 0 } };
    }
}

async function exportToCSV() {
    try {
        const res = await fetchWithTimeout(`${API_URL}/export/csv`);
        const blob = await res.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `trips-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showNotification("✅ Exported to CSV", "success");
    } catch (err) {
        logger.error("exportToCSV", err);
        showNotification("❌ Export failed", "error");
    }
}