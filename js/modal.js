// modal.js — destination detail modal

const overlay = document.createElement('div');
overlay.className = 'modal-overlay';
overlay.innerHTML = `
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <button class="modal-close" aria-label="Close">&times;</button>
    <div class="modal-img-wrap">
      <img class="modal-img" alt="" />
    </div>
    <div class="modal-content">
      <p class="modal-region"></p>
      <h2 class="modal-title" id="modal-title"></h2>
      <p class="modal-country"></p>
      <p class="modal-description"></p>
      <div class="modal-tags"></div>
      <div class="modal-actions">
        <button class="btn-modal-wishlist">&#9825; Save to Wishlist</button>
        <button class="btn-modal-trip">+ Add to Trip</button>
      </div>
    </div>
  </div>
`;
document.body.appendChild(overlay);

const closeBtn     = overlay.querySelector('.modal-close');
const imgEl        = overlay.querySelector('.modal-img');
const regionEl     = overlay.querySelector('.modal-region');
const titleEl      = overlay.querySelector('.modal-title');
const countryEl    = overlay.querySelector('.modal-country');
const descEl       = overlay.querySelector('.modal-description');
const tagsEl       = overlay.querySelector('.modal-tags');
const wishlistBtn  = overlay.querySelector('.btn-modal-wishlist');
const tripBtn      = overlay.querySelector('.btn-modal-trip');

let currentDestination = null;
let currentCallbacks   = {};

imgEl.addEventListener('error', () => { imgEl.style.display = 'none'; });

wishlistBtn.addEventListener('click', () => {
  const saved = wishlistBtn.classList.toggle('saved');
  wishlistBtn.innerHTML = saved ? '&#9829; Saved' : '&#9825; Save to Wishlist';
  if (currentCallbacks.onWishlistToggle) {
    currentCallbacks.onWishlistToggle(currentDestination, saved);
  }
});

tripBtn.addEventListener('click', () => {
  if (currentCallbacks.onAddToTrip) {
    currentCallbacks.onAddToTrip(currentDestination);
  }
});

export function openModal(destination, { isSaved = false, onWishlistToggle = null, onAddToTrip = null } = {}) {
  currentDestination = destination;
  currentCallbacks   = { onWishlistToggle, onAddToTrip };

  imgEl.src            = destination.image;
  imgEl.alt            = destination.name;
  imgEl.style.display  = 'block';
  regionEl.textContent  = destination.region;
  titleEl.textContent   = destination.name;
  countryEl.textContent = destination.country;
  descEl.textContent    = destination.description;

  tagsEl.innerHTML = destination.tags
    .map(t => `<span class="tag">${t}</span>`)
    .join('');

  wishlistBtn.classList.toggle('saved', isSaved);
  wishlistBtn.innerHTML = isSaved ? '&#9829; Saved' : '&#9825; Save to Wishlist';

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  imgEl.src = '';
  currentDestination = null;
  currentCallbacks   = {};
}

closeBtn.addEventListener('click', closeModal);

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
});
