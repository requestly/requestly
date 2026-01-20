export function getShortenedUrl(longUrl) {
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
