# Feature: SOAP Request Support

## Summary

Add first-class SOAP (Simple Object Access Protocol) support to Requestly API Client, enabling users to import WSDL files, browse service operations, auto-generate SOAP envelopes, and execute SOAP requests with full variable/auth/scripting support. This targets enterprise developers working with healthcare, financial, government, telecom, and ERP systems where SOAP remains the dominant integration protocol.

## User types

- **Enterprise developers** integrating with legacy SOAP services (SAP, Oracle, Salesforce SOAP API, payment gateways)
- **Healthcare developers** working with HL7/CDC immunization registries and clinical data exchange
- **Government/compliance teams** interfacing with tax filing, customs, and benefits systems
- **QA engineers** testing SOAP web services alongside REST/GraphQL endpoints in the same tool
- **Developers migrating from SoapUI/Postman** who want a modern, unified API client

## Competitive Analysis: Postman SOAP Support

### What Postman does well
- WSDL import via URL, file upload, raw text, or folder
- Auto-generates collection with one request per operation
- Pre-populates SOAP XML envelopes with parameter placeholders
- Full variable support (`{{var}}`) in XML bodies
- Standard auth (Bearer, Basic, API Key) works with SOAP
- XML response pretty-printing with syntax highlighting
- Test scripts can parse XML via `xml2Json()`, Cheerio, or xpath/xmldom

### Where Postman falls short (our opportunity)
1. **Broken external XSD resolution** -- multi-file WSDLs with `xsd:import` fail regularly (open issues since 2021, still unresolved as of 2025)
2. **No native WS-Security** -- users must hand-craft WSSE headers in pre-request scripts
3. **Incorrect XML generation** -- generated envelopes sometimes use wrong element names/namespaces compared to SoapUI
4. **No SOAP fault-specific UI** -- faults shown as generic XML, no structured error display
5. **No WSDL-based response validation** -- responses not validated against schema
6. **No MTOM/SwA support** -- cannot send/receive SOAP messages with binary attachments
7. **No WSDL explorer/browser** -- operations are flat in a collection, no service/port/binding hierarchy
8. **SOAP 1.2 quirks** -- Content-Type `action` parameter causes issues; no auto-detection of SOAP version
9. **No mock SOAP service generation** from WSDL
10. **No operation parameter UI** -- users must hand-edit raw XML rather than filling in a structured form

### SoapUI strengths to learn from
- Robust multi-file WSDL resolution (relative paths, circular refs)
- Built-in WS-Security profiles (UsernameToken, X.509, SAML)
- WSDL navigator showing service hierarchy
- Form-based parameter entry alongside raw XML
- Mock service generation from WSDL
- XPath-based assertions
- MTOM/SwA support

---

## Core Requirements

### P0 -- Must Have (MVP)

#### CR-1: WSDL Import
- Import WSDL from: URL, file upload, raw text paste
- Parse WSDL 1.1 documents (the overwhelmingly dominant version in production)
- Resolve inline `<types>` / XSD schemas
- Extract: services, ports, bindings, operations, messages, types
- Generate one SOAP request per operation with pre-populated envelope
- Organize imported operations into a collection grouped by service > port
- Auto-detect SOAP version (1.1 vs 1.2) from WSDL binding namespace
- Auto-set endpoint URL from `<service><port><soap:address location="..."/>`
- Auto-set SOAPAction header from binding `soapAction` attribute

#### CR-2: SOAP Request Editor
- New entry type: `soap` in the discriminated union (`EntryType.soap`)
- XML body editor with syntax highlighting (CodeMirror 6, XML mode)
- Auto-generated SOAP envelope with correct namespace for SOAP 1.1/1.2
- Editable SOAP headers (`<soap:Header>`) section
- Editable SOAP body (`<soap:Body>`) section
- HTTP headers panel (auto-populated: Content-Type, SOAPAction)
- Method locked to POST (SOAP always uses POST)
- Requestly variable support (`{{var}}`) in XML body, headers, and URL
- SOAP version toggle (1.1 / 1.2) that updates Content-Type and envelope namespace automatically

