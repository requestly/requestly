import React from "react";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system-v2/components/RQButton/RQButton";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import "./index.scss";
import GreenTickIcon from "assets/icons/green-tick.svg?react";
import { useSecretsModals } from "../../context/SecretsModalsContext";
import { SecretProviderType } from "@requestly/shared/types/entities/secretsManager";
import { mapProviderTypeToDisplayString } from "services/secretsManagerService";
import { selectSecretsByProviderId } from "features/apiClient/slices/secrets-manager/selectors";
import { useSelector } from "react-redux";

interface ManageProvidersRowProps {
  providerId: string;
  providerName: string;
  providerType: SecretProviderType;
  isActive?: boolean;
}

const ManageProvidersRow: React.FC<ManageProvidersRowProps> = ({
  providerId,
  providerName,
  providerType,
  isActive = false,
}) => {
  const { openEditProviderModal, openDeleteProviderModal } = useSecretsModals();

  const handleEdit = () => {
    openEditProviderModal(providerId);
  };

  const handleDelete = () => {
    openDeleteProviderModal(providerId, providerName);
  };

  const secretsCount = useSelector(selectSecretsByProviderId)(providerId).length;

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
          <p className="provider-type">{mapProviderTypeToDisplayString(providerType)}</p>
        </div>
      </Col>
      <Col xs={4} sm={4} md={4} lg={4} xl={4} className="manage-providers-col2">
        <span className="provider-secrets-count">{secretsCount} secrets</span>
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
