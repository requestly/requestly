export const getDecodedBase64Data = (base64Data: string) => {
  if (!base64Data) {
    return null;
  }

  try {
    const decodedData = atob(base64Data);
    const parsedData = JSON.parse(decodedData);
    return parsedData;
  } catch (error) {
    console.error(error);
    return null;
  }
};
