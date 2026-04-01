const categories = {
    "1": "Korrupció",
    "2": "Média és propaganda",
    "3": "Jogállam",
    "4": "Társadalomi károkozás",
    "5": "Külpolitika"
};

function groupByCategory(data) {
    const map = {};

    Object.values(data)
        .sort((a, b) => b.id - a.id)
        .filter(item =>
            item.title && item.title.trim() !== '' &&
            item.items && item.items.some(i =>
                i.text && i.text.trim() !== '' &&
                i.url && i.url.trim() !== ''
            )
        )
        .forEach(item => {
            const resolvedCategory = (!item.category || item.category.trim() === '') ? '1' : item.category;
            const catName = categories[resolvedCategory] || 'Egyéb';
            if (!map[catName]) map[catName] = [];
            map[catName].push(item);
        });

    return map;
}

function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';
    card.tabIndex = 0;

    const itemsPreview = item.items
        .slice(0, 2)
        .map(i => `<div>• ${i.text}</div>`)
        .join('');

    card.innerHTML = `
        <div class="title">${item.title}</div>
        <div class="items">${itemsPreview}</div>
    `;

    if (item.items && item.items.length > 0) {
        card.dataset.url = item.items[0].url;
    }

    return card;
}

function attachDragScroll(row) {
    let isDragging = false;
    let startX, scrollLeft, velocity, lastX, momentumID;
    let wasMoved = false;

    const stopMomentum = () => cancelAnimationFrame(momentumID);

    const applyMomentum = () => {
        const decay = 0.95;
        const step = () => {
            if (Math.abs(velocity) > 0.5 && !isDragging) {
                row.scrollLeft -= velocity;
                velocity *= decay;
                momentumID = requestAnimationFrame(step);
            }
        };
        momentumID = requestAnimationFrame(step);
    };

    row.addEventListener('pointerdown', e => {
        isDragging = true;
        wasMoved = false;
        startX = e.pageX - row.offsetLeft;
        scrollLeft = row.scrollLeft;
        lastX = e.pageX;
        stopMomentum();
        row.setPointerCapture(e.pointerId);
    });

    row.addEventListener('pointermove', e => {
        if (!isDragging) return;
        const x = e.pageX - row.offsetLeft;
        const walk = x - startX;
        if (Math.abs(walk) > 5) {
            wasMoved = true;
            row.classList.add('dragging');
        }
        row.scrollLeft = scrollLeft - walk;
        velocity = e.pageX - lastX;
        lastX = e.pageX;
    });

    row.addEventListener('pointerup', e => {
        if (!isDragging) return;
        isDragging = false;
        row.releasePointerCapture(e.pointerId);
        setTimeout(() => row.classList.remove('dragging'), 0);
        applyMomentum();
    });

    row.addEventListener('click', e => {
        if (wasMoved) return;
        const card = document.elementFromPoint(e.clientX, e.clientY)?.closest('.card');
        if (card && card.dataset.url) {
            window.open(card.dataset.url, '_blank');
        }
    });
}

function initKeyboardNav(rows) {
    let currentRow = 0;
    let currentCol = 0;
    const lastColPerRow = {};

    function focusCard(rowIndex, colIndex) {
        const row = rows[rowIndex];
        if (!row) return;
        const cards = row.querySelectorAll('.card');
        if (!cards.length) return;
        currentCol = Math.max(0, Math.min(colIndex, cards.length - 1));
        const card = cards[currentCol];
        card.focus();
        smoothScrollToCard(card);
    }

    document.addEventListener('keydown', e => {
        const row = rows[currentRow];
        const cards = row.querySelectorAll('.card');

        switch (e.key) {
            case 'ArrowRight':
                if (currentCol < cards.length - 1) focusCard(currentRow, ++currentCol);
                break;
            case 'ArrowLeft':
                if (currentCol > 0) focusCard(currentRow, --currentCol);
                break;
            case 'ArrowDown':
                if (currentRow < rows.length - 1) {
                    lastColPerRow[currentRow] = currentCol;
                    currentRow++;
                    currentCol = 0;
                    focusCard(currentRow, currentCol);
                }
                break;
            case 'ArrowUp':
                if (currentRow > 0) {
                    lastColPerRow[currentRow] = currentCol;
                    currentRow--;
                    currentCol = lastColPerRow[currentRow] ?? 0;
                    focusCard(currentRow, currentCol);
                }
                break;
            case 'Enter': {
                const active = document.activeElement;
                if (active && active.dataset.url) window.open(active.dataset.url, '_blank');
                break;
            }
        }
    });
}

function smoothScrollToCard(card) {
    const rect = card.getBoundingClientRect();
    const row = card.closest('.row');

    const targetY = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2;
    const startY = window.scrollY;
    const distanceY = targetY - startY;

    const targetX = card.offsetLeft - row.clientWidth / 2 + card.clientWidth / 2;
    const startX = row.scrollLeft;
    const distanceX = targetX - startX;

    const duration = 500;
    let startTime = null;

    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const time = currentTime - startTime;
        const progress = Math.min(time / duration, 1);
        const ease = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        window.scrollTo(0, startY + distanceY * ease);
        row.scrollLeft = startX + distanceX * ease;
        if (time < duration) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
}

function render() {
    const app = document.getElementById('app');
    const container = document.createElement('div');
    container.className = 'container';

    const grouped = groupByCategory(htmlData);

    // Render categories in defined order (Korrupció first, etc.)
    Object.keys(categories).forEach(catId => {
        const categoryName = categories[catId];
        if (!grouped[categoryName]) return;

        const section = document.createElement('div');
        section.className = 'category';

        const title = document.createElement('h2');
        title.textContent = categoryName;

        const row = document.createElement('div');
        row.className = 'row';
        row.setAttribute('aria-label', categoryName);

        grouped[categoryName].forEach(item => row.appendChild(createCard(item)));

        section.appendChild(title);
        section.appendChild(row);
        container.appendChild(section);
    });

    // Render uncategorised items last
    if (grouped['Egyéb']) {
        const section = document.createElement('div');
        section.className = 'category';
        const title = document.createElement('h2');
        title.textContent = 'Egyéb';
        const row = document.createElement('div');
        row.className = 'row';
        row.setAttribute('aria-label', 'Egyéb');
        grouped['Egyéb'].forEach(item => row.appendChild(createCard(item)));
        section.appendChild(title);
        section.appendChild(row);
        container.appendChild(section);
    }

    app.appendChild(container);

    const rows = Array.from(document.querySelectorAll('.row'));
    rows.forEach(attachDragScroll);
    initKeyboardNav(rows);
}

window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    hero.style.backgroundPosition = `center ${window.scrollY * 0.3}px`;
    hero.style.transform = 'translateZ(0)';
});

render();
