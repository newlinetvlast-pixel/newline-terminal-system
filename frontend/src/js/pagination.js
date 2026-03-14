let currentPage = 1;
const itemsPerPage = 20;

async function loadPage(page = 1) {
    const offset = (page - 1) * itemsPerPage;
    const result = await getTrips(itemsPerPage, offset);
    
    if (result.success) {
        displayTripsTable(result.data);
        currentPage = page;
    }
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationDiv = document.getElementById("pagination");
    
    if (!paginationDiv || totalPages <= 1) return;
    
    let html = '<div class="pagination">';
    
    if (currentPage > 1) {
        html += `<button onclick="loadPage(${currentPage - 1})">← Previous</button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        html += `<button ${i === currentPage ? 'class="active"' : ''} onclick="loadPage(${i})">${i}</button>`;
    }
    
    if (currentPage < totalPages) {
        html += `<button onclick="loadPage(${currentPage + 1})