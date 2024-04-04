import { MdOutlineScience } from "@react-icons/all-files/md/MdOutlineScience";
import { RQButton } from "lib/design-system/components";
import { useBottomSheetContext } from "componentsV2/BottomSheet";
import "./index.scss";

export const TestRuleButton = () => {
  const { toggleOpen } = useBottomSheetContext();
  return (
    <RQButton className="header-test-rule-btn" type="text" icon={<MdOutlineScience />} onClick={toggleOpen}>
      Test
    </RQButton>
  );
};
