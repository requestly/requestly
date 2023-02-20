import SpinnerColumn from "components/misc/SpinnerColumn";
import ProCard from "@ant-design/pro-card";

const LoadingStep = () => {
  return (
    <ProCard>
      <SpinnerColumn message="Creating App" />
    </ProCard>
  );
};

export default LoadingStep;
