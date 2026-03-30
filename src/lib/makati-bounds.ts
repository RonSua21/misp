// ─────────────────────────────────────────────
//  Makati City geographic bounds (WGS84)
//  Used for GIS residency verification.
// ─────────────────────────────────────────────

export const MAKATI_BOUNDS = {
  north: 14.5832,
  south: 14.5244,
  east:  121.0418,
  west:  121.0063,
};

export const MAKATI_CENTER = {
  lat: 14.5547,
  lng: 121.0244,
};

/**
 * Returns true if the given coordinates fall within
 * the approximate bounding box of Makati City.
 */
export function isWithinMakati(lat: number, lng: number): boolean {
  return (
    lat >= MAKATI_BOUNDS.south &&
    lat <= MAKATI_BOUNDS.north &&
    lng >= MAKATI_BOUNDS.west &&
    lng <= MAKATI_BOUNDS.east
  );
}

export const MAKATI_BARANGAYS = [
  "Bangkal", "Bel-Air", "Carmona", "Dasmariñas", "Forbes Park",
  "Guadalupe Nuevo", "Guadalupe Viejo", "Kasilawan", "La Paz",
  "Magallanes", "Olympia", "Palanan", "Pinagkaisahan", "Pio del Pilar",
  "Poblacion", "San Antonio", "San Isidro", "San Lorenzo", "Santa Cruz",
  "Singkamas", "Tejeros", "Urdaneta", "Valenzuela",
];
