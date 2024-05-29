let json = null;
try {
  json = JSON.parse(document.currentScript.dataset.params);
} catch (e) {
  //do nothing
}

if (json) {
  const PUBLIC_NAMESPACE = "__REQUESTLY__";

  window[PUBLIC_NAMESPACE] = window[PUBLIC_NAMESPACE] || {};
  Object.entries(json).forEach(([key, value]) => {
    window[PUBLIC_NAMESPACE][key] = value;
  });
}
