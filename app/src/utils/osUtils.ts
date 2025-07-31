export enum ParsedOS {
  macOS = "macOS",
  ios = "iOS",
  windows = "Windows",
  android = "Android",
  linux = "Linux",
}
let detectedOS: ParsedOS | null = null;
export const getUserOS = (): ParsedOS | null => {
  if (detectedOS) return detectedOS;
  let userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
    windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
    iosPlatforms = ["iPhone", "iPad", "iPod"],
    os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = ParsedOS.macOS;
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = ParsedOS.ios;
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = ParsedOS.windows;
  } else if (/Android/.test(userAgent)) {
    os = ParsedOS.android;
  } else if (!os && /Linux/.test(platform)) {
    os = ParsedOS.linux;
  }
  detectedOS = os;
  return os;
};
