export const getColorFromString = (string = "", saturation = 60, lightness = 38) => {
  const hue = string.split("").reduce((hue, char) => {
    let hash = char.charCodeAt(0) + ((hue << 5) - hue);
    hash &= hash;
    return hash;
  }, 0);

  return `hsl(${hue % 360}, ${saturation}%, ${lightness}%)`;
};
