import React from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdAutoAwesome } from "@react-icons/all-files/md/MdAutoAwesome";
import { MdArrowOutward } from "@react-icons/all-files/md/MdArrowOutward";

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
  const title = canGenerateTests ? "No test results found for this request" : "Tests are setup but not run yet";

  const description = canGenerateTests
    ? "Write a test script or generate one automatically based on the last response."
    : "Send your request to execute your tests and view results here.";

  return (
    <div className="empty-tests-view-container">
      <img src="/assets/media/apiClient/tests.svg" alt="test container" />

      <div className="empty-tests-view-title">{title}</div>
      <div className="empty-tests-view-description">{description}</div>

      {showGenerateCta && (
        <RQButton
          type="secondary"
          icon={<MdAutoAwesome />}
          onClick={onGenerateTests}
          loading={isGeneratingTests}
          disabled={isGeneratingTests || !onGenerateTests}
        >
          {isGeneratingTests ? "Generating Tests" : "Generate Tests"}
        </RQButton>
      )}

      <a
        className="empty-tests-doc-anchor"
        href="https://docs.requestly.com/general/api-client/tests"
        target="_blank"
        rel="noopener noreferrer"
      >
        Read Documentation
        <MdArrowOutward />
      </a>
    </div>
  );
};
