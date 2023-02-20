import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import FeatureCard from "./FeatureCard";
import {
  CloudOutlined,
  BugOutlined,
  MobileOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";

const Home = () => {
  const user = useSelector(getUserAuthDetails);

  return (
    <div className="home-container">
      <h2>
        Welcome to Requestly,{" "}
        {user.loggedIn ? user.details.profile.displayName : "User"}!
      </h2>
      <p className="home-sm-text">
        Here are the most common tools for modifying network (HTTP(s)) requests.
      </p>
      <p className="home-sm-text">
        For more info, visit the{" "}
        <a href="https://requestly.io/contact-us/">Support Center</a>
      </p>
      <h2 style={{ marginTop: "1rem" }}>Quick ways to get started</h2>
      <p className="home-sm-text ">
        You Don't need much to get started, just these few basic things!
      </p>
      <div className="feature-card-container">
        <FeatureCard
          name="Web Debugger"
          info="Intercept and modify network requests or sit amet, consectetur adipiscing elit, sed do eiusmod."
          setupText="Set up a web debugger"
          navigateTo="/rules"
          icon={<CreditCardOutlined className="feature-card-icon" />}
        />
        <FeatureCard
          name="Mobile Apps Debugger"
          info="Intercept and modify network requests or sit amet, consectetur adipiscing elit, sed do eiusmod."
          setupText="Set up a mobile apps debugger"
          navigateTo="/mobile-debugger"
          icon={<MobileOutlined className="feature-card-icon" />}
        />
        <FeatureCard
          name="Mock Server"
          info="Intercept and modify network requests or sit amet, consectetur adipiscing elit, sed do eiusmod."
          setupText="Set up a mock server"
          navigateTo="/mock-server"
          icon={<CloudOutlined className="feature-card-icon" />}
        />
        <FeatureCard
          name="Bug Reporting"
          info="Intercept and modify network requests or sit amet, consectetur adipiscing elit, sed do eiusmod."
          setupText="Set up a bug reporting"
          navigateTo="/sessions"
          icon={<BugOutlined className="feature-card-icon" />}
        />
      </div>
    </div>
  );
};

export default Home;
