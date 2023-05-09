import { Avatar } from "antd";
import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import { addUrlSchemeIfMissing } from "views/features/api-client/apiUtils";
import classNames from "classnames";
import { debounce } from "lodash";
import "./favicon.scss";

const FAVICON_ENDPOINT = (origin: string): string =>
  "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=16&url=" + origin;

const EMPTY_FAVICON_URL = FAVICON_ENDPOINT("");

interface Props {
  url: string;
  debounceWait?: number;
  className?: string;
  style?: CSSProperties;
}

const Favicon: React.FC<Props> = ({ url, debounceWait, className, style }) => {
  const [faviconUrl, setFaviconUrl] = useState(EMPTY_FAVICON_URL);
  const setFaviconUrlDebounced = useMemo(() => {
    return debounceWait ? debounce(setFaviconUrl, 500) : setFaviconUrl;
  }, [debounceWait]);

  useEffect(() => {
    let faviconUrl = EMPTY_FAVICON_URL;

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
        faviconUrl = FAVICON_ENDPOINT(origin);
      }
    } catch (e) {
      // skip
    }

    setFaviconUrlDebounced(faviconUrl);
  }, [setFaviconUrlDebounced, url]);

  return <Avatar size="small" src={faviconUrl} className={classNames(["rq-favicon", className])} style={style} />;
};

export default Favicon;
