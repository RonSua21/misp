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
  "Bangkal", "Bel-Air", "Carmona", "Cembo", "Comembo",
  "Dasmariñas", "East Rembo", "Forbes Park", "Guadalupe Nuevo",
  "Guadalupe Viejo", "Kasilawan", "La Paz", "Magallanes",
  "Olympia", "Palanan", "Pembo", "Pinagkaisahan", "Pio del Pilar",
  "Pitogo", "Poblacion", "Post Proper Northside", "Post Proper Southside",
  "Rizal", "San Antonio", "San Isidro", "San Lorenzo", "Santa Cruz",
  "Singkamas", "South Cembo", "Tejeros", "Ugong Norte",
  "Urdaneta", "West Rembo",
];
