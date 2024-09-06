import React, { useEffect, useState } from "react";
import { ImportMocksModal } from "./ImportMocksModal";
import { useMocksModalsContext } from "features/mocks/contexts/modals";
import { MockType } from "components/features/mocksV2/types";

interface ImportMocksModalWrapperProps {
  forceRender?: () => void;
}

export const ImportMocksModalWrapper: React.FC<ImportMocksModalWrapperProps> = ({ forceRender = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mockType, setMockType] = useState(null);
  const [eventSource, setEventSource] = useState("");
  const [onSuccess, setOnSuccess] = useState(() => () => {});

  const { setOpenMocksImportModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = (mockType: MockType, source: string = "", onSuccess?: () => void) => {
      setIsOpen(true);
      setMockType(mockType);
      setEventSource(source);

      setOnSuccess(() => () => {
        forceRender?.();
        onSuccess?.();
      });
    };

    setOpenMocksImportModalAction(() => openModal);
  }, [setOpenMocksImportModalAction, forceRender]);

  const onClose = () => {
    setIsOpen(false);
  };

  return isOpen ? (
    <ImportMocksModal
      source={eventSource}
      mockType={mockType}
      isOpen={isOpen}
      toggleModal={onClose}
      onSuccess={onSuccess}
    />
  ) : null;
};
