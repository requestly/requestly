// app/src/features/graphify/screens/graphify/translation/components/endpointAnalysis/index.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Table, Checkbox, Skeleton } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import "./endpointAnalysis.scss";

const EndpointAnalysis = ({ apiConfig, onNext, onPrevious }) => {
  // State management for endpoints and analysis
  const [analyzing, setAnalyzing] = useState(true);
  const [endpoints, setEndpoints] = useState([]);
  const [selectedEndpoints, setSelectedEndpoints] = useState([]);
  const [relationships, setRelationships] = useState([]);

  // Simulated API analysis function - in production, this would make real API calls
  const simulateAPIAnalysis = async (config) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulated discovered endpoints based on common REST patterns
    return {
      endpoints: [
        {
          id: "1",
          method: "GET",
          path: "/users",
          resourceType: "User",
          description: "Get all users",
          parameters: ["limit", "offset"],
        },
        {
          id: "2",
          method: "GET",
          path: "/users/:id",
          resourceType: "User",
          description: "Get user by ID",
          parameters: ["id"],
        },
        {
          id: "3",
          method: "POST",
          path: "/users",
          resourceType: "User",
          description: "Create a new user",
          parameters: [],
        },
        {
          id: "4",
          method: "GET",
          path: "/users/:id/posts",
          resourceType: "Post",
          description: "Get posts by user ID",
          parameters: ["userId"],
        },
      ],
      relationships: [
        {
          from: "/users/:id",
          to: "/users/:id/posts",
          type: "hasMany",
          description: "User has many posts",
        },
      ],
    };
  };

  // Analyze API endpoints - wrapped in useCallback to avoid dependency issues
  const analyzeAPI = useCallback(async () => {
    try {
      setAnalyzing(true);

      // In production, this would make real API calls to discover endpoints
      const analysisResult = await simulateAPIAnalysis(apiConfig);

      setEndpoints(analysisResult.endpoints);
      setSelectedEndpoints(analysisResult.endpoints.map((e) => e.id));
      setRelationships(analysisResult.relationships);
    } catch (error) {
      console.error("Error analyzing API:", error);
      // In production, you would want to show this error to the user
    } finally {
      setAnalyzing(false);
    }
  }, [apiConfig]);

  // Effect to trigger analysis when component mounts
  useEffect(() => {
    analyzeAPI();
  }, [analyzeAPI]);

  // Handle endpoint selection/deselection
  const handleEndpointSelect = (endpointId) => {
    setSelectedEndpoints((prev) => {
      if (prev.includes(endpointId)) {
        return prev.filter((id) => id !== endpointId);
      }
      return [...prev, endpointId];
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: () => (
        <Checkbox
          checked={selectedEndpoints.length === endpoints.length}
          indeterminate={selectedEndpoints.length > 0 && selectedEndpoints.length < endpoints.length}
          onChange={(e) => {
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
          onChange={(e) => handleEndpointSelect(record.id)}
          className="endpoint-checkbox"
        />
      ),
    },
    {
      title: "Method",
      key: "method",
      render: (text, record) => (
        <span className={`method-badge method-${record.method.toLowerCase()}`}>{record.method}</span>
      ),
    },
    {
      title: "Path",
      key: "path",
      dataIndex: "path",
    },
    {
      title: "Resource Type",
      key: "resourceType",
      dataIndex: "resourceType",
    },
    {
      title: "Description",
      key: "description",
      dataIndex: "description",
    },
  ];

  // Handle continue action
  const handleContinue = () => {
    const selectedEndpointData = endpoints.filter((endpoint) => selectedEndpoints.includes(endpoint.id));

    onNext({
      endpoints: selectedEndpointData,
      relationships,
    });
  };

  // Show loading state while analyzing
  if (analyzing) {
    return (
      <div className="endpoint-analysis loading">
        <h3>Analyzing API Structure</h3>
        <p>Discovering endpoints and relationships...</p>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className="endpoint-analysis">
      <div className="analysis-header">
        <h2>Discovered Endpoints</h2>
        <p className="description">
          We've analyzed your API and discovered the following endpoints. Select which ones you want to include in your
          GraphQL API.
        </p>
      </div>

      <div className="endpoints-table">
        <Table columns={columns} dataSource={endpoints} rowKey="id" pagination={false} />
      </div>

      <div className="relationships-section">
        <h3>Detected Relationships</h3>
        <p className="description">We've identified these relationships between your endpoints:</p>
        {relationships.map((rel, index) => (
          <div key={index} className="relationship-item">
            <span className="from">{rel.from}</span>
            <span className="arrow">→</span>
            <span className="to">{rel.to}</span>
            <span className="type">{rel.type}</span>
          </div>
        ))}
      </div>

      <div className="analysis-actions">
        <RQButton onClick={onPrevious}>Back</RQButton>
        <RQButton type="primary" onClick={handleContinue} disabled={selectedEndpoints.length === 0}>
          Continue to Schema Preview
        </RQButton>
      </div>
    </div>
  );
};

export default EndpointAnalysis;
