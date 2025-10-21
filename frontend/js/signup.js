// form di registrazione
document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = Object.fromEntries(new FormData(form));
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: data.username, email: data.email, password: data.password })
            });
            const json = await res.json();
            if (res.ok) {
                // show popup
                document.getElementById('signup-popup').classList.remove('hidden');
            } else {
                showToast(json.message || 'Errore durante la registrazione', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Errore di rete durante la registrazione', 'error');
        }
    });

    // popup close
    document.getElementById('signup-popup-close').addEventListener('click', () => {
        document.getElementById('signup-popup').classList.add('hidden');
    });