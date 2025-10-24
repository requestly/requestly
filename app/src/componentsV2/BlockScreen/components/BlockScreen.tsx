import React, { ReactElement, useEffect } from "react";
import "./blockscreen.scss";
import MinimalLayout from "layouts/MinimalLayout";
import { BlockConfig, BlockType } from "../hooks/useIsUserBlocked";
import { trackBlockScreenViewed } from "../analytics";

interface Props {
  blockConfig: BlockConfig;
}

const BlockComponent = ({
  logo,
  title,
  subtitle,
}: {
  logo: ReactElement;
  title: ReactElement | string;
  subtitle: ReactElement | string;
}) => {
  return (
    <div className="block-screen-message-container">
      <div className="block-screen-message-icon">{logo}</div>
      <div className="block-screen-content">
        <div className="block-screen-message-title">{title}</div>
        <div className="block-screen-message-description">{subtitle}</div>
      </div>
    </div>
  );
};

export const BlockScreen: React.FC<Props> = ({ blockConfig }) => {
  const blockType = Object.keys(blockConfig)?.[0];
  const config = blockConfig[blockType as BlockType];

  useEffect(() => {
    trackBlockScreenViewed(blockType);
  }, [blockType]);

  let blockElement = (
    <BlockComponent
      logo={<img width={56} height={56} src={"/assets/media/grr/globe-warning.svg"} alt="Blocked" />}
      title={"Blocked"}
      subtitle={"Blocked"}
    />
  );

  if (blockType === BlockType.GRR) {
    blockElement = (
      <BlockComponent
        logo={<img width={56} height={56} src={"/assets/media/grr/globe-warning.svg"} alt="GRR warning" />}
        title={"Important Update on Requestly Usage"}
        subtitle={
          <>
            Welcome to Requestly, now part of BrowserStack! Your organization requires Data Residency, and Requestly is
            currently being updated for full compliance. For guidance on using Requestly, please reach out to your
            BrowserStack Customer Success Manager or email us at
            <a
              target="_blank"
              rel="noreferrer"
              href="mailto:contact@requestly.com"
              className="block-screen-message-contact-mail"
            >
              contact@requestly.com
            </a>
          </>
        }
      />
    );
  } else if (blockType === BlockType.COMPLIANCE_ISSUE) {
    blockElement = (
      <BlockComponent
        logo={<img width={56} height={56} src={"/assets/media/grr/globe-warning.svg"} alt={blockType} />}
        title={"Requestly is currently not enabled for your Organization"}
        subtitle={
          <>
            {"To enable Requestly access, please "}
            {config?.metadata?.contactEmail ? (
              <>
                reach out to{" "}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`mailto:${config?.metadata?.contactEmail}`}
                  className="block-screen-message-contact-mail"
                >
                  {config?.metadata?.contactEmail}
                </a>
                {" or "}
              </>
            ) : null}
            drop us an email at
            <a
              target="_blank"
              rel="noreferrer"
              href="mailto:support@requestly.com"
              className="block-screen-message-contact-mail"
            >
              support@requestly.com
            </a>
            .
          </>
        }
      />
    );
  }

  return (
    <MinimalLayout>
      <div className="block-screen-screen">{blockElement}</div>
    </MinimalLayout>
  );
};
