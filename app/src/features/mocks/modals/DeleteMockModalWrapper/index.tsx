import { useEffect, useState } from "react";
import { DeleteMockModal } from "./DeleteMockModal";
import { RQMockMetadataSchema } from "components/features/mocksV2/types";
import { useMocksModalsContext } from "features/mocks/contexts/modals";

export const DeleteMockModalWrapper = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mock, setMock] = useState<RQMockMetadataSchema>();

  const { setOpenDeleteMockModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = (record: RQMockMetadataSchema) => {
      setIsVisible(true);
      setMock(record);
    };

    setOpenDeleteMockModalAction(() => openModal);
  }, [setOpenDeleteMockModalAction]);

  const onClose = () => {
    setIsVisible(false);
    setMock(undefined);
  };

  return <DeleteMockModal mock={mock} visible={isVisible} toggleModalVisibility={onClose} />;
};
