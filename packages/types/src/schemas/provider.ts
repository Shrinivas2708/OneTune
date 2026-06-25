import { z } from "zod";

export const ProviderIdSchema = z.enum(["youtube", "spotify", "jiosaavn"]);

export type ProviderId = z.infer<typeof ProviderIdSchema>;

export const PROVIDER_IDS = ProviderIdSchema.options;
