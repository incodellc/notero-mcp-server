import type { HttpService } from '../../shared/http.service.js';
import { RecordingApiPaths } from './recording.constants.js';
import type {
  MeetingNote,
  Recording,
  RecordingMetadata,
  SummaryResult,
  TranscriptResult,
} from './recording.types.js';

export class RecordingApi {
  constructor(private readonly http: HttpService) {}

  list(search?: string): Promise<Recording[]> {
    if (search === undefined || search === '') {
      return this.http.get<Recording[]>(RecordingApiPaths.Base);
    }

    const params = new URLSearchParams({
      [RecordingApiPaths.QueryKeys.Search]: search,
    });
    return this.http.get<Recording[]>(
      `${RecordingApiPaths.Base}?${params.toString()}`,
    );
  }

  getMetadata(id: string): Promise<RecordingMetadata> {
    return this.http.get<RecordingMetadata>(
      `${RecordingApiPaths.Base}/${id}/${RecordingApiPaths.Suffixes.Metadata}`,
    );
  }

  getSummary(id: string): Promise<SummaryResult> {
    return this.http.get<SummaryResult>(
      `${RecordingApiPaths.Base}/${id}/${RecordingApiPaths.Suffixes.Summary}`,
    );
  }

  getTranscript(id: string): Promise<TranscriptResult> {
    return this.http.get<TranscriptResult>(
      `${RecordingApiPaths.Base}/${id}/${RecordingApiPaths.Suffixes.Transcript}`,
    );
  }

  getNotes(id: string): Promise<MeetingNote[]> {
    return this.http.get<MeetingNote[]>(
      `${RecordingApiPaths.Base}/${id}/${RecordingApiPaths.Suffixes.Notes}`,
    );
  }
}
