import React from "react";
import { Collapse } from "antd";
import { MdOutlineExpandLess } from "@react-icons/all-files/md/MdOutlineExpandLess";
import "./index.css";

const PricingFAQs = () => {
  const FAQs = [
    {
      question: <React.Fragment>Do individual developers need to pay for Requestly?</React.Fragment>,
      answer: (
        <React.Fragment>
          No, developers working individually without a team are not required to pay for Requestly. The Free plan
          provides liberal limits and includes many features you know and love, including capturing requests and
          modifying requests, mocking APIs, SessionBook, and much more.
        </React.Fragment>
      ),
    },
    {
      question: <React.Fragment>How can I remove limits from the Free plan?</React.Fragment>,
      answer: (
        <React.Fragment>
          Requestly is an open-source platform. Downloading the source code from GitHub allows you to use the Free plan
          without any limitations, but sharing and other collaboration features will be unavailable.
        </React.Fragment>
      ),
    },
    {
      question: <React.Fragment>When should I switch to the Pro plan?</React.Fragment>,
      answer: (
        <React.Fragment>
          Users should look forward to creating teams when there is a need for collaboration, as team workspaces provide
          real-time modification of rules and synchronization within the team and thereby enhances the productivity of
          teams.
        </React.Fragment>
      ),
    },
    {
      question: <React.Fragment>Does unlimited really mean unlimited in the case of Pro plan?</React.Fragment>,
      answer: (
        <React.Fragment>
          Yes. Rarely some things might get restricted due to storage or performance reasons. Please contact us in case
          that happens.
        </React.Fragment>
      ),
    },
    {
      question: <>I want to modify only HTTP Headers, Is there a discounted plan for me?</>,
      answer: (
        <>
          We provide a custom plan for users seeking unlimited header modifications. Contact us to get this plan
          activated for you.
        </>
      ),
    },
    {
      question: <React.Fragment>Which payment methods do you accept?</React.Fragment>,
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
      <div className="faq-heading">Frequently asked questions</div>
      <div className="faq-collapse-container">
        <Collapse
          ghost
          className="faq-collapse"
          expandIconPosition="right"
          expandIcon={(panelprops) => {
            return (
              <MdOutlineExpandLess className={`anticon faq-collapse-icon  ${panelprops?.isActive ? "active" : ""}`} />
            );
          }}
        >
          {FAQs.map((faq, index) => (
            <Collapse.Panel key={index} header={<div className="faq-question">{faq.question}</div>}>
              <div className="faq-answer">{faq.answer}</div>
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    </>
  );
};

export default PricingFAQs;
