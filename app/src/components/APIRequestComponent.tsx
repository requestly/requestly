/**
 * Enhanced API Request Component for Requestly
 * Provides comprehensive API request building with accessibility and performance features
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useErrorHandling } from '../utils/error-handling';
import { useAccessibility } from '../utils/accessibility';
import { usePerformanceMonitoring } from '../utils/performance';

interface APIRequestProps {
  onSendRequest?: (request: APIRequest) => void;
  initialRequest?: Partial<APIRequest>;
  className?: string;
}

interface APIRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  queryParams: Record<string, string>;
  timeout?: number;
}

interface RequestHistoryItem extends APIRequest {
  id: string;
  timestamp: number;
  status?: number;
  responseTime?: number;
  responseSize?: number;
}

export const APIRequestComponent: React.FC<APIRequestProps> = ({
  onSendRequest,
  initialRequest,
  className = ''
}) => {
  // State management
  const [request, setRequest] = useState<APIRequest>({
    method: 'GET',
    url: '',
    headers: {},
    body: '',
    queryParams: {},
    timeout: 30000,
    ...initialRequest
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [requestHistory, setRequestHistory] = useState<RequestHistoryItem[]>([]);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(-1);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showQueryParams, setShowQueryParams] = useState(false);
  const [showBody, setShowBody] = useState(false);

  // Refs for focus management
  const methodSelectRef = useRef<HTMLSelectElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);

  // Initialize utilities
  const { handleError, handleAsyncError, startRequest, endRequest, trackError } = useErrorHandling();
  const { announce, announceError, announceSuccess, handleKeyboardNavigation } = useAccessibility();
  const { startTimer, endTimer } = usePerformanceMonitoring();

  // Enhanced request sending with error handling and performance monitoring
  const sendRequest = handleAsyncError(async () => {
    if (!request.url.trim()) {
      announceError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    const requestId = `req-${Date.now()}`;
    
    try {
      startTimer(`api-request-${requestId}`);
      startRequest(requestId, request.url, request.method);

      // Build URL with query parameters
      const url = new URL(request.url);
      Object.entries(request.queryParams).forEach(([key, value]) => {
        if (key && value) {
          url.searchParams.append(key, value);
        }
      });

      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        },
        signal: AbortSignal.timeout(request.timeout || 30000)
      };

      // Add body for non-GET requests
      if (request.method !== 'GET' && request.body) {
        fetchOptions.body = request.body;
      }

      // Send the request
      const response = await fetch(url.toString(), fetchOptions);
      const responseText = await response.text();
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      const responseTime = endTimer(`api-request-${requestId}`);
      endRequest(requestId, response.status, responseText.length);

      // Update response state
      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        responseTime,
        size: responseText.length
      });

      // Add to history
      const historyItem: RequestHistoryItem = {
        ...request,
        id: requestId,
        timestamp: Date.now(),
        status: response.status,
        responseTime,
        responseSize: responseText.length
      };

      setRequestHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 requests
      
      announceSuccess(`Request completed with status ${response.status}`);
      
      // Call parent callback
      onSendRequest?.(request);

    } catch (error) {
      const responseTime = endTimer(`api-request-${requestId}`);
      trackError(requestId, error as Error);
      
      setResponse({
        error: (error as Error).message,
        responseTime
      });
      
      announceError(`Request failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, 'Send API Request');

  // Keyboard navigation for request history
  const handleHistoryKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (requestHistory.length === 0) return;
    
    const newIndex = handleKeyboardNavigation(event, requestHistory, selectedHistoryIndex);
    if (newIndex !== selectedHistoryIndex) {
      setSelectedHistoryIndex(newIndex);
      const selectedRequest = requestHistory[newIndex];
      if (selectedRequest) {
        setRequest(selectedRequest);
        announce(`Selected request from history: ${selectedRequest.method} ${selectedRequest.url}`);
      }
    }
  }, [requestHistory, selectedHistoryIndex, handleKeyboardNavigation, announce]);

  // Focus management
  useEffect(() => {
    if (methodSelectRef.current) {
      methodSelectRef.current.focus();
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        sendRequest();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sendRequest]);

  return (
    <div 
      className={`api-request-component ${className}`}
      role="main"
      aria-labelledby="api-request-title"
      style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}
    >
      {/* Screen reader only title */}
      <h1 id="api-request-title" className="sr-only">
        API Request Builder
      </h1>

      {/* Main request form */}
      <div 
        className="request-form"
        role="form"
        aria-label="API Request Form"
        style={{ marginBottom: '2rem' }}
      >
        {/* Method and URL row */}
        <div 
          className="method-url-row"
          style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}
        >
          <select
            ref={methodSelectRef}
            value={request.method}
            onChange={(e) => setRequest(prev => ({ ...prev, method: e.target.value }))}
            aria-label="HTTP Method"
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              minWidth: '100px'
            }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>

          <input
            ref={urlInputRef}
            type="url"
            value={request.url}
            onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
            placeholder="Enter API URL"
            aria-label="API URL"
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />

          <button
            ref={sendButtonRef}
            onClick={sendRequest}
            disabled={isLoading || !request.url.trim()}
            aria-label="Send API Request"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              background: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              minWidth: '100px'
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {/* Request options */}
        <div className="request-options" style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setShowHeaders(!showHeaders)}
            aria-expanded={showHeaders}
            aria-controls="headers-section"
            style={{
              padding: '0.5rem',
              marginRight: '1rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            Headers {showHeaders ? '▼' : '▶'}
          </button>

          <button
            onClick={() => setShowQueryParams(!showQueryParams)}
            aria-expanded={showQueryParams}
            aria-controls="query-params-section"
            style={{
              padding: '0.5rem',
              marginRight: '1rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            Query Params {showQueryParams ? '▼' : '▶'}
          </button>

          {request.method !== 'GET' && (
            <button
              onClick={() => setShowBody(!showBody)}
              aria-expanded={showBody}
              aria-controls="body-section"
              style={{
                padding: '0.5rem',
                marginRight: '1rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Body {showBody ? '▼' : '▶'}
            </button>
          )}
        </div>

        {/* Headers section */}
        {showHeaders && (
          <div 
            id="headers-section"
            className="headers-section"
            style={{ marginBottom: '1rem' }}
          >
            <h3>Headers</h3>
            <div className="headers-list">
              {Object.entries(request.headers).map(([key, value], index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newHeaders = { ...request.headers };
                      delete newHeaders[key];
                      newHeaders[e.target.value] = value;
                      setRequest(prev => ({ ...prev, headers: newHeaders }));
                    }}
                    placeholder="Header name"
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setRequest(prev => ({
                      ...prev,
                      headers: { ...prev.headers, [key]: e.target.value }
                    }))}
                    placeholder="Header value"
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <button
                    onClick={() => {
                      const newHeaders = { ...request.headers };
                      delete newHeaders[key];
                      setRequest(prev => ({ ...prev, headers: newHeaders }));
                    }}
                    aria-label={`Remove header ${key}`}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      background: '#ff6b6b',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => setRequest(prev => ({
                  ...prev,
                  headers: { ...prev.headers, '': '' }
                }))}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  background: '#28a745',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Add Header
              </button>
            </div>
          </div>
        )}

        {/* Query params section */}
        {showQueryParams && (
          <div 
            id="query-params-section"
            className="query-params-section"
            style={{ marginBottom: '1rem' }}
          >
            <h3>Query Parameters</h3>
            <div className="query-params-list">
              {Object.entries(request.queryParams).map(([key, value], index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newParams = { ...request.queryParams };
                      delete newParams[key];
                      newParams[e.target.value] = value;
                      setRequest(prev => ({ ...prev, queryParams: newParams }));
                    }}
                    placeholder="Parameter name"
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setRequest(prev => ({
                      ...prev,
                      queryParams: { ...prev.queryParams, [key]: e.target.value }
                    }))}
                    placeholder="Parameter value"
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <button
                    onClick={() => {
                      const newParams = { ...request.queryParams };
                      delete newParams[key];
                      setRequest(prev => ({ ...prev, queryParams: newParams }));
                    }}
                    aria-label={`Remove parameter ${key}`}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      background: '#ff6b6b',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => setRequest(prev => ({
                  ...prev,
                  queryParams: { ...prev.queryParams, '': '' }
                }))}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  background: '#28a745',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Add Parameter
              </button>
            </div>
          </div>
        )}

        {/* Body section */}
        {showBody && request.method !== 'GET' && (
          <div 
            id="body-section"
            className="body-section"
            style={{ marginBottom: '1rem' }}
          >
            <h3>Request Body</h3>
            <textarea
              value={request.body}
              onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Enter request body (JSON, XML, etc.)"
              rows={10}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'monospace'
              }}
            />
          </div>
        )}
      </div>

      {/* Request history */}
      {requestHistory.length > 0 && (
        <div 
          className="request-history"
          style={{ marginBottom: '2rem' }}
        >
          <h3>Request History</h3>
          <div
            className="history-list"
            role="listbox"
            aria-label="Request History"
            onKeyDown={handleHistoryKeyDown}
            tabIndex={0}
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            {requestHistory.map((item, index) => (
              <div
                key={item.id}
                role="option"
                aria-selected={index === selectedHistoryIndex}
                onClick={() => {
                  setSelectedHistoryIndex(index);
                  setRequest(item);
                  announce(`Selected request from history: ${item.method} ${item.url}`);
                }}
                style={{
                  padding: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: index === selectedHistoryIndex ? '#e3f2fd' : 'white',
                  borderBottom: '1px solid #eee'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    <strong>{item.method}</strong> {item.url}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>
                    {item.status && (
                      <span style={{ 
                        color: item.status >= 200 && item.status < 300 ? 'green' : 
                               item.status >= 400 ? 'red' : 'orange'
                      }}>
                        {item.status}
                      </span>
                    )}
                    {item.responseTime && (
                      <span style={{ marginLeft: '0.5rem' }}>
                        {item.responseTime.toFixed(0)}ms
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response section */}
      {response && (
        <div 
          className="response-section"
          role="region"
          aria-labelledby="response-title"
        >
          <h3 id="response-title">Response</h3>
          <div 
            className="response-content"
            style={{
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '1rem',
              backgroundColor: '#f8f9fa'
            }}
          >
            {response.error ? (
              <div style={{ color: 'red' }}>
                <strong>Error:</strong> {response.error}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ 
                    color: response.status >= 200 && response.status < 300 ? 'green' : 
                           response.status >= 400 ? 'red' : 'orange',
                    fontWeight: 'bold'
                  }}>
                    {response.status} {response.statusText}
                  </span>
                  {response.responseTime && (
                    <span style={{ marginLeft: '1rem', color: '#666' }}>
                      {response.responseTime.toFixed(0)}ms
                    </span>
                  )}
                  {response.size && (
                    <span style={{ marginLeft: '1rem', color: '#666' }}>
                      {response.size} bytes
                    </span>
                  )}
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <h4>Headers</h4>
                  <pre style={{ 
                    backgroundColor: '#fff', 
                    padding: '0.5rem', 
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4>Body</h4>
                  <pre style={{ 
                    backgroundColor: '#fff', 
                    padding: '0.5rem', 
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    overflow: 'auto',
                    maxHeight: '300px'
                  }}>
                    {typeof response.data === 'string' 
                      ? response.data 
                      : JSON.stringify(response.data, null, 2)
                    }
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default APIRequestComponent;
