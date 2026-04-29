// modal.js — destination detail modal

import { getNote, saveNote } from './storage.js';

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
      <div class="modal-notes">
        <p class="notes-label">Your Notes</p>
        <div class="star-rating" aria-label="Rating">
          <button class="star" data-value="1" aria-label="1 star">&#9733;</button>
          <button class="star" data-value="2" aria-label="2 stars">&#9733;</button>
          <button class="star" data-value="3" aria-label="3 stars">&#9733;</button>
          <button class="star" data-value="4" aria-label="4 stars">&#9733;</button>
          <button class="star" data-value="5" aria-label="5 stars">&#9733;</button>
        </div>
        <textarea class="notes-text" placeholder="Write your thoughts about this destination..." rows="3"></textarea>
        <div class="notes-footer">
          <button class="btn-save-note">Save Note</button>
          <p class="note-saved-msg" hidden>&#10003; Saved!</p>
        </div>
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
const stars        = overlay.querySelectorAll('.star');
const notesText    = overlay.querySelector('.notes-text');
const saveNoteBtn  = overlay.querySelector('.btn-save-note');
const noteSavedMsg = overlay.querySelector('.note-saved-msg');

let currentDestination = null;
let currentCallbacks   = {};
let selectedRating     = 0;

function setStars(value) {
  stars.forEach(s => s.classList.toggle('active', Number(s.dataset.value) <= value));
}

stars.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = Number(star.dataset.value);
    setStars(selectedRating);
  });
  star.addEventListener('mouseenter', () => setStars(Number(star.dataset.value)));
  star.addEventListener('mouseleave', () => setStars(selectedRating));
});

let savedMsgTimer = null;

saveNoteBtn.addEventListener('click', () => {
  if (!currentDestination) return;
  const text = notesText.value.trim();
  if (selectedRating === 0 && !text) return;
  saveNote(currentDestination.id, { rating: selectedRating, text });
  noteSavedMsg.hidden = false;
  clearTimeout(savedMsgTimer);
  savedMsgTimer = setTimeout(() => { noteSavedMsg.hidden = true; }, 2000);
});

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

let lastFocusedElement = null;

export function openModal(destination, { isSaved = false, onWishlistToggle = null, onAddToTrip = null } = {}) {
  currentDestination = destination;
  currentCallbacks   = { onWishlistToggle, onAddToTrip };

  lastFocusedElement = document.activeElement;

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

  const existing    = getNote(destination.id);
  selectedRating    = existing?.rating ?? 0;
  notesText.value   = existing?.text   ?? '';
  noteSavedMsg.hidden = true;
  setStars(selectedRating);

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}

export function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  imgEl.removeAttribute('src');
  currentDestination = null;
  currentCallbacks   = {};
  selectedRating     = 0;
  clearTimeout(savedMsgTimer);
  if (lastFocusedElement) lastFocusedElement.focus();
}

closeBtn.addEventListener('click', closeModal);

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
});
