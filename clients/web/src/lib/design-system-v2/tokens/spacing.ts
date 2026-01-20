const SPACE_TOKENS = {
  "space-0": "0rem", // 0px
  "space-1": "0.125rem", // 2px
  "space-2": "0.25rem", // 4px
  "space-3": "0.375rem", // 6px
  "space-4": "0.5rem", // 8px
  "space-5": "0.75rem", // 12px
  "space-6": "1rem", // 16px
  "space-7": "1.25rem", // 20px
  "space-8": "1.5rem", // 24px
  "space-9": "2rem", // 32px
  "space-10": "2.5rem", // 40px
  "space-11": "3rem", // 48px
  "space-12": "3.5rem", // 56px
  "space-13": "4rem", // 64px
  "space-14": "4.5rem", // 72px
  "space-15": "5rem", // 80px
};

export type SpaceTokens = typeof SPACE_TOKENS;

export const generateSpaceTokens = () => {
  return {
    ...SPACE_TOKENS,
  };
};
