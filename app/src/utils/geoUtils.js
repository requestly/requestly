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

//getting country of user
export const getCountryFromAPI = async () => {
  const res = await fetch("https://api.country.is/");
  if (res.status === 200) {
    const user = await res.json();
    return user.country;
  } else {
    //showing default logos
    return null;
  }
};

//get country of visitor
export const getCountryName = async () => {
  let countryName = localStorage.getItem("country");
  if (countryName === null) {
    countryName = await getCountryFromAPI();
    localStorage.setItem("country", countryName);
  }
  return countryName;
};
