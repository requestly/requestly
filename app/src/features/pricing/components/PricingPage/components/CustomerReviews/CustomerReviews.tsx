import CustomerReviewCard from "./components/CustomerReviewCard";
import "./customerReviews.scss";

export const CustomerReviews = () => {
  const customerStoryData = [
    {
      name: "Lea Verou",
      title: "W3C TAG member, MIT CSAIL",
      mugshot: "/assets/media/common/lea.jpeg",
      testimonial:
        "I absolutely love Requestly in my development process. Definitely, my most essential tool after a browser & a text editor!",
      companyName: "W3C",
    },
    {
      name: "Piers Carrigan",
      title: "QA lead",
      mugshot: "/assets/media/common/piers.jpeg",
      testimonial:
        "Requestly is a game-changer for us. It started with one person and now the entire team uses Requestly to test our Staging code on production customers & non-customer sites. We more confidently ship product updates now.",
      companyName: "15Gifts",
    },
  ];

  return (
    <>
      <div className="testimonials-section-title">
        Discover what top developers worldwide are saying about Requestly
      </div>
      <div className="testimonials-container">
        {customerStoryData.map((data) => (
          <CustomerReviewCard
            key={data.name}
            name={data.name}
            title={data.title}
            mugshot={data.mugshot}
            testimonial={data.testimonial}
            companyName={data.companyName}
          />
        ))}
      </div>
    </>
  );
};
