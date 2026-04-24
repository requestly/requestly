import { describe, it, expect } from "vitest";

import { classifyPlatform } from "./detectOS";

describe("classifyPlatform", () => {
  it("returns 'mac_arm' for macOS with architecture 'arm'", () => {
    expect(classifyPlatform({ os: "macOS", architecture: "arm" })).toBe("mac_arm");
  });

  it("returns 'mac_intel' for macOS with architecture 'x86'", () => {
    expect(classifyPlatform({ os: "macOS", architecture: "x86" })).toBe("mac_intel");
  });

  it("defaults to 'mac_arm' for macOS when architecture is unknown", () => {
    expect(classifyPlatform({ os: "macOS", architecture: undefined })).toBe("mac_arm");
  });

  it("returns 'win' for Windows (any architecture)", () => {
    expect(classifyPlatform({ os: "Windows", architecture: undefined })).toBe("win");
    expect(classifyPlatform({ os: "Windows", architecture: "arm" })).toBe("win");
  });

  it("returns 'linux' for Linux (any architecture)", () => {
    expect(classifyPlatform({ os: "Linux", architecture: undefined })).toBe("linux");
  });

  it("returns null for unsupported OS (iOS, Android, or null)", () => {
    expect(classifyPlatform({ os: "iOS", architecture: undefined })).toBeNull();
    expect(classifyPlatform({ os: "Android", architecture: undefined })).toBeNull();
    expect(classifyPlatform({ os: null, architecture: undefined })).toBeNull();
  });
});
