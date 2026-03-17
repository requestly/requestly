# Request History — Product Overview

## What is it?

Request History is a lightweight, auto-capture feature inside the API Client that records every HTTP and GraphQL request a user executes. It acts as a quick-access ledger of recent API calls — a "scratch pad" before users decide to permanently save something to a collection.

Users access it via a dedicated **History** tab (clock icon) in the API Client's left sidebar, alongside Collections, Environments, and Runtime Variables.

---

## Features

**Automatic Capture** — Every request executed from the API Client is automatically added to history. No manual action needed. Both HTTP and GraphQL requests are captured.

**Timeline View** — History entries are displayed as a vertical timeline in reverse chronological order (newest first). Each entry shows the HTTP method (color-coded) and the request URL, with a tooltip for the full URL.

**Open & Re-execute** — Clicking any history entry opens it in a dedicated History View tab where users can see the full request configuration, modify it, and re-execute it.

**Save to Collection** — A "Save" button in the History View lets users promote a temporary history entry into a permanent saved request inside a collection. This creates a new independent record — it's not linked back to the history entry.

**Clear History** — A trash icon button in the sidebar header lets users wipe all history entries in one action.

**Privacy Notice** — The UI shows a dismissible banner: *"Your history is stored in your device's local storage for better privacy & control."*

---

## What Data is Captured?

For each request, history stores:

- Request type (HTTP or GraphQL)
- HTTP method and URL
- Headers, query params, and path variables
- Request body and content type
- Authentication configuration
- Pre-request and post-response scripts
- Test results from execution

**Notably missing**: Response body, response headers, status code, and timing data are **not** stored. The response is intentionally stripped before saving to local storage — this is a deliberate privacy decision.

---

## Storage & Sync

- History is stored in the browser's `localStorage` (key: `rq-api-history`).
- It is **device-local only** — there is no cloud sync.
- Web app, Desktop app, and Browser Extension each maintain completely separate, isolated histories.
- History survives browser restarts but is lost if localStorage is cleared.

---

## Limitations

| Area | Limitation |
|------|-----------|
| **Max entries** | Hard cap of **20 requests**. When a 21st is added, the oldest is dropped (FIFO). |
| **No cloud sync** | History lives only on the device where the request was made. |
| **No response data** | Only the request configuration is saved, not the response. |
| **No search or filter** | Users can only scroll through the timeline — there's no way to search or filter by method, URL, status, etc. |
| **No time-based grouping** | Entries aren't grouped by date or session. It's a flat reverse-chronological list. |
| **No sharing** | History can't be shared directly. Users must first save a request to a collection, then share from there. |
| **Platform isolation** | History on `app.requestly.io` is completely separate from Desktop app history, which is separate from Extension history. |
| **No export** | There's no way to export history entries (e.g., as HAR, cURL, or CSV). |
| **Storage quota** | Subject to browser localStorage limits (~5–10 MB depending on browser). |

---

## Cross-Platform Availability

History works across all three Requestly contexts — Web, Desktop, and Extension — but each maintains its own isolated local history. There is no way to view or merge history across platforms.

---

## Relationship with Other Features

**API Client Collections** — History is the "unsaved" counterpart to collections. The typical flow is: execute a request, it appears in history, and if it's worth keeping, the user saves it to a collection.

**Collection Runner (Run History)** — This is a separate concept. The Collection Runner has its own execution history that tracks results across collection runs and iterations. It's stored differently (Redux) and shown in a different UI (a drawer in the runner).

**Session Recording & Network Inspector** — These are independent features with their own data models and storage. They don't integrate with Request History.

---

## Analytics

Two events are tracked:

- `api_client_request_selected_from_history` — when a user clicks on a history entry
- `api_client_history_cleared` — when a user clears all history

---
---

# Competitive Analysis

## Postman — Request History

Postman's History is a mature, full-featured implementation that serves as the industry benchmark for API client history.

### How it Works

Every request sent in Postman automatically appears under the **History** tab in the sidebar. Requests are grouped by date (e.g., "Today", "Yesterday", "Last 7 days"), making it easy to locate recent work. Users can open any history entry in a new tab, modify it, and re-execute it — similar to Requestly.

### Key Features

**Search Bar** — The History tab has a built-in search bar at the top, allowing users to quickly find specific requests by URL or keyword. This is absent in Requestly.

**Save Responses Toggle** — Users can opt in to saving response data alongside request history by enabling "Save Responses" from the History options menu. This is off by default for privacy, but gives users the choice. In Requestly, responses are always stripped with no option to retain them.

**Cloud Sync Across Devices** — When signed into a Postman account, history syncs across devices automatically. Users can start work on their laptop and pick up the same history on another machine. Requestly history is completely isolated per device.

