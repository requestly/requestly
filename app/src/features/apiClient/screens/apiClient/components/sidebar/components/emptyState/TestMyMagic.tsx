import { RQButton } from "lib/design-system-v2/components";
import { useEffect, useState } from "react";
import { LocalFileSyncProvider } from "services/localFileSync";
import { sampleSerivceProvider, SampleService } from "services/SampleServiceAdapter";

const LocalFileSync = LocalFileSyncProvider.getInstance();
// todo TEMPLATE COMPONENT: Remove this component before merging
export function TestMyMagic() {
  const [sampleService, setSampleService] = useState<SampleService>(null);
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

  const addBase = () => {
    sampleService
      .add(5)
      .then((res) => {
        alert(`Result: ${res}`);
      })
      .catch(console.error);
  };

  const multiplyBase = () => {
    sampleService
      .multiply(5)
      .then((res) => {
        alert(`Result: ${res}`);
      })
      .catch(console.error);
  };

  useEffect(() => {
    console.log("DBG: trying to get service");
    sampleSerivceProvider
      .get(5)
      .then((service) => {
        setSampleService(service);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    console.log("DBG: trying setting event listener", JSON.stringify({ sampleService }));

    // LocalFileSync.setEventListener((event: any) => {
    //   console.log("Live event from BG: ", event);
    // });

    sampleService?.setEventListener((event: any) => {
      console.log("Live event for sample service: ", event);
    });
    return () => {
      LocalFileSync.removeEventListeners();
      sampleService?.removeEventListeners();
    };
  }, [sampleService]);

  return (
    <>
      <RQButton onClick={clickHandler}>Abra cadabra</RQButton>
      <RQButton onClick={expectedToFailHandler}>Aveda kedabra</RQButton>
      <RQButton onClick={addBase}>Sample service add</RQButton>
      <RQButton onClick={multiplyBase}>Sample service multiple</RQButton>
    </>
  );
}
