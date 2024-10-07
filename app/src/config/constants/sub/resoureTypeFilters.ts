import { RQNetworkLog } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";

const RESOURCE_SUBSTR = {
  html: "html",
  json: "json",
  js: ["javascript", "ecmascript"],
  css: "css",
  img: "image/",
  media: ["video/", "audio/"],
  form: "form",
  font: "font",
  graphql: "graphql",
  misc: "", // none of the above
};

interface FilterOption {
  label: string;
  value: keyof typeof RESOURCE_SUBSTR;
}

const MISC_FILTER_KEY = "misc";

// because we wanted to control the order of filter options
export const RESOURCE_FILTER_OPTIONS: FilterOption[] = [
  {
    label: "HTML",
    value: "html",
  },
  {
    label: "JSON",
    value: "json",
  },
  {
    label: "JavaScript",
    value: "js",
  },
  {
    label: "CSS",
    value: "css",
  },
  {
    label: "Images",
    value: "img",
  },
  {
    label: "GraphQL",
    value: "graphql",
  },
  {
    label: "Media (Audio + Video)",
    value: "media", // audio + video
  },
  {
    label: "Form data",
    value: "form",
  },
  {
    label: "Fonts",
    value: "font",
  },
  {
    label: "Others",
    value: MISC_FILTER_KEY,
  },
];

function doesFilterMatchContentType(filter: FilterOption["value"], contentType: string): boolean {
  if (filter === MISC_FILTER_KEY) {
    const allFiltersExceptMISC = RESOURCE_FILTER_OPTIONS.slice(0, RESOURCE_FILTER_OPTIONS.length - 1).map(
      (option) => option.value
    );

    // check that it does not match any of the existing filters
    return !doesContentTypeMatchResourceFilter(contentType, allFiltersExceptMISC);
  }

  const substr = RESOURCE_SUBSTR[filter];

  if (typeof substr === "string") {
    return contentType.toLowerCase().includes(substr);
  } else {
    return substr.some((str) => contentType.toLowerCase().includes(str));
  }
}

export function doesContentTypeMatchResourceFilter(
  contentTypeHeader: string,
  selectedFilters: FilterOption["value"][],
  log: RQNetworkLog = null
): boolean {
  if (selectedFilters.includes("graphql") && log) {
    const GQLDetails = log?.metadata?.GQLDetails;
    if (GQLDetails && Object.keys(GQLDetails).length > 0) {
      return true;
    }
  }

  if (!contentTypeHeader) {
    return selectedFilters.includes(MISC_FILTER_KEY);
  }

  return selectedFilters.some((filter) => {
    return doesFilterMatchContentType(filter, contentTypeHeader);
  });
}
