// app/src/features/graphify/screens/graphify/translation/components/testingDeploy/index.jsx

import React, { useState } from "react";
import { Tabs, Card, Input, Switch, Space, Alert } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { useGraphify } from "hooks/graphify/useGraphify"; // Import our hook
import "./testingDeploy.scss";

const { TabPane } = Tabs;

const TestingDeploy = ({ schemaData, analysisId, onPrevious }) => {
  // State for queries and results
  const [queryInput, setQueryInput] = useState(
    `# Try this example query
query {
  users {
    id
    name
  }
}`
  );
  const [queryResult, setQueryResult] = useState(null);
  const [restCalls, setRestCalls] = useState([]);
  const [error, setError] = useState(null);

  // Get our GraphQL execution function from the hook
  const { executeQuery, isExecuting } = useGraphify();

  // Handle query execution
  const handleExecuteQuery = async () => {
    try {
      setError(null);
      setQueryResult(null);

      const result = await executeQuery(analysisId, queryInput);

      setQueryResult(result.data);
      setRestCalls(result.restCalls || []);
    } catch (err) {
      console.error("Query execution failed:", err);
      setError(err.message || "Failed to execute query");
    }
  };

  // Render REST calls made during query execution
  const renderRestCalls = () => {
    if (!restCalls.length) {
      return <Alert type="info" message="Execute a GraphQL query to see how it translates to REST calls" showIcon />;
    }

    return restCalls.map((call, index) => (
      <Card key={index} size="small" className="rest-call-card" title={`REST Call ${index + 1}`}>
        <pre className="rest-call-details">
          {JSON.stringify(
            {
              method: call.method,
              url: call.url,
              headers: call.headers,
            },
            null,
            2
          )}
        </pre>
      </Card>
    ));
  };

  return (
    <div className="testing-deploy">
      <Tabs defaultActiveKey="testing">
        <TabPane tab="Test Queries" key="testing">
          <div className="testing-section">
            <div className="query-section">
              <Card title="GraphQL Query">
                <div className="query-editor">
                  <Input.TextArea
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    rows={10}
                    placeholder="Enter your GraphQL query"
                  />
                  <RQButton type="primary" onClick={handleExecuteQuery} loading={isExecuting}>
                    Execute Query
                  </RQButton>
                </div>
              </Card>

              {error && <Alert type="error" message="Error" description={error} closable className="error-alert" />}

              {queryResult && (
                <Card title="Query Result" className="result-card">
                  <pre>{JSON.stringify(queryResult, null, 2)}</pre>
                </Card>
              )}
            </div>

            <div className="rest-calls-section">
              <h3>REST API Calls</h3>
              {renderRestCalls()}
            </div>
          </div>
        </TabPane>

        {/* Keeping deployment simple for MVP */}
        <TabPane tab="Deploy API" key="deploy">
          <div className="deploy-section">
            <Card>
              <Alert
                message="Coming Soon"
                description="API deployment functionality will be available in the next version."
                type="info"
                showIcon
              />
            </Card>

            <div className="deploy-actions">
              <RQButton onClick={onPrevious}>Back</RQButton>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TestingDeploy;
