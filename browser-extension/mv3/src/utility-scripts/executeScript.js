const params = JSON.parse(document.currentScript.dataset.params);
const { code } = params;

if (code) {
  const functionFromString = new Function(code);
  functionFromString();
}