**Shareable Response Links** — After enabling "Save Responses", users can generate a shareable link to a specific request-response pair. Team members in the same workspace (internal or Partner) can view the exact request configuration and response. This is useful for debugging and collaboration. Links also render rich previews in Slack and Microsoft Teams via Postman integrations.

**Per-Request History (Version History)** — For saved requests in collections, Postman maintains a timeline of previous configurations. Users can click "History" in the response area to see timestamped versions of the same request and compare how it changed over time. This is a concept Requestly doesn't have at all.

**Contextual Actions** — From any history entry, users can create monitors, documentation, or mock servers directly. This turns history into a launchpad for other Postman features.

**Date-Based Grouping** — History entries are organized by date, making it much easier to navigate than a flat chronological list.

**Individual Deletion** — Users can delete specific history entries one at a time, rather than only having a "clear all" option.

### Limitations

- History is personal — team members in a shared workspace cannot see each other's history (similar to Requestly).
- "Save Responses" doesn't work with Collection Runner results.
- Response sharing only works for requests created after October 7, 2024.
- Sharing is restricted to internal or Partner Workspaces (not public workspaces).
- Shared responses expose sensitive data to anyone with the link.
- No official documented hard cap on entry count, but retention appears to be approximately the last 7 days of activity.

### Sources

