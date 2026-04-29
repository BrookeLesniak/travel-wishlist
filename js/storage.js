// storage.js — localStorage wishlist

const KEY = 'wanderlust_wishlist';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
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

export function clearWishlist() {
  localStorage.removeItem(KEY);
}
