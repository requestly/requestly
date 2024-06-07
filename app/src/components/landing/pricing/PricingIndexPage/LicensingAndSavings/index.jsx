import React from "react";
import { Card, Col, Row, Typography } from "antd";
import { FileTextOutlined, UserSwitchOutlined, CreditCardOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Title, Text, Link } = Typography;

const styles = {
  section: {
    padding: "40px 20px",
  },
  container: {
    maxWidth: "65vw",
    margin: "0 auto",
  },
  title: {
    textAlign: "center",
    marginBottom: "40px",
  },
  col: {
    display: "flex",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
    background: "var(--component-background)",
  },
  icon: {
    fontSize: "2.2em",
    marginBottom: "20px",
  },
  text: {
    color: "var(--neutrals-gray-300)",
  },
};

const LicensingAndSavings = () => {
  return (
    <div style={styles.section}>
      <div style={styles.container}>
        <Title level={2} style={styles.title}>
          How Requestly License Works
        </Title>
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} md={8} style={styles.col}>
            <Card style={styles.card}>
              <FileTextOutlined style={styles.icon} />
              <Title level={4}>License policy</Title>
              <Text style={styles.text}>
                Requestly has a subscription license, and after your initial term, it automatically renews either yearly
                or monthly, depending on your plan. Each license allows one user to work with the product.
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={8} style={styles.col}>
            <Card style={styles.card}>
              <UserSwitchOutlined style={styles.icon} />
              <Title level={4}>Reassign to someone else</Title>
              <Text style={styles.text}>
                You can purchase a license and assign the seat to someone else via Dashboard. If you're managing billing
                only and not using the product, you won't be charged.
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={8} style={styles.col}>
            <Card style={styles.card}>
              <CreditCardOutlined style={styles.icon} />
              <Title level={4}>Payment processing</Title>
              <Text style={styles.text}>
                Your transaction is processed securely through Stripe. All payments are encrypted, and your credentials
                and payment method are isolated for security. We do not save any card info.
              </Text>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default LicensingAndSavings;