#### CR-3: SOAP Response Viewer
- XML response pretty-printing with syntax highlighting
- Raw response view
- Response headers display
- Response time, status code, size metrics
- **SOAP Fault detection and structured display:**
  - Detect `<soap:Fault>` in response body
  - Parse and display fault code, fault string/reason, detail
  - Visual distinction (error styling) for fault responses
  - Handle both SOAP 1.1 and 1.2 fault structures

#### CR-4: Request Execution
- Execute SOAP requests through existing Runtime `RequestFetcher` (SOAP is HTTP POST)
- Variable resolution in XML body (same pipeline as HTTP/GraphQL)
- Support existing auth types (Bearer, Basic, API Key) for SOAP endpoints
- Pre-request and post-response scripts work identically to HTTP/GraphQL
- Response stored in history

#### CR-5: SOAP Operation Browser
- After WSDL import, show a tree view of: Service > Port > Operations
- Each operation shows: name, input message, output message, SOAPAction
- Click an operation to open/create the corresponding request
- Show parameter types (from XSD) for each operation's input message

### P1 -- Should Have (Fast Follow)

#### CR-6: Structured Parameter Editor
- Form-based parameter entry for operation inputs (alongside raw XML)
- Parse XSD types into form fields: string, int, boolean, date, enum (dropdown), complex types (nested groups)
- Mark required vs. optional fields
- Auto-generate XML from form values
- Sync between form editor and raw XML editor (bidirectional)

#### CR-7: Multi-File WSDL Resolution
- Resolve `xsd:import` and `xsd:include` references (external XSD files)
- Resolve `wsdl:import` references (multi-file WSDL split across abstract/concrete)
- Support both relative and absolute `schemaLocation` URIs
- Handle folder-based import (upload a folder of WSDL + XSD files)
- Circular reference detection with depth limit
- Authentication for fetching remote WSDL/XSD files (same-origin credentials)

#### CR-8: WS-Security -- UsernameToken
- Dedicated WS-Security auth option in the Auth panel
- UsernameToken profile: username, password, password type (Text / Digest)
- Auto-generate `<wsse:Security>` header with:
  - `<wsse:UsernameToken>`
  - `<wsse:Nonce>` (auto-generated)
  - `<wsu:Created>` (auto-generated timestamp)
  - Password digest computation: `Base64(SHA-1(nonce + created + password))`
- Optional `<wsu:Timestamp>` with configurable TTL

#### CR-9: XPath Response Assertions
- XPath expression evaluator in the response panel (test/explore mode)
- Pre-built test assertion: `pm.expect.xpath(expression).toEqual(value)`
- Namespace-aware XPath evaluation
- Highlight matched nodes in the XML response view

### P2 -- Nice to Have (Future)

#### CR-10: WSDL 2.0 Support
- Parse `<description>` root element
- Map `<interface>` (with inheritance), `<endpoint>`, inline message schemas
- Very low priority given negligible real-world adoption

#### CR-11: MTOM/XOP Support
- Detect `<xop:Include>` elements in responses and resolve to MIME parts
- Construct MTOM requests: extract base64 content from body, place in MIME parts
- File attachment UI for MTOM-enabled operations
- Configurable size threshold for MTOM optimization

#### CR-12: WS-Security -- Advanced
- X.509 certificate-based security tokens
- XML Signature (sign specific elements: body, timestamp, etc.)
- XML Encryption
- SAML token support
- WS-Security policy auto-detection from WSDL/WS-Policy

#### CR-13: Mock SOAP Service
- Generate a mock SOAP service from WSDL
- Return sample responses matching the WSDL output message schema
- Configurable response delay, fault injection

#### CR-14: SOAP-to-REST Comparison View
- Side-by-side view showing equivalent REST request for a SOAP operation
- Useful for teams migrating from SOAP to REST

---

## Screens Needed

