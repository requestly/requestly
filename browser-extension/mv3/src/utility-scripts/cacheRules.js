const params = JSON.parse(document.currentScript.dataset.params);
const { rules, ruleType } = params;
let rulesJSON = null;
try {
  rulesJSON = JSON.parse(rules);
} catch (e) {
  //do nothing
}

if (rulesJSON && ruleType) {
  const PUBLIC_NAMESPACE = "__REQUESTLY__";

  window[PUBLIC_NAMESPACE] = window[PUBLIC_NAMESPACE] || {};
  window[PUBLIC_NAMESPACE][`${ruleType}Rules`] = rulesJSON;
}
