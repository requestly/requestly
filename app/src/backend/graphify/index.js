// app/src/backend/graphify/index.js

import { getFunctions, httpsCallable } from "firebase/functions";
import firebaseApp from "../../firebase";
import Logger from "lib/logger";

// Service class for handling all Graphify-related operations
class GraphifyService {
  constructor() {
    this.functions = getFunctions(firebaseApp);
  }

  /**
   * Analyzes a REST API to generate GraphQL schema
   * @param {string} baseUrl - The base URL of the REST API
   * @param {Object} authentication - Authentication details (optional)
   * @param {string} authentication.type - Type of auth ('none', 'bearer', or 'apiKey')
   * @param {string} [authentication.token] - Bearer token if using bearer auth
   * @param {string} [authentication.apiKey] - API key if using apiKey auth
   * @param {string} [authentication.headerName] - Header name for API key
   * @returns {Promise<Object>} Analysis result containing endpoints and relationships
   */
  async analyzeAPI(baseUrl, authentication) {
    try {
      const analyzeRestAPI = httpsCallable(this.functions, "analyzeRestAPI");

      const result = await analyzeRestAPI({
        baseUrl,
        authentication: authentication || { type: "none" },
      });

      return result.data;
    } catch (error) {
      Logger.error("Failed to analyze REST API:", error);
      throw error;
    }
  }

  /**
   * Executes a GraphQL query against the translated API
   * @param {string} analysisId - ID from the analysis step
   * @param {string} query - GraphQL query string
   * @param {Object} [variables] - Query variables (optional)
   * @returns {Promise<Object>} Query result
   */
  async executeQuery(analysisId, query, variables = {}) {
    try {
      const executeGraphQL = httpsCallable(this.functions, "executeGraphQL");

      const result = await executeGraphQL({
        analysisId,
        query,
        variables,
      });

      return result.data;
    } catch (error) {
      Logger.error("Failed to execute GraphQL query:", error);
      throw error;
    }
  }
}

// Export a singleton instance so we can reuse the same instance everywhere
export const graphifyService = new GraphifyService();
