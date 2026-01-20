import { MdOutlineReviews } from "@react-icons/all-files/md/MdOutlineReviews";
import { MdOutlineStarBorder } from "@react-icons/all-files/md/MdOutlineStarBorder";
import { FaRegLaugh } from "@react-icons/all-files/fa/FaRegLaugh";
import "./statsCard.scss";

export const StatsCard = () => {
  const statistics = [
    {
      icon: <MdOutlineStarBorder />,
      label: (
        <div className="stats-label">
          <span>4.4/5</span> Star ratings
        </div>
      ),
    },
    {
      icon: <MdOutlineReviews />,
      label: (
        <div className="stats-label">
          <span>1000+</span> Chrome web store reviews
        </div>
      ),
    },
    {
      icon: <FaRegLaugh />,
      label: (
        <div className="stats-label">
          <span>200,000+</span> Happy users
        </div>
      ),
    },
  ];
  return (
    <div className="stats-card-container">
      <div className="stats-card">
        {statistics.map((stat, index) => (
          <div key={index} className="stat-item">
            {stat.icon}
            {stat.label}
          </div>
        ))}
      </div>
    </div>
  );
};
