// app/src/features/graphify/screens/graphify/translation/components/endpointAnalysis/index.jsx

import React from "react";
import { Table, Checkbox, Skeleton } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import "./endpointAnalysis.scss";

const EndpointAnalysis = ({ apiConfig, endpoints, onNext, onPrevious, isLoading }) => {
  const [selectedEndpoints, setSelectedEndpoints] = React.useState([]);

  // When endpoints prop changes, update selected endpoints
  React.useEffect(() => {
    if (endpoints) {
      setSelectedEndpoints(endpoints.map((e) => e.id));
    }
  }, [endpoints]);

  // Fixed handleEndpointSelect function
  const handleEndpointSelect = (endpointId, checked) => {
    setSelectedEndpoints((prev) => {
      if (checked) {
        return [...prev, endpointId];
      }
      return prev.filter((id) => id !== endpointId);
    });
  };

  // Columns configuration for the endpoints table
  const columns = [
    {
      title: () => (
        <Checkbox
          checked={selectedEndpoints.length === endpoints?.length}
          indeterminate={selectedEndpoints.length > 0 && selectedEndpoints.length < (endpoints?.length || 0)}
          onChange={(e) => {
            // Handle "select all" checkbox
            setSelectedEndpoints(e.target.checked ? endpoints.map((endpoint) => endpoint.id) : []);
          }}
          className="endpoint-checkbox"
        />
      ),
      key: "include",
      width: 60,
      render: (_, record) => (
        <Checkbox
          checked={selectedEndpoints.includes(record.id)}
          onChange={(e) => handleEndpointSelect(record.id, e.target.checked)} // Pass checked state
          className="endpoint-checkbox"
        />
      ),
    },
    {
      title: "Method",
      key: "method",
      render: (_, record) => (
        <span className={`method-badge method-${record.method.toLowerCase()}`}>{record.method}</span>
      ),
    },
    {
      title: "Path",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Parameters",
      key: "parameters",
      render: (_, record) => record.parameters?.join(", ") || "-",
    },
  ];

  if (isLoading) {
    return (
      <div className="endpoint-analysis loading">
        <h3>Analyzing API Structure</h3>
        <p>Discovering endpoints and relationships...</p>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (!endpoints || endpoints.length === 0) {
    return (
      <div className="endpoint-analysis empty">
        <h3>No Endpoints Found</h3>
        <p>No endpoints were discovered for this API. Please check your API configuration.</p>
        <RQButton onClick={onPrevious}>Back to Configuration</RQButton>
      </div>
    );
  }

  return (
    <div className="endpoint-analysis">
      <div className="analysis-header">
        <h2>Discovered Endpoints</h2>
        <p className="description">Select which endpoints you want to include in your GraphQL API.</p>
      </div>

      <div className="endpoints-table">
        <Table
          columns={columns}
          dataSource={endpoints}
          rowKey={(record) => `${record.method}-${record.path}`}
          pagination={false}
        />
      </div>

      <div className="analysis-actions">
        <RQButton onClick={onPrevious}>Back</RQButton>
        <RQButton
          type="primary"
          onClick={() => {
            const selectedEndpointData = endpoints.filter((endpoint) => selectedEndpoints.includes(endpoint.id));
            onNext({
              endpoints: selectedEndpointData,
            });
          }}
          disabled={selectedEndpoints.length === 0}
        >
          Continue to Schema Preview
        </RQButton>
      </div>
    </div>
  );
};

export default EndpointAnalysis;
