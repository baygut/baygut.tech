export const formatPhone = (phone: string) => {
  const countryCode = phone.slice(0, 3);
  const areaCode = phone.slice(3, 6);
  const firstPart = phone.slice(6, 9);
  const secondPart = phone.slice(9, 11);
  const thirdPart = phone.slice(11, 13);
  return `${countryCode} ${areaCode} ${firstPart} ${secondPart} ${thirdPart}`;
};

// Define your color palette
const colors = {
  red: '#FF0000',
  green: '#28a745',
  purple: '#6f42c1',
  pink: '#e83e8c',
  indigo: '#6610f2',
  orange: '#fd7e14',
  teal: '#20c997',
} as const;

// Type to represent the color keys
type Color = keyof typeof colors;

// Function to get a random color from the palette
export function getRandomColor(): string {
  const colorKeys = Object.keys(colors) as Color[];
  const randomKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
  return colors[randomKey];
}
