// printer.js — handles printing tickets

async function printTicket(tripId) {
    try {
        const res = await fetch(`${API_URL}/trips/${tripId}`);
        const result = await res.json();
        
        if (!result.success) {
            console.error("Trip not found in database, checking offline storage...");
            showNotification("❌ Trip not yet saved to server", "error");
            return;
        }

        const trip = result.data;
        const content = generateTicketHTML(trip);
        const printWindow = window.open('', '', 'height=600,width=400');
        
        printWindow.document.write(content);
        printWindow.document.close();
        
        printWindow.onload = () => {
            printWindow.print();
        };

        setTimeout(() => {
            printWindow.close();
        }, 500);
    } catch (err) {
        console.error("Error printing ticket:", err);
        showNotification("❌ Failed to print ticket", "error");
    }
}
function generateTicketHTML(trip) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Terminal Receipt</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Courier New', monospace;
                    background: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 20px;
                }
                
                .receipt {
                    width: 300px;
                    border: 2px solid #333;
                    padding: 20px;
                    background: white;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                
                .receipt-header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 2px dashed #333;
                    padding-bottom: 10px;
                }
                
                .receipt-header h2 {
                    font-size: 18px;
                    margin-bottom: 5px;
                }
                
                .receipt-header p {
                    font-size: 12px;
                    color: #666;
                }
                
                .receipt-body {
                    margin-bottom: 20px;
                }
                
                .receipt-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: 12px;
                    border-bottom: 1px dotted #ccc;
                    padding-bottom: 8px;
                }
                
                .receipt-item-label {
                    font-weight: bold;
                    width: 40%;
                }
                
                .receipt-item-value {
                    text-align: right;
                    width: 60%;
                    word-break: break-word;
                }
                
                .receipt-fare {
                    display: flex;
                    justify-content: space-between;
                    margin: 15px 0;
                    padding: 10px;
                    background: #f0f0f0;
                    border-radius: 5px;
                    font-size: 14px;
                    font-weight: bold;
                }
                
                .receipt-footer {
                    text-align: center;
                    border-top: 2px dashed #333;
                    padding-top: 10px;
                    font-size: 11px;
                    color: #666;
                }
                
                @media print {
                    body {
                        padding: 0;
                        background: white;
                    }
                    .receipt {
                        box-shadow: none;
                        border-color: #000;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="receipt-header">
                    <h2>🎫 TERMINAL RECEIPT</h2>
                    <p>Trip Booking Confirmation</p>
                </div>
                
                <div class="receipt-body">
                    <div class="receipt-item">
                        <span class="receipt-item-label">Receipt ID:</span>
                        <span class="receipt-item-value">${trip.id}</span>
                    </div>
                    
                    <div class="receipt-item">
                        <span class="receipt-item-label">Passenger:</span>
                        <span class="receipt-item-value">${escapeHtml(trip.passenger)}</span>
                    </div>
                    
                    <div class="receipt-item">
                        <span class="receipt-item-label">Passport:</span>
                        <span class="receipt-item-value">${escapeHtml(trip.passport)}</span>
                    </div>
                    
                    <div class="receipt-item">
                        <span class="receipt-item-label">Driver:</span>
                        <span class="receipt-item-value">${escapeHtml(trip.driver)}</span>
                    </div>
                    
                    <div class="receipt-item">
                        <span class="receipt-item-label">Destination:</span>
                        <span class="receipt-item-value">${escapeHtml(trip.destination)}</span>
                    </div>
                    
                    <div class="receipt-item">
                        <span class="receipt-item-label">Trip Type:</span>
                        <span class="receipt-item-value">${escapeHtml(trip.type)}</span>
                    </div>
                    
                    <div class="receipt-item">
                        <span class="receipt-item-label">Date & Time:</span>
                        <span class="receipt-item-value">${formatDateTime(trip.date)}</span>
                    </div>
                    
                    <div class="receipt-fare">
                        <span>FARE AMOUNT:</span>
                        <span>${formatCurrency(trip.fare)}</span>
                    </div>
                </div>
                
                <div class="receipt-footer">
                    <p>✅ Trip Status: ${trip.status || 'Completed'}</p>
                    <p>Printed: ${new Date().toLocaleString()}</p>
                    <p style="margin-top: 10px; border-top: 1px dotted #ccc; padding-top: 10px;">
                        Thank you for using Terminal Booking System
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Print all trips (bulk)
async function printAllTrips() {
    const result = await getTrips();
    if (!result.success || result.data.length === 0) {
        showNotification("No trips to print", "error");
        return;
    }

    const trips = result.data;
    const printWindow = window.open('', '', 'height=800,width=900');
    
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>All Trips Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #667eea; color: white; padding: 10px; text-align: left; }
                td { border: 1px solid #ddd; padding: 8px; }
                tr:nth-child(even) { background: #f9f9f9; }
                @media print {
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <h1>📋 All Trips Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Total Trips: ${trips.length}</p>
            
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Passenger</th>
                        <th>Driver</th>
                        <th>Destination</th>
                        <th>Type</th>
                        <th>Fare</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    trips.forEach(trip => {
        html += `
                    <tr>
                        <td>${trip.id}</td>
                        <td>${escapeHtml(trip.passenger)}</td>
                        <td>${escapeHtml(trip.driver)}</td>
                        <td>${escapeHtml(trip.destination)}</td>
                        <td>${escapeHtml(trip.type)}</td>
                        <td>${formatCurrency(trip.fare)}</td>
                        <td>${formatDateTime(trip.date)}</td>
                    </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onload = () => {
        printWindow.print();
    };
}