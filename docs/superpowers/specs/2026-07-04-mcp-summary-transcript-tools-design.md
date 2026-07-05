# Design: `get_meeting_summary` / `get_meeting_transcript` MCP tools

**Date:** 2026-07-04
**Status:** Approved
**Branch:** feat/na-121/mcp

## Problem

An agent asked for a meeting's summary and reported that no summary resource was
available. The summary is exposed, but only at a sibling resource URI
(`notero://meetings/{id}/summary`) that is registered with `list: undefined`, so
it never appears in `resources/list`. Only the metadata resource
(`notero://meetings/{id}`) is enumerable. The metadata content contains no pointer
to the summary or transcript URIs either. The agent therefore read the only URI it
could discover (metadata), found no summary field, and correctly concluded there
was nothing to summarize — it had no way to reach `.../summary`.

This is a discoverability defect, not a data problem. The summary endpoint works.

## Decision

Expose the summary and transcript as **MCP tools** rather than resources. Tools are
always advertised in `tools/list`, and agents reliably call them without needing to
discover resource templates. Two decisions were made during brainstorming:

1. **Replace, don't duplicate.** Remove the summary and transcript *resource*
   registrations; the tools become the single way to fetch that content. Keep the
   metadata resource (`notero://meetings/{id}`) because its `list` handler is what
   makes meetings listable/discoverable.
2. **Explanatory tool errors, backend-owned readiness.** The MCP server does not know
   about summary/transcript generation status. The backend returns `200 { content }`
   when ready and a non-2xx status + human message when not-ready/failed. The tool
   renders the content on success, or returns a normal tool result with `isError: true`
   carrying the backend's message on failure. It never throws `McpError` and never
   inspects a status enum. (Superseded the earlier PENDING/GENERATING/FAILED branching
   — see 2026-07-05 revision below.)

## Components

### New file: `src/mcp/recording/recording.tool.ts`

Exports `registerRecordingTools(server: McpServer, recordingApi: RecordingApi): void`,
mirroring the existing `registerRecordingResource`. Registers both tools via
`server.registerTool`. Reuses `formatSummary` and `formatTranscript` (imports move
here from `recording.resource.ts`). Input is validated with Zod (already a
dependency via `src/env.ts`).

### Wiring: `src/mcp/mcp.server.ts`

In `createMcpServer`, call `registerRecordingTools(server, recordingApi)` directly
after `registerRecordingResource(server, recordingApi)`.

### API

`RecordingApi.getSummary(id)` / `getTranscript(id)` return `SummaryResult` /
`TranscriptResult`, whose shapes carry only `content` (and `segments` for transcript) —
no `status` field. Not-ready/failed is signalled by the backend via a non-2xx response,
which `HttpService` turns into an `HttpError` the tool catches.

## The two tools

| Tool | Input | Success output |
|---|---|---|
| `get_meeting_summary` | `{ meetingId: string }` | `formatSummary(summary.content)` |
| `get_meeting_transcript` | `{ meetingId: string }` | `formatTranscript(transcript.segments, transcript.content)` |

- Input parameter name is `meetingId` (clearer to the agent than bare `id`; approved).
- Each tool carries a `description` that states what it fetches — this is what drives
  the agent's tool selection.

### Behavior / states

Success (backend returned `200 { content }`):
```
{ content: [{ type: 'text', text: <formatted markdown> }] }
```

Failure (backend returned a non-2xx, e.g. not-ready/failed/not-found):
```
{ content: [{ type: 'text', text: <backend message, or ResourceNotFound fallback> }], isError: true }
```

The tool wraps the API call in `try/catch`: on success it renders the content; on an
`HttpError` it surfaces `error.message` (the backend's readiness/failure text); on any
other error it falls back to `McpErrorMessages.ResourceNotFound`. There is no status
enum on the MCP side.

## Resources removed

In `src/mcp/recording/recording.resource.ts`, delete the `MeetingSummaries` and
`MeetingTranscripts` `registerResource` blocks. Keep the metadata resource. Remove
imports that become unused there (`formatSummary`, `formatTranscript`, and any
constants only those blocks used).

Remove the now-orphaned constants from `src/mcp/mcp.constants.ts`:
- `McpResourceNames.MeetingSummaries`, `McpResourceNames.MeetingTranscripts`
- `McpResourceUriTemplates.MeetingSummary`, `McpResourceUriTemplates.MeetingTranscript`

(Only `McpErrorMessages.ResourceNotFound` remains — the `SummaryNotReady` /
`SummaryFailed` / `TranscriptNotReady` messages were removed; the backend now supplies
those messages. See the 2026-07-05 revision below.)

## Constants (no inline literals — CLAUDE.md rule)

Add to `src/mcp/mcp.constants.ts`:
- `McpToolNames` — `{ MeetingSummary: 'get_meeting_summary', MeetingTranscript: 'get_meeting_transcript' }`
- `McpToolDescriptions` — one description string per tool
- `McpToolInputKeys` — `{ MeetingId: 'meetingId' }`

## Convention change: `.tool.ts` suffix

CLAUDE.md's file-suffix table has no row for MCP tools. Per CLAUDE.md's own rule
(new conventions must be agreed and recorded, not invented), add a row:

| MCP tool | `.tool.ts` | `recording.tool.ts` |

Rationale: analogous to `.resource.ts`; singular, and a single tool file stays at
the directory level (the subdirectory-grouping rule only triggers on a second file
of the same suffix). This CLAUDE.md edit is part of this change.

## Verification

No test runner or lint is configured (CLAUDE.md), so verification is:
1. `pnpm build` — TypeScript compiles, strict mode passes, no orphaned imports from
   the removed resource blocks.
2. Manual check against a running server: `tools/list` shows both tools; calling
   `get_meeting_summary` with a completed meeting returns the summary markdown; a
   pending/failed/unknown meeting returns the corresponding `isError` message.

Scaffolding a test framework is out of scope for this change.

## Out of scope

- Adding a test runner.
- Linking sub-resource URIs from the metadata output (superseded by tools).

## Revision — 2026-07-05: readiness moves to the backend

The MCP server no longer knows about summary/transcript generation status. Rationale:
the generation lifecycle (`PENDING`/`GENERATING`/`FAILED`/`COMPLETED`) is backend
business state; encoding it in the MCP server duplicated that state and coupled the two.

Changes:
- Dropped the `status` field from `SummaryResult` / `TranscriptResult`
  (`recording.types.ts`); `getSummary`/`getTranscript` return the non-null shape.
- `recording.tool.ts` no longer branches on status — `try` renders `content`, `catch`
  surfaces the backend's `HttpError` message with `isError: true`.
- Removed `SummaryNotReady` / `SummaryFailed` / `TranscriptNotReady` from
  `McpErrorMessages`.

**Backend contract (the "actual server"):** `/internal/mcp/recordings/:id/summary` and
`.../transcript` must return `200 { content }` when ready and a non-2xx status + human
message when not-ready/failed (no `status` field). This MCP-side change must deploy
together with that backend change — otherwise a not-ready summary renders as empty
content.
