// api.js — functions for querying destination data

import destinations from './destinations.js';

export const REGIONS = ['Europe', 'Asia', 'Americas', 'Africa', 'Oceania', 'Middle East'];

export function getAllDestinations() {
  return destinations;
}

export function getDestinationById(id) {
  return destinations.find(d => d.id === id) ?? null;
}

export function getByRegion(region) {
  return destinations.filter(d => d.region === region);
}

export function searchDestinations(query) {
  const q = query.toLowerCase().trim();
  if (!q) return destinations;
  return destinations.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.country.toLowerCase().includes(q) ||
    d.region.toLowerCase().includes(q) ||
    d.tags.some(t => t.includes(q))
  );
}
