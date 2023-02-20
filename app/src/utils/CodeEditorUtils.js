export const minifyCode = (value) => {
  try {
    return JSON.stringify(JSON.parse(value));
  } catch (e) {
    return value;
  }
};
