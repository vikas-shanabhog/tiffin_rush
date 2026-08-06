// Straight-line (haversine) distance between two lat/lng points, in km.
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

// Tiered delivery fee by distance: <=1km ₹20, <=2km ₹40, <=3km ₹50, beyond ₹60.
export function deliveryFeeForDistance(km) {
  if (km <= 1) return 20;
  if (km <= 2) return 40;
  if (km <= 3) return 50;
  return 60;
}