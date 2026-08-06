// Mirrors backend/utils/geo.js — used here only to show a live estimate
// before the order is placed. The backend recomputes this itself from the
// coordinates it receives, so this copy never has to be trusted for billing.
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function deliveryFeeForDistance(km) {
  if (km <= 1) return 20;
  if (km <= 2) return 40;
  if (km <= 3) return 50;
  return 60;
}