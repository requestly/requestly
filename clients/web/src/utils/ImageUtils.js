import md5 from "md5";
import { getRandomNumber } from "./Algos";

export const getRandomAvatar = () => {
  const randomNumber = getRandomNumber(1, 6);

  if (window.location.origin.includes("localhost")) {
    return "https://yoda.hypeople.studio/yoda-admin-template/react/static/media/memoji-1.afa5922f.png";
  }

  return `https://app.requestly.io/assets/img/memoji/png/analytics-marketing-team-${randomNumber}.png`;
};

export const generateGravatarURL = (email = "sagar@requestly.io") => {
  return `https://www.gravatar.com/avatar/${md5(email)}?s=200&d=${getRandomAvatar()}`;
};
