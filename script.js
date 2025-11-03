// --- VARIABLES ---
const container = document.getElementById('people-container');
const paginationContainer = document.getElementById('page-buttons');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const showFavoritesBtn = document.getElementById('showFavorites');
const getStartedBtn = document.getElementById('getStartedBtn');
const popup = document.getElementById('formPopup');
const closePopupBtn = document.getElementById('closePopup');
let people = [];
let currentPage = 1;
const perPage = 5;
let showFavoritesOnly = false;

// --- LOAD PEOPLE ---
async function loadPeople() {
    try {
        const res = await fetch('./people.json');
        people = await res.json();
        renderPeople();
    } catch (err) {
        console.error('Error loading people:', err);
    }
}

// --- RENDER PEOPLE ---
function renderPeople() {
    let list = showFavoritesOnly ? getFavoritesList() : people;
    const totalPages = Math.ceil(list.length / perPage);
    currentPage = Math.min(currentPage, totalPages) || 1;

    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const paginated = list.slice(start, end);

    container.innerHTML = '';
    paginated.forEach(p => {
        const card = document.createElement('div');
        card.classList.add('person');
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isFav = favorites.includes(p.firstName + ' ' + p.lastName);
        card.innerHTML = `
      <img src="${p.image}" alt="${p.firstName} ${p.lastName}">
      <div class="name-first">${p.firstName}</div>
      <div class="name-last">${p.lastName}</div>
      <div class="skill">${p.skill}</div>
      <div class="desc">${p.description}</div>
      <button class="favorite-btn" data-name="${p.firstName} ${p.lastName}">
        ${isFav ? '❤️' : '🤍'}
      </button>
    `;
        container.appendChild(card);
    });

    renderPagination(totalPages);
    setupFavoriteButtons();
}

// --- FAVORITE BUTTONS ---
function setupFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (favorites.includes(name)) {
                favorites = favorites.filter(f => f !== name);
                btn.textContent = '🤍';
            } else {
                favorites.push(name);
                btn.textContent = '❤️';
            }
            localStorage.setItem('favorites', JSON.stringify(favorites));
        });
    });
}

// --- FAVORITES LIST ---
function getFavoritesList() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return people.filter(p => favorites.includes(p.firstName + ' ' + p.lastName));
}

// --- PAGINATION ---
function renderPagination(totalPages) {
    paginationContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.classList.toggle('active', i === currentPage);
        btn.addEventListener('click', () => {
            currentPage = i;
            renderPeople();
        });
        paginationContainer.appendChild(btn);
    }
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

prevBtn.addEventListener('click', () => { currentPage--; renderPeople(); });
nextBtn.addEventListener('click', () => { currentPage++; renderPeople(); });

// --- SHOW FAVORITES ---
showFavoritesBtn?.addEventListener('click', () => {
    showFavoritesOnly = !showFavoritesOnly;
    currentPage = 1;
    renderPeople();
});

// --- POPUP OPEN/CLOSE ---
getStartedBtn?.addEventListener('click', () => {
    popup.style.display = 'flex';
    popup.setAttribute('aria-hidden', 'false');
});

closePopupBtn?.addEventListener('click', () => {
    popup.style.display = 'none';
    popup.setAttribute('aria-hidden', 'true');
});

// --- FORM SUBMISSION (FormSubmit.co, stay on site) ---
function handleFormSubmit(formId, msgId) {
    const form = document.getElementById(formId);
    const msg = document.getElementById(msgId);

    form.addEventListener('submit', async e => {
        e.preventDefault();

        try {
            const formData = new FormData(form);
            const res = await fetch(form.action, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                msg.textContent = '✅ Form submitted successfully!';
                form.reset();

                // Optional: close popup after success
                if (popup) {
                    setTimeout(() => {
                        popup.style.display = 'none';
                        popup.setAttribute('aria-hidden', 'true');
                    }, 1500);
                }

            } else {
                msg.textContent = '⚠️ Something went wrong. Try again.';
            }
        } catch (error) {
            console.error(error);
            msg.textContent = '⚠️ Error sending form.';
        }

        setTimeout(() => msg.textContent = '', 4000);
    });
}

handleFormSubmit('signupForm', 'signupMsg');
handleFormSubmit('newsletterForm', 'newsletterMsg');

// --- DOM READY ---
document.addEventListener('DOMContentLoaded', loadPeople);