### S1: WSDL Import Screen
- **Entry point:** Import button in sidebar (extend existing import flow) + dedicated "Import WSDL" option
- **Import sources:** URL input, file upload drag-drop zone, raw text paste area
- **Preview step:** After parsing, show:
  - Service name, endpoint URL, SOAP version
  - List of operations with checkboxes (select which to import)
  - Type summary (number of complex types, elements)
  - Warnings for any parsing issues (unresolved imports, unsupported features)
- **Target:** Choose existing collection or create new one
- **Action:** "Import" button generates requests

### S2: SOAP Request Editor (Main Screen)
- **URL bar:** Endpoint URL (editable, with variable support), locked POST method badge, Send button
- **Request config tabs (top panel):**
  - **SOAP Body** (default) -- XML editor with auto-generated envelope, syntax highlighting, variable highlighting
  - **SOAP Headers** -- XML editor for `<soap:Header>` content (separate from HTTP headers)
  - **HTTP Headers** -- Standard key-value header editor (auto-populated with Content-Type, SOAPAction)
  - **Auth** -- Standard auth panel + WS-Security option (P1)
  - **Pre-request Script** -- Standard script editor
  - **Settings** -- SOAP version toggle (1.1/1.2), encoding style info (read-only from WSDL)
- **WSDL metadata banner** (when request was generated from WSDL):
  - Operation name, service name, binding style
  - "View in WSDL Explorer" link
- **Parameter form** (P1, collapsible panel):
  - Form fields generated from XSD types
  - "Generate XML" button to update body from form values
  - "Parse XML" button to populate form from current body

### S3: SOAP Response Viewer (Bottom Panel)
- **Normal response:** XML pretty-print with syntax highlighting, Raw view, Headers tab
- **SOAP Fault response:**
  - Red/error banner: "SOAP Fault: {faultcode} -- {faultstring}"
  - Structured fault display: Code, Reason, Detail (expandable)
  - Full XML view available below
- **Metrics bar:** Status code, response time, response size
- **XPath evaluator** (P1): Input field for XPath expression, results panel

### S4: WSDL Explorer (Sidebar Panel)
- **Tree view:** Service > Port > Binding > Operations
- **Operation detail** (on click):
  - Operation name, SOAPAction
  - Input message: parameter names, types, required/optional
  - Output message: response structure
  - Faults: declared fault messages
- **Type browser:** Browse complex types defined in the WSDL's XSD
- **"Open Request" button** for each operation

### S5: SOAP Entry in Sidebar
- SOAP requests appear in the sidebar collections tree with a "SOAP" protocol badge
- Visual distinction from HTTP/GraphQL entries (color-coded badge using `custom` semantic tokens -- e.g., cyan or magenta)
- Context menu: Edit, Duplicate, Delete, "Regenerate from WSDL"

---

## Key Interactions

### Flow 1: Import WSDL and Execute First Request
1. User clicks Import > WSDL in sidebar
2. Pastes WSDL URL or uploads file
3. System parses WSDL, shows preview with operations list
4. User selects operations to import, chooses/creates target collection
5. System generates SOAP requests with pre-populated envelopes
6. User clicks on an operation request in the collection
7. SOAP editor opens with pre-filled XML body, endpoint URL, headers
8. User fills in parameter values in the XML body (or form editor in P1)
9. User clicks Send
10. Response displays in bottom panel with XML pretty-print
11. If fault: structured fault display with error banner

### Flow 2: Create SOAP Request from Scratch
1. User clicks "+" > New SOAP Request
2. Empty SOAP editor opens with template envelope
3. User enters endpoint URL
4. User writes/pastes SOAP XML body
5. User sets SOAPAction header manually
6. User selects SOAP version (1.1 default)
7. User clicks Send
8. Response displays

### Flow 3: Switch Between SOAP Versions
1. User opens SOAP request settings
2. Toggles SOAP version from 1.1 to 1.2
3. System auto-updates:
   - Envelope namespace (`schemas.xmlsoap.org` -> `w3.org/2003/05/soap-envelope`)
   - Content-Type header (`text/xml` -> `application/soap+xml`)
   - SOAPAction: moved from separate header to Content-Type `action` parameter
4. User reviews changes, sends request

