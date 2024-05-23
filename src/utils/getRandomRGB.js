/**
 * Returns a random RGB color string.
 * @returns {Object} R, G, B
 */

export default function getRandomRGB() {
  const R = Math.floor(Math.random() * 256);
  const G = Math.floor(Math.random() * 256);
  const B = Math.floor(Math.random() * 256);

  return { R, G, B };
}
