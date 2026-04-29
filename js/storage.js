// storage.js — localStorage wishlist and notes

const KEY       = 'wanderlust_wishlist';
const NOTES_KEY = 'wanderlust_notes';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch (err) {
    console.error('Could not parse wishlist from storage:', err);
    return [];
  }
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    console.error('Storage full — could not save wishlist.');
  }
}

export function getWishlist() {
  return load();
}

export function addToWishlist(destination) {
  const list = load();
  if (!list.find(d => d.id === destination.id)) {
    list.push(destination);
    save(list);
  }
}

export function removeFromWishlist(id) {
  save(load().filter(d => d.id !== id));
}

export function isWishlisted(id) {
  return load().some(d => d.id === id);
}

export function getWishlistedIds() {
  return new Set(load().map(d => d.id));
}

export function clearWishlist() {
  localStorage.removeItem(KEY);
}

// ===========================
// Notes & Ratings
// ===========================

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY)) ?? {};
  } catch (err) {
    console.error('Could not parse notes from storage:', err);
    return {};
  }
}

function saveNotes(notes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    console.error('Storage full — could not save notes.');
  }
}

export function getNote(id) {
  return loadNotes()[id] ?? null;
}

export function saveNote(id, { rating, text }) {
  const notes = loadNotes();
  notes[id] = { rating, text };
  saveNotes(notes);
}

export function removeNote(id) {
  const notes = loadNotes();
  delete notes[id];
  saveNotes(notes);
}
