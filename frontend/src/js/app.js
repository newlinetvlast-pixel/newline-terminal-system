async function loadTrips() {
    const result = await getTrips();
    const tbody = document.getElementById("tripsBody");
    const noTrips = document.getElementById("noTrips");
    if (!result.success || result.data.length === 0) {
        tbody.innerHTML = "";
        noTrips.style.display = "block";
        return;
    }
    noTrips.style.display = "none";
    tbody.innerHTML = result.data.map(trip => `
        <tr>
            <td>${trip.id}</td>
            <td>${escapeHtml(trip.passenger)}</td>
            <td>${escapeHtml(trip.passport)}</td>
            <td>${escapeHtml(trip.driver)}</td>
            <td>${escapeHtml(trip.destination)}</td>
            <td>${escapeHtml(trip.type)}</td>
            <td>${formatCurrency(trip.fare)}</td>
            <td>${formatDateTime(trip.date)}</td>
            <td><button onclick="deleteTripById(${trip.id})" style="background:#dc2626;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;">Delete</button></td>
        </tr>
    `).join("");
}

async function loadStats() {
    const result = await getDailyStats();
    const box = document.getElementById("totalCount");
    if (result.success) {
        box.innerHTML = `<h3>Today Earnings: <strong>${formatCurrency(result.data.earnings)}</strong></h3><p>${result.data.trips} trips completed</p>`;
    }
}

async function deleteTripById(id) {
    if (!confirm("Delete this trip?")) return;
    const result = await deleteTrip(id);
    if (result.success) {
        showNotification("Trip deleted!", "success");
        loadTrips();
        loadStats();
    } else {
        showNotification("Error deleting trip!", "error");
    }
}

loadTrips();
loadStats();