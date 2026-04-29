// cards.js — destination card creation and grid rendering

import { openModal } from './modal.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function createDestinationCard(destination, { isSaved = false, onWishlistToggle = null, onAddToTrip = null, note = null } = {}) {
  const card = document.createElement('article');
  card.className = 'dest-card';
  card.dataset.id = destination.id;

  const tagHTML = destination.tags.slice(0, 3).map(t =>
    `<span class="tag">${t}</span>`
  ).join('');

  const hasNote = note && (note.rating > 0 || note.text);
  const noteHTML = hasNote ? `
    <div class="card-note">
      ${note.rating > 0 ? `<span class="card-note-stars">${'★'.repeat(note.rating)}${'☆'.repeat(5 - note.rating)}</span>` : ''}
      ${note.text ? `<p class="card-note-text">${escapeHtml(note.text)}</p>` : ''}
    </div>` : '';

  card.innerHTML = `
    <div class="card-img-wrap">
      <img class="card-img" src="${destination.image}" alt="${destination.name}" loading="lazy" />
      <button class="btn-wishlist ${isSaved ? 'saved' : ''}" aria-label="${isSaved ? 'Remove from wishlist' : 'Save to wishlist'}">
        ${isSaved ? '&#9829;' : '&#9825;'}
      </button>
    </div>
    <div class="card-body">
      <p class="card-region">${destination.region}</p>
      <h3 class="card-name">${destination.name}</h3>
      <p class="card-country">${destination.country}</p>
      <div class="card-tags">${tagHTML}</div>
      ${noteHTML}
    </div>
  `;

  // Hide broken images gracefully
  const img = card.querySelector('.card-img');
  img.addEventListener('error', () => { img.style.display = 'none'; });

  // Wishlist button
  const wishBtn = card.querySelector('.btn-wishlist');
  wishBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const saved = wishBtn.classList.toggle('saved');
    wishBtn.innerHTML = saved ? '&#9829;' : '&#9825;';
    wishBtn.setAttribute('aria-label', saved ? 'Remove from wishlist' : 'Save to wishlist');
    if (onWishlistToggle) onWishlistToggle(destination, saved);
  });

  // Open modal on card click
  card.addEventListener('click', () => {
    openModal(destination, {
      isSaved: wishBtn.classList.contains('saved'),
      onWishlistToggle: (dest, saved) => {
        wishBtn.classList.toggle('saved', saved);
        wishBtn.innerHTML = saved ? '&#9829;' : '&#9825;';
        wishBtn.setAttribute('aria-label', saved ? 'Remove from wishlist' : 'Save to wishlist');
        if (onWishlistToggle) onWishlistToggle(dest, saved);
      },
      onAddToTrip,
    });
  });

  return card;
}

export function renderDestinations(destinations, container, options = {}) {
  container.innerHTML = '';

  if (!destinations.length) {
    container.innerHTML = '<p class="empty-state">No destinations found.</p>';
    return;
  }

  const { isSaved: isSavedFn, note: noteFn, ...rest } = options;
  destinations.forEach(d => {
    const isSaved = typeof isSavedFn === 'function' ? isSavedFn(d.id) : false;
    const note    = typeof noteFn   === 'function' ? noteFn(d.id)    : null;
    container.appendChild(createDestinationCard(d, { ...rest, isSaved, note }));
  });
}
