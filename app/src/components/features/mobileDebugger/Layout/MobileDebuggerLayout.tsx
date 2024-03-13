import { Alert } from "antd";
import { Outlet } from "react-router";

export default function MobileDebuggerLayout() {
  return (
    <>
      <Alert
        message={
          <p style={{ marginBottom: "0px" }}>
            Android debugger will sunset on February 15.{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://requestly.com/blog/saying-goodbye-to-the-requestly-android-debugger/"
            >
              Check here to know more.
            </a>
          </p>
        }
        type="warning"
        showIcon
        style={{ margin: "1rem 1.5rem" }}
      />
      <Outlet />
    </>
  );
}
