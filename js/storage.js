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

// ===========================
// Trips
// ===========================

const TRIPS_KEY = 'wanderlust_trips';

function loadTrips() {
  try {
    return JSON.parse(localStorage.getItem(TRIPS_KEY)) ?? [];
  } catch (err) {
    console.error('Could not parse trips from storage:', err);
    return [];
  }
}

function saveTrips(trips) {
  try {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  } catch {
    console.error('Storage full — could not save trips.');
  }
}

export function getTrips() {
  return loadTrips();
}

export function createTrip(name) {
  const trips = loadTrips();
  const trip  = { id: 'trip_' + Date.now(), name: name.trim(), destinationIds: [] };
  trips.push(trip);
  saveTrips(trips);
  return trip;
}

export function deleteTrip(id) {
  saveTrips(loadTrips().filter(t => t.id !== id));
}

export function addDestinationToTrip(tripId, destId) {
  const trips = loadTrips();
  const trip  = trips.find(t => t.id === tripId);
  if (trip && !trip.destinationIds.includes(destId)) {
    trip.destinationIds.push(destId);
    saveTrips(trips);
  }
}

export function removeDestinationFromTrip(tripId, destId) {
  const trips = loadTrips();
  const trip  = trips.find(t => t.id === tripId);
  if (trip) {
    trip.destinationIds = trip.destinationIds.filter(id => id !== destId);
    saveTrips(trips);
  }
}

export function isInTrip(tripId, destId) {
  const trip = loadTrips().find(t => t.id === tripId);
  return trip ? trip.destinationIds.includes(destId) : false;
}

export function getTripsForDestination(destId) {
  return loadTrips().filter(t => t.destinationIds.includes(destId));
}
