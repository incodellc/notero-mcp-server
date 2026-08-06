import type { HttpService } from '../../shared/http.service.js';
import {
  RecordingApiPaths,
  RecordingListDefaults,
} from './recording.constants.js';
import type {
  MeetingNote,
  Recording,
  RecordingMetadata,
  SummaryResult,
  TranscriptResult,
} from './recording.types.js';

export type ListRecordingsParams = {
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
};

export class RecordingApi {
  constructor(private readonly http: HttpService) {}

  list(params: ListRecordingsParams = {}): Promise<Recording[]> {
    const query = new URLSearchParams();

    if (params.search !== undefined && params.search !== '') {
      query.set(RecordingApiPaths.QueryKeys.Search, params.search);
    }
    if (params.from !== undefined && params.from !== '') {
      query.set(RecordingApiPaths.QueryKeys.From, params.from);
    }
    if (params.to !== undefined && params.to !== '') {
      query.set(RecordingApiPaths.QueryKeys.To, params.to);
    }

    const limit = params.limit ?? RecordingListDefaults.Limit;
    query.set(RecordingApiPaths.QueryKeys.Limit, String(limit));

    const qs = query.toString();
    return this.http.get<Recording[]>(
      qs ? `${RecordingApiPaths.Base}?${qs}` : RecordingApiPaths.Base,
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
