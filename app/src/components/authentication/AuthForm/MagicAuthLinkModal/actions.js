import { actions } from "store";

let interval = null;
export function updateTimeToResendEmailLogin(dispatch, time) {
  let timeLeft = time;

  if (interval) {
    clearInterval(interval);
  }
  if (!time) return;

  interval = setInterval(() => {
    timeLeft--;
    dispatch(actions.updateTimeToResendEmailLogin(timeLeft));
    if (timeLeft === 0) {
      clearInterval(interval);
    }
  }, 1000);
}
