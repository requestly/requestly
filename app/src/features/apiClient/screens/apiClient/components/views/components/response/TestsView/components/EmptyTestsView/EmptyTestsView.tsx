import React from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdAutoFixHigh } from "@react-icons/all-files/md/MdAutoFixHigh";

interface EmptyTestsViewProps {
  onGenerateTests?: () => void;
  isGeneratingTests?: boolean;
  canGenerateTests?: boolean;
}

export const EmptyTestsView: React.FC<EmptyTestsViewProps> = ({
  onGenerateTests,
  isGeneratingTests = false,
  canGenerateTests = false,
}) => {
  const showGenerateCta = canGenerateTests;

  return (
    <div className="empty-tests-view-container">
      <img src={"/assets/media/apiClient/tests.svg"} alt="test container" />
      <div className="empty-tests-view-title">No test results found for this request</div>
      <div className="empty-tests-view-description">
        You can write a test script (
        <a href="https://docs.requestly.com/general/api-client/tests" target="_blank" rel="noopener noreferrer">
          Docs
        </a>
        ) or auto-generate a basic test suite for the last response.
      </div>

      {showGenerateCta ? (
        <RQButton
          type="secondary"
          icon={<MdAutoFixHigh />}
          onClick={onGenerateTests}
          loading={isGeneratingTests}
          disabled={isGeneratingTests || !onGenerateTests}
        >
          {isGeneratingTests ? "Generating Tests" : "Generate Tests"}
        </RQButton>
      ) : null}
    </div>
  );
};
