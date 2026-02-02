import type { Settings } from "@shared/types/Settings";
import type { AIProvider } from "../base";
import type { ILoggingProvider } from "@shared/types/Logger";

export async function CreateAIProvider(
  settings: Settings,
  loggingProvider: ILoggingProvider,
): Promise<AIProvider> {
  if (settings.aiProvider === "HuggingFace") {
    const { HuggingFace } = await import("../huggingface/huggingface");
    return new HuggingFace(
      settings.providerSettings.HuggingFace,
      settings.interactionSettings,
      loggingProvider,
    );
  }

  if (settings.aiProvider === "OpenAI") {
    const { OpenAI } = await import("../openai");
    return new OpenAI(
      settings.providerSettings.OpenAI,
      settings.interactionSettings,
      loggingProvider,
    );
  }

  if (settings.aiProvider === "Anthropic") {
    const { Anthropic } = await import("../anthropic");
    return new Anthropic(
      settings.providerSettings.Anthropic,
      settings.interactionSettings,
      loggingProvider,
    );
  }

  if (settings.aiProvider === "AzureAI") {
    const { AzureAI } = await import("../azure");
    return new AzureAI(
      settings.providerSettings.AzureAI,
      settings.interactionSettings,
      loggingProvider,
    );
  }

  if (settings.aiProvider === "xAI") {
    const { xAI } = await import("../xai");
    return new xAI(
      settings.providerSettings.xAI,
      settings.interactionSettings,
      loggingProvider,
    );
  }

  if (settings.aiProvider === "OpenRouter") {
    const { OpenRouter } = await import("../openrouter");
    return new OpenRouter(
      settings.providerSettings.OpenRouter,
      settings.interactionSettings,
      loggingProvider,
    );
  }

  if (settings.aiProvider === "Google") {
    const { Google } = await import("../google");
    return new Google(
      settings.providerSettings.Google,
      settings.interactionSettings,
      loggingProvider,
    );
  }

  if (settings.aiProvider === "LMStudio") {
    const { LMStudio } = await import("../lmstudio");
    return new LMStudio(
      settings.providerSettings.LMStudio,
      settings.interactionSettings,
      loggingProvider,
    );
  }

  const { Ollama } = await import("../ollama");
  return new Ollama(
    settings.providerSettings.Ollama,
    settings.interactionSettings,
    loggingProvider,
    settings.embeddingSettings.Ollama,
  );
}

export async function CreateEmbeddingProvider(
  settings: Settings,
  loggingProvider: ILoggingProvider,
): Promise<AIProvider> {
  if (settings.embeddingProvider === "OpenAI") {
    const { OpenAI } = await import("../openai");
    return new OpenAI(
      settings.providerSettings.OpenAI,
      settings.interactionSettings,
      loggingProvider,
      settings.embeddingSettings.OpenAI,
    );
  }

  if (settings.embeddingProvider === "AzureAI") {
    const { AzureAI } = await import("../azure");
    return new AzureAI(
      settings.providerSettings.AzureAI,
      settings.interactionSettings,
      loggingProvider,
      settings.embeddingSettings.AzureAI,
    );
  }

  if (settings.embeddingProvider === "OpenRouter") {
    const { OpenRouter } = await import("../openrouter");
    return new OpenRouter(
      settings.providerSettings.OpenRouter,
      settings.interactionSettings,
      loggingProvider,
      settings.embeddingSettings.OpenRouter,
    );
  }

  if (settings.embeddingProvider === "Google") {
    const { Google } = await import("../google");
    return new Google(
      settings.providerSettings.Google,
      settings.interactionSettings,
      loggingProvider,
      settings.embeddingSettings.Google,
    );
  }

  if (settings.embeddingProvider === "LMStudio") {
    const { LMStudio } = await import("../lmstudio");
    return new LMStudio(
      settings.providerSettings.LMStudio,
      settings.interactionSettings,
      loggingProvider,
      settings.embeddingSettings.LMStudio,
    );
  }

  const { Ollama } = await import("../ollama");
  return new Ollama(
    settings.providerSettings.Ollama,
    settings.interactionSettings,
    loggingProvider,
    settings.embeddingSettings.Ollama,
  );
}
