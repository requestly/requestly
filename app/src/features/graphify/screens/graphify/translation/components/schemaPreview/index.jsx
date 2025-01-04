import React, { useState, useEffect } from "react";
import { Alert, Tabs, Collapse, Input, Spin } from "antd";
import Editor from "@monaco-editor/react";
import { print, parse, buildSchema } from "graphql";
import { format } from "prettier";
import "./schemaPreview.scss";
import { RQButton } from "lib/design-system-v2/components";

const { Panel } = Collapse;

const SchemaPreview = ({ endpointData, onNext, onPrevious }) => {
  // State to manage different aspects of the schema
  const [schema, setSchema] = useState("");
  const [customizations, setCustomizations] = useState({});
  const [isGenerating, setIsGenerating] = useState(true);
  const [previewQuery, setPreviewQuery] = useState("");
  const [validationError, setValidationError] = useState(null);

  // Effect to generate initial schema from endpoint data
  useEffect(() => {
    generateInitialSchema();
  }, [endpointData]);

  // Function to generate the initial GraphQL schema from REST endpoints
  const generateInitialSchema = async () => {
    try {
      setIsGenerating(true);

      // Convert REST endpoints to GraphQL types
      const types = endpointData.endpoints.map((endpoint) => {
        // Generate type name from endpoint path
        const typeName = generateTypeName(endpoint.path);

        // Generate fields based on response structure
        const fields = generateFields(endpoint);

        return `
          type ${typeName} {
            ${fields}
          }
        `;
      });

      // Generate Query type with all GET endpoints
      const queries = endpointData.endpoints
        .filter((endpoint) => endpoint.method === "GET")
        .map((endpoint) => {
          const typeName = generateTypeName(endpoint.path);
          const args = generateQueryArguments(endpoint);

          return `
            ${getOperationName(endpoint)}: ${typeName}${args ? `(${args})` : ""}
          `;
        });

      // Combine everything into a complete schema
      const fullSchema = `
        ${types.join("\n")}

        type Query {
          ${queries.join("\n")}
        }
      `;

      // Format the schema nicely
      const formattedSchema = format(fullSchema, {
        parser: "graphql",
        printWidth: 80,
      });

      setSchema(formattedSchema);
      generateSampleQuery(formattedSchema);
    } catch (error) {
      setValidationError("There was an error generating the GraphQL schema. Please check your endpoint configuration.");
      console.error("Schema generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to generate clean type names from REST paths
  const generateTypeName = (path) => {
    // Convert /users/:id/posts to UserPost
    return path
      .split("/")
      .filter((part) => part && !part.startsWith(":"))
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  };

  // Generate fields for a type based on endpoint
  const generateFields = (endpoint) => {
    // In a real implementation, we would analyze the response structure
    // For now, we'll generate some sample fields
    return `
      id: ID!
      createdAt: String
      updatedAt: String
    `;
  };

  // Generate arguments for queries based on endpoint parameters
  const generateQueryArguments = (endpoint) => {
    if (!endpoint.parameters?.length) return "";

    return endpoint.parameters.map((param) => `${param}: String`).join(", ");
  };

  // Generate operation name from endpoint
  const getOperationName = (endpoint) => {
    const base = endpoint.path
      .split("/")
      .filter((part) => part && !part.startsWith(":"))
      .join("_");

    return `get_${base}`;
  };

  // Generate a sample query for the schema
  const generateSampleQuery = (schemaString) => {
    try {
      const parsedSchema = buildSchema(schemaString);
      // Generate a simple query using the first available query field
      const queryType = parsedSchema.getQueryType();
      const fields = queryType.getFields();
      const firstField = Object.values(fields)[0];

      if (firstField) {
        const query = `
          query SampleQuery {
            ${firstField.name} {
              id
              createdAt
            }
          }
        `;

        setPreviewQuery(
          format(query, {
            parser: "graphql",
            printWidth: 80,
          })
        );
      }
    } catch (error) {
      console.error("Error generating sample query:", error);
    }
  };

  if (isGenerating) {
    return (
      <div className="schema-preview-loading">
        <Spin size="large" />
        <p>Generating GraphQL Schema...</p>
      </div>
    );
  }

  return (
    <div className="schema-preview">
      {validationError && (
        <Alert
          message="Schema Generation Error"
          description={validationError}
          type="error"
          closable
          className="schema-error"
        />
      )}

      <Tabs
        defaultActiveKey="schema"
        items={[
          {
            key: "schema",
            label: "Schema",
            children: (
              <div className="schema-editor">
                <Editor
                  height="400px"
                  language="graphql"
                  value={schema}
                  onChange={(value) => setSchema(value)}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    readOnly: false,
                  }}
                />
              </div>
            ),
          },
          {
            key: "preview",
            label: "Query Preview",
            children: (
              <div className="query-preview">
                <Editor
                  height="300px"
                  language="graphql"
                  value={previewQuery}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    readOnly: true,
                  }}
                />
              </div>
            ),
          },
        ]}
      />

      <div className="schema-actions">
        <RQButton onClick={onPrevious}>Back</RQButton>
        <RQButton
          type="primary"
          onClick={() => onNext({ schema, customizations })}
          disabled={!schema || !!validationError}
        >
          Continue to Testing
        </RQButton>
      </div>
    </div>
  );
};

export default SchemaPreview;
