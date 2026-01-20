import { AuthScreen } from "../../AuthScreen";
import { AuthScreenContextProvider } from "../../context";
import { AuthScreenMode } from "../../types";
import "./authPage.scss";

export const AuthPage = () => {
  return (
    <div className="rq-auth-page">
      <AuthScreenContextProvider screenMode={AuthScreenMode.PAGE}>
        <AuthScreen />
      </AuthScreenContextProvider>
    </div>
  );
};
