export const getColorFromString = (
  string = "#ffffff4d",
  saturation = 60,
  lightness = 40
) => {
  const hue = string.split("").reduce((hue, char) => {
    let hash = char.charCodeAt(0) + ((hue << 5) - hue);
    hash &= hash;
    return hash;
  }, 0);

  return `hsl(${(hue + 50) % 360}, ${saturation}%, ${lightness}%)`;
};
