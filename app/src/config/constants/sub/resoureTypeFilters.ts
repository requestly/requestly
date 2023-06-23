const RESOURCE_SUBSTR = {
  html: "html",
  json: "json",
  js: ["javascript", "ecmascript"],
  css: "css",
  img: "image/",
  media: ["video/", "audio/"],
  form: "form",
  font: "font",
  misc: "", // none the above
};

interface FilterOption {
  label: string;
  value: keyof typeof RESOURCE_SUBSTR;
}

// because we wanted to control the order of filter options
export const RESOURCE_FILTER_OPTIONS: FilterOption[] = [
  {
    label: "HTML Document",
    value: "html",
  },
  {
    label: "JSON",
    value: "json",
  },
  {
    label: "JAVASCRIPT",
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
    value: "misc",
  },
];

function doesFilterMatchContentType(filter: FilterOption["value"], contentType: string): boolean {
  if (filter === "misc") {
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
  selectedFilters: FilterOption["value"][]
): boolean {
  if (!contentTypeHeader) {
    if (selectedFilters.find((filter) => filter === "misc")) return true;
    else return false;
  }

  return selectedFilters.some((filter) => {
    return doesFilterMatchContentType(filter, contentTypeHeader);
  });
}
