const MAX_MASK_LENGTH = 15;
const SECRET_MASK_CHARACTER = "*";

export const getMaskedSecretValue = (value: string): string => {
  return SECRET_MASK_CHARACTER.repeat(Math.min(String(value).length, MAX_MASK_LENGTH));
};

export const getSecretToggleAriaLabel = (revealed: boolean): string => {
  return revealed ? "Hide secret" : "Reveal secret";
};
