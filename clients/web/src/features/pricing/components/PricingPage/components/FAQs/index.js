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
      question: <>Is Requestly free for teams switching from ModHeader?</>,
      answer: (
        <>
          Yes! ModHeader's primary offering is HTTP header modification, and Requestly's free plan includes unlimited
          HTTP header modifications. This makes it simple for your team to migrate without any limitations or added
          costs.
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
    {
      question: <React.Fragment>Do you offer student discounts?</React.Fragment>,
      answer: (
        <React.Fragment>
          Requestly’s Professional Plan (worth $270) is free for students for one year! Just connect your GitHub Student
          account to unlock premium features instantly. Read more details{" "}
          <a target="_blank" href={LINKS.GITHUB_STUDENT_PROGRAM_DOC} rel="noreferrer">
            here
          </a>
          .
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
