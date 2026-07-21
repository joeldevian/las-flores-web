// Coordenadas Exactas del Restaurante Las Flores (Jr. José Olaya 106, Conchopata, Ayacucho)
export const RESTAURANT_LOCATION = {
  lat: -13.1628496,
  lng: -74.2178801,
};

// Configuraciones de Delivery
export const DELIVERY_CONFIG = {
  baseCost: 5, // Costo base (S/ 5.00)
  costPerKm: 1.5, // Costo adicional por cada km (S/ 1.50)
  maxRadiusKm: 8, // Límite máximo de cobertura (8 km)
};

/**
 * Calcula la distancia entre dos puntos en kilómetros usando la fórmula de Haversine.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distancia en km
  return distance;
}

/**
 * Calcula el costo total del delivery basado en la distancia.
 */
export function calculateDeliveryCost(distanceKm: number): number {
  if (distanceKm === 0) return 0;
  // Costo base + (distancia * precio por km)
  // Redondeamos a 1 decimal (ej. 6.50) para que no haya precios raros
  const total = DELIVERY_CONFIG.baseCost + distanceKm * DELIVERY_CONFIG.costPerKm;
  return Math.round(total * 10) / 10;
}
