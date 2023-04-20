import RuleHelper from "../RuleHelper";
import {
  getUrlWithoutQueryParamsAndHash,
  extractUrlComponent,
  getQueryParamsMap,
  convertQueryParamMapToString,
  addQueryParamToURL,
} from "../../../utils";

import CONSTANTS from "../../../constants";

class QueryParamsRuleProcessor {
  static process({ rule, requestURL, details }) {
    const url = requestURL;
    let pairs = rule.pairs,
      pair = null,
      resultingUrl = url;

    for (let i = 0; i < pairs.length; i++) {
      pair = pairs[i];

      // If Source does not match, proceed with next pair
      if (
        !RuleHelper.matchRequestWithRuleSourceFilters(pair.source.filters, details) ||
        RuleHelper.matchUrlWithRuleSource(pair.source, url) === null
      ) {
        continue;
      }

      resultingUrl = this.applyQueryParamModifications(pair.modifications, resultingUrl);
    }

    return resultingUrl !== url ? { action: "redirect", url: resultingUrl } : null;
  }

  /**
   * Apply list of query param modifications to given url
   * @param modifications
   * @param url
   * @returns Final Url after applying the given modifications to input url
   */
  static applyQueryParamModifications(modifications, url) {
    let resultingUrl = url;

    modifications.forEach(function (modification) {
      resultingUrl = QueryParamsRuleProcessor.applyQueryParamModification(modification, resultingUrl);
    });

    return resultingUrl;
  }

  static applyQueryParamModification(modification, url) {
    let resultingUrl = url,
      urlWithoutQueryParams = getUrlWithoutQueryParamsAndHash(url),
      urlHash = extractUrlComponent(url, CONSTANTS.URL_COMPONENTS.HASH),
      queryString = extractUrlComponent(url, CONSTANTS.URL_COMPONENTS.QUERY),
      queryParamsMap = getQueryParamsMap(queryString),
      paramName = modification.param,
      paramValue = modification.value;

    switch (modification.type) {
      case CONSTANTS.MODIFICATION_TYPES.ADD:
        // eslint-disable-next-line no-case-declarations
        const overwrite = modification.actionWhenParamExists === "Overwrite";
        resultingUrl = addQueryParamToURL(resultingUrl, paramName, paramValue, overwrite);

        if (modification.actionWhenParamExists === "Ignore") {
          resultingUrl = url;
        }
        break;

      case CONSTANTS.MODIFICATION_TYPES.REMOVE:
        if (paramName in queryParamsMap) {
          delete queryParamsMap[paramName];

          queryString = convertQueryParamMapToString(queryParamsMap);

          resultingUrl = queryString ? urlWithoutQueryParams + "?" + queryString : urlWithoutQueryParams;
          resultingUrl += urlHash;
        }
        break;

      case CONSTANTS.MODIFICATION_TYPES.REMOVE_ALL:
        resultingUrl = urlWithoutQueryParams + urlHash;
        break;
    }

    return resultingUrl;
  }
}

export default QueryParamsRuleProcessor;
