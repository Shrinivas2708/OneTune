import { providerRegistry } from "@vibevault/provider-core";
import { createJioSaavnAdapter } from "./jiosaavn.adapter";
import { createSpotifyAdapter } from "./spotify.adapter";
import { createYouTubeAdapter } from "./youtube.adapter";

let registered = false;

export function registerProviders(): void {
  if (registered) return;

  providerRegistry.register(createYouTubeAdapter());
  providerRegistry.register(createJioSaavnAdapter());
  providerRegistry.register(createSpotifyAdapter());

  registered = true;
}

export { providerRegistry };
