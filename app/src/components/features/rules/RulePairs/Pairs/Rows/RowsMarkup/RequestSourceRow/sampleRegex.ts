interface SampleRegexItem {
  title: string;
  regex: string;
  url: string;
}

export const sampleRegex: SampleRegexItem[] = [
  {
    title: "Match URLs that start with https:// only",
    regex: "^https://.*",
    url: "https://example.com",
  },
  {
    title: "Match URLs that belong specific domain",
    regex: "^https://.*\\.example\\.com",
    url: "https://app.example.com",
  },
  {
    title: "Match URLs that contain a query parameter",
    regex: "^https://.*\\?.*",
    url: "https://example.com?param=value",
  },
  {
    title: "Match URLs ending with specific file types",
    regex: "^https?://.*\\.(jpg|png|gif)$",
    url: "https://example.com/gallery/image.jpg",
  },
  {
    title: "Match URLs with optional “www” and subdomains and paths.",
    regex: "^https?://([a-zA-Z0-9-]+\\.)*example\\.com(/.*)?$",
    url: "https://app.example.com/path/to/resource",
  },
];
