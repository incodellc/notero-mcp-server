import type { HttpService } from '../../shared/http.service.js';
import { RecordingApiPaths } from './recording.constants.js';
import type {
  Recording,
  RecordingMetadata,
  SummaryResult,
  TranscriptResult,
} from './recording.types.js';

export class RecordingApi {
  constructor(private readonly http: HttpService) {}

  list(): Promise<Recording[]> {
    return this.http.get<Recording[]>(RecordingApiPaths.Base);
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
}
