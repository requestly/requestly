export const getUserGeoDetails = async () => {
  const endpoints = [
    "https://www.cloudflare.com/cdn-cgi/trace",
    "https://cf-ns.com/cdn-cgi/trace", // Cloudflare China Network
  ];

  try {
    const promises = endpoints.map((endpoint) => fetch(endpoint));
    const response = await Promise.any(promises);
    const userDetailsString = await response.text();
    const userDetails = userDetailsString?.split("\n")?.reduce((result, pair) => {
      const [key, value] = pair.split("=");
      return { ...result, [key]: value };
    }, {});

    return userDetails;
  } catch (error) {
    console.log("Error while getting user GeoDetails", error);
  }
};
