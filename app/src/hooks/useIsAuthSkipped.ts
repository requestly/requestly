import { useSearchParams } from "react-router-dom";

export const useIsAuthSkipped = () => {
  const [searchParams] = useSearchParams();
  return searchParams.get("skip_auth") === "true";
};
