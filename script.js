document.addEventListener('DOMContentLoaded', () => {
    // Popup open/close
    const getStartedBtn = document.getElementById('getStartedBtn');
    const formPopup = document.getElementById('formPopup');
    const closePopup = document.getElementById('closePopup');

    getStartedBtn.addEventListener('click', () => {
        formPopup.style.display = 'flex';
        formPopup.setAttribute('aria-hidden', 'false');
    });

    function closeForm() {
        formPopup.style.display = 'none';
        formPopup.setAttribute('aria-hidden', 'true');
    }

    closePopup.addEventListener('click', closeForm);
    formPopup.addEventListener('click', (e) => {
        if (e.target === formPopup) closeForm();
    });

    // People finder + pagination
    const peopleContainer = document.getElementById('people-container');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageButtonsWrap = document.getElementById('page-buttons');

    let people = [];
    let currentPage = 1;
    const perPage = 5;
    let totalPages = 1;

    async function loadPeople() {
        try {
            const res = await fetch('people.json');
            if (!res.ok) throw new Error('people.json not found');
            people = await res.json();
            totalPages = Math.max(1, Math.ceil(people.length / perPage));
            renderPagination();
            renderPage(1);
        } catch (err) {
            peopleContainer.innerHTML = '<p style="color:#ff6b6b">Error loading people.json — run a local server and ensure the file exists.</p>';
            console.error(err);
        }
    }

    function renderPage(page) {
        currentPage = Math.min(Math.max(1, page), totalPages);
        peopleContainer.innerHTML = '';
        const start = (currentPage - 1) * perPage;
        const slice = people.slice(start, start + perPage);

        slice.forEach(p => {
            const imageSrc = p.image && p.image.trim() ? p.image : 'https://via.placeholder.com/100?text=No+Image';
            const card = document.createElement('div');
            card.className = 'person';
            card.innerHTML = `
        <img src="${imageSrc}" alt="${(p.firstName || '') + ' ' + (p.lastName || '')}">
        <div class="name-first">${p.firstName || ''}</div>
        <div class="name-last">${p.lastName || ''}</div>
        <div class="skill">${p.skill || ''}</div>
        <div class="desc">${p.description || ''}</div>
      `;
            peopleContainer.appendChild(card);
        });

        updatePaginationButtons();
    }

    function renderPagination() {
        pageButtonsWrap.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.dataset.page = i;
            btn.addEventListener('click', () => renderPage(Number(btn.dataset.page)));
            pageButtonsWrap.appendChild(btn);
        }
        updatePaginationButtons();
    }

    function updatePaginationButtons() {
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
        Array.from(pageButtonsWrap.children).forEach(b => {
            b.classList.toggle('active', Number(b.dataset.page) === currentPage);
        });
    }

    prevBtn.addEventListener('click', () => { if (currentPage > 1) renderPage(currentPage - 1); });
    nextBtn.addEventListener('click', () => { if (currentPage < totalPages) renderPage(currentPage + 1); });

    // Signup form (submit via fetch to FormSubmit, but stay on page and show message)
    const signupForm = document.getElementById('signupForm');
    const signupMsg = document.getElementById('signupMsg');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        signupMsg.textContent = '';
        const formData = new FormData(signupForm);

        try {
            // send to FormSubmit
            await fetch(signupForm.action, {
                method: 'POST',
                body: formData
            });

            signupMsg.textContent = '✅ Form submitted successfully!';
            signupMsg.style.color = '#00ff99';
            signupForm.reset();
        } catch (err) {
            signupMsg.textContent = '❌ Something went wrong. Try again.';
            signupMsg.style.color = '#ff6666';
            console.error(err);
        }
    });

    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterMsg = document.getElementById('newsletterMsg');

    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        newsletterMsg.textContent = '';
        const formData = new FormData(newsletterForm);

        try {
            await fetch(newsletterForm.action, {
                method: 'POST',
                body: formData
            });

            newsletterMsg.textContent = '✅ Subscribed successfully!';
            newsletterMsg.style.color = '#00ff99';
            newsletterForm.reset();
        } catch (err) {
            newsletterMsg.textContent = '❌ Subscription failed.';
            newsletterMsg.style.color = '#ff6666';
            console.error(err);
        }
    });

    // initialize
    loadPeople();
});
