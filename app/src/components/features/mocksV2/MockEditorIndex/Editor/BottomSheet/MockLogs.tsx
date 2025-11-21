import { Log } from "backend/mocks/getMockLogs";
import { RQNetworkTable } from "lib/design-system/components";
import { RQNetworkLog } from "lib/design-system/components/RQNetworkTable/types";
import useGetMockLogs from "components/features/mocksV2/hooks/useGetMockLogs";
import { useMemo } from "react";

import { MdNetworkCheck } from "@react-icons/all-files/md/MdNetworkCheck";
import { BottomSheet } from "componentsV2/BottomSheet";

interface Props {
  mockId: string;
}

function converLogToRQNetworkLog(log: Log): RQNetworkLog {
  return {
    id: log.id,
    entry: log.har,
  };
}

export default function MockLogs({ mockId }: Props) {
  const logs = useGetMockLogs({ mockId });
  const mockLogs = useMemo(() => logs.map(converLogToRQNetworkLog), [logs]);

  const bottomSheetTabItems = useMemo(() => {
    return [
      {
        key: "Logs",
        icon: MdNetworkCheck,
        label: (
          <div className="bottom-sheet-tab">
            <MdNetworkCheck />
            <span>Network Logs</span>
          </div>
        ),
        children: <RQNetworkTable logs={mockLogs} />,
        forceRender: true,
      },
    ];
  }, [mockLogs]);

  return <BottomSheet items={bottomSheetTabItems} defaultActiveKey="Logs" disableDocking={true} />;
}
