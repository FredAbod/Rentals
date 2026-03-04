export interface DistanceResult {
  postcode: string;
  distanceKm: number;
}

/**
 * getDistanceKmFromCentralLondon is intentionally stubbed.
 *
 * In production you would integrate with a geocoding or routing API to
 * compute distance from a central reference (e.g. Trafalgar Square).
 */
export function getDistanceKmFromCentralLondon(postcode: string): DistanceResult {
  const normalised = postcode.trim().toUpperCase();

  // Simple heuristic for demonstration: inner London postcodes treated as nearer.
  if (normalised.startsWith("EC") || normalised.startsWith("WC") || normalised.startsWith("W1")) {
    return { postcode: normalised, distanceKm: 3 };
  }

  if (normalised.startsWith("N") || normalised.startsWith("E") || normalised.startsWith("W")) {
    return { postcode: normalised, distanceKm: 8 };
  }

  return { postcode: normalised, distanceKm: 18 };
}

/**
 * isInCongestionZone approximates whether a given London postcode is within
 * the Congestion Charge zone.
 *
 * For a real build, swap this for a maintained polygon or an external API.
 */
export function isInCongestionZone(postcode: string): boolean {
  const normalised = postcode.trim().toUpperCase();
  return normalised.startsWith("EC") || normalised.startsWith("WC") || normalised.startsWith("W1");
}

