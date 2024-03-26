import React, { useEffect, useState } from "react";
import { useRulesContext } from "../../../../../context";
import CreateNewRuleGroupModal from "components/features/rules/CreateNewRuleGroupModal";

interface Props {}

export const CreateNewRuleGroupModalWrapper: React.FC<Props> = () => {
  const { setCreateGroupAction } = useRulesContext();

  const [isModalActive, setIsModalActive] = useState(false);

  useEffect(() => {
    const createGroup = () => {
      setIsModalActive(true);
    };

    setCreateGroupAction(() => createGroup);
  }, [setCreateGroupAction]);

  const onClose = () => {
    setIsModalActive(false);
  };

  return isModalActive ? <CreateNewRuleGroupModal isOpen={isModalActive} toggle={onClose} /> : null;
};
