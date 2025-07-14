import React, { useEffect, useState } from "react";
import Checkbox, { CheckboxChangeEvent } from "antd/lib/checkbox";
import { TooltipProps } from "antd";
import { toast } from "utils/Toast";
import { updateSharedListNotificationStatus } from "../../actions";
import { AiOutlineInfoCircle } from "@react-icons/all-files/ai/AiOutlineInfoCircle";
import { RQTooltip } from "lib/design-system-v2/components";
import "./notifyOnImport.scss";

interface NotifyOnImportProps {
  label: string;
  sharedListId: string;
  disabled?: boolean;
  initialValue?: boolean;
  infoTooltipPlacement?: TooltipProps["placement"];
}

export const NotifyOnImport: React.FC<NotifyOnImportProps> = ({
  label,
  disabled,
  sharedListId,
  infoTooltipPlacement,
  initialValue = false,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notifyOnImport, setNotifyOnImport] = useState(false);

  useEffect(() => {
    setNotifyOnImport(initialValue);
  }, [initialValue]);

  const handleOnChange = async (e: CheckboxChangeEvent) => {
    try {
      // TODO: add analytics event for toggling notification
      setIsUpdating(true);
      setNotifyOnImport(e.target.checked);

      const result = await updateSharedListNotificationStatus(sharedListId, e.target.checked);

      if (!result.data.success) {
        throw new Error("Failed to update notification status");
      }
    } catch (error) {
      toast.error("Failed to update shared list notification status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <Checkbox
        value={notifyOnImport}
        disabled={disabled || isUpdating}
        onChange={handleOnChange}
        className="notify-on-import-checkbox"
      >
        <span className="notify-on-import-checkbox-label">
          {label}
          <RQTooltip
            showArrow={false}
            placement={infoTooltipPlacement ?? "rightTop"}
            overlayClassName="share-link-radio-btn-label-tooltip"
            title="Get an email when someone imports your shared list, including their email and timestamp."
          >
            <AiOutlineInfoCircle />
          </RQTooltip>
        </span>
      </Checkbox>
    </div>
  );
};
