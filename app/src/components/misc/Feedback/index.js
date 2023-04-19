import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";
import { Row, Col, Card, Button, Input, Rate } from "antd";
import { toast } from "utils/Toast.js";
import { getUserAuthDetails } from "../../../store/selectors";
import axios from "axios";
import { getFunctions, httpsCallable } from "firebase/functions";
//tracking
import { trackFeedbackSubmitted } from "modules/analytics/events/misc/feedback";
import Logger from "lib/logger";

const Feedback = () => {
  const functions = getFunctions();

  //Global State
  const user = useSelector(getUserAuthDetails);

  //Component State
  const [response, setResponse] = useState({
    uses: "",
    recommend: 0,
    suggestions: "",
  });
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const sendFeedbackResponse = httpsCallable(functions, "sendFeedbackResponse");
  //handleChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponse((prevVal) => {
      return {
        ...prevVal,
        [name]: value,
      };
    });
  };

  const customIcons = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />,
  };

  const handleSubmit = () => {
    if (!user.loggedIn) {
      if (userEmail === "") return toast.error("Please provide your e-mail address");
      else if (
        userEmail !== "" &&
        !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(userEmail.trim())
      ) {
        return toast.error("Please enter your valid e-mail address");
      }
    }

    setResponseSubmitted(true);

    //Send to Crisp and Analytics
    trackFeedbackSubmitted(response.suggestions, response.recommend);

    const excelData = {
      email: user.loggedIn ? user.details.profile.email : userEmail,
      uses: response.uses,
      recommend: response.recommend,
      suggestions: response.suggestions,
      date: new Date().toJSON().slice(0, 10).replace(/-/g, "/"),
    };
    //saving data in excel sheet
    axios.post("https://sheet.best/api/sheets/ffb1a7f7-9f6f-4e60-9fb1-982d43a17e25", excelData);

    sendFeedbackResponse({
      email: user.loggedIn ? user.details.profile.email : userEmail,
      mailType: "pricing",
      message: "Rating:" + response.recommend + ",Issue:" + response.uses + ",Suggestions:" + response.suggestions,
      userName: user.loggedIn ? user.details.profile.displayName : "not signed in",
    })
      .then(() => {
        Logger.log("email-done");
      })
      .catch((err) => {
        Logger.log(err);
      });
  };

  return (
    <React.Fragment>
      <Row>
        <Col style={{ width: "100%", height: "100%" }}>
          {responseSubmitted ? (
            <Row type="flex" justify="center" align="middle">
              <Col>
                <Card
                  style={{
                    marginTop: "15%",
                    border: "2px solid #0a48b3",
                    borderRadius: "5px",
                  }}
                >
                  <div
                    style={{
                      margin: "10px 0px 0px 10px",
                      textAlign: "center",
                    }}
                  >
                    <h2>Thanks for your valuable feedback 🙂</h2>
                  </div>
                </Card>
              </Col>
            </Row>
          ) : (
            <Row type="flex" justify="center" align="middle">
              <Col>
                <Card
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #0a48b3",
                    marginTop: "35px",
                  }}
                >
                  <div style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <h2>Feedback on Pricing Change</h2>
                    <div className="app">
                      <h3 style={{ marginTop: "20px" }}>What's your overall feedback on pricing change</h3>
                      <div style={{ margin: "20px auto 0px auto", width: "70%" }}>
                        <Rate
                          onChange={(e) => {
                            setResponse((prev) => {
                              return {
                                ...prev,
                                recommend: e,
                              };
                            });
                          }}
                          character={({ index }) => customIcons[index + 1]}
                        />
                        <p>Select an option</p>
                        <div style={{ marginTop: "20px" }}>
                          <h3>Anything else you want to say?</h3>
                          <Input.TextArea
                            name="suggestions"
                            value={response.suggestions}
                            rows={3}
                            onChange={handleChange}
                          />
                        </div>
                        {user.loggedIn ? null : (
                          <div style={{ marginTop: "20px" }}>
                            <h3>
                              Enter your Email <span style={{ color: "red" }}>*</span>
                            </h3>
                            <Input
                              placeholder="Enter your email address"
                              name="email"
                              value={userEmail}
                              onChange={(e) => setUserEmail(e.target.value)}
                            />
                          </div>
                        )}
                        <Button
                          style={{ width: "fit-content", marginTop: "20px" }}
                          block
                          type="primary"
                          size="large"
                          onClick={handleSubmit}
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};
export default Feedback;
