// FIXME: Performance Improvements
export const rulesListToContentTableAdapter = (rules: any) => {
  const topLevelMap: any = {};
  rules.forEach((rule: any) => {
    rule["key"] = rule.id;
    console.log({topLevelMap, rule});
    if (rule?.groupId) {
      topLevelMap[rule?.groupId] = topLevelMap[rule?.groupId] ?? {};
      console.log(topLevelMap[rule?.groupId]["children"]);
      topLevelMap[rule?.groupId]["children"] = topLevelMap[rule?.groupId]["children"]
        ? topLevelMap[rule?.groupId]["children"].concat(rule)
        : [rule];
    } else {
      topLevelMap[rule?.id] = topLevelMap[rule?.id] ? {...rule, children: topLevelMap[rule?.id]["children"] } : rule;
    }
  });

  const finalAdapterRules = Object.values(topLevelMap);
  console.log({ finalAdapterRules });
  return finalAdapterRules;
};
