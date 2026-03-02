import OpenAI from "openai";

import { getBackendBaseUrlSync } from "@shared/utils/backendBaseUrl";

let client: OpenAI | null = null;
let currentBaseUrl: string | null = null;

const resolveOpenAICompatBaseUrl = (): string => {
  // The app stores the "standard" backend base URL as ".../v1".
  // OpenAI-compatible forwarding endpoints live under "/openai/v1/*".
  const base = getBackendBaseUrlSync().trim().replace(/\/+$/, "");

  if (base.endsWith("/openai/v1")) return base;

  const v1Suffix = "/v1";
  const origin = base.endsWith(v1Suffix) ? base.slice(0, -v1Suffix.length) : base;
  return `${origin}/openai/v1`;
};

export const getOpenAIClient = (): OpenAI => {
  const baseURL = resolveOpenAICompatBaseUrl();
  if (!client) {
    client = new OpenAI({
      apiKey: "local",
      baseURL,
      dangerouslyAllowBrowser: true,
    });
    currentBaseUrl = baseURL;
  } else if (currentBaseUrl !== baseURL) {
    client = new OpenAI({
      apiKey: "local",
      baseURL,
      dangerouslyAllowBrowser: true,
    });
    currentBaseUrl = baseURL;
  }
  return client;
};
