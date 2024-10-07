interface RegexSample {
  title: string;
  regex: string;
  url: string;
}

export const sampleRegex: RegexSample[] = [
  {
    title: "Filter URLs that start with https:// only",
    regex: "^https://.*",
    url: "https://example.com",
  },
  {
    title: "Filter URLs that belong specific domain",
    regex: "^https://.*\\.example\\.com",
    url: "https://app.example.com",
  },
  {
    title: "Filter URLs that contain a query parameter",
    regex: "^https://.*\\?.*",
    url: "https://example.com?param=value",
  },
  {
    title: "Filter URLs ending with specific file types",
    regex: "^https?://.*\\.(jpg|png|gif)$",
    url: "https://example.com/gallery/image.jpg",
  },
  {
    title: "Filter URLs with optional “www” and subdomains and paths.",
    regex: "^https?://([a-zA-Z0-9-]+\\.)*example\\.com(/.*)?$",
    url: "https://app.example.com/path/to/resource",
  },
];
