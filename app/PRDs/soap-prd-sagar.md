PRD: SOAP Request Support



By Sagar Soni

4 min

13

Add a reaction
Overview
Add support for SOAP (Simple Object Access Protocol) requests in Requestly, enabling users to import WSDL files and execute SOAP API requests.

If you’re new to SOAP, highly recommend giving the research done by @Shubhranshu Dash a read. Link: 
SOAP and WSDL Flows across API Clients 

Background
SOAP is a protocol used extensively in enterprise environments, banking systems, government services, and legacy applications. Many organizations still rely on SOAP-based web services and need tools to test and debug these APIs.

Currently, Requestly supports REST APIs. Adding SOAP support will expand our user base to include enterprise/QA teams and developers working with legacy systems.

Goals
Allow users to import WSDL files (via file upload or URL)

Automatically generate SOAP requests from WSDL definitions

Execute SOAP requests and display formatted XML responses

Organize imported requests into collections/folders

Resolve dealblocker of the customer “Evri”.

Target Audience
Enterprise and QA teams testing legacy SOAP APIs

Developers integrating with SOAP-based services (banks, payment gateways, government APIs)

Teams migrating from SOAP to REST who need to test both

Example WSDL Files:
http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL

http://www.dneonline.com/calculator.asmx?WSDL

Design Decisions
Import-Only Approach - No Manual SOAP Creation
Decision: SOAP requests can only be created by importing a WSDL file. There is no "New Request" > "SOAP" option.

Rationale:

Aligns with Postman's approach for SOAP

SOAP requests require proper namespaces, operations, and envelope structure from the WSDL

Reduces complexity and potential for user error

Users who need manual SOAP requests can use the standard HTTP request with XML body

Extending HTTP -Not a New Request Type
Decision: SOAP requests are implemented as standard HTTP POST requests with pre-configured XML body and headers, not as a separate request type like GraphQL.

Rationale:

SOAP is fundamentally HTTP POST with XML payload

Reduces implementation complexity

Leverages existing HTTP request infrastructure

Imported SOAP requests appear as regular HTTP requests that users can edit

Functional Requirements
1. WSDL Import
1.1 Import Methods
Method

Description

File Import

User uploads a .wsdl or .xml file from local system

URL Import

User provides a WSDL URL (e.g., https://example.com/service?wsdl)

1.2 Import Flow
User selects "Import" > "WSDL"

User chooses import method (File or URL)

System parses the WSDL and extracts services, ports, and operations

System prompts: "Select folder organization" with options:

No folders - All requests in a flat list

Port/Endpoint - Group requests by SOAP port (recommended for multi-version WSDL)

System generates the collection with SOAP requests as HTTP POST requests

User can rename the collection before saving

1.3 Multi-Version SOAP Handling
If WSDL contains multiple SOAP versions (1.1 and 1.2):

Default behavior: Import SOAP 1.2 version only

User option: Allow switching to SOAP 1.1 during import via a dropdown/toggle

Example WSDL with both versions:



CountryInfoService
├── CountryInfoServiceSoap (SOAP 1.1) - 21 operations
└── CountryInfoServiceSoap12 (SOAP 1.2) - 21 operations ← Imported by default
2. SOAP Request Execution
2.1 Request Structure
Each generated SOAP request is a standard HTTP request with:

Component

Value

Method

POST

URL

Endpoint from <soap:address location="...">

Content-Type

text/xml; charset=utf-8 (SOAP 1.1) or application/soap+xml; charset=utf-8 (SOAP 1.2)

SOAPAction Header

"namespace/operationName"

Body

SOAP Envelope XML with operation and parameters

Note to developer: Before starting, please research about in what cases the SOAPAction should go into Header and in what cases the SOAPAction should be defined in the Content-type header.

2.2 Request Body Template


<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:tns="{{namespace}}">
  <soap:Header>
    <!-- Optional headers -->
  </soap:Header>
  <soap:Body>
    <tns:{{operationName}}>
      <paramName>{{paramValue}}</paramName>
    </tns:{{operationName}}>
  </soap:Body>
</soap:Envelope>
2.3 Response Display
Display raw XML response with syntax highlighting

Pretty-print/format the XML for readability

Show response headers, status code, and response time

Option to copy response or save to file

Technical Implementation
WSDL Parsing
I did a successful POC with the soap npm module but it is designed for Node.js environments and will not work in browser context. We should explore browser-compatible alternatives:

xml2js - General XML parser (already used for Charles rule import)

browser-soap - Browser-compatible SOAP library

Native DOMParser - Built-in browser XML parsing

fast-xml-parser - Lightweight XML parser

WSDL to Requestly Mapping
WSDL Element

Requestly Element

<service name="...">

Collection name

<port name="...">

Folder name (if folder organization selected)

<operation name="...">

Request name

<soap:address location="...">

Request URL

targetNamespace

SOAPAction header value, XML namespace in body

<input> parameters

Request body parameters with {{variable}} placeholders

<documentation>

Request description

Identifying SOAP Version from WSDL
Element

SOAP 1.1

SOAP 1.2

Namespace

xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"

xmlns:soap12="http://schemas.xmlsoap.org/wsdl/soap12/"

Binding

<soap:binding>

<soap12:binding>

Address

<soap:address>

<soap12:address>

Content-Type

text/xml

application/soap+xml

Possible UX
Import Dialog


┌─────────────────────────────────────────────────────┐
│  Import WSDL                                    [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ○ Import from File    ○ Import from URL            │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Drop WSDL file here or click to browse       │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  SOAP Version:                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ SOAP 1.2 (Recommended)                   ▼  │    │
│  └─────────────────────────────────────────────┘    │
│  (Only shown if WSDL contains multiple versions)    │
│                                                     │
│  Folder Organization:                               │
│  ┌─────────────────────────────────────────────┐    │
│  │ Port/Endpoint (Recommended)              ▼  │    │
│  └─────────────────────────────────────────────┘    │
│  Options: No folders, Port/Endpoint                 │
│                                                     │
│                          [Cancel]  [Import]         │
└─────────────────────────────────────────────────────┘
Imported Request Editor
Since SOAP requests are imported as standard HTTP requests:

Body editor displays XML with syntax highlighting and linting

Headers show Content-Type and SOAPAction (conditional)

User can modify any part of the request as needed

No special SOAP-specific UI required

Edge Cases & Error Handling
Scenario

Handling

Invalid WSDL syntax

Show parsing error with details

WSDL URL unreachable

Show network error, allow retry

WSDL with no operations

Show warning, create empty collection

Duplicate operation names across ports

Prefix with port name or use folders

Missing required namespace

Prompt user to enter manually

Large WSDL (100+ operations)

Show progress indicator during import

WSDL with only SOAP 1.1

Import SOAP 1.1, no version selector shown

Analytics
None. To be done only on ad-hoc basis.

Future Enhancements (Out of Scope for V1)
WS-Security authentication support

Support for WSDL 2.0

Manual SOAP request creation (New Request > SOAP)

References
Postman SOAP Documentation

xml2js npm module

SOAP 1.1 Specification

SOAP 1.2 Specification