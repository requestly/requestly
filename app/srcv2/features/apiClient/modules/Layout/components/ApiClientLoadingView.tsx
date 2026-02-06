import type { JSX } from "react";
import { Skeleton } from "antd";

export const ApiClientLoadingView = (): JSX.Element => {
  return (
    <div className="flex h-full bg-neutral-900 ">
      <div className="w-80 border-r border-r-neutral-600 p-4">
        <Skeleton active paragraph={{ rows: 10, width: "100%" }} />
      </div>
      <div className="flex-1">
        <Skeleton active className="px-4 py-2" paragraph={{ rows: 1, width: "100%" }} />
        <Skeleton active className="px-4 py-0" />
      </div>
    </div>
  );
};
