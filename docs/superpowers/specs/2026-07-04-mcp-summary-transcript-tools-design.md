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
2. **Explanatory tool errors.** When content is not ready (PENDING/GENERATING/FAILED
   for summaries, non-COMPLETED for transcripts) or not found, return a normal tool
   result with `isError: true` and a human-readable message. Do not throw
   `McpError`. This is the MCP-recommended pattern for tools and reads far better to
   the model than a protocol-level error.

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

### No API changes

`RecordingApi.getSummary(id)` and `RecordingApi.getTranscript(id)` already exist and
return `SummaryResult | null` / `TranscriptResult | null`. No change to
`recording.api.ts` or `recording.types.ts`.

## The two tools

| Tool | Input | Success output |
|---|---|---|
| `get_meeting_summary` | `{ meetingId: string }` | `formatSummary(summary.content)` |
| `get_meeting_transcript` | `{ meetingId: string }` | `formatTranscript(transcript.segments, transcript.content)` |

- Input parameter name is `meetingId` (clearer to the agent than bare `id`; approved).
- Each tool carries a `description` that states what it fetches — this is what drives
  the agent's tool selection.

### Behavior / states

Success:
```
{ content: [{ type: 'text', text: <formatted markdown> }] }
```

Not found / null result:
```
{ content: [{ type: 'text', text: McpErrorMessages.ResourceNotFound }], isError: true }
```

`get_meeting_summary` state mapping:
- `PENDING` or `GENERATING` → `isError: true`, text = `McpErrorMessages.SummaryNotReady`
- `FAILED` → `isError: true`, text = `McpErrorMessages.SummaryFailed`
- `COMPLETED` → success

`get_meeting_transcript` state mapping:
- status !== `COMPLETED` → `isError: true`, text = `McpErrorMessages.TranscriptNotReady`
- `COMPLETED` → success

The API calls are wrapped in `.catch(() => null)` (as the resources do today) so a
transport/HTTP failure maps to the not-found result rather than an unhandled throw.

## Resources removed

In `src/mcp/recording/recording.resource.ts`, delete the `MeetingSummaries` and
`MeetingTranscripts` `registerResource` blocks. Keep the metadata resource. Remove
imports that become unused there (`formatSummary`, `formatTranscript`, and any
constants only those blocks used).

Remove the now-orphaned constants from `src/mcp/mcp.constants.ts`:
- `McpResourceNames.MeetingSummaries`, `McpResourceNames.MeetingTranscripts`
- `McpResourceUriTemplates.MeetingSummary`, `McpResourceUriTemplates.MeetingTranscript`

(The `McpErrorMessages` entries stay — they are now the tool `isError` text.)

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
- Any change to the backend API or `RecordingApi`.
