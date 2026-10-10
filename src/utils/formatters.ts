/**
 * Indian Rupee & Date Localization Utilities
 */

export const formatINR = (rupees: number): string => {
  if (isNaN(rupees)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
};

export const rupeesToPaise = (rupees: number): number => {
  return Math.round(rupees * 100);
};

export const paiseToRupees = (paise: number): number => {
  return Math.round(paise) / 100;
};

export const formatISTDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    // DD/MM/YYYY with IST time
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date) + ' IST';
  } catch {
    return isoString;
  }
};

export const formatISTDateOnly = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
};

export const isValidIndianPhone = (phone: string): boolean => {
  const clean = phone.replace(/[\s\-\(\)\+]/g, '');
  // Matches 10-digit Indian mobile starting with 6, 7, 8, or 9 (with optional 91 prefix)
  return /^(91)?[6-9]\d{9}$/.test(clean);
};

export const formatIndianPlate = (plate: string): string => {
  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length === 10) {
    // e.g. KA01AB1234 -> KA 01 AB 1234
    return `${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 6)} ${clean.slice(6)}`;
  }
  return plate.toUpperCase();
};

/**
 * Calculates geographical distance in metres between two coordinates
 */
export const calculateDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};