### Flow 4: Handle SOAP Fault
1. User sends SOAP request
2. Server returns HTTP 500 with SOAP Fault body
3. Response panel shows:
   - Error banner with fault code and message
   - Structured display: Code, Reason/String, Actor/Role, Detail
   - Full XML response available in "Raw" tab
4. User can copy fault details for debugging

### Flow 5: Use Variables in SOAP
1. User creates environment variables (e.g., `{{username}}`, `{{accountId}}`)
2. User references them in SOAP XML body:
   ```xml
   <soap:Body>
     <GetAccount>
       <AccountId>{{accountId}}</AccountId>
     </GetAccount>
   </soap:Body>
   ```
3. Variables highlighted in XML editor (same as HTTP/GraphQL)
4. On Send, variables resolved before request is dispatched
5. User can extract response values in post-response scripts and set variables

---

## Edge Cases and Error Scenarios

### WSDL Import Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| WSDL URL returns 401/403 | Prompt user for credentials, retry with auth |
| WSDL URL returns non-XML content | Show error: "Invalid WSDL: expected XML document" |
| WSDL has no operations | Show warning: "No operations found in WSDL" |
| WSDL references external XSDs (P0) | Show warning: "External schema references not resolved. Some parameter types may be incomplete. Import operations anyway?" |
| WSDL references external XSDs (P1) | Resolve automatically; show progress indicator for multi-file resolution |
| WSDL has circular XSD imports | Detect cycle, stop resolution, show warning with cycle path |
| WSDL defines multiple services | Show all services in tree; user can import selectively |
| WSDL has unsupported binding (e.g., HTTP GET) | Skip unsupported bindings, show warning listing what was skipped |
| WSDL uses RPC/Encoded style | Show info: "RPC/Encoded style detected (legacy). Generated envelopes may need manual adjustment." |
| WSDL parse fails completely | Show error with parser error details; offer to open as raw XML for inspection |
| WSDL contains `<wsp:Policy>` | Parse for informational display (e.g., "This service requires WS-Security"); do not enforce |
| Duplicate operation names across ports | Disambiguate with port name prefix: `PortName.OperationName` |
| Very large WSDL (>1MB) | Show progress indicator during parsing; consider streaming parser |

### Request Execution Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Server returns HTTP 200 with SOAP Fault | Detect `<Fault>` element, display as fault (not success) |
| Server returns HTTP 500 with SOAP Fault | Standard fault display with HTTP status context |
| Server returns HTTP 500 without SOAP body | Show as HTTP error (not SOAP fault) |
| Response is not valid XML | Show raw response with warning: "Response is not valid XML" |
| Response uses different namespace prefix than expected | Parse namespace-aware (match by URI, not prefix) |
| SOAPAction mismatch | Show server error; suggest checking SOAPAction value in request settings |
| Content-Type mismatch (1.1 body with 1.2 Content-Type) | Show warning but send anyway; user may be dealing with non-compliant server |
| Connection timeout | Standard timeout error with retry option |
| SSL/TLS certificate error | Same handling as HTTP requests (show cert error, option to proceed) |
| Response contains `<xop:Include>` (MTOM) | P0: Show raw MIME response with info "MTOM response detected. Binary parts not rendered." P2: Full MTOM support |
| Extremely large XML response (>10MB) | Truncate pretty-print view, offer "Download raw" option |
| Response encoding mismatch (e.g., ISO-8859-1) | Respect Content-Type charset; fallback to UTF-8 |

### XML Editor Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| User breaks XML syntax | Show inline error markers (CodeMirror XML linting) |
| Variable `{{var}}` inside XML attribute | Resolve correctly: `<element attr="{{var}}">` |
| Variable contains XML special characters | XML-escape variable value (`<` -> `&lt;`, `&` -> `&amp;`) |
| User pastes non-XML content into body editor | Show parse error; don't crash |
| User clears entire body | Show template button to regenerate default envelope |
| CDATA sections in XML | Preserve and display correctly |
| XML namespaces with colons in variable names | `{{ns:var}}` should not be treated as a namespace prefix; treat `{{...}}` as opaque tokens |
| Very long XML lines | Soft-wrap in editor; don't truncate |

