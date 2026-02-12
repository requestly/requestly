import Logger from "lib/logger";

const removePreloader = () => {
  try {
    const ele = document.getElementById("ipl-progress-indicator");
    if (ele) {
      // fade out
      ele.classList.add("available");
      setTimeout(() => {
        // remove from DOM
        // ele.outerHTML = "";
        try {
          document.body.removeChild(ele);
        } catch (err) {
          Logger.log("Error removing preloader", err);
        }
      }, 500);
    }
    document.body.style.pointerEvents = "unset";
  } catch (error) {
    Logger.log(error);
  }
};

// Reduced timeout - preloader now removes earlier for better UX
// Auth continues loading in background
setTimeout(removePreloader, 8000);

export default removePreloader;
