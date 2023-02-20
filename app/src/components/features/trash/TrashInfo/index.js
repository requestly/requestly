import React from "react";
import { useNavigate } from "react-router-dom";

//UTILS
import { redirectToRules } from "../../../../utils/RedirectionUtils";
import { Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { FeatureBanner } from "components/common/featureBanner";
import Trash from "../../../../assets/img/icons/common/trash.svg";

const TrashInfo = ({ error }) => {
  const navigate = useNavigate();

  const renderEmptyTrashDescription = () => {
    return (
      <>
        <p>
          {error
            ? "Sorry we couldn't load the rules, please refresh or try again later"
            : "Rules deleted in the past 30 days can be recovered from here."}
        </p>
        <Row justify="center">
          <RQButton type="primary" onClick={() => redirectToRules(navigate)}>
            Go to Rules
          </RQButton>
        </Row>
      </>
    );
  };
  return (
    <FeatureBanner
      title="Deleted Rules"
      bannerTitle="Trash"
      bannerImg={Trash}
      description={renderEmptyTrashDescription()}
    />
  );
};

export default TrashInfo;
