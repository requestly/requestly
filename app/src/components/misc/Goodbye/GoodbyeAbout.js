const GoodbyeAbout = () => {
  return (
    <div className="goodbye-about-wrapper">
      <div className="goodbye-img-wrapper">
        <img alt="" className="goodbye-image" src={"/assets/media/components/sachin-jain.jpeg"} />
      </div>
      <div className="goodbye-about-text">
        <p>Hi,</p>
        <p>
          I'm Sachin, founder & CEO of Requestly. It's me and our team who've been keeping this tool up and running
          since 2013. In 2021 alone, we implemented over 60 minor and major changes in Requestly. Most of these changes
          were requested by our users.
        </p>
        <p>We're open to improvements and feedback. Your opinion does matter and can change Requestly.</p>
      </div>
    </div>
  );
};

export default GoodbyeAbout;
