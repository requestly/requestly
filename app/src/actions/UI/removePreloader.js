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
        document.body.removeChild(ele);
      }, 500);
    }
    document.body.style.pointerEvents = "unset";
  } catch (error) {
    Logger.log(error);
  }
};

// Auto Remove Preloader after some time in case some else function fails to invoke it!
setTimeout(removePreloader, 8000);

export default removePreloader;
