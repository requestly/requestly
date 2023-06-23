import { Typography, Row, Col } from "antd";
import { HiArrowRight } from "react-icons/hi";
import { CompanyMarquee } from "components/misc/Marquee";
import quoteIcon from "../../../assets/img/icons/common/quote.svg";
import underlineIcon from "../../../assets/img/icons/common/underline.svg";

export const AuthFormHero = ({ currentTestimonialIndex }) => {
  const workEmailsBenefits = [
    "Use Requestly with your colleagues",
    "Access to Team Workspaces",
    "Access to Session Recording",
    "Organization level access controls",
  ];

  const TestimonialSection = () => {
    const testimonials = [
      {
        body: "Requestly is a game-changer. It started with one person and now the entire team uses Requestly.",
        name: "Piers Carrigan",
        author: "https://uploads-ssl.webflow.com/6348fffb6541341630d50640/63809401540ef733d3ce9506_piers.jpeg",
        role: "QA Lead",
        company: "15Gifts",
      },
      {
        body:
          "Requestly made it easier for us to develop, test & debug our code. We more confidently ship product updates now.",
        name: "Michael Levinson",
        author: "https://uploads-ssl.webflow.com/6348fffb6541341630d50640/638094ec2d13f972194ee214_michael.jpeg",
        role: "CPO & Co-Founder",
        company: "Joyned",
      },
      {
        body: "Requestly is one-stop solution for all our needs at Wingify. Collaboration feature works like a Charm.",
        name: "Nitish Mittal",
        author: "https://uploads-ssl.webflow.com/6348fffb6541341630d50640/638c981c0787c782c9e26282_nitish.jpeg",
        role: "Director of Engineering",
        company: "Wingify",
      },
    ];

    return (
      <Col className="signup-modal-testimonial-wrapper">
        <img src={quoteIcon} alt="quote" />
        <Row>
          <Typography.Text type="primary">{testimonials[currentTestimonialIndex].body}</Typography.Text>
        </Row>
        <Row align={"middle"} className="signup-modal-testimonial">
          <img src={testimonials[currentTestimonialIndex].author} alt="user" width={28} />
          <Typography.Text type="secondary">
            - {testimonials[currentTestimonialIndex].name}, {testimonials[currentTestimonialIndex].role} at{" "}
            {testimonials[currentTestimonialIndex].company}
          </Typography.Text>
        </Row>
      </Col>
    );
  };

  return (
    <Col span={13} className="signup-modal-section-wrapper signup-modal-hero">
      <Typography.Title type="primary" className="signup-modal-hero-title w-full text-bold">
        Speed up your web development, testing & debugging process 🚀
      </Typography.Title>
      <div className="work-email-wrapper">
        <Typography.Text type="primary" className="text-bold header">
          Use{" "}
          <span className="work-email-highlight-wrapper">
            work email <img src={underlineIcon} alt="work email" />
          </span>{" "}
          to get access to
        </Typography.Text>

        {workEmailsBenefits.map((benefit, index) => (
          <div className="work-email-benefit-item" key={index}>
            <HiArrowRight className="signup-modal-secondary-text" />
            <Typography.Text className="signup-modal-secondary-text">{benefit}</Typography.Text>
          </div>
        ))}
      </div>
      <Typography.Text className="signup-modal-secondary-text">
        Trusted by developers from 5000+ Organizations
      </Typography.Text>
      <CompanyMarquee />
      <TestimonialSection />
    </Col>
  );
};
