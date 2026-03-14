const OFFLINE_STORAGE_KEY = "offlineTrips";
let offlineTrips = [];

// Initialize offline trips
function initOfflineSync() {
    try {
        offlineTrips = JSON.parse(localStorage.getItem(OFFLINE_STORAGE_KEY) || "[]");
        logger.info(`✅ Loaded ${offlineTrips.length} offline trips`);
    } catch (err) {
        logger.error("initOfflineSync", err);
        offlineTrips = [];
    }
}

// Save trip offline
function saveTripOffline(trip) {
    try {
        const tripWithId = {
            ...trip,
            offlineId: Date.now(),
            synced: false,
            createdAt: new Date().toISOString()
        };
        offlineTrips.push(tripWithId);
        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(offlineTrips));
        logger.info(`✅ Trip saved offline. Total: ${offlineTrips.length}`);
        return tripWithId;
    } catch (err) {
        logger.error("saveTripOffline", err);
        return null;
    }
}

// Get offline trips
function getOfflineTrips() {
    return offlineTrips;
}

// Remove offline trip
function removeOfflineTrip(offlineId) {
    try {
        offlineTrips = offlineTrips.filter(t => t.offlineId !== offlineId);
        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(offlineTrips));
        logger.info(`✅ Offline trip removed. Remaining: ${offlineTrips.length}`);
    } catch (err) {
        logger.error("removeOfflineTrip", err);
    }
}

// Sync offline trips
async function syncOfflineTrips() {
    if (offlineTrips.length === 0) {
        logger.info("No offline trips to sync");
        return;
    }

    logger.info(`🔄 Syncing ${offlineTrips.length} offline trips...`);

    // Create deep copy
    const tripsToSync = JSON.parse(JSON.stringify(offlineTrips));
    let synced = 0;
    let failed = 0;

    for (let trip of tripsToSync) {
        try {
            const { offlineId, createdAt, ...tripData } = trip;

            const result = await addTrip(tripData);

            if (result.success) {
                synced++;
                removeOfflineTrip(offlineId);
                logger.info(`Synced: ${tripData.passenger}`);
            } else {
                failed++;
                logger.warn(`Failed: ${tripData.passenger}`);
            }
        } catch (err) {
            failed++;
            logger.error("syncOfflineTrips", err);
        }
    }

    if (synced > 0) {
        showNotification(`✅ Synced ${synced} trips!`, "success");
    }
    if (failed > 0) {
        showNotification(`⚠️ ${failed} trips failed. Will retry later.`, "warning");
    }

    loadTrips();
    updateTotals();
}

// Listen for online/offline
window.addEventListener("online", () => {
    logger.info("🌐 Back online!");
    showNotification("🌐 Back online - syncing...", "info");
    setTimeout(() => syncOfflineTrips(), 1000);
});

window.addEventListener("offline", () => {
    logger.info("📴 Offline!");
    showNotification("📴 Offline - data saved locally", "warning");
});

// Initialize on load
window.addEventListener("DOMContentLoaded", () => {
    initOfflineSync();
    if (navigator.onLine && offlineTrips.length > 0) {
        setTimeout(() => syncOfflineTrips(), 2000);
    }
});