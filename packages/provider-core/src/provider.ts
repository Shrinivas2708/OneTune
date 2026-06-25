import type {
  DownloadManifest,
  DownloadOptions,
  ImportedPlaylist,
  ProviderId,
  SearchQuery,
  SearchResultPage,
  StreamManifest,
  StreamOptions,
  TrackMetadata,
  TrackRef,
} from "@vibevault/types";

export interface ProviderCapabilities {
  search: boolean;
  metadata: boolean;
  streaming: boolean;
  playlistImport: boolean;
  download: boolean;
  video: boolean;
}

export class ProviderError extends Error {
  constructor(
    public readonly providerId: ProviderId,
    public readonly code: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export class ProviderUnavailableError extends ProviderError {
  constructor(providerId: ProviderId, cause?: unknown) {
    super(
      providerId,
      "PROVIDER_UNAVAILABLE",
      `Provider "${providerId}" is unavailable`,
      cause,
    );
    this.name = "ProviderUnavailableError";
  }
}

export class ProviderNotSupportedError extends ProviderError {
  constructor(providerId: ProviderId, operation: string) {
    super(
      providerId,
      "OPERATION_NOT_SUPPORTED",
      `Provider "${providerId}" does not support "${operation}"`,
    );
    this.name = "ProviderNotSupportedError";
  }
}

/**
 * Provider adapter contract. Implementations live in apps/api adapters.
 * The mobile app never imports provider implementations — only normalized DTOs.
 */
export interface MusicProvider {
  readonly id: ProviderId;
  readonly displayName: string;
  readonly capabilities: ProviderCapabilities;

  search(query: SearchQuery): Promise<SearchResultPage>;
  getMetadata(ref: TrackRef): Promise<TrackMetadata>;
  resolveStream(
    ref: TrackRef,
    options?: StreamOptions,
  ): Promise<StreamManifest>;
  importPlaylist(url: string): Promise<ImportedPlaylist>;
  resolveDownload?(
    ref: TrackRef,
    options?: DownloadOptions,
  ): Promise<DownloadManifest>;
}

export function assertCapability(
  provider: MusicProvider,
  capability: keyof ProviderCapabilities,
  operation: string,
): void {
  if (!provider.capabilities[capability]) {
    throw new ProviderNotSupportedError(provider.id, operation);
  }
}
