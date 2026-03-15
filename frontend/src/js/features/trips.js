function saveTrip() {
    const passenger = document.getElementById('passenger').value.trim();
    const passport = document.getElementById('passport').value.trim();
    const driver = document.getElementById('driver').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const type = document.getElementById('type').value;
    const fare = document.getElementById('fare').value;
    if (!passenger || !passport || !driver || !destination || !fare) {
        showNotification('Please fill in all fields!', 'error');
        return;
    }
    addTrip({ passenger, passport, driver, destination, type, fare })
        .then(result => {
            if (result.success) {
                showNotification('Trip saved!', 'success');
                clearForm();
                loadTrips();
                loadStats();
            } else {
                showNotification('Error: ' + result.error, 'error');
            }
        })
        .catch(() => showNotification('Error saving trip!', 'error'));
}
function clearForm() {
    document.getElementById('passenger').value = '';
    document.getElementById('passport').value = '';
    document.getElementById('driver').value = '';
    document.getElementById('destination').value = '';
    document.getElementById('fare').value = '';
    document.getElementById('type').selectedIndex = 0;
}
