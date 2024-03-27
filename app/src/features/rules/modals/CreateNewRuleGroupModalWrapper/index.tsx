import React, { useEffect, useState } from "react";
import CreateNewRuleGroupModal from "components/features/rules/CreateNewRuleGroupModal";
import { useRulesModalsContext } from "features/rules/context/modals";

interface Props {}

export const CreateNewRuleGroupModalWrapper: React.FC<Props> = () => {
  const { setOpenCreateGroupModal } = useRulesModalsContext();

  const [isModalActive, setIsModalActive] = useState(false);

  useEffect(() => {
    const openModal = () => {
      setIsModalActive(true);
    };

    setOpenCreateGroupModal(() => openModal);
  }, [setOpenCreateGroupModal]);

  const onClose = () => {
    setIsModalActive(false);
  };

  return isModalActive ? <CreateNewRuleGroupModal isOpen={isModalActive} toggle={onClose} /> : null;
};
