async function syncOfflineTrips() {
    if (offlineTrips.length === 0) {
        console.log("No offline trips to sync");
        return;
    }

    console.log(`🔄 Syncing ${offlineTrips.length} offline trips...`);
    
    // Create deep copy ONCE at start
    const tripsToSync = JSON.parse(JSON.stringify(offlineTrips));
    let synced = 0;
    let failed = 0;

    for (let trip of tripsToSync) {
        try {
            const { offlineId, synced: _, createdAt, ...tripData } = trip;
            
            const result = await addTrip(tripData);

            if (result.success) {
                synced++;
                removeOfflineTrip(offlineId);
                logger.info(`Synced trip: ${tripData.passenger}`);
            } else {
                failed++;
                logger.warn(`Failed to sync trip: ${tripData.passenger}`);
            }
        } catch (err) {
            failed++;
            logger.error("Error syncing trip", err);
        }
    }

    if (synced > 0) {
        showNotification(`✅ Synced ${synced} trips!`, "success");
    }

    if (failed > 0) {
        showNotification(`⚠️ ${failed} trips failed. Will retry later.`, "warning");
    }

    // Refresh UI
    loadTrips();
    updateTotals();
}