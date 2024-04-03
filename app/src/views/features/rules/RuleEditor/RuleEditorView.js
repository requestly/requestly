import { BottomSheetProvider } from "componentsV2/BottomSheet";
import RuleEditor from "./RuleEditor";

const RuleEditorView = () => {
  return (
    <BottomSheetProvider>
      <RuleEditor />
    </BottomSheetProvider>
  );
};

export default RuleEditorView;
