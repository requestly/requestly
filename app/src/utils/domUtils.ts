export const removeElement = (selectorQuery: string) => {
  document.querySelector(selectorQuery)?.remove?.();
};

export const hideElement = (selectorQuery: string) => {
  document.querySelector(selectorQuery)?.classList.add("hidden");
};

export const showElement = (selectorQuery: string) => {
  document.querySelector(selectorQuery)?.classList.remove("hidden");
};
