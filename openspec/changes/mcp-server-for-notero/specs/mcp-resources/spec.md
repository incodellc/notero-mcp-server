## ADDED Requirements

### Requirement: Resource listing returns all org recordings
The MCP server SHALL expose a `resources/list` handler that returns a resource entry for each recording belonging to the authenticated organization.

#### Scenario: Listing resources
- **WHEN** a client sends `resources/list`
- **THEN** the server returns one resource URI per recording in the format `notero://meetings/{recordingId}`, with the recording's display name as the resource name

### Requirement: Meeting metadata resource
The MCP server SHALL expose a meeting metadata resource at URI `notero://meetings/{recordingId}/metadata` that returns a markdown-formatted block with title, date, duration, provider, and participants.

The data sources are:
- `Recording.displayName` → Title
- `Recording.createdAt` → Date
- `Recording.duration` → Duration (seconds, formatted as mm:ss)
- `Recording.externalBot.type` → Provider (`RECALL` or `upload`)
- Unique `speakerId` values from `Transcription.segments` → Participants (omitted if no transcript)

Markdown format:
```
# Meeting Metadata
**Title:** <displayName or "Untitled">
**Date:** <ISO date, human readable>
**Duration:** <mm:ss>
**Provider:** <Recall Bot | Direct Upload>
**Participants:** <comma-separated speakerIds, or "Unknown">
```

#### Scenario: Full metadata with transcript
- **WHEN** a client reads `notero://meetings/{id}/metadata` and the recording has a completed transcription
- **THEN** the markdown includes participants derived from unique speakerIds in segments

#### Scenario: Metadata without transcript
- **WHEN** a client reads `notero://meetings/{id}/metadata` and no transcription exists
- **THEN** participants field shows `"Unknown"` and other fields render from Recording data

#### Scenario: Resource not in org
- **WHEN** a client requests a recordingId that does not belong to the authenticated org
- **THEN** a JSON-RPC error is returned: `"Resource not found or access denied."`

### Requirement: Meeting summary resource
The MCP server SHALL expose a meeting summary resource at URI `notero://meetings/{recordingId}/summary` that returns the `RecordingSummary.content` as markdown.

#### Scenario: Completed summary available
- **WHEN** a client reads `notero://meetings/{id}/summary` and summary status is `COMPLETED`
- **THEN** the resource returns the summary content prefixed with `# Meeting Summary\n\n`

#### Scenario: Summary not yet available
- **WHEN** a client reads `notero://meetings/{id}/summary` and no summary exists or status is `PENDING`/`GENERATING`
- **THEN** a JSON-RPC error is returned: `"Summary is not yet available for this meeting."`

#### Scenario: Summary generation failed
- **WHEN** status is `FAILED`
- **THEN** a JSON-RPC error is returned: `"Summary generation failed for this meeting."`

### Requirement: Meeting transcript resource with speaker attribution
The MCP server SHALL expose a transcript resource at URI `notero://meetings/{recordingId}/transcript` that returns speaker-attributed markdown when segments are available, falling back to plain content otherwise.

Speaker-attributed format (when segments have speakerIds):
```
# Meeting Transcript

**<speakerId>** *(0:12 – 0:45)*
<text>

**<speakerId>** *(0:46 – 1:03)*
<text>
```

Fallback format (when no speakerIds present):
```
# Meeting Transcript

<plain content>
```

Consecutive segments from the same speaker SHALL be merged into a single block.

#### Scenario: Transcript with speaker attribution
- **WHEN** a client reads the transcript resource and `Transcription.segments` contains `speakerId` values
- **THEN** the markdown groups consecutive same-speaker segments into blocks with timestamps

#### Scenario: Transcript without speaker attribution
- **WHEN** all segments have no `speakerId`, or no segments exist
- **THEN** the markdown renders `Transcription.content` as a single unlabeled block

#### Scenario: Transcript not ready
- **WHEN** no `Transcription` record exists or status is not `COMPLETED`
- **THEN** a JSON-RPC error is returned: `"Transcript is not yet available for this meeting."`

### Requirement: User profile resource
The MCP server SHALL expose a user profile resource at URI `notero://profile` that returns the authenticated user's profile as markdown.

Data sources: `User.firstName`, `User.lastName`, `User.email`, `User.role`, `User.title`, `Organization.name`.

Markdown format:
```
# User Profile
**Name:** <firstName lastName>
**Email:** <email>
**Role:** <role or "—">
**Title:** <title or "—">
**Organization:** <org name>
```

#### Scenario: Full profile
- **WHEN** a client reads `notero://profile`
- **THEN** the markdown includes all available user fields; optional fields render as `"—"` when null

### Requirement: Markdown formatting layer
All resource content SHALL be formatted as UTF-8 markdown strings. The formatter layer SHALL be a separate module responsible for transforming raw NestJS API response data into markdown, independent of MCP protocol concerns.

#### Scenario: Formatter is independent
- **WHEN** the NestJS API response shape changes
- **THEN** only the formatter module requires updates, not the MCP resource handler
