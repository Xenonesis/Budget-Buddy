'use client';

// Utility to generate consistent, beautiful SVG avatars
export const generateUserAvatar = (name: string, id: number, size: number = 48) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
    '#ec4899', // Pink
    '#6366f1', // Indigo
  ];

  const bgColor = colors[id % colors.length];
  const fontSize = Math.floor(size * 0.35);

  // Use URI encoding instead of base64 for better CSP compatibility
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${bgColor}"/><text x="${size / 2}" y="${size / 2 + fontSize / 3}" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${fontSize}" font-weight="600">${initials}</text></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// Fallback avatar for any failed images
export const getFallbackAvatar = (name: string, size: number = 48) => {
  const initial = name.charAt(0).toUpperCase();
  const fontSize = Math.floor(size * 0.4);

  // Use URI encoding instead of base64 for better CSP compatibility
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#6b7280"/><text x="${size / 2}" y="${size / 2 + fontSize / 3}" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="600">${initial}</text></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
