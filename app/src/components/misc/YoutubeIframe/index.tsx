import React from "react";
import YouTube, { YouTubeProps } from "react-youtube";

interface YTVideoProps {
  src: string;
  width: string;
  height: string;
  handleOnPlay: () => void;
}

export const YouTubePlayer: React.FC<YTVideoProps> = ({ src, width, height, handleOnPlay }) => {
  const getVideoIdFromURL = () => {
    const urlParts = src.split("/");
    return urlParts[urlParts.length - 1];
  };

  const options: YouTubeProps["opts"] = {
    width,
    height,
  };

  return <YouTube videoId={getVideoIdFromURL()} opts={options} title={src} onPlay={handleOnPlay} />;
};
