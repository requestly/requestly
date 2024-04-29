import React, { useEffect, useState } from "react";
import { CreateCollectionModal } from "./CreateCollectionModal";
import { MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { useMocksModalsContext } from "features/mocks/contexts/modals";

export const CreateCollectionModalWrapper: React.FC<{ forceRender: () => void }> = ({ forceRender }) => {
  const [collection, setCollection] = useState<RQMockMetadataSchema>();
  const [mockType, setMockType] = useState<MockType>();
  const [isVisible, setIsVisible] = useState(false);

  const { setOpenCollectionModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = (mockType: MockType, record?: RQMockMetadataSchema) => {
      setIsVisible(true);
      setMockType(mockType);

      if (record) {
        setCollection(record);
      }
    };

    setOpenCollectionModalAction(() => openModal);
  }, [setOpenCollectionModalAction]);

  const onClose = () => {
    setIsVisible(false);
    setCollection(undefined);
    setMockType(undefined);
  };

  return isVisible ? (
    <CreateCollectionModal
      id={collection?.id}
      name={collection?.name}
      description={collection?.desc}
      mockType={mockType}
      visible={isVisible}
      toggleModalVisibility={onClose}
      onSuccess={forceRender}
    />
  ) : null;
};
