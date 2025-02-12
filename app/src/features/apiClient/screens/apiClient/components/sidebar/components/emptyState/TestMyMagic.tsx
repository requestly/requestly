import { RQButton } from "lib/design-system-v2/components";
import { useEffect } from "react";
import { LocalFileSyncProvider } from "services/localFileSync";

const LocalFileSync = LocalFileSyncProvider.getInstance();

// todo TEMPLATE COMPONENT: Remove this component before merging
export function TestMyMagic() {
  const clickHandler = () => {
    console.log("Clicked");
    LocalFileSync.test({ foo: "arg1" }, { bar: "arg2" })
      .then((res) => {
        console.log("Response from BG: ", res);
      })
      .catch(console.error);
  };

  const expectedToFailHandler = () => {
    console.log("Clicked");
    LocalFileSync.notImplementedInBG(true)
      .then((res) => {
        console.log("Response from BG: ", res);
      })
      .then(console.log)
      .catch(console.error);
  };

  useEffect(() => {
    LocalFileSync.setEventListener((event: any) => {
      console.log("Live event from BG: ", event);
    });
    return () => {
      LocalFileSync.removeEventListeners();
    };
  });

  return (
    <>
      <RQButton onClick={clickHandler}>Abra cadabra</RQButton>
      <RQButton onClick={expectedToFailHandler}>Aveda kedabra</RQButton>
    </>
  );
}
