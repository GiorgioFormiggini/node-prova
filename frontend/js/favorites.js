(function() {
            const token = localStorage.getItem('token');
            const loginLink = document.getElementById('login-link');
            const logoutBtn = document.getElementById('logout-button');
            if (token) {
                if (loginLink) loginLink.style.display = 'none';
                if (logoutBtn) logoutBtn.classList.remove('hidden');
            } else {
                if (loginLink) loginLink.style.display = '';
                if (logoutBtn) logoutBtn.classList.add('hidden');
            }
            if (logoutBtn) logoutBtn.addEventListener('click', () => { localStorage.removeItem('token'); location.reload(); });
        })();

async function loadFavorites() {
        const token = localStorage.getItem('token');
        if (!token) {
            document.getElementById('message-box').classList.remove('hidden');
            document.getElementById('message-box').innerText = 'Devi effettuare il login per vedere i preferiti.';
            return;
        }
        const res = await fetch('/api/movies/favorites', { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) return showToast('Errore caricamento preferiti', 'error');
        const json = await res.json();
        const list = document.getElementById('movie-list');
        list.innerHTML = '';
        (json.favorites || []).forEach(m => {
            const card = document.createElement('div');
            card.className = 'movie-card bg-card-bg rounded-xl overflow-hidden shadow-2xl';
            card.innerHTML = `
                <div class="p-4">
                  <h3 class="text-lg font-semibold">${m.title}</h3>
                  <p class="text-sm text-gray-400">TMDB ID: ${m.tmdbId}</p>
                                    <div class="mt-4 flex items-center gap-2">
                                        <button data-tmdb="${m.tmdbId}" class="remove-fav bg-red-600 text-white px-3 py-1 rounded">Rimuovi</button>
                                        <a class="ml-2 bg-gray-700 text-white px-3 py-1 rounded" href="movie.html?id=${m.tmdbId}">Dettagli</a>
                                        <button data-tmdb="${m.tmdbId}" title="Segna come visto" class="mark-watched ml-2 text-gray-300 bg-gray-800 px-3 py-1 min-w-[80px] rounded-md border-2 border-gray-700">Visto</button>
                                    </div>
                </div>`;
            list.appendChild(card);
        });

                // attach remove and watched handlers
                document.querySelectorAll('.remove-fav').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                                const id = e.target.dataset.tmdb;
                                const token = localStorage.getItem('token');
                                const r = await fetch(`/api/movies/favorites/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                                if (r.ok) { loadFavorites(); } else showToast('Errore rimuovendo preferito', 'error');
                        });
                });

                // Attach watched handlers and set initial label/icon from server state
                document.querySelectorAll('.mark-watched').forEach(btn => {
                        if (btn.dataset.boundWatched) return;
                        btn.dataset.boundWatched = '1';
                        const id = Number(btn.dataset.tmdb);

                        // initialize visual based on watchedSet cache (text-only)
                        if (watchedSet.has(id)) {
                            btn.innerText = 'Visto';
                            btn.classList.add('bg-green-600','border-green-600','text-white');
                            btn.classList.remove('bg-gray-800','border-gray-700','text-gray-300');
                        } else {
                            btn.innerText = 'Segna come visto';
                            btn.classList.remove('bg-green-600','border-green-600','text-white');
                            btn.classList.add('bg-gray-800','border-gray-700','text-gray-300');
                        }

                        btn.addEventListener('click', async (e) => {
                                const id = Number(e.currentTarget.dataset.tmdb);
                                const token = localStorage.getItem('token');
                                if (!token) return showToast('Effettua il login per segnare come visto', 'warn');
                                const shouldMark = !watchedSet.has(id);

                                // optimistic visual (text-only)
                                if (shouldMark) {
                                    e.currentTarget.innerText = 'Visto';
                                    e.currentTarget.classList.add('bg-green-600','border-green-600','text-white');
                                    e.currentTarget.classList.remove('bg-gray-800','border-gray-700','text-gray-300');
                                } else {
                                    e.currentTarget.innerText = 'Segna come visto';
                                    e.currentTarget.classList.remove('bg-green-600','border-green-600','text-white');
                                    e.currentTarget.classList.add('bg-gray-800','border-gray-700','text-gray-300');
                                }

                                try {
                                    const res = await fetch('/api/movies/watched', { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ tmdbId: id, isWatched: shouldMark }) });
                                    if (!res.ok) throw new Error('Impossibile aggiornare');
                                    const j = await res.json();
                                    if (j.success) {
                                        if (shouldMark) { watchedSet.add(id); showToast('Segnato come visto', 'success'); }
                                        else { watchedSet.delete(id); showToast('Segnato come non visto', 'info'); }
                                    } else {
                                        // rollback
                                        if (shouldMark) {
                                            e.currentTarget.innerText = 'Segna come visto';
                                            e.currentTarget.classList.remove('bg-green-600','border-green-600','text-white');
                                            e.currentTarget.classList.add('bg-gray-800','border-gray-700','text-gray-300');
                                        } else {
                                            e.currentTarget.innerText = 'Visto';
                                            e.currentTarget.classList.add('bg-green-600','border-green-600','text-white');
                                            e.currentTarget.classList.remove('bg-gray-800','border-gray-700','text-gray-300');
                                        }
                                        showToast('Impossibile aggiornare lo stato', 'error');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    // rollback
                                    if (shouldMark) {
                                        e.currentTarget.innerText = 'Segna come visto';
                                        e.currentTarget.classList.remove('bg-green-600','border-green-600','text-white');
                                        e.currentTarget.classList.add('bg-gray-800','border-gray-700','text-gray-300');
                                    } else {
                                        e.currentTarget.innerText = 'Visto';
                                        e.currentTarget.classList.add('bg-green-600','border-green-600','text-white');
                                        e.currentTarget.classList.remove('bg-gray-800','border-gray-700','text-gray-300');
                                    }
                                    showToast('Errore aggiornando visto', 'error');
                                }
                        });
                });

        document.querySelectorAll('.remove-fav').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.tmdb;
                const token = localStorage.getItem('token');
                const r = await fetch(`/api/movies/favorites/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                if (r.ok) { loadFavorites(); } else showToast('Errore rimuovendo preferito', 'error');
            });
        });
    }

loadFavorites();




