import React from "react";
import { Button, Collapse } from "antd";
import { MdOutlineExpandLess } from "@react-icons/all-files/md/MdOutlineExpandLess";
import { trackContactUsClicked } from "./analytics";
import LINKS from "config/constants/sub/links";
import "./index.css";

const PricingFAQs = () => {
  const FAQs = [
    {
      question: <React.Fragment>How Requestly License Works?</React.Fragment>,
      answer: (
        <React.Fragment>
          Requestly has a subscription license, and after your initial term, it automatically renews either yearly or
          monthly, depending on your plan. Each license allows one user to work with the product.
        </React.Fragment>
      ),
    },
    {
      question: <React.Fragment>Is it possible to transfer a purchased license to another person?</React.Fragment>,
      answer: (
        <React.Fragment>
          You can purchase a license and assign the seat to someone else via Dashboard. If you're managing billing only
          and not using the product, you won't be charged.
        </React.Fragment>
      ),
    },
    {
      question: <React.Fragment>How can I claim volume discounts?</React.Fragment>,
      answer: (
        <React.Fragment>
          Enjoy flexible pricing tailored to your needs. For discounts on 50+ licenses, email us at{" "}
          <a href="mailto:sales@requestly.io">sales@requestly.io</a>. Get the best pricing with our volume discount.
        </React.Fragment>
      ),
    },
    {
      question: <React.Fragment>How is my payment information handled and secured?</React.Fragment>,
      answer: (
        <React.Fragment>
          Your transaction is processed securely through Stripe. All payments are encrypted, and your credentials and
          payment method are isolated for security. We do not save any card info.
        </React.Fragment>
      ),
    },
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
      <div className="faq-footer">
        Still have more questions?
        <Button
          type="link"
          className="link"
          onClick={() => {
            trackContactUsClicked("pricing_page");
            window.open(LINKS.CONTACT_US_PAGE, "_blank");
          }}
        >
          Contact us
        </Button>
      </div>
    </>
  );
};

export default PricingFAQs;
