import { RQMockCollection, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { DeleteCollectionModal } from "./DeleteCollectionModal";
import { useEffect, useState } from "react";
import { useMocksModalsContext } from "features/mocks/contexts/modals";

export const DeleteCollectionModalWrapper = () => {
  const [collection, setCollection] = useState<RQMockCollection>();
  const [isVisible, setIsVisible] = useState(false);

  const { setOpenDeleteCollectionModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = (record: RQMockMetadataSchema) => {
      setIsVisible(true);
      setCollection((record as unknown) as RQMockCollection);
    };

    setOpenDeleteCollectionModalAction(() => openModal);
  }, [setOpenDeleteCollectionModalAction]);

  const onClose = () => {
    setIsVisible(false);
    setCollection(undefined);
  };

  return (
    <DeleteCollectionModal
      visible={isVisible}
      collection={(collection as unknown) as RQMockCollection}
      toggleModalVisibility={onClose}
    />
  );
};
