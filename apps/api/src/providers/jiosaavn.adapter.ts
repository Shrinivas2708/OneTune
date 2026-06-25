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
  jiosaavnGetSong,
  jiosaavnImportPlaylist,
  jiosaavnSearchSongs,
} from "../clients/jiosaavn-client";
import {
  buildSearchPage,
  jiosaavnDownloadManifest,
  jiosaavnStreamManifest,
  jiosaavnToMetadata,
  jiosaavnToPlaylist,
  jiosaavnToSearchResult,
} from "./mappers";

const capabilities: ProviderCapabilities = {
  search: true,
  metadata: true,
  streaming: true,
  playlistImport: true,
  download: true,
  video: false,
};

function wrapError(error: unknown): never {
  if (error instanceof ProviderNotSupportedError) throw error;
  throw new ProviderUnavailableError("jiosaavn", error);
}

export function createJioSaavnAdapter(): MusicProvider {
  return {
    id: "jiosaavn",
    displayName: "JioSaavn",
    capabilities,

    async search(query: SearchQuery): Promise<SearchResultPage> {
      assertCapability(this, "search", "search");
      try {
        const data = await jiosaavnSearchSongs(
          query.query,
          query.page,
          query.limit,
        );
        const results = data.results.map(jiosaavnToSearchResult);
        return buildSearchPage("jiosaavn", query, results, data.total);
      } catch (error) {
        wrapError(error);
      }
    },

    async getMetadata(ref: TrackRef): Promise<TrackMetadata> {
      assertCapability(this, "metadata", "getMetadata");
      try {
        const song = await jiosaavnGetSong(ref.externalId);
        return jiosaavnToMetadata(song);
      } catch (error) {
        wrapError(error);
      }
    },

    async resolveStream(
      ref: TrackRef,
      _options?: StreamOptions,
    ): Promise<StreamManifest> {
      assertCapability(this, "streaming", "resolveStream");
      try {
        const song = await jiosaavnGetSong(ref.externalId);
        return jiosaavnStreamManifest(ref, song);
      } catch (error) {
        wrapError(error);
      }
    },

    async importPlaylist(url: string): Promise<ImportedPlaylist> {
      assertCapability(this, "playlistImport", "importPlaylist");
      try {
        const playlist = await jiosaavnImportPlaylist(url);
        return jiosaavnToPlaylist(playlist);
      } catch (error) {
        wrapError(error);
      }
    },

    async resolveDownload(
      ref: TrackRef,
      options?: DownloadOptions,
    ): Promise<DownloadManifest> {
      assertCapability(this, "download", "resolveDownload");
      try {
        const song = await jiosaavnGetSong(ref.externalId);
        return jiosaavnDownloadManifest(ref, song, options);
      } catch (error) {
        wrapError(error);
      }
    },
  };
}