- [Navigating Postman — Official Docs](https://learning.postman.com/docs/getting-started/basics/navigating-postman)
- [Debug API Requests — Official Docs](https://learning.postman.com/docs/sending-requests/response-data/troubleshooting-api-requests)
- [Sharing in Postman — Official Docs](https://learning.postman.com/docs/collaborating-in-postman/sharing)
- [Sync Changes Across Devices — Official Docs](https://learning.postman.com/docs/getting-started/basics/syncing)
- [Community Discussion on History Limits](https://community.postman.com/t/what-is-the-limit-of-storage-in-history-is-it-the-number-of-days-or-the-number-of-requests/22736)

---

## Apidog — Request History

Apidog takes a different approach with a clear split between **Local** and **Shared** history, making collaboration a first-class part of the feature.

### How it Works

When a user sends a request, the full request and response are automatically saved as a "snapshot" on the Local tab. This happens silently in the background. Users can revisit any snapshot, modify the parameters, and re-send — similar to Requestly and Postman.

### Key Features

**Local + Shared Tabs** — Apidog splits history into two distinct views:
  - **Local tab**: Auto-captured snapshots visible only to the user (privacy-first, like Requestly).
  - **Shared tab**: Manually shared snapshots that are uploaded to the cloud and visible to all project members.

This dual model gives users the best of both worlds — private by default, collaborative when needed.

**500 Entry Limit** — Both the desktop client and the web app store up to 500 history entries. This is **25x more** than Requestly's 20-entry cap.

**Full Response Capture** — Unlike Requestly (which strips responses), Apidog saves the complete request *and* response as a snapshot. This makes history entries self-contained and useful for debugging without having to re-execute.

**1 MB Size Guard** — If a request+response payload exceeds 1 MB, the snapshot is not auto-saved locally. However, users can still manually share it to the cloud, where larger payloads are stored.

**One-Click Sharing** — A "Share" button on any history entry uploads the snapshot to the cloud and generates a sharing link. Other project members can access shared history via the link or by browsing the project's Shared tab. This is much simpler than Postman's approach of enabling "Save Responses" first.

**Modify and Re-send** — Users can edit parameters directly within a history entry and re-send the request, streamlining the debug-tweak-retry loop.

### Limitations

- Local history is device-specific (same as Requestly and Postman).
- The 1 MB cap on auto-saving can silently skip large API responses.
- No documented search or filter capability within the history tab.
- No date-based grouping mentioned in documentation.
- Shared history requires manual action per entry — there's no bulk share or auto-share.

### Sources

- [Request History — Apidog Official Docs](https://docs.apidog.com/request-history-754600m0)
- [Request History (Redirect) — Apidog Help](https://apidog.com/help/api-requesting/requesting-history/)
- [Team Collaboration — Apidog Docs](https://docs.apidog.com/team-collaboration-616231m0)

---
---

# Feature Comparison Matrix

| Capability | Requestly | Postman | Apidog |
|---|---|---|---|
| **Auto-capture requests** | Yes | Yes | Yes |
| **Max history entries** | 20 | ~7 days retention | 500 |
| **Response data saved** | No (stripped) | Optional (opt-in toggle) | Yes (full snapshot) |
| **Search / filter** | No | Yes (search bar) | No |
| **Date-based grouping** | No | Yes | No |
| **Cloud sync** | No | Yes (auto-sync with account) | No (local only by default) |
| **Share history entries** | No | Yes (shareable links) | Yes (cloud share + links) |
| **Individual entry deletion** | No (clear all only) | Yes | Not documented |
| **Save to collection** | Yes | Yes | Yes |
| **Modify & re-execute** | Yes | Yes | Yes |
| **Per-request version history** | No | Yes (for saved requests) | No |
| **Create monitors/mocks from history** | No | Yes | No |
| **Cross-device access** | No | Yes | Only via shared tab |
| **Size limit per entry** | No explicit limit | Not documented | 1 MB auto-save cap |
| **Privacy by default** | Yes | Yes | Yes (local tab) |

---
---

# Recommended Improvements for Requestly

Based on the competitive analysis, here are actionable improvements ordered by estimated impact and feasibility.

## High Priority (High Impact, Reasonable Effort)

### 1. Increase the History Cap from 20 to 500

Requestly's 20-entry limit is the most glaring gap. Apidog stores 500 entries. Postman retains ~7 days of activity. At 20 entries, a developer doing active debugging can burn through the entire history in minutes, losing valuable context.

**Recommendation**: Increase to at least 300–500 entries. Consider using IndexedDB instead of localStorage to handle the larger dataset without hitting browser storage quotas.

### 2. Add a Search Bar

Postman's history search bar is a simple but high-value feature. When history grows beyond a handful of entries, scrolling becomes impractical. A basic text search over URL and method would immediately make history more usable.

**Recommendation**: Add a search input at the top of the History sidebar tab that filters entries by URL substring or method.

### 3. Optional Response Saving (Opt-In Toggle)

Requestly strips responses for privacy. Postman makes this a toggle. Apidog saves responses by default. The current approach sacrifices debugging utility for privacy — but the user should get to choose.

**Recommendation**: Add a "Save Responses" toggle in the History tab header (off by default). When enabled, response body, status code, and headers are stored alongside the request. This makes history entries self-contained for debugging.

### 4. Date-Based Grouping

Postman groups history by "Today", "Yesterday", "Last 7 days" etc. Requestly shows a flat chronological list. As history size grows (especially after increasing the cap), grouping becomes essential for navigation.

**Recommendation**: Group history entries by date. Show relative labels (Today, Yesterday) for recent entries and date strings for older ones.

## Medium Priority (Good Impact, Moderate Effort)

### 5. Individual Entry Deletion

Requestly only offers "Clear All". Postman allows deleting individual entries. Users often want to clean up noise without wiping everything.

**Recommendation**: Add a delete icon (or right-click context menu) on each history entry.

### 6. Shareable History Snapshots

Both Postman and Apidog let users share a request-response pair with team members. This is a significant collaboration advantage, especially for debugging. Apidog's approach (one-click Share button that uploads to cloud and generates a link) is the most elegant.

**Recommendation**: Add a "Share" button on history entries that uploads the request (and response, if saved) to the cloud and generates a shareable link. Team members can view the snapshot via the link. Consider a "Shared" tab alongside the local history, similar to Apidog's Local/Shared split.

### 7. Cloud Sync for Signed-In Users

Postman automatically syncs history across devices for signed-in users. This removes the frustration of losing context when switching machines.

**Recommendation**: For users signed into a Requestly account, sync history to the cloud. Keep local-only mode as a fallback for users who prefer privacy. This is a larger backend effort but aligns with Requestly's existing cloud infrastructure.

## Lower Priority (Nice-to-Have, Higher Effort)

### 8. Per-Request Version History

Postman's ability to view previous configurations of a saved request is unique and valuable for tracking how a request evolved over time. This is a differentiator but also the most complex to implement.

**Recommendation**: For saved collection requests, maintain a version timeline showing previous configurations and their responses. This could be a longer-term roadmap item.

### 9. Contextual Actions from History

Postman lets users create monitors, documentation, or mock servers directly from a history entry. While Requestly may not have all these features, surfacing relevant actions (like "Create Mock" or "Add to Test Suite") from history entries could increase feature discoverability.

**Recommendation**: Add a context menu on history entries with actions relevant to Requestly's feature set.

### 10. Export History

Neither Postman nor Apidog prominently feature history export, but the ability to export entries as cURL commands, HAR files, or CSV would serve power users and debugging workflows.

**Recommendation**: Add an export option (cURL at minimum) to individual history entries and a bulk export for the full history list.

---

## Summary

Requestly's Request History is functional but minimal. The 20-entry cap, lack of search, no response storage, and no sharing put it well behind both Postman and Apidog. The highest-leverage improvements are increasing the cap, adding search, and introducing optional response saving — these three changes alone would close the biggest gaps with moderate engineering effort.
