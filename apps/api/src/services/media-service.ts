import { ERROR_CODES } from "@vibevault/config";
import {
  ProviderNotSupportedError,
  providerRegistry,
} from "@vibevault/provider-core";
import type {
  DownloadManifest,
  DownloadOptions,
  StreamManifest,
  StreamOptions,
  TrackMetadata,
  TrackRef,
} from "@vibevault/types";
import { AppError } from "../lib/errors";

export async function getTrackMetadata(
  providerId: TrackRef["providerId"],
  externalId: string,
): Promise<TrackMetadata> {
  const provider = providerRegistry.getOrThrow(providerId);
  return provider.getMetadata({ providerId, externalId });
}

export async function resolveStream(
  trackRef: TrackRef,
  options?: StreamOptions,
): Promise<StreamManifest> {
  const provider = providerRegistry.getOrThrow(trackRef.providerId);

  try {
    return await provider.resolveStream(trackRef, options);
  } catch (error) {
    if (error instanceof ProviderNotSupportedError) {
      throw new AppError(
        ERROR_CODES.PROVIDER_ERROR,
        error.message,
        501,
      );
    }
    throw error;
  }
}

export async function resolveDownload(
  trackRef: TrackRef,
  options?: DownloadOptions,
): Promise<DownloadManifest> {
  const provider = providerRegistry.getOrThrow(trackRef.providerId);

  if (!provider.resolveDownload) {
    throw new AppError(
      ERROR_CODES.PROVIDER_ERROR,
      `Provider "${trackRef.providerId}" does not support downloads`,
      501,
    );
  }

  return provider.resolveDownload(trackRef, options);
}
