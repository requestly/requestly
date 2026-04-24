import { getUserOS } from "utils/osUtils";

// String literals match what `getUserOS()` returns in both the legacy osUtils.js
// and the newer osUtils.ts (the .js takes resolution precedence in Vite/Vitest,
// and it has no `ParsedOS` export — see RQ-1806 test notes). Keeping the switch
// keyed on the literal values works with either file.
type ParsedOSValue = "macOS" | "iOS" | "Windows" | "Android" | "Linux";

export type DownloadPlatform = "mac_arm" | "mac_intel" | "win" | "linux";

interface ClassifyInputs {
  os: ParsedOSValue | null;
  architecture: string | undefined; // "arm" | "x86" | undefined (from userAgentData)
}

export function classifyPlatform({ os, architecture }: ClassifyInputs): DownloadPlatform | null {
  switch (os) {
    case "macOS":
      if (architecture === "x86") return "mac_intel";
      return "mac_arm"; // default includes "arm" and unknown
    case "Windows":
      return "win";
    case "Linux":
      return "linux";
    default:
      return null;
  }
}

export const ALL_PLATFORMS: DownloadPlatform[] = ["mac_arm", "mac_intel", "win", "linux"];

export interface DetectedPlatform {
  primary: DownloadPlatform | null;
  all: DownloadPlatform[];
}

export async function detectDownloadPlatform(): Promise<DetectedPlatform> {
  const os = getUserOS() as ParsedOSValue | null;
  let architecture: string | undefined;
  const userAgentData = (navigator as any).userAgentData;
  if (userAgentData && typeof userAgentData.getHighEntropyValues === "function") {
    try {
      const data = await userAgentData.getHighEntropyValues(["architecture"]);
      if (typeof data.architecture === "string") {
        architecture = data.architecture;
      }
    } catch {
      // Probe failed; leave architecture undefined so classifyPlatform uses its default.
    }
  }
  const primary = classifyPlatform({ os, architecture });
  return { primary, all: ALL_PLATFORMS };
}
