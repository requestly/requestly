import { describe, expect, it } from "vitest";

import { getMaskedSecretValue, getSecretToggleAriaLabel } from "./secretFieldUtils";

describe("RevealableSecretField", () => {
  it("masks secret values with generated placeholder text", () => {
    expect(getMaskedSecretValue("super-secret-token")).toBe("***************");
    expect(getMaskedSecretValue("short")).toBe("*****");
    expect(getMaskedSecretValue("")).toBe("");
  });

  it("describes the next reveal action for assistive technology", () => {
    expect(getSecretToggleAriaLabel(false)).toBe("Reveal secret");
    expect(getSecretToggleAriaLabel(true)).toBe("Hide secret");
  });
});
