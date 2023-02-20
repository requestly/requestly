import { Col, Row, Select, Typography } from "antd";
import { useState } from "react";
import CodeHelper from "./CodeHelper";

const { Text, Title } = Typography;

const ANDROID_SDK_VERSION = "2.4.3";

const CODE_LANGUAGES = {
  JAVA: "JAVA",
  KOTLIN: "KOTLIN",
};

const AndroidIntegration = ({ sdkKey }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    CODE_LANGUAGES.KOTLIN
  );

  const renderGradleDependencyStep = () => {
    return (
      <>
        <Title level={5}>Add Dependency</Title>
        <p>
          Add Requestly to your app's <Text code>build.gradle</Text> file
        </p>
        <CodeHelper
          code={`dependencies {
  debugImplementation "io.requestly:requestly-android:${ANDROID_SDK_VERSION}"
  releaseImplementation "io.requestly:requestly-android-noop:${ANDROID_SDK_VERSION}"
  debugImplementation "io.requestly:requestly-android-okhttp:${ANDROID_SDK_VERSION}"
  releaseImplementation "io.requestly:requestly-android-okhttp-noop:${ANDROID_SDK_VERSION}"
}`}
        />
      </>
    );
  };

  const renderInitStep = () => {
    let okhttpStep = null;
    let initStep = null;

    switch (selectedLanguage) {
      case CODE_LANGUAGES.KOTLIN:
        initStep = `Requestly.Builder(this, "${sdkKey}")
  .build()`;
        okhttpStep = `val collector = RQCollector(context=appContext)
val rqInterceptor = RQInterceptor.Builder(appContext).collector(collector).build()
val client = OkHttpClient.Builder().addInterceptor(rqInterceptor).build()`;
        break;
      case CODE_LANGUAGES.JAVA:
        initStep = `new Requestly.Builder(this, "${sdkKey}")
  .build()`;
        okhttpStep = `RQCollector collector = new RQCollector(context=appContext);
RQInterceptor rqInterceptor = new RQInterceptor.Builder(appContext).collector(collector).build();
OkHttpClient client = new OkHttpClient.Builder().addInterceptor(rqInterceptor).build();`;
        break;
      default:
        initStep = null;
        okhttpStep = null;
    }

    return (
      <>
        <Row gutter={8}>
          <Col>
            <Title level={5}>Initialization</Title>
          </Col>
          <Col>
            <Select
              value={selectedLanguage}
              onChange={(value) => {
                setSelectedLanguage(value);
              }}
              size="small"
            >
              {Object.values(CODE_LANGUAGES).map((language) => {
                return (
                  <Select.Option value={language} key={language}>
                    {language}
                  </Select.Option>
                );
              })}
            </Select>
          </Col>
        </Row>
        <p>
          1. Initialize Requestly in your <Text code>Application</Text> Class{" "}
          <Text code>onCreate</Text> method
        </p>
        <CodeHelper code={initStep} />
        <p>
          2. Add the Requestly Interceptor to your{" "}
          <Text code>okhttp/Retrofit</Text> Client
        </p>
        <CodeHelper code={okhttpStep} />
      </>
    );
  };

  return (
    <>
      {renderGradleDependencyStep()}
      {renderInitStep()}
    </>
  );
};

export default AndroidIntegration;