### Auth Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| WS-Security + HTTP Basic Auth used together | Allow both; HTTP auth in transport layer, WS-Security in SOAP header |
| WS-Security password digest with clock skew | Include `<wsu:Created>` timestamp; if server rejects with "message expired" fault, suggest checking clock sync |
| Auth credentials contain XML special characters | XML-escape in WSSE header construction |

---

## Technical Architecture

### Schema Changes (`packages/schemas/`)
```
EntryType enum: add 'soap'

SoapApiEntry = {
  type: 'soap'
  request: HttpRequest          // Reuse -- SOAP is HTTP
  soapConfig: SoapConfig        // New: SOAP-specific metadata
  auth?: AuthConfig             // Existing, extended with WS-Security
  scripts?: CollectionScripts   // Existing
}

SoapConfig = {
  soapVersion: '1.1' | '1.2'
  wsdlRef?: WsdlReference       // Link to imported WSDL
  operationName?: string
  soapAction?: string
  bindingStyle?: 'document' | 'rpc'
  encodingStyle?: 'literal' | 'encoded'
}

WsdlReference = {
  source: 'url' | 'file'
  url?: string                  // Original WSDL URL
  fileName?: string             // Original file name
  serviceName: string
  portName: string
  operationName: string
}

ApiEntry = HttpApiEntry | GraphqlApiEntry | SoapApiEntry  // Extended union
```

### New Feature Module (`clients/web/src/features/soapClient/`)
```
soapClient/
  types.ts
  constants.ts
  store/
    soapSlice.ts              // WSDL cache, parsed operations
  hooks/
    useSoapRequestEditor.ts   // Main editor logic
    useSoapBodyEditor.ts      // XML body editing
    useSoapResponsePanel.ts   // Response display + fault parsing
    useWsdlImport.ts          // WSDL import flow
    useWsdlExplorer.ts        // WSDL tree navigation
    useSoapVersionToggle.ts   // 1.1 <-> 1.2 switching
    useSoapFaultParser.ts     // Fault structure extraction
  components/
    SoapRequestEditor.tsx
    SoapBodyEditor.tsx
    SoapHeaderEditor.tsx
    SoapResponsePanel.tsx
    SoapFaultDisplay.tsx
    SoapVersionBadge.tsx
    WsdlImportDialog.tsx
    WsdlExplorer.tsx
    WsdlOperationDetail.tsx
  containers/
    SoapRequestEditorContainer.tsx
    WsdlImportContainer.tsx
    WsdlExplorerContainer.tsx
  index.ts
```

### WSDL Parser (`packages/importers/src/wsdl/`)
```
wsdl/
  index.ts                    // Public API: parseWsdl()
  parser.ts                   // WSDL XML parsing
  schema-resolver.ts          // XSD import/include resolution (P1)
  types.ts                    // WsdlDefinition, WsdlService, WsdlOperation, etc.
  envelope-generator.ts       // Generate SOAP XML envelope from operation
  xsd-to-form.ts             // XSD types -> form field definitions (P1)
  __tests__/
    parser.test.ts
    envelope-generator.test.ts
    schema-resolver.test.ts
    fixtures/                 // Sample WSDL/XSD files
```

### Runtime Impact
**None.** SOAP requests are HTTP POST requests. The existing `RequestFetcher.fetch(HttpRequest) -> HttpResponse` pipeline handles SOAP without modification. SOAP-specific logic (envelope construction, fault parsing) lives entirely in the UI and importer layers.

### Route Addition
```
/api-client/soap/:requestId?    // SOAP request editor
```

---

## SOAP Version Handling Matrix

