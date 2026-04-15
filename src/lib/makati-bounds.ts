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

// District 1 (20 barangays) + District 2 (3 barangays) = 23 total
export const MAKATI_BARANGAYS = [
  // District 1
  "Bangkal", "Bel-Air", "Carmona", "Dasmariñas", "Forbes Park",
  "Kasilawan", "La Paz", "Magallanes", "Olympia", "Palanan",
  "Pio del Pilar", "Poblacion", "San Antonio", "San Isidro", "San Lorenzo",
  "Santa Cruz", "Singkamas", "Tejeros", "Urdaneta", "Valenzuela",
  // District 2
  "Guadalupe Nuevo", "Guadalupe Viejo", "Pinagkaisahan",
];
