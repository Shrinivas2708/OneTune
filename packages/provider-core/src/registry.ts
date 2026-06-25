import type { ProviderId } from "@vibevault/types";
import type { MusicProvider } from "./provider";

export class ProviderRegistry {
  private readonly providers = new Map<ProviderId, MusicProvider>();

  register(provider: MusicProvider): void {
    this.providers.set(provider.id, provider);
  }

  get(id: ProviderId): MusicProvider | undefined {
    return this.providers.get(id);
  }

  getOrThrow(id: ProviderId): MusicProvider {
    const provider = this.get(id);
    if (!provider) {
      throw new Error(`Provider not registered: ${id}`);
    }
    return provider;
  }

  list(): MusicProvider[] {
    return [...this.providers.values()];
  }

  listSearchable(): MusicProvider[] {
    return this.list().filter((provider) => provider.capabilities.search);
  }

  listStreamable(): MusicProvider[] {
    return this.list().filter((provider) => provider.capabilities.streaming);
  }
}

export const providerRegistry = new ProviderRegistry();
