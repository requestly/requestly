import React from "react";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system-v2/components/RQButton/RQButton";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import "./index.scss";
import GreenTickIcon from "assets/icons/green-tick.svg?react";
import { useSecretsModals } from "../../context/SecretsModalsContext";

interface ManageProvidersRowProps {
  providerId?: string;
  providerName?: string;
  providerType?: string;
  secretsCount?: number;
  isActive?: boolean;
}

const ManageProvidersRow: React.FC<ManageProvidersRowProps> = ({
  providerId = "1",
  providerName = "Develop",
  providerType = "AWS secret manager",
  secretsCount = 5,
  isActive = true,
}) => {
  const { openEditProviderModal, openDeleteProviderModal } = useSecretsModals();

  const handleEdit = () => {
    openEditProviderModal({ id: providerId, name: providerName, type: providerType });
  };

  const handleDelete = () => {
    openDeleteProviderModal(providerId, providerName);
  };

  return (
    <Row className="manage-providers-row">
      <Col xs={12} sm={12} md={12} lg={12} xl={12} className="manage-providers-col1">
        <div className="provider-details-block">
          <div className="provider-name-block">
            <span className="provider-name">{providerName}</span>
            {isActive && (
              <span className="provider-status">
                <GreenTickIcon /> Active
              </span>
            )}
          </div>
          <p className="provider-type">{providerType}</p>
        </div>
      </Col>
      <Col xs={4} sm={4} md={4} lg={4} xl={4} className="manage-providers-col2">
        <span className="provider-secrets-count"> {secretsCount} secrets</span>
      </Col>
      <Col xs={8} sm={8} md={8} lg={8} xl={8} className="manage-providers-col3">
        <div className="provider-actions">
          <RQButton
            type="transparent"
            size="small"
            icon={<MdOutlineEdit />}
            className="edit-provider-button"
            onClick={handleEdit}
          >
            Edit
          </RQButton>
          <RQButton
            type="transparent"
            size="small"
            icon={<RiDeleteBin6Line />}
            className="delete-provider-button"
            onClick={handleDelete}
          >
            Delete
          </RQButton>
        </div>
      </Col>
    </Row>
  );
};

export default ManageProvidersRow;
