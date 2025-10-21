async function fetchPopular() {
        try {
            const r = await fetch('/api/movies/popular');
            if (!r.ok) return console.error('Errore fetching popular');
            const data = await r.json();
            const list = document.getElementById('movie-list');
            list.innerHTML = '';
            (data.results || []).forEach(m => {
                const card = document.createElement('div');
                card.className = 'movie-card bg-card-bg rounded-xl overflow-hidden shadow-2xl transition duration-500 hover:scale-[1.03] hover:shadow-primary/50 cursor-pointer';
                card.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w500${m.poster_path}" alt="${m.title}" class="w-full h-64 object-cover" />
                    <div class="p-4">
                      <h3 class="text-lg font-semibold">${m.title}</h3>
                      <p class="text-sm text-gray-400">${m.release_date || ''}</p>
                      <div class="flex justify-between mt-2 items-center">
                        <div class="flex gap-2">
                          <button data-tmdb="${m.id}" class="add-fav bg-primary text-white px-3 py-1 rounded">Aggiungi</button>
                          <button data-tmdb="${m.id}" class="show-details bg-gray-700 text-white px-3 py-1 rounded">Dettagli</button>
                        </div>
                        <button data-tmdb="${m.id}" title="Segna come visto" class="mark-watched text-gray-300 bg-gray-800 px-3 py-1 min-w-[80px] rounded-md border-2 border-gray-700">Visto</button>
                      </div>
                    </div>`;
                list.appendChild(card);
            });

            // attach handlers (will be re-run after populating list)
            attachAddFavHandlers();
            attachMarkWatchedHandlers();

        } catch (err) { console.error(err); }
    }

    document.getElementById('search-input').addEventListener('keyup', async (e) => {
        if (e.key !== 'Enter') return;
        const q = e.target.value.trim();
        if (!q) return fetchPopular();
        const r = await fetch(`/api/movies/search?q=${encodeURIComponent(q)}`);
        const data = await r.json();
        const list = document.getElementById('movie-list');
        list.innerHTML = '';
    (data.results || []).forEach(m => {
            const card = document.createElement('div');
            card.className = 'movie-card bg-card-bg rounded-xl overflow-hidden shadow-2xl transition duration-500 hover:scale-[1.03] hover:shadow-primary/50 cursor-pointer';
            card.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${m.poster_path}" alt="${m.title}" class="w-full h-64 object-cover" />
                <div class="p-4">
                  <h3 class="text-lg font-semibold">${m.title}</h3>
                  <p class="text-sm text-gray-400">${m.release_date || ''}</p>
                  <div class="flex justify-between mt-2 items-center">
                    <div class="flex gap-2">
                      <button data-tmdb="${m.id}" class="add-fav bg-primary text-white px-3 py-1 rounded">Aggiungi</button>
                      <button data-tmdb="${m.id}" class="show-details bg-gray-700 text-white px-3 py-1 rounded">Dettagli</button>
                    </div>
                    <button data-tmdb="${m.id}" title="Segna come visto" class="mark-watched text-gray-300 bg-gray-800 px-2 py-1 rounded-md">Visto</button>
                  </div>
                </div>`;
            list.appendChild(card);
        });
    });

        // Load popular on start
            // cache of user's favorite tmdbIds
            const favoriteSet = new Set();
            // cache of user's watched tmdbIds
            const watchedSet = new Set();

            async function loadUserFavoritesToCache() {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return; // no cache for anonymous
                    const res = await fetch('/api/movies/favorites', { headers: { 'Authorization': `Bearer ${token}` } });
                    if (!res.ok) return;
                    const j = await res.json();
                    (j.favorites || []).forEach(f => favoriteSet.add(Number(f.tmdbId)));
                } catch (e) { console.error('fav cache load', e); }
            }

            async function loadUserWatchedToCache() {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;
                    const res = await fetch('/api/movies/watched', { headers: { 'Authorization': `Bearer ${token}` } });
                    if (!res.ok) return;
                    const j = await res.json();
                    (j.watched || []).forEach(f => watchedSet.add(Number(f.tmdbId)));
                } catch (e) { console.error('watched cache load', e); }
            }

            function attachAddFavHandlers() {
                document.querySelectorAll('.add-fav').forEach(btn => {
                    if (btn.dataset.bound) return;
                    btn.dataset.bound = '1';
                    btn.addEventListener('click', async (e) => {
                        const id = Number(e.target.dataset.tmdb);
                        const token = localStorage.getItem('token');
                        if (!token) return showToast('Effettua il login per salvare i preferiti', 'warn');
                        // immediate client-side check
                        if (favoriteSet.has(id)) return showToast('Già aggiunto ai preferiti', 'warn');
                        // proceed with POST
                        const res = await fetch('/api/movies/favorites', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ tmdbId: id, title: e.target.closest('.movie-card').querySelector('h3').innerText, isFavorite: true })
                        });
                        if (res.status === 409) {
                            // server says duplicate; update cache and inform user
                            favoriteSet.add(id);
                            return showToast('Già aggiunto ai preferiti', 'warn');
                        }
                        const json = await res.json();
                        if (json.success) {
                            favoriteSet.add(id);
                            showToast('Aggiunto ai preferiti', 'success');
                        } else showToast('Errore', 'error');
                    });
                });
            }

            function attachMarkWatchedHandlers() {
                document.querySelectorAll('.mark-watched').forEach(btn => {
                    if (btn.dataset.boundWatched) return;
                    btn.dataset.boundWatched = '1';
                    // set initial state and label/icon based on cache
                    const id = Number(btn.dataset.tmdb);
                    const eyeSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;

                    function setWatchedVisual(el, watched) {
                            if (watched) {
                                el.innerText = 'Visto';
                                el.classList.add('bg-green-600','border-green-600','text-white');
                                el.classList.remove('bg-gray-800','border-gray-700','text-gray-300');
                            } else {
                                el.innerText = 'Segna come visto';
                                el.classList.remove('bg-green-600','border-green-600','text-white');
                                el.classList.add('bg-gray-800','border-gray-700','text-gray-300');
                            }
                    }

                    setWatchedVisual(btn, watchedSet.has(id));

                    btn.addEventListener('click', async (e) => {
                        const id = Number(e.currentTarget.dataset.tmdb);
                        const token = localStorage.getItem('token');
                        if (!token) return showToast('Effettua il login per segnare come visto', 'warn');
                        const shouldMark = !watchedSet.has(id);

                        // optimistic UI
                        setWatchedVisual(e.currentTarget, shouldMark);

                        try {
                            const res = await fetch('/api/movies/watched', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ tmdbId: id, isWatched: shouldMark })
                            });
                            if (!res.ok) throw new Error('Errore update watched');
                            const j = await res.json();
                            if (j.success) {
                                if (shouldMark) { watchedSet.add(id); showToast('Segnato come visto', 'success'); }
                                else { watchedSet.delete(id); showToast('Segnato come non visto', 'info'); }
                            } else {
                                // rollback
                                setWatchedVisual(e.currentTarget, !shouldMark);
                                showToast('Impossibile aggiornare lo stato', 'error');
                            }
                        } catch (err) {
                            console.error(err);
                            // rollback
                            setWatchedVisual(e.currentTarget, !shouldMark);
                            showToast('Errore di rete', 'error');
                        }
                    });
                });
            }

            // initialize caches then load popular
            (async () => { await loadUserFavoritesToCache(); await loadUserWatchedToCache(); fetchPopular(); })();

        // Toggle login/logout UI
        (function() {
            const token = localStorage.getItem('token');
            const loginLink = document.getElementById('login-link');
            const logoutBtn = document.getElementById('logout-button');
            const welcome = document.getElementById('welcome-msg');
            function parseJwt(t) {
                try {
                    const payload = t.split('.')[1];
                    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
                    return JSON.parse(decodeURIComponent(escape(json)));
                } catch (e) { return null; }
            }
            if (token) {
                if (loginLink) loginLink.style.display = 'none';
                if (logoutBtn) logoutBtn.classList.remove('hidden');
                const p = parseJwt(token);
                if (p && (p.username || p.email)) {
                    welcome.textContent = `Benvenuto, ${p.username || p.email}!`;
                } else {
                    welcome.textContent = '';
                }
            } else {
                if (loginLink) loginLink.style.display = '';
                if (logoutBtn) logoutBtn.classList.add('hidden');
                if (welcome) welcome.textContent = '';
            }
            if (logoutBtn) logoutBtn.addEventListener('click', () => { localStorage.removeItem('token'); location.reload(); });
        })();

        // Insert modal container
        const modalHtml = `
            <div id="details-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-60">
                <div class="max-w-4xl w-full bg-card-bg rounded-2xl p-6 relative">
                    <button id="details-close" class="absolute right-4 top-4 bg-gray-700 text-white px-3 py-1 rounded">Chiudi</button>
                    <div id="details-content" class="mt-4"></div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        async function showMovieDetails(tmdbId) {
            try {
                const r = await fetch(`/api/movies/${tmdbId}`);
                if (!r.ok) return showToast('Impossibile caricare i dettagli', 'error');
                const movie = await r.json();
                const c = document.getElementById('details-content');
                c.innerHTML = `
                    <div class="flex gap-6">
                        <div class="w-1/3">
                            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path || movie.details?.poster_path || ''}" class="w-full rounded" />
                        </div>
                        <div class="w-2/3">
                            <h2 class="text-2xl font-bold mb-2">${movie.title || movie.details?.title || ''}</h2>
                            <p class="text-gray-300 mb-4">${movie.details?.overview || movie.overview || ''}</p>
                            <p class="text-sm text-gray-400">Release: ${movie.release_date || movie.details?.release_date || ''}</p>
                            <p class="mt-3">Runtime: ${movie.details?.runtime || 'N/A'} min</p>
                            <p class="mt-3">Rating: ${movie.vote_average || movie.details?.vote_average || 'N/A'}</p>
                        </div>
                    </div>`;
                const modal = document.getElementById('details-modal');
                modal.classList.remove('hidden');
                document.getElementById('details-close').onclick = () => modal.classList.add('hidden');
            } catch (err) { console.error(err); showToast('Errore di rete', 'error'); }
        }

        // Delegate click events (re-run attach after populating list)
        const observer = new MutationObserver(() => {
            document.querySelectorAll('.show-details').forEach(btn => {
                if (btn.dataset.bound) return;
                btn.dataset.bound = '1';
                btn.addEventListener('click', (e) => showMovieDetails(e.target.dataset.tmdb));
            });
        });
        observer.observe(document.getElementById('movie-list'), { childList: true, subtree: true });
        