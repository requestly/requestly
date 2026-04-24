import { getUserOS, ParsedOS } from "utils/osUtils";

export type DownloadPlatform = "mac_arm" | "mac_intel" | "win" | "linux";

interface ClassifyInputs {
  os: ParsedOS | null;
  architecture: string | undefined; // "arm" | "x86" | undefined (from userAgentData)
}

export function classifyPlatform({ os, architecture }: ClassifyInputs): DownloadPlatform | null {
  switch (os) {
    case ParsedOS.macOS:
      if (architecture === "x86") return "mac_intel";
      return "mac_arm"; // default includes "arm" and unknown
    case ParsedOS.windows:
      return "win";
    case ParsedOS.linux:
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
  const os = getUserOS();
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
