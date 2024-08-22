const FONT_WEIGHT_TOKENS = {
  "weight-thin": 100,
  "weight-extralight": 200,
  "weight-light": 300,
  "weight-normal": 400,
  "weight-medium": 500,
  "weight-semibold": 600,
  "weight-bold": 700,
  "weight-extrabold": 800,
  "weight-black": 900,
};

const FONT_SIZE_TOKENS = {
  "size-2xs": "0.625rem", // 10px
  "size-xs": "0.688rem", // 11px
  "size-sm": "0.813rem", // 13px
  "size-md": "0.938rem", // 15px
  "size-base": "1rem", // 16px
  "size-lg": "1.25rem", // 20px
  "size-xl": "1.5rem", // 24px
  "size-2xl": "1.875rem", // 30px
  "size-3xl": "2.25rem", // 36px
  "size-4xl": "3rem", // 48px
  "size-5xl": "3.75rem", // 60px
};

const LINE_HEIGHT_TOKENS = {
  "line-height-2xs": "0.75rem", // 12px
  "line-height-xs": "0.875rem", // 14px
  "line-height-sm": "1.25rem", // 20px
  "line-height-md": "1.438rem", // 23px
  "line-height-base": "1.5rem", // 24px
  "line-height-lg": "1.875rem", // 30px
  "line-height-xl": "2.25rem", // 36px
  "line-height-2xl": "2.813rem", // 45px
  "line-height-3xl": "3.375rem", // 54px
  "line-height-4xl": "4.5rem", // 72px
  "line-height-5xl": "5.625rem", // 90px
};

const FONT_FAMILY_TOKENS = {
  "family-code": "Roboto Mono",
  "family-default": "Inter",
};

export type TypographyTokens = typeof FONT_SIZE_TOKENS &
  typeof LINE_HEIGHT_TOKENS &
  typeof FONT_WEIGHT_TOKENS &
  typeof FONT_FAMILY_TOKENS;

export const generateTypographyTokens = () => {
  return {
    ...FONT_WEIGHT_TOKENS,
    ...FONT_SIZE_TOKENS,
    ...LINE_HEIGHT_TOKENS,
    ...FONT_FAMILY_TOKENS,
  };
};
