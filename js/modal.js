// modal.js — destination detail modal

import { getNote, saveNote, getTrips, createTrip, addDestinationToTrip, removeDestinationFromTrip } from './storage.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
      <div class="trip-picker">
        <p class="trip-picker-label">Your trips</p>
        <ul class="trip-picker-list"></ul>
        <div class="trip-picker-new">
          <input class="trip-picker-input" type="text" placeholder="New trip name…" maxlength="60" />
          <button class="btn-trip-create">Create &amp; Add</button>
        </div>
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

const closeBtn       = overlay.querySelector('.modal-close');
const imgEl          = overlay.querySelector('.modal-img');
const regionEl       = overlay.querySelector('.modal-region');
const titleEl        = overlay.querySelector('.modal-title');
const countryEl      = overlay.querySelector('.modal-country');
const descEl         = overlay.querySelector('.modal-description');
const tagsEl         = overlay.querySelector('.modal-tags');
const wishlistBtn    = overlay.querySelector('.btn-modal-wishlist');
const tripBtn        = overlay.querySelector('.btn-modal-trip');
const tripPicker     = overlay.querySelector('.trip-picker');
const tripList       = overlay.querySelector('.trip-picker-list');
const tripInput      = overlay.querySelector('.trip-picker-input');
const btnTripCreate  = overlay.querySelector('.btn-trip-create');
const stars          = overlay.querySelectorAll('.star');
const notesText      = overlay.querySelector('.notes-text');
const saveNoteBtn    = overlay.querySelector('.btn-save-note');
const noteSavedMsg   = overlay.querySelector('.note-saved-msg');

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
  const note = { rating: selectedRating, text };
  saveNote(currentDestination.id, note);
  if (currentCallbacks.onNoteSaved) currentCallbacks.onNoteSaved(note);
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

// ===========================
// Trip picker
// ===========================

function renderTripList() {
  if (!currentDestination) return;
  const trips = getTrips();
  const destId = currentDestination.id;

  if (!trips.length) {
    tripList.innerHTML = '<li class="trip-picker-empty">No trips yet — create one below.</li>';
    return;
  }

  tripList.innerHTML = '';
  trips.forEach(trip => {
    const inTrip = trip.destinationIds.includes(destId);
    const li = document.createElement('li');
    li.className = 'trip-picker-item';
    li.innerHTML = `
      <span class="trip-picker-name">${escapeHtml(trip.name)}</span>
      <button class="btn-trip-toggle ${inTrip ? 'in-trip' : ''}" data-trip-id="${trip.id}" aria-pressed="${inTrip}">
        ${inTrip ? '&#10003; Added' : '+ Add'}
      </button>
    `;
    tripList.appendChild(li);
  });
}

tripBtn.addEventListener('click', () => {
  const isOpen = tripPicker.classList.contains('open');
  tripPicker.classList.toggle('open', !isOpen);
  tripBtn.classList.toggle('active', !isOpen);
  if (!isOpen) renderTripList();
});

tripList.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-trip-toggle');
  if (!btn || !currentDestination) return;
  const tripId = btn.dataset.tripId;
  const inTrip = btn.classList.contains('in-trip');
  if (inTrip) {
    removeDestinationFromTrip(tripId, currentDestination.id);
  } else {
    addDestinationToTrip(tripId, currentDestination.id);
  }
  renderTripList();
});

btnTripCreate.addEventListener('click', () => {
  const name = tripInput.value.trim();
  if (!currentDestination) return;
  if (!name) {
    tripInput.classList.add('input-error');
    tripInput.placeholder = 'Enter a name first…';
    tripInput.focus();
    setTimeout(() => {
      tripInput.classList.remove('input-error');
      tripInput.placeholder = 'New trip name…';
    }, 1500);
    return;
  }
  const trip = createTrip(name);
  addDestinationToTrip(trip.id, currentDestination.id);
  tripInput.value = '';
  renderTripList();
});

tripInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnTripCreate.click();
});

// ===========================

let lastFocusedElement = null;

export function openModal(destination, { isSaved = false, onWishlistToggle = null, onAddToTrip = null, onNoteSaved = null } = {}) {
  currentDestination = destination;
  currentCallbacks   = { onWishlistToggle, onAddToTrip, onNoteSaved };

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

  tripPicker.classList.remove('open');
  tripBtn.classList.remove('active');
  tripInput.value   = '';
  tripList.innerHTML = '';

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
  tripPicker.classList.remove('open');
  tripBtn.classList.remove('active');
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
