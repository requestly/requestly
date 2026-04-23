import { describe, it, expect, vi } from "vitest";

import { classifyPlatform } from "./detectOS";
import { ParsedOS } from "utils/osUtils";

// The duplicate `utils/osUtils.js` (legacy, no `ParsedOS` export) resolves before the `.ts`
// file in Vitest's module lookup, so the real `ParsedOS` import is undefined at test time.
// Mock `utils/osUtils` to pin the enum shape to what `detectOS.ts` actually consumes.
vi.mock("utils/osUtils", () => ({
  ParsedOS: {
    macOS: "macOS",
    ios: "iOS",
    windows: "Windows",
    android: "Android",
    linux: "Linux",
  },
  getUserOS: vi.fn(),
}));

describe("classifyPlatform", () => {
  it("returns 'mac_arm' for macOS with architecture 'arm'", () => {
    expect(classifyPlatform({ os: ParsedOS.macOS, architecture: "arm" })).toBe("mac_arm");
  });

  it("returns 'mac_intel' for macOS with architecture 'x86'", () => {
    expect(classifyPlatform({ os: ParsedOS.macOS, architecture: "x86" })).toBe("mac_intel");
  });

  it("defaults to 'mac_arm' for macOS when architecture is unknown", () => {
    expect(classifyPlatform({ os: ParsedOS.macOS, architecture: undefined })).toBe("mac_arm");
  });

  it("returns 'win' for Windows (any architecture)", () => {
    expect(classifyPlatform({ os: ParsedOS.windows, architecture: undefined })).toBe("win");
    expect(classifyPlatform({ os: ParsedOS.windows, architecture: "arm" })).toBe("win");
  });

  it("returns 'linux' for Linux (any architecture)", () => {
    expect(classifyPlatform({ os: ParsedOS.linux, architecture: undefined })).toBe("linux");
  });

  it("returns null for unsupported OS (iOS, Android, or null)", () => {
    expect(classifyPlatform({ os: ParsedOS.ios, architecture: undefined })).toBeNull();
    expect(classifyPlatform({ os: ParsedOS.android, architecture: undefined })).toBeNull();
    expect(classifyPlatform({ os: null, architecture: undefined })).toBeNull();
  });
});
