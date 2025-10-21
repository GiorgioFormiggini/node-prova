// Caricamento toast utility
(function(){
    var s = document.createElement('script');
    s.src = './js/toast.js';
    s.async = false;
    document.head.appendChild(s);
})();

// Gestione login rapido dalla landing page
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quick-login-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password })
            });
            const json = await res.json();
            if (res.ok && json.token) {
                localStorage.setItem('token', json.token);
                window.location.href = 'home.html';
            } else {
                showToast(json.message || 'Login fallito', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Errore di rete durante il login', 'error');
        }
    });
});