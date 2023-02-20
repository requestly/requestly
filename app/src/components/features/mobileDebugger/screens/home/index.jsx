import withAppDetailsHoc from "../../hoc/withAppDetailsHoc";
import FeaturesList from "./FeaturesList";
import ProCard from "@ant-design/pro-card";
import SpinnerColumn from "components/misc/SpinnerColumn";

const MobileDebuggerHome = ({ appId, appDetails, isDetailsLoading }) => {
  if (isDetailsLoading) {
    return (
      <ProCard>
        <SpinnerColumn />
      </ProCard>
    );
  }

  return <FeaturesList appDetails={appDetails} />;
};

export default withAppDetailsHoc(MobileDebuggerHome);
