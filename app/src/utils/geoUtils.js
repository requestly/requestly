//no of logos for each country for iteration
export const filesByCountry = {
  AU: 3,
  BR: 5,
  CA: 4,
  CN: 3,
  DE: 1,
  GB: 5,
  IN: 6,
  JP: 6,
  RU: 6,
  TR: 2,
  US: 6,
};

export const fetchUserCountry = async () => {
  const defaultCountry = "US";
  const country = await fetch("https://api.country.is/")
    .then((res) => res.json())
    .then((location) => {
      if (location.country) {
        return location.country;
      } else {
        return defaultCountry;
      }
    })
    .catch(() => {
      return defaultCountry;
    });
  return country;
};
