import React, { useEffect, useState } from "react";
import { MockType } from "components/features/mocksV2/types";
import { useMocksModalsContext } from "features/mocks/contexts/modals";
import { MockUploaderModal } from "./MockUploaderModal";

export const MockUploaderModalWrapper: React.FC<{ selectMockOnUpload?: (mockUrl: string) => void }> = ({
  selectMockOnUpload = () => {},
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mockType, setMockType] = useState<MockType>();

  const { setOpenMockUploaderModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = (mockType: MockType) => {
      setIsVisible(true);
      setMockType(mockType);
    };

    setOpenMockUploaderModalAction(() => openModal);
  }, [setOpenMockUploaderModalAction]);

  const onClose = () => {
    setIsVisible(false);
    setMockType(undefined);
  };

  return isVisible ? (
    <MockUploaderModal
      mockType={mockType}
      visible={isVisible}
      toggleModalVisibility={onClose}
      selectMockOnUpload={selectMockOnUpload}
    />
  ) : null;
};
