import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import RuleEditor from "./RuleEditor";

const RuleEditorView = () => {
  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM}>
      <RuleEditor />
    </BottomSheetProvider>
  );
};

export default RuleEditorView;
