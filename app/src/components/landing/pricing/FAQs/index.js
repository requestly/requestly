import React, { useState } from "react";
import { ContactUsModal } from "componentsV2/modals/ContactUsModal";
import { RQButton } from "lib/design-system/components";
import "./index.css";

const PricingFAQs = () => {
  const [isContactUsModalOpen, setIsContactUsModalOpen] = useState(false);

  const FAQs = [
    {
      ques: <React.Fragment>Do individual developers need to pay for Requestly?</React.Fragment>,
      answer: (
        <React.Fragment>
          No, developers working individually without a team are not required to pay for Requestly. The Free plan
          provides liberal limits and includes many features you know and love, including capturing requests and
          modifying requests, mocking APIs, SessionBook, and much more.
        </React.Fragment>
      ),
    },
    {
      ques: <React.Fragment>How can I remove limits from the Free plan?</React.Fragment>,
      answer: (
        <React.Fragment>
          Requestly is an open-source platform. Downloading the source code from GitHub allows you to use the Free plan
          without any limitations, but sharing and other collaboration features will be unavailable.
        </React.Fragment>
      ),
    },
    {
      ques: <React.Fragment>When should I switch to the Pro plan?</React.Fragment>,
      answer: (
        <React.Fragment>
          Users should look forward to creating teams when there is a need for collaboration, as team workspaces provide
          real-time modification of rules and synchronization within the team and thereby enhances the productivity of
          teams.
        </React.Fragment>
      ),
    },
    {
      ques: <React.Fragment>Does unlimited really mean unlimited in the case of Pro plan?</React.Fragment>,
      answer: (
        <React.Fragment>
          Yes. Rarely some things might get restricted due to storage or performance reasons. Please contact us in case
          that happens.
        </React.Fragment>
      ),
    },
    {
      ques: <>I want to modify only HTTP Headers, Is there a discounted plan for me?</>,
      answer: (
        <>
          We provide a custom plan for users seeking unlimited header modifications at $5/month.{" "}
          <span onClick={() => setIsContactUsModalOpen(true)} className="link-button">
            Contact us
          </span>{" "}
          to get this plan activated for you.
        </>
      ),
    },
    {
      ques: <React.Fragment>Which payment methods do you accept?</React.Fragment>,
      answer: (
        <React.Fragment>
          We are using Stripe as our payment processor. Stripe supports the majority of credit and debit card networks,
          including Visa & Mastercard.
        </React.Fragment>
      ),
    },
  ];
  return (
    <>
      <div className="text-center faq-heading">Frequently Asked Questions</div>
      <>
        {FAQs.map((faq, index) => (
          <div key={index} className="faq-item">
            <div className="faq-question">{faq.ques}</div>
            <div className="faq-answer">{faq.answer}</div>
          </div>
        ))}
      </>
      <div className="more-questions-container">
        <div className="header text-gray">Still have more questions?</div>
        <RQButton type="primary" className="faq-contact-btn" onClick={() => setIsContactUsModalOpen(true)}>
          Contact us
        </RQButton>
      </div>
      <ContactUsModal
        isOpen={isContactUsModalOpen}
        onCancel={() => setIsContactUsModalOpen(false)}
        heading="Get In Touch"
        subHeading="Learn about Requestly"
        source="pricing_page"
      />
    </>
  );
};

export default PricingFAQs;
