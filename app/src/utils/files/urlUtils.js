// import axios from "axios";

export function getShortenedUrl(longUrl) {
  /*  const environment = {
    production: true,
    urlShortnerKey: "AIzaSyC2WOxTtgKH554wCezEJ4plxnMNXaUSFXY",
    urlShortnerDomain: "requestly.page.link"
  };

  const body = {
    dynamicLinkInfo: {
      dynamicLinkDomain: environment.urlShortnerDomain,
      link: longUrl
    }
  };

  const urlShortenerApi =
    "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=" +
    environment.urlShortnerKey;

  return axios.post(urlShortenerApi, body).then(response => {
    // console.log(response);
    return response.data.shortLink;
  });*/
  return new Promise(function (resolve, reject) {
    resolve(longUrl);
  });
}

export function getMockUrl(path, uid) {
  if (path !== null && uid !== null) return `https://${uid.toLowerCase()}.requestly.me/${path}`;
  else return `https://requestly.me/${path}`;
}

export function getDelayMockUrl(id, delay, uid) {
  if (delay > 0 && id && uid !== null) return `https://${uid.toLowerCase()}.requestly.me/${id}/?delay=${delay}`;
  else return `https://requestly.me/${id}/?delay=${delay}`;
}

export function getMockTypeFromUrl(path) {
  return path.slice(27, window.location.pathname.length);
}
