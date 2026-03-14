async function printTicket(tripId) {
    try {
        const result = await getTripById(tripId);
        if (!result.success || !result.data) {
            showNotification("❌ Trip not found", "error");
            return;
        }

        const trip = result.data;
        const printWindow = window.open("", "", "width=600,height=400");

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Trip Receipt #${trip.id}</title>
                <style>
                    body { font-family: Arial; margin: 20px; }
                    .receipt { border: 1px solid #ccc; padding: 20px; max-width: 400px; }
                    h2 { text-align: center; }
                    .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <h2>🚕 Trip Receipt</h2>
                    <div class="item">
                        <span>Trip ID:</span>
                        <span>${trip.id}</span>
                    </div>
                    <div class="item">
                        <span>Passenger:</span>
                        <span>${escapeHtml(trip.passenger)}</span>
                    </div>
                    <div class="item">
                        <span>Driver:</span>
                        <span>${escapeHtml(trip.driver)}</span>
                    </div>
                    <div class="item">
                        <span>Destination:</span>
                        <span>${escapeHtml(trip.destination)}</span>
                    </div>
                    <div class="item">
                        <span>Type:</span>
                        <span>${escapeHtml(trip.type)}</span>
                    </div>
                    <div class="item">
                        <span>Date:</span>
                        <span>${formatDateTime(trip.date)}</span>
                    </div>
                    <div class="total">Fare: ${formatCurrency(trip.fare)}</div>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
        logger.info(`Printed ticket #${tripId}`);
        showNotification("✅ Printing...", "success");
    } catch (err) {
        logger.error("printTicket", err);
        showNotification("❌ Print failed", "error");
    }
}