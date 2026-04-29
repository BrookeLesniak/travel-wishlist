// cards.js — destination card creation and grid rendering

import { openModal } from './modal.js';

export function createDestinationCard(destination, { isSaved = false, onWishlistToggle = null, onAddToTrip = null } = {}) {
  const card = document.createElement('article');
  card.className = 'dest-card';
  card.dataset.id = destination.id;

  const tagHTML = destination.tags.slice(0, 3).map(t =>
    `<span class="tag">${t}</span>`
  ).join('');

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

  const { isSaved: isSavedFn, ...rest } = options;
  destinations.forEach(d => {
    const isSaved = typeof isSavedFn === 'function' ? isSavedFn(d.id) : false;
    container.appendChild(createDestinationCard(d, { ...rest, isSaved }));
  });
}
