// Gestione logout
document.addEventListener('DOMContentLoaded', () => {
    const logout = document.getElementById('logout-button');
    if (!logout) return;
    logout.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
});