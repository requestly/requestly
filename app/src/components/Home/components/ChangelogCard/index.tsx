import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Row, Typography, Spin } from "antd";
import { m, AnimatePresence } from "framer-motion";
import { ChangeLogType, Changelog } from "components/Home/types";
import Logger from "lib/logger";
import "./changelogCard.scss";
import { trackHomeWhatsNewClicked } from "components/Home/analytics";

export const ChangeLogCard: React.FC = () => {
  const [logs, setLogs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("https://requestly.tech/api/mockv2/v1/rq-changelog?teamId=LmyapmzY39XTFXvua6eX")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setLogs(data);
      })
      .catch((err) => {
        Logger.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <AnimatePresence>
      {isLoading ? (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="homepage-card-loader">
          <Spin tip="Getting new updates..." size="large" />
        </m.div>
      ) : (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Typography.Title level={5} className="changelog-card-title">
            🚀 What's new
          </Typography.Title>
          <Col className="changelog-card-logs-wrapper">
            {logs?.map((log: Changelog) => {
              return (
                <Col className="changelog-log">
                  <Row align="middle" gutter={8}>
                    <Col
                      className={`${
                        log.type === ChangeLogType.CHORE
                          ? "changelog-chore"
                          : ChangeLogType.FEATURE
                          ? "changelog-feature"
                          : "changelog-fix"
                      } changelog-card-log-tag`}
                    >
                      {log.tag}
                    </Col>
                    <Col className="changelog-card-log-date">on {log.date}</Col>
                  </Row>
                  <Typography.Text className="changelog-card-log-title">{log.title}</Typography.Text>
                  <div className="changelog-card-log-description">{log.description}</div>
                </Col>
              );
            })}
          </Col>
          <Link
            rel="noopener noreferrer"
            target="_blank"
            to="https://requestly.productlift.dev/"
            onClick={() => trackHomeWhatsNewClicked("view_all_updates")}
          >
            View all updates
          </Link>
        </m.div>
      )}
    </AnimatePresence>
  );
};
