// Cache preferiti e film visti
const favoriteSet = new Set();
const watchedSet = new Set();

// Caricamento film popolari
async function fetchPopular() {
    const r = await fetch('/api/movies/popular');
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
                  <button data-tmdbid="${m.id}" class="details-button bg-blue-600 text-white px-3 py-1 rounded">Dettagli</button>
                </div>
                <button data-tmdb="${m.id}" title="Segna come visto" class="mark-watched text-gray-300 bg-gray-800 px-3 py-1 min-w-[80px] rounded-md border-2 border-gray-700">Visto</button>
              </div>
            </div>`;
        list.appendChild(card);
    });
    attachAddFavHandlers();
    attachMarkWatchedHandlers();
    attachDetailsButtonHandlers();
}

// Ricerca film
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
                  <button data-tmdbid="${m.id}" class="details-button bg-blue-600 text-white px-3 py-1 rounded">Dettagli</button>
                </div>
                <button data-tmdb="${m.id}" title="Segna come visto" class="mark-watched text-gray-300 bg-gray-800 px-2 py-1 rounded-md">Visto</button>
              </div>
            </div>`;
        list.appendChild(card);
    });
    attachAddFavHandlers();
    attachMarkWatchedHandlers();
    attachDetailsButtonHandlers();
});

// Caricamento preferiti utente
async function loadUserFavoritesToCache() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/movies/favorites', { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) return;
    const j = await res.json();
    (j.favorites || []).forEach(f => favoriteSet.add(Number(f.tmdbId)));
}

// Caricamento film visti utente
async function loadUserWatchedToCache() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/movies/watched', { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) return;
    const j = await res.json();
    (j.watched || []).forEach(f => watchedSet.add(Number(f.tmdbId)));
}

// Handler aggiungi ai preferiti
function attachAddFavHandlers() {
    document.querySelectorAll('.add-fav').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', async (e) => {
        const id = Number(e.target.dataset.tmdb);
        const token = localStorage.getItem('token');
        if (!token) return alert('Effettua il login per salvare i preferiti');
        
        const res = await fetch('/api/movies/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ tmdbId: id, title: e.target.closest('.movie-card').querySelector('h3').innerText, isFavorite: true })
        });
        const json = await res.json();
        
        if (res.ok && json.success) {
            favoriteSet.add(id);
        }
    });
});
}

function attachDetailsButtonHandlers() {
     document.querySelectorAll('.details-button').forEach(btn => {
         if (btn.dataset.boundDetails) return;
         btn.dataset.boundDetails = '1';
         btn.addEventListener('click', (e) => {
             const tmdbId = e.target.dataset.tmdbid;
             showMovieDetails(tmdbId);
         });
     });
 }

// Handler segna come visto
function attachMarkWatchedHandlers() {
    document.querySelectorAll('.mark-watched').forEach(btn => {
        if (btn.dataset.boundWatched) return;
        btn.dataset.boundWatched = '1';
        const id = Number(btn.dataset.tmdb);

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
            if (!token) return alert('Effettua il login per segnare come visto');
            const shouldMark = !watchedSet.has(id);
            setWatchedVisual(e.currentTarget, shouldMark);

            const res = await fetch('/api/movies/watched', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ tmdbId: id, isWatched: shouldMark })
            });
            const j = await res.json();
            
            if (j.success) {
                if (shouldMark) { watchedSet.add(id); }
                else { watchedSet.delete(id); }
            } else {
                setWatchedVisual(e.currentTarget, !shouldMark);
            }
        });
    });
}

// Inizializzazione cache e caricamento film popolari
(async () => { await loadUserFavoritesToCache(); await loadUserWatchedToCache(); fetchPopular(); })();

// Gestione UI login/logout
(function() {
    const token = localStorage.getItem('token');
    const loginLink = document.getElementById('login-link');
    const logoutBtn = document.getElementById('logout-button');
    const welcome = document.getElementById('welcome-msg');
    
    function parseJwt(t) {
        const payload = t.split('.')[1];
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodeURIComponent(escape(json)));
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



// Mostra dettagli film in modal
// Mostra dettagli film in modal
async function showMovieDetails(tmdbId) {
    const modal = document.getElementById('movie-details-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalPoster = document.getElementById('modal-poster');
    const modalOverview = document.getElementById('modal-overview');
    const modalRating = document.getElementById('modal-rating');
    const modalCast = document.getElementById('modal-cast');
    const modalTrailer = document.getElementById('modal-trailer');
    const modalImages = document.getElementById('modal-images');

    // Clear previous content
    modalTitle.textContent = '';
    modalPoster.src = '';
    modalOverview.textContent = '';
    modalRating.textContent = '';
    modalCast.textContent = '';
    modalTrailer.innerHTML = '';
    modalImages.innerHTML = '';

    modal.classList.remove('hidden');

    try {
        const r = await fetch(`/api/movies/${tmdbId}`);
        const movie = await r.json();

        modalTitle.textContent = movie.title || movie.details?.title || 'N/A';
        modalPoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path || movie.details?.poster_path || ''}`;
        modalOverview.textContent = movie.details?.overview || movie.overview || 'Nessuna trama disponibile.';
        modalRating.textContent = movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'N/A';

        // Fetch additional details like cast, trailer, images
        const detailsRes = await fetch(`/api/movies/${tmdbId}/details`);
        const details = await detailsRes.json();

        if (details.cast && details.cast.length > 0) {
            modalCast.textContent = details.cast.map(c => c.name).slice(0, 5).join(', ');
        } else {
            modalCast.textContent = 'N/A';
        }

        if (details.trailer) {
            modalTrailer.innerHTML = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${details.trailer}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }

        if (details.images && details.images.length > 0) {
            details.images.slice(0, 6).forEach(img => {
                const imgElement = document.createElement('img');
                imgElement.src = `https://image.tmdb.org/t/p/w500${img}`;
                imgElement.className = 'w-full h-32 object-cover rounded-lg shadow-md';
                modalImages.appendChild(imgElement);
            });
        }

    } catch (error) {
        console.error('Errore nel caricamento dei dettagli del film:', error);
        modalTitle.textContent = 'Errore';
        modalOverview.textContent = 'Impossibile caricare i dettagli del film.';
    }
}

document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('movie-details-modal').classList.add('hidden');
});

// Observer per gestione click dettagli
const observer = new MutationObserver(() => {
    document.querySelectorAll('.show-details').forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = '1';
        btn.addEventListener('click', (e) => showMovieDetails(e.target.dataset.tmdb));
    });
});
observer.observe(document.getElementById('movie-list'), { childList: true, subtree: true });
