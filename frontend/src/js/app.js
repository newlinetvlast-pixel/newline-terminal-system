// ============ MAIN APP ORCHESTRATION ============
// All utility functions are imported from their respective modules
// This file handles page initialization and event binding

console.log("✅ App initialized");

// ============ PAGE INITIALIZATION ============
window.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Page loaded, initializing app...");
    
    // Initialize offline sync
    initOfflineSync();
    
    // Load initial data
    loadTrips();
    updateTotals();
    
    // Bind event listeners
    bindEventListeners();
    
    // Auto-refresh trips every 2 minutes
    setInterval(() => {
        loadTrips();
        updateTotals();
    }, 120000);
});

// ============ EVENT BINDING ============
function bindEventListeners() {
    // Search with debounce
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", debounce(filterTrips, 500));
    }

    // Save trip on form submit
    const tripForm = document.getElementById("tripForm");
    if (tripForm) {
        tripForm.addEventListener("submit", (e) => {
            e.preventDefault();
            saveTrip();
        });
    }

    // Scan button
    const scanBtn = document.getElementById("scanBtn");
    if (scanBtn) {
        scanBtn.addEventListener("click", scanPassport);
    }
}

// ============ LOAD TRIPS ============
async function loadTrips() {
    try {
        const result = await getTrips(100, 0);
        if (!result.success) {
            console.error("Failed to load trips");
            return;
        }

        displayTripsTable(result.data);
    } catch (err) {
        console.error("Error loading trips:", err);
        showNotification("❌ Failed to load trips", "error");
    }
}

// ============ DISPLAY TRIPS IN TABLE ============
function displayTripsTable(trips) {
    const tbody = document.getElementById("tripsBody");
    const noTripsMsg = document.getElementById("noTrips");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!trips || trips.length === 0) {
        noTripsMsg.style.display = "block";
        return;
    }

    noTripsMsg.style.display = "none";

    // Use DocumentFragment for efficient DOM insertion
    const fragment = document.createDocumentFragment();

    trips.forEach(trip => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td data-label="ID">${trip.id}</td>
            <td data-label="Passenger">${escapeHtml(trip.passenger)}</td>
            <td data-label="Passport">${escapeHtml(trip.passport)}</td>
            <td data-label="Driver">${escapeHtml(trip.driver)}</td>
            <td data-label="Destination">${escapeHtml(trip.destination)}</td>
            <td data-label="Type"><span class="badge badge-${trip.type.toLowerCase().replace(/ /g, '-')}">${escapeHtml(trip.type)}</span></td>
            <td data-label="Fare">${formatCurrency(trip.fare)}</td>
            <td data-label="Date">${formatDateTime(trip.date)}</td>
            <td data-label="Actions">
                <button class="btn-danger" onclick="deleteTripHandler(${trip.id})" title="Delete trip">🗑️</button>
                <button class="btn-info" onclick="printTicket(${trip.id})" title="Print receipt">🖨️</button>
            </td>
        `;
        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
}

// ============ SAVE TRIP ============
async function saveTrip() {
    const validatedData = validateTripForm();
    if (!validatedData) return;

    try {
        if (!navigator.onLine) {
            // Save offline
            const offlineTrip = saveTripOffline(validatedData);
            showNotification("📴 Saved offline. Will sync when online.", "warning");
            clearForm();
            return;
        }

        // Save to server
        const result = await addTrip(validatedData);
        
        if (result.success) {
            showNotification(`✅ Trip saved! ID: ${result.data.id}`, "success");
            clearForm();
            loadTrips();
            updateTotals();
        } else {
            showNotification(`❌ ${result.error}`, "error");
        }
    } catch (err) {
        console.error("Error saving trip:", err);
        showNotification("❌ Failed to save trip", "error");
    }
}

// ============ DELETE TRIP ============
async function deleteTripHandler(id) {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
        const result = await deleteTrip(id);
        
        if (result.success) {
            showNotification("✅ Trip deleted", "success");
            loadTrips();
            updateTotals();
        } else {
            showNotification(`❌ ${result.error}`, "error");
        }
    } catch (err) {
        console.error("Error deleting trip:", err);
        showNotification("❌ Failed to delete trip", "error");
    }
}

// ============ FILTER/SEARCH TRIPS ============
async function filterTrips() {
    const q = document.getElementById("searchInput")?.value?.trim() || "";

    if (!q) {
        loadTrips();
        return;
    }

    try {
        const result = await searchTrips(q);
        
        if (result.success) {
            displayTripsTable(result.data);
        } else {
            showNotification("❌ Search failed", "error");
        }
    } catch (err) {
        console.error("Error searching trips:", err);
        showNotification("❌ Search error", "error");
    }
}

// ============ UPDATE TOTALS ============
async function updateTotals() {
    try {
        const result = await getStats();
        
        if (result.success) {
            const { trips, earnings } = result.data;
            const totalCountBox = document.getElementById("totalCount");
            
            if (totalCountBox) {
                totalCountBox.innerHTML = `
                    <h3>Today's Earnings: <strong>${formatCurrency(earnings)}</strong></h3>
                    <p>${trips} trips completed</p>
                `;
            }
        }
    } catch (err) {
        console.error("Error updating totals:", err);
    }
}

// ============ VALIDATE TRIP FORM ============
function validateTripForm() {
    const passenger = document.getElementById("passenger")?.value?.trim() || "";
    const passport = document.getElementById("passport")?.value?.trim() || "";
    const driver = document.getElementById("driver")?.value?.trim() || "";
    const destination = document.getElementById("destination")?.value?.trim() || "";
    const type = document.getElementById("type")?.value || "Local";
    const fare = document.getElementById("fare")?.value?.trim() || "";

    const errors = [];

    // Validate passenger
    if (!passenger || passenger.length < 2) {
        errors.push("❌ Passenger name must be at least 2 characters");
    }
    if (passenger.length > 50) {
        errors.push("❌ Passenger name too long (max 50)");
    }
    if (!/^[a-zA-Z\s\-']+$/.test(passenger)) {
        errors.push("❌ Passenger name contains invalid characters");
    }

    // Validate passport
    if (!passport || passport.length < 3) {
        errors.push("❌ Valid passport required");
    }
    if (passport.length > 20) {
        errors.push("❌ Passport too long (max 20)");
    }

    // Validate driver
    if (!driver || driver.length < 2) {
        errors.push("❌ Driver name must be at least 2 characters");
    }
    if (!/^[a-zA-Z\s\-']+$/.test(driver)) {
        errors.push("❌ Driver name contains invalid characters");
    }

    // Validate destination
    if (!destination || destination.length < 2) {
        errors.push("❌ Destination required (min 2 chars)");
    }
    if (destination.length > 100) {
        errors.push("❌ Destination too long (max 100)");
    }

    // Validate fare
    const fareNum = parseFloat(fare);
    if (!fare || isNaN(fareNum) || fareNum <= 0) {
        errors.push("❌ Valid fare required (> 0)");
    }
    if (fareNum > 999999) {
        errors.push("❌ Fare too high");
    }

    if (errors.length > 0) {
        errors.forEach(err => showNotification(err, "error"));
        return null;
    }

    return {
        passenger,
        passport,
        driver,
        destination,
        type,
        fare: parseFloat(fare)
    };
}

// ============ CLEAR FORM ============
function clearForm() {
    document.getElementById("passenger").value = "";
    document.getElementById("passport").value = "";
    document.getElementById("driver").value = "";
    document.getElementById("destination").value = "";
    document.getElementById("type").value = "Local";
    document.getElementById("fare").value = "";
}