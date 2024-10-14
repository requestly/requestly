import { Avatar } from "antd";
import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import { addUrlSchemeIfMissing } from "features/apiClient/screens/apiClient/utils";

const FAVICON_SIZE = {
  small: 16,
  normal: 24, // default
  large: 64,
};

type FaviconSize = keyof typeof FAVICON_SIZE;

const FAVICON_ENDPOINT = (origin: string, size: FaviconSize): string =>
  `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=${FAVICON_SIZE[size]}&url=${origin}`;

const EMPTY_FAVICON_URL = (size: FaviconSize) => FAVICON_ENDPOINT("", size);

interface Props {
  url: string;
  size?: FaviconSize;
  debounceWait?: number;
  className?: string;
  style?: CSSProperties;
}

const Favicon: React.FC<Props> = ({ url, size = "normal", debounceWait, className, style = {} }) => {
  const [faviconUrl, setFaviconUrl] = useState(EMPTY_FAVICON_URL(size));
  const setFaviconUrlDebounced = useMemo(() => {
    return debounceWait ? debounce(setFaviconUrl, 500) : setFaviconUrl;
  }, [debounceWait]);

  useEffect(() => {
    let faviconUrl = EMPTY_FAVICON_URL(size);

    try {
      if (url) {
        const urlObj = new URL(addUrlSchemeIfMissing(url));
        let domain = urlObj.hostname;
        const hostParts = domain.split(".");

        if (hostParts.length > 2) {
          if (hostParts[hostParts.length - 2].length === 2) {
            domain = hostParts.slice(hostParts.length - 3).join(".");
          } else {
            domain = hostParts.slice(hostParts.length - 2).join(".");
          }
        }

        const origin = `${urlObj.protocol}//${domain}`;
        faviconUrl = FAVICON_ENDPOINT(origin, size);
      }
    } catch (e) {
      // skip
    }

    setFaviconUrlDebounced(faviconUrl);
  }, [setFaviconUrlDebounced, size, url]);

  return (
    <Avatar
      size="small"
      src={faviconUrl}
      className={className}
      style={{ height: FAVICON_SIZE[size], width: FAVICON_SIZE[size], ...style }}
    />
  );
};

export default Favicon;
