import {
  ProviderNotSupportedError,
  ProviderUnavailableError,
  assertCapability,
  type MusicProvider,
  type ProviderCapabilities,
} from "@vibevault/provider-core";
import type {
  DownloadManifest,
  DownloadOptions,
  ImportedPlaylist,
  SearchQuery,
  SearchResultPage,
  StreamManifest,
  StreamOptions,
  TrackMetadata,
  TrackRef,
} from "@vibevault/types";
import {
  spotifyGetTrack,
  spotifyImportPlaylist,
  spotifySearch,
} from "../clients/spotify-client";
import {
  buildSearchPage,
  spotifyToMetadata,
  spotifyToPlaylist,
  spotifyToSearchResult,
} from "./mappers";

const capabilities: ProviderCapabilities = {
  search: true,
  metadata: true,
  streaming: false,
  playlistImport: true,
  download: false,
  video: false,
};

function wrapError(error: unknown): never {
  if (error instanceof ProviderNotSupportedError) throw error;
  throw new ProviderUnavailableError("spotify", error);
}

export function createSpotifyAdapter(): MusicProvider {
  return {
    id: "spotify",
    displayName: "Spotify",
    capabilities,

    async search(query: SearchQuery): Promise<SearchResultPage> {
      assertCapability(this, "search", "search");
      try {
        const tracks = await spotifySearch(query.query, query.limit);
        const results = tracks.map(spotifyToSearchResult);
        return buildSearchPage("spotify", query, results, results.length);
      } catch (error) {
        wrapError(error);
      }
    },

    async getMetadata(ref: TrackRef): Promise<TrackMetadata> {
      assertCapability(this, "metadata", "getMetadata");
      try {
        const track = await spotifyGetTrack(ref.externalId);
        return spotifyToMetadata(track);
      } catch (error) {
        wrapError(error);
      }
    },

    async resolveStream(
      _ref: TrackRef,
      _options?: StreamOptions,
    ): Promise<StreamManifest> {
      assertCapability(this, "streaming", "resolveStream");
      throw new ProviderNotSupportedError("spotify", "resolveStream");
    },

    async importPlaylist(url: string): Promise<ImportedPlaylist> {
      assertCapability(this, "playlistImport", "importPlaylist");
      try {
        const playlist = await spotifyImportPlaylist(url);
        return spotifyToPlaylist(playlist);
      } catch (error) {
        wrapError(error);
      }
    },

    async resolveDownload(
      _ref: TrackRef,
      _options?: DownloadOptions,
    ): Promise<DownloadManifest> {
      assertCapability(this, "download", "resolveDownload");
      throw new ProviderNotSupportedError("spotify", "resolveDownload");
    },
  };
}
