// import { UserOutlined } from "@ant-design/icons";
import starIcon from "../../../../assets/img/icons/common/star.svg";
import reviewIcon from "../../../../assets/img/icons/common/review.svg";
import usersIcon from "../../../../assets/img/icons/common/users.svg";
import "./index.css";

const ChromeStoreStats = () => {
  return (
    <div className="chrome-store-stats-container">
      <div className="stat-wrapper">
        <img src={starIcon} alt="stars" />
        <div className="text-gray">
          <span className="stat">4.7</span>/5 Star ratings
        </div>
      </div>
      <div className="stat-wrapper">
        <img src={reviewIcon} alt="reviews" />
        <div className="text-gray">
          <span className="stat">1000+</span> Chrome web store review
        </div>
      </div>
      <div className="stat-wrapper">
        <div className="text-gray">
          <img src={usersIcon} alt="users" />
          <span className="stat">170,000+</span> Happy users
        </div>
      </div>
    </div>
  );
};

export default ChromeStoreStats;
