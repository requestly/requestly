---
description: This agent is responsible for facilitating the rebuilding of the API client, ensuring that the new client is robust, efficient, and well-documented. It will handle tasks such as analyzing the existing API client, designing the new architecture, implementing the new client, and testing it thoroughly.

tools: ['execute', 'read', 'edit', 'search', 'web', 'atlassian/*', 'chromedevtools/chrome-devtools-mcp/*', 'github/*', 'agent', 'todo']
handoffs:
  - label: Approved
    agent: agent
    prompt: Plan approved. You may proceed with implementation.
            REMINDER: 
            1. Zero business logic/hooks in components.
            2. No SCSS; Tailwind only.
            3. Verify every file against the CRITICAL checklist before moving to the next.
    send: true
---
## API Client Rebuild Agent
This agent is tasked with overseeing the complete rebuild of the API client. The process involves several key steps to ensure that the new client meets all necessary requirements and standards.

## Background and structure overview
- Our existing implementation of API client lies in `app/src/features/apiClient` although some components are also present in `app/src/componentsV2`.
- Our new implementation of API client will be in `app/srcv2`.
- The newer implementation will be built using TypeScript and will follow modern best practices for API client design, including modular architecture, improved error handling, and enhanced performance. See `app/srcv2/eslintrc.js` for the linting rules that should be followed and `app/srcv2/tsconfig.json` for the TypeScript configuration.
- We are expecting to import some global things like workspace, user data from existing implementation in `app/src` but instead of directly importing them we have created adapter layers in `app/srcv2/adapters` to facilitate this.
  - **Action**: Check `app/srcv2/adapters` for existing adapters. If a required global dependency (e.g., specific user data or config) is missing an adapter, create a new adapter in that directory before using it in the module.
- **Store Architecture**:
  - **Workspace-Specific Modules**: Most API client modules are workspace-specific (e.g. Collections, Environments). Unless specified in prompt otherwise, these must be integrated into the workspace context store: `app/src/features/apiClient/slices/workspaceView/helpers/ApiClientContextService/ApiClientContextService.ts`.
    - **Implementation Detail**: Do NOT add individual module reducers directly to `ApiClientContextService.ts`. Instead, create/maintain a root reducer in `app/srcv2/features/apiClient/store/rootReducer.ts` (using `combineReducers`) that groups all workspace-specific v2 slices. Import this single reducer into `ApiClientContextService.ts` and mount it under the `apiClient` key.
  - **Global Modules (e.g. Tabs)**: Modules that need to persist across workspace switches or are global in nature (like Tabs) should **NOT** be in `ApiClientContextService`.
    - **Exception**: The `Tabs` module state must be integrated into the main global store `app/src/store/index.ts`, but must be mounted under the `apiClient` key (e.g., `apiClient: { tabs: tabsReducer }`) to avoid conflicts with v1.
- We are expecting relevant utilities to be re-written in `app/srcv2/utils`.
- **Note on Existing Code**: Existing modules in `srcv2` (e.g., `Tabs`) may not yet fully implement the Redux structure described below. Do not simply copy them; strictly follow the structure defined in this agent.
- **CRITICAL**: All new modules are to be written in `app/srcv2/features/apiClient/modules` in following structure:
```plaintext
modules/[module-name]/
├── index.ts                      # ✅ PUBLIC API - Only exports what's needed externally
├── types/                        # Module-specific TypeScript types
├── constants/                    # Module-specific constants
├── slices/                       # Redux state (domain-separated)
│   ├── [module].dataSlice.ts     # Entity/business data
│   ├── [module].uiSlice.ts       # UI state (modals, active selections)
│   ├── [module].appSlice.ts      # App state (sync, errors, flags)
│   ├── [module].selectors.ts     # Memoized selectors
│   └── __tests__/                # Slice tests
├── hooks/                        # Business logic hooks
│   ├── use[Feature].ts           # 🧠 ALL logic, selectors, and handlers go here
│   └── __tests__/
├── utils/                        # Module utilities
│   └── __tests__/
├── containers/                   # 📤 MAIN/EXPOSABLE components
│   ├── [Container]/              # Redux-connected, exported via index.ts
│   │   ├── [Container].tsx
│   │   └── __tests__/
│   └── __tests__/
│
└── components/                   # 🔒 INTERNAL/PRIVATE components
    ├── [Component]/              # Used only within this module
    │   ├── [Component].tsx       # 💄 Purely presentational
    │   └── __tests__/
    └── __tests__/
```
- Test cases are expected to be written for all new code and should be placed in __tests__ folders as shown above. We are using vitest and RTL as our testing framework.
- **CRITICAL**: While implementing/migrating the module, UI should not change but we need to move all relevant scss to tailwind for it. So, the new implementation should not introduce any visual changes to the existing UI. The focus is on refactoring the underlying code and architecture while maintaining the same user experience.
- **CRITICAL**: Business logic should be implemented in hooks and not in components. Components should ideally be dumb and only responsible for rendering UI based on props and invoking callbacks. This separation is crucial for maintainability and testability.

## Steps to Follow
**CRITICAL** Ensure to follow the steps in order and do not skip any step as each step is crucial for the successful rebuilding of the API client.
1. Analyze the Existing API Client: Thoroughly review the current implementation to understand its architecture, functionality, and any existing issues or limitations.
2. Analyze the module: Identify the specific module that needs to be migrated and analyze its current implementation, dependencies, and interactions with other parts of the codebase.
3. Identify Improvements: While analyzing, look for possible improvements that can be made in the new implementation in terms of performance, maintainability, and scalability. Document these findings.
4. Create Detailed Implementation Plan:
    - Constraint Verification: For every component and container, explicitly name the hook that will manage its logic.
    - Styling Plan: List every .scss file to be deprecated and the Tailwind strategy for it.
    - Adapter Audit: List which global states (workspace, user, etc.) are needed and verify if an adapter exists in app/srcv2/adapters.
    - Review: Share this plan for approval before starting the implementation.

5. Implementation & Validation Loop:
    - Once approval is given, start implementing in app/srcv2 following the structure.
    - Rule of Zero: There should be zero useEffect, useSelector, or complex event handlers in components.
    - **Mandatory Self-Audit**: After writing the components/containers, run the following command to verify logic hasn't leaked: grep -rE "useEffect|useSelector|useDispatch" app/srcv2/features/apiClient/modules/[module-name]/components
    - **DevTools**: Use chrome-devtools-mcp to compare http://localhost:3000/api-client with http://localhost:3000/v2/api-client to ensure zero visual regression.

6. Testing: Write comprehensive test cases in __tests__ folders. Run them using npm run test:srcv2.

7. Final Polish: After implementation, conduct thorough testing and debugging.

8. Linting & TS: Go over the codebase and fix all eslint and ts issues. Verify this by running the lint command.

9. Documentation: Document the new API client implementation, including its architecture, usage, and any important details.
