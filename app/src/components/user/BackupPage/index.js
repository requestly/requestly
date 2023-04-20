import React, { useState, useEffect, useCallback } from "react";
import { Col, Row, Button } from "antd";
import { FileSyncOutlined } from "@ant-design/icons";
// import _ from "lodash";
import debounce from "lodash.debounce";
import SpinnerCard from "../../misc/SpinnerCard";
import { toast } from "utils/Toast.js";
//UTILS
import { getLastBackupTimeStamp, getAppMode, getUserAuthDetails } from "../../../store/selectors";
import { actions } from "../../../store";
import { createNewBackup, getBackupFromFirestore, updateRecordWithBackup } from "../../../utils/BackupUtils";
import { redirectToRules } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
//CONSTANTS
import APP_CONSTANTS from "../../../config/constants";
import ProCard from "@ant-design/pro-card";
import ProTable from "@ant-design/pro-table";
import moment from "moment";
import { UndoOutlined } from "@ant-design/icons";
import { isEmpty } from "lodash";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { useDispatch, useSelector } from "react-redux";
import { trackBackupRollbacked } from "modules/analytics/events/features/syncing/backup";

const BackupPage = () => {
  const navigate = useNavigate();

  // GLOBAL STATE
  const dispatch = useDispatch();
  const lastBackupTimestamp = useSelector(getLastBackupTimeStamp);
  const user = useSelector(getUserAuthDetails);
  const uid = user.details.profile.uid;
  const appMode = useSelector(getAppMode);

  // COMPONENT STATE
  const [currentBackupTimestamp, setCurrentBackupTimestamp] = useState("");
  const [savedBackups, setSavedBackups] = useState(null);
  const [isBackupFetched, setIsBackupFetched] = useState(false);
  const [isRollbackProcessing, setIsRollbackProcessing] = useState(false);

  const getPreviousBackups = async () => {
    const doc = await getBackupFromFirestore(uid);
    setSavedBackups(doc.data);
    setIsBackupFetched(true);
  };
  const stableGetPreviousBackups = useCallback(getPreviousBackups, [uid]);

  // Loads remote backup into local storage
  const copyRulesAndGroupsFromRemoteBackup = (index) => {
    if (savedBackups) {
      setIsRollbackProcessing(true);

      const selectedBackup = savedBackups.backups[index];
      updateRecordWithBackup(appMode, selectedBackup)
        .then(() => {
          toast.info(`Rules and Groups updated`);
          trackBackupRollbacked(index + 1);

          setIsRollbackProcessing(false);
        })
        .then(() => redirectToRules(navigate))
        .catch(() => {
          console.log("Error: Caught trying to copy empty backup to storage, please Report!");

          setIsRollbackProcessing(false);
        });
    } else console.log("Error: Caught trying to copy empty backup to storage, please Report!");
  };

  const BackupsTableColumns = [
    {
      title: "Backup Date",
      dataIndex: "timestamp",
      valueType: "date",
      render: (_, record) => {
        return moment(record.timestamp).format("LLL");
      },
    },
    {
      title: "Actions",
      align: "right",
      render: (_, record, index) => {
        return (
          <Button
            icon={<UndoOutlined />}
            onClick={() => copyRulesAndGroupsFromRemoteBackup(index)}
            loading={isRollbackProcessing}
          >
            Rollback
          </Button>
        );
      },
    },
  ];

  useEffect(() => {
    if (lastBackupTimestamp && isEmpty(currentBackupTimestamp)) {
      setCurrentBackupTimestamp(lastBackupTimestamp);
    }

    if (!savedBackups) {
      stableGetPreviousBackups();
    }
  }, [
    savedBackups,
    lastBackupTimestamp,
    currentBackupTimestamp,
    setSavedBackups,
    setCurrentBackupTimestamp,
    stableGetPreviousBackups,
  ]);

  // Function to send backup to backend manually
  const sendBackup = debounce(() => {
    toast.info(`Creating backup, this will take a while`);
    createNewBackup(appMode).then((res) => {
      if (res.success) {
        if (res.time) {
          toast.success(`New Backup Created!`);
          setCurrentBackupTimestamp(res.time);
          stableGetPreviousBackups();
          dispatch(actions.updateLastBackupTimeStamp(Date.now()));
        }
      } else {
        toast.error(`Something went wrong!`);
      }
    });
  }, 1000);

  return isBackupFetched ? (
    <React.Fragment>
      <ProCard className="primary-card github-like-border">
        <Row>
          <Col span={24}>
            {savedBackups ? (
              <>
                <Row className="align-items-center">
                  <Col span={24} align="center">
                    <h2>
                      Never loose your rules data anymore.
                      <br />
                      Your rules are backed up every 6-hours.
                    </h2>
                    <p>
                      <em>
                        <a href={APP_CONSTANTS.LINKS.REQUESTLY_DOCS_BACKUP_DATA}>Learn how it works</a>
                      </em>
                    </p>
                  </Col>
                </Row>

                <Row>
                  <Col span={24} align="center">
                    <ProTable
                      rowKey="timestamp"
                      dataSource={savedBackups.backups}
                      options={false}
                      pagination={false}
                      search={false}
                      dateFormatter={false}
                      headerTitle="Recent backups"
                      columns={BackupsTableColumns}
                      toolBarRender={() => [
                        <Button type="secondary" onClick={sendBackup} icon={<FileSyncOutlined />}>
                          Initiate a Backup
                        </Button>,
                      ]}
                    />
                  </Col>
                </Row>
              </>
            ) : (
              <Row>
                <Col lg="12" md="12" className="text-center">
                  <Jumbotron style={{ background: "transparent" }} className="text-center">
                    <h1 className="display-3">Create Your First Backup</h1>
                    <p className="lead">Never loose your rules data anymore. Your rules are backed up every 6-hours.</p>
                    <p>
                      <Button color="primary" onClick={() => sendBackup()}>
                        Backup Your Data
                      </Button>
                    </p>
                  </Jumbotron>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </ProCard>
    </React.Fragment>
  ) : (
    <>
      <SpinnerCard customLoadingMessage="Getting previous backups" />
    </>
  );
};

export default BackupPage;
