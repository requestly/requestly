export const removeElement = (className: string) => {
  document.querySelector(className)?.remove?.();
};

export const hideElement = (className: string) => {
  document.querySelector(className)?.classList.add("hidden");
};

export const showElement = (className: string) => {
  document.querySelector(className)?.classList.remove("hidden");
};
