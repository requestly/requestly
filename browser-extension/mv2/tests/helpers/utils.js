/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj1
 */
function extend(obj1, obj2) {
  var attrName;

  for (attrName in obj2) {
    obj1[attrName] = obj2[attrName];
  }
  return obj1;
}
