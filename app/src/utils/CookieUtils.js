export const getCookie = (name) => {
  try {
    const cName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(cName) === 0) {
        return c.substring(cName.length, c.length);
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};
