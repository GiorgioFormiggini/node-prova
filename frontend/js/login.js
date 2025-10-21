document.getElementById('login-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = e.target;
                const formData = Object.fromEntries(new FormData(form));
                // Send email and password to backend for server-side validation
                const payload = { email: formData.email, password: formData.password };

                try {
                    const res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const json = await res.json().catch(() => ({ success: false }));

                    if (res.ok && json.token) {
                        localStorage.setItem('token', json.token);
                        window.location.href = 'home.html';
                    } else {
                        showToast(json.message || 'Credenziali non valide', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Impossibile eseguire il login. Riprova.', 'error');
                }
            });