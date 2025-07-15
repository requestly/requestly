export const getConfigfromApi = async (apiKey: string): Promise<any> => {
  try {
    const response = await fetch("https://api2.requestly.io/v1/rules", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    const result = await response.json();

    if (!result?.success) {
      throw new Error("Failed to fetch rules");
    }

    return result.data;
  } catch (error) {
    throw new Error(`Failed to fetch config: ${error.message}`);
  }
};

export default getConfigfromApi;
