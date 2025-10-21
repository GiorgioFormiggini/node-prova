function getQueryParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    }

    function asDetails(obj) {
        // Support either top-level TMDB fields or nested details object
        if (!obj) return null;
        if (obj.details) return Object.assign({}, obj, obj.details);
        return obj;
    }

    async function isFavorite(tmdbId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;
            const res = await fetch('/api/movies/favorites', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) return false;
            const j = await res.json();
            if (!j.favorites) return false;
            return j.favorites.some(f => Number(f.tmdbId) === Number(tmdbId));
        } catch (e) { return false; }
    }

    async function toggleFavorite(tmdbId, title, btn) {
        const token = localStorage.getItem('token');
    if (!token) return showToast('Effettua il login per salvare i preferiti', 'warn');
        try {
            const res = await fetch('/api/movies/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ tmdbId: Number(tmdbId), title, isFavorite: true })
            });
            if (res.status === 409) {
                // already favorited
                showToast('Già aggiunto ai preferiti', 'warn');
                return null;
            }
            if (!res.ok) throw new Error('Errore salvataggio');
            const j = await res.json();
            btn.innerText = 'Aggiunto ai preferiti';
            btn.classList.remove('bg-primary');
            btn.classList.add('bg-green-600');
            btn.disabled = true;
            return j;
        } catch (err) {
            showToast('Impossibile salvare il preferito', 'error');
        }
    }

    async function loadMovie() {
        const id = getQueryParam('id');
        const container = document.getElementById('movie-details-container');
        if (!id) return container.innerText = 'ID film mancante';
        const res = await fetch(`/api/movies/${id}`);
        if (!res.ok) return container.innerText = 'Errore caricamento film';
        const json = await res.json();
        const d = asDetails(json);

        const genres = (d.genres && Array.isArray(d.genres)) ? d.genres.map(g => g.name || g).join(', ') : (d.genre_names || '—');
        const runtime = d.runtime ? `${d.runtime} min` : '—';
        const release_date = d.release_date || d.first_air_date || '—';
        const language = d.original_language || '—';
        const vote = d.vote_average ? `${d.vote_average} / 10` : '—';
        const vote_count = d.vote_count || 0;
        const popularity = d.popularity ? Number(d.popularity).toFixed(1) : '—';
        const poster = d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : './img/no-poster.png';
        const backdrop = d.backdrop_path ? `https://image.tmdb.org/t/p/w780${d.backdrop_path}` : '';

        container.innerHTML = `
            <div class="flex flex-col lg:flex-row gap-8 bg-card-bg p-6 sm:p-10 rounded-2xl shadow-2xl">
                <div class="lg:w-1/3">
                    <img src="${poster}" alt="Poster ${d.title || ''}" class="w-full rounded-xl shadow-lg" />
                </div>
                <div class="lg:w-2/3 space-y-4">
                    <h2 class="text-3xl font-bold">${d.title || d.name || 'Titolo non disponibile'}</h2>
                    <p class="text-gray-400">${d.tagline ? `<em>${d.tagline}</em>` : ''}</p>
                    <div class="flex flex-wrap items-center gap-3">
                        <span class="px-3 py-1 rounded-full bg-gray-800 text-sm">${release_date}</span>
                        <span class="px-3 py-1 rounded-full bg-gray-800 text-sm">${runtime}</span>
                        <span class="px-3 py-1 rounded-full bg-gray-800 text-sm">Lingua: ${language}</span>
                        <span class="px-3 py-1 rounded-full bg-amber-400 text-black text-sm">⭐ ${vote} (${vote_count})</span>
                        <span class="px-3 py-1 rounded-full bg-gray-700 text-sm">Pop: ${popularity}</span>
                    </div>

                    <p class="text-gray-300">${d.overview || 'Nessuna overview disponibile.'}</p>

                    <div class="flex gap-3">
                        <button id="fav-btn" class="bg-primary text-white px-4 py-2 rounded">Salva ai preferiti</button>
                        <button id="watched-btn" class="bg-gray-700 text-white px-4 py-2 rounded">Segna come visto</button>
                        <a href="home.html" class="bg-gray-700 text-white px-4 py-2 rounded">Torna</a>
                    </div>

                    <div class="mt-4 text-sm text-gray-400">
                        <strong>Generi:</strong> ${genres}
                    </div>
                </div>
            </div>`;

        const favBtn = document.getElementById('fav-btn');
        const watchedBtn = document.getElementById('watched-btn');
        const already = await isFavorite(id);
        if (already) {
            favBtn.innerText = 'Già nei preferiti';
            favBtn.classList.remove('bg-primary');
            favBtn.classList.add('bg-green-600');
            // keep it enabled so user can click and receive feedback
        }

        // helper: get current status (favorite / watched) for this user+movie
        async function getStatusAPI(tmdbId) {
            try {
                const token = localStorage.getItem('token');
                if (!token) return { isFavorite: false, isWatched: false };
                const res = await fetch(`/api/movies/status/${tmdbId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!res.ok) return { isFavorite: false, isWatched: false };
                const j = await res.json();
                return j.status || { isFavorite: false, isWatched: false };
            } catch (e) { return { isFavorite: false, isWatched: false }; }
        }

        // initialize watched button state with eye SVG + green when watched
        if (watchedBtn) {
            const st = await getStatusAPI(id);
            function setDetailWatchedVisual(el, watched) {
                if (watched) {
                    el.innerText = 'Visto';
                    el.classList.remove('bg-gray-700');
                    el.classList.add('bg-green-600','border-green-600','text-white');
                } else {
                    el.innerText = 'Segna come visto';
                    el.classList.remove('bg-green-600','border-green-600','text-white');
                    el.classList.add('bg-gray-700');
                }
            }

            setDetailWatchedVisual(watchedBtn, st.isWatched);

            watchedBtn.addEventListener('click', async () => {
                const token = localStorage.getItem('token');
                if (!token) return showToast('Effettua il login per segnare come visto', 'warn');
                const shouldMark = !(st.isWatched || watchedSet.has(Number(id)));

                // optimistic UI
                setDetailWatchedVisual(watchedBtn, shouldMark);

                try {
                    const res = await fetch('/api/movies/watched', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ tmdbId: Number(id), isWatched: shouldMark })
                    });
                    if (!res.ok) {
                        showToast('Impossibile aggiornare lo stato visto', 'error');
                        setDetailWatchedVisual(watchedBtn, !shouldMark);
                        return;
                    }
                    const j = await res.json();
                    if (j.success) {
                        if (shouldMark) { watchedSet.add(Number(id)); showToast('Film segnato come visto', 'success'); }
                        else { watchedSet.delete(Number(id)); showToast('Film marcato come non visto', 'info'); }
                        // keep local st in sync
                        st.isWatched = shouldMark;
                    } else {
                        setDetailWatchedVisual(watchedBtn, !shouldMark);
                        showToast('Impossibile aggiornare lo stato', 'error');
                    }
                } catch (err) {
                    showToast('Errore di rete', 'error');
                    setDetailWatchedVisual(watchedBtn, !shouldMark);
                }
            });
        }

        favBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            if (!token) return showToast('Effettua il login per salvare i preferiti', 'warn');
            if (await isFavorite(id)) {
                // show popup informing user it's already saved
                return showToast('Già aggiunto ai preferiti', 'warn');
            }
            await toggleFavorite(id, d.title || d.name, favBtn);
        });
    }

    loadMovie();
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
  