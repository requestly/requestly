export const generateDraftSessionTitle = (url: string) => {
  const hostname = new URL(url).hostname.split(".").slice(0, -1).join(".");
  const date = new Date();
  const month = date.toLocaleString("default", { month: "short" });
  const formattedDate = `${date.getDate()}${month}${date.getFullYear()}`;
  return `${hostname}@${formattedDate}`;
};