| Aspect | SOAP 1.1 | SOAP 1.2 |
|--------|----------|----------|
| Content-Type | `text/xml; charset=utf-8` | `application/soap+xml; charset=utf-8` |
| SOAPAction | HTTP header: `SOAPAction: "uri"` | Content-Type param: `action="uri"` |
| Envelope NS | `http://schemas.xmlsoap.org/soap/envelope/` | `http://www.w3.org/2003/05/soap-envelope` |
| Fault: code element | `<faultcode>` | `<env:Code><env:Value>` |
| Fault: message element | `<faultstring>` | `<env:Reason><env:Text xml:lang="en">` |
| Fault: detail element | `<detail>` | `<env:Detail>` |
| Fault codes | `Client`, `Server` | `Sender`, `Receiver` |
| Subcodes | Dot notation | Nested `<env:Subcode>` |

Auto-detection from WSDL:
- `xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"` -> SOAP 1.1
- `xmlns:soap12="http://schemas.xmlsoap.org/wsdl/soap12/"` -> SOAP 1.2

---

## Binding Style Handling

| Style | Description | Envelope Generation |
|-------|-------------|-------------------|
| Document/Literal Wrapped | Body contains wrapper element named after operation, params as children | `<OperationName xmlns="targetNS"><param1>val</param1></OperationName>` |
| Document/Literal (unwrapped) | Body contains the message part element directly | `<PartElement xmlns="targetNS">val</PartElement>` |
| RPC/Literal | Body contains operation element with namespace, parts as children | `<ns:OperationName xmlns:ns="targetNS"><param1>val</param1></ns:OperationName>` |
| RPC/Encoded | Like RPC/Literal but with `xsi:type` attributes | Legacy; generate with type annotations, show info banner |

Detection from WSDL:
- `<soap:binding style="document">` + `<soap:body use="literal">` -> Document/Literal
- `<soap:binding style="rpc">` + `<soap:body use="literal">` -> RPC/Literal
- Wrapped vs. unwrapped: if operation input message has a single part referencing an element (not a type), it's wrapped

---

## Design Constraints

- Desktop and web clients (follows existing multi-client architecture)
- Must use `@requestly/ui` components exclusively (no direct antd, no native HTML elements)
- Semantic tokens for all colors (no hardcoded Tailwind colors)
- XML editor: extend existing CodeMirror 6 editor infrastructure (`packages/ui/src/components/editors/`)
- SOAP badge color: use `custom` semantic category (cyan or magenta) to visually distinguish from HTTP (blue) and GraphQL (pink)
- WSDL parser must be platform-agnostic (lives in `packages/importers/`, no browser/Node assumptions)
- Follow render-only component pattern: all logic in hooks, components only render
- All interactive elements need `data-testid` attributes

---

## Out of Scope

- **UDDI discovery** -- finding SOAP services via UDDI registry (obsolete)
- **WS-ReliableMessaging** -- message delivery guarantees
- **WS-Transaction** -- distributed transactions over SOAP
- **WS-Addressing** -- message routing headers (could be P2)
- **SOAP over non-HTTP transports** (JMS, SMTP) -- Requestly is an HTTP API client
- **WSDL editing/authoring** -- Requestly consumes WSDLs, doesn't create them
- **Code generation** -- generating client code from WSDL (IDE territory)
- **SOAP monitoring/proxy** -- intercepting SOAP traffic (separate Requestly product)
- **Full WS-Policy enforcement** -- display policy info but don't enforce

---

## Success Metrics

- Users can import a standard WSDL 1.1 file and execute a SOAP request within 2 minutes
- WSDL import succeeds for single-file WSDLs with inline schemas (>95% success rate)
- SOAP fault responses are detected and displayed with structured error info (100%)
- Variable substitution works in XML bodies identically to HTTP/GraphQL
- Zero Runtime changes required (validates architecture extensibility)

---

## Phasing Summary

| Phase | Scope | Key Deliverables |
|-------|-------|-----------------|
| **P0 (MVP)** | CR-1 through CR-5 | WSDL import (single-file), SOAP editor, response viewer with fault display, execution, operation browser |
| **P1 (Fast Follow)** | CR-6 through CR-9 | Structured parameter form, multi-file WSDL resolution, WS-Security UsernameToken, XPath assertions |
| **P2 (Future)** | CR-10 through CR-14 | WSDL 2.0, MTOM, advanced WS-Security, mock services, SOAP-to-REST comparison |