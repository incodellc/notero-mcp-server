import type { HttpService } from '../../shared/http.service.js';
import { RECORDING_API_PATHS } from './recording.constants.js';
import type {
  Recording,
  RecordingMetadata,
  SummaryResult,
  TranscriptResult,
} from './recording.types.js';

export class RecordingApi {
  constructor(private readonly http: HttpService) {}

  list(): Promise<Recording[]> {
    return this.http.get<Recording[]>(RECORDING_API_PATHS.BASE);
  }

  getMetadata(id: string): Promise<RecordingMetadata> {
    return this.http.get<RecordingMetadata>(
      `${RECORDING_API_PATHS.BASE}/${id}/${RECORDING_API_PATHS.SUFFIXES.METADATA}`,
    );
  }

  getSummary(id: string): Promise<SummaryResult | null> {
    return this.http.get<SummaryResult | null>(
      `${RECORDING_API_PATHS.BASE}/${id}/${RECORDING_API_PATHS.SUFFIXES.SUMMARY}`,
    );
  }

  getTranscript(id: string): Promise<TranscriptResult | null> {
    return this.http.get<TranscriptResult | null>(
      `${RECORDING_API_PATHS.BASE}/${id}/${RECORDING_API_PATHS.SUFFIXES.TRANSCRIPT}`,
    );
  }
}
