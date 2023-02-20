import { AiFillAndroid } from "react-icons/ai";
import { FaAppStore, FaReact } from "react-icons/fa";

export const APP_PLATFORMS = [
  {
    name: "Android",
    id: "android",
    icon: <AiFillAndroid size="1em" />,
  },
  {
    name: "IOS",
    id: "ios",
    icon: <FaAppStore />,
    tag: "Coming Soon",
  },
  {
    name: "React Native",
    id: "react-native",
    icon: <FaReact />,
    tag: "Coming Soon",
  },
];

export const APP_PLATFORMS_MAP = {};
APP_PLATFORMS.map((platform) => (APP_PLATFORMS_MAP[platform.id] = platform));
