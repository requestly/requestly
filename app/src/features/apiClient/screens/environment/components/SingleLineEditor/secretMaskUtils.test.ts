import { describe, expect, it } from "vitest";

import { getSecretToggleAriaLabel, shouldResetSecretReveal, shouldUseSecretMask } from "./secretMaskUtils";

describe("secretMaskUtils", () => {
  it("describes the reveal toggle action", () => {
    expect(getSecretToggleAriaLabel(false)).toBe("Reveal secret");
    expect(getSecretToggleAriaLabel(true)).toBe("Hide secret");
  });

  it("resets revealed state only for secret editors", () => {
    expect(shouldResetSecretReveal(true)).toBe(true);
    expect(shouldResetSecretReveal(false)).toBe(false);
  });

  it("uses secret masking only when a secret is hidden", () => {
    expect(shouldUseSecretMask({ isSecret: true, isSecretRevealed: false })).toBe(true);
    expect(shouldUseSecretMask({ isSecret: true, isSecretRevealed: true })).toBe(false);
    expect(shouldUseSecretMask({ isSecret: false, isSecretRevealed: false })).toBe(false);
  });
});
