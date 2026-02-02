"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingProvider = void 0;
const Settings_1 = require("@shared/types/Settings");
const EmbeddingOllamaSettingsView_1 = require("./EmbeddingOllamaSettingsView");
const EmbeddingOpenAISettingsView_1 = require("./EmbeddingOpenAISettingsView");
const EmbeddingAzureAISettingsView_1 = require("./EmbeddingAzureAISettingsView");
const vsc_1 = require("react-icons/vsc");
const IndexedFilesProgress_1 = require("./IndexedFilesProgress");
const EmbeddingGoogleSettingsView_1 = require("./EmbeddingGoogleSettingsView");
const EmbeddingOpenRouterSettingsView_1 = require("./EmbeddingOpenRouterSettingsView");
const EmbeddingLMStudioSettingsView_1 = require("./EmbeddingLMStudioSettingsView");
const EmbeddingProvider = ({ settings, indexedFiles, onProviderChanged, onProviderSettingsChanged, }) => {
    const { embeddingProvider, embeddingSettings, providerSettings } = settings;
    const { Ollama, OpenAI, AzureAI, Google, OpenRouter, LMStudio } = embeddingSettings;
    const handleProviderChange = (e) => {
        onProviderChanged(e.target.value);
    };
    const handleChangeInput = (e) => {
        const field = e.target.getAttribute("data-name");
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        //@ts-expect-error
        const clone = { ...embeddingSettings };
        //@ts-expect-error
        clone.General[field] = value;
        onProviderSettingsChanged(clone);
    };
    if (OpenAI && !OpenAI.apiKey) {
        OpenAI.apiKey = settings.providerSettings.OpenAI?.apiKey;
    }
    if (AzureAI && !AzureAI.apiKey) {
        AzureAI.apiKey = settings.providerSettings.AzureAI?.apiKey;
    }
    if (Google && !Google.apiKey) {
        Google.apiKey = settings.providerSettings.Google.apiKey;
    }
    if (OpenRouter && !OpenRouter.apiKey) {
        OpenRouter.apiKey = settings.providerSettings.OpenRouter?.apiKey;
    }
    const copyProviderSettings = () => {
        // Get the current provider settings
        const currentProviderSettings = { ...providerSettings[embeddingProvider] };
        // Create a new object with the appropriate structure for embedding settings
        let updatedSettings = {};
        if (embeddingProvider === "Ollama") {
            updatedSettings = {
                ...Settings_1.defaultSettings.embeddingSettings.Ollama,
                ...currentProviderSettings,
            };
        }
        else if (embeddingProvider === "OpenAI") {
            updatedSettings = {
                //@ts-expect-error
                baseUrl: currentProviderSettings.baseUrl || "https://api.openai.com/v1/chat/completions",
                //@ts-expect-error
                apiKey: currentProviderSettings.apiKey || "",
                //@ts-expect-error
                model: currentProviderSettings.model || "text-embedding-3-small",
                //@ts-expect-error
                summaryModel: currentProviderSettings.summaryModel || "gpt-4o-mini",
                //@ts-expect-error
                dimensions: currentProviderSettings.dimensions || 1536,
            };
        }
        else if (embeddingProvider === "AzureAI") {
            updatedSettings = {
                //@ts-expect-error
                instanceName: currentProviderSettings.instanceName || "",
                //@ts-expect-error
                apiKey: currentProviderSettings.apiKey || "",
                //@ts-expect-error
                apiVersion: currentProviderSettings.apiVersion || "2024-06-01",
                //@ts-expect-error
                model: currentProviderSettings.model || "text-embedding-ada-002",
                //@ts-expect-error
                summaryModel: currentProviderSettings.chatModel || "",
                //@ts-expect-error
                dimensions: currentProviderSettings.dimensions || 1536,
            };
        }
        else if (embeddingProvider === "Google") {
            updatedSettings = {
                //@ts-expect-error
                apiKey: currentProviderSettings.apiKey || "",
                //@ts-expect-error
                model: currentProviderSettings.model || "gemini-embedding-exp-03-07",
                //@ts-expect-error
                summaryModel: currentProviderSettings.summaryModel || "gemini-2.0-flash",
                //@ts-expect-error
                dimensions: currentProviderSettings.dimensions || 3072,
            };
        }
        else if (embeddingProvider === "OpenRouter") {
            updatedSettings = {
                //@ts-expect-error
                baseUrl: currentProviderSettings.baseUrl || "https://api.openai.com/v1/chat/completions",
                //@ts-expect-error
                apiKey: currentProviderSettings.apiKey || "",
                //@ts-expect-error
                model: currentProviderSettings.model || "text-embedding-3-small",
                //@ts-ignore
                summaryModel: currentProviderSettings.summaryModel || "gpt-4o-mini",
                //@ts-ignore
                dimensions: currentProviderSettings.dimensions || 1536
            };
        }
        else if (embeddingProvider === "LMStudio") {
            updatedSettings = {
                ...Settings_1.defaultSettings.embeddingSettings.LMStudio,
                ...currentProviderSettings
            };
        }
        // Update the settings
        onProviderSettingsChanged(updatedSettings);
    };
    return (<div className="container mx-auto">
			<div className="mb-4">
				<label htmlFor="ai-provider" className="block mb-2 text-sm font-medium">
					AI Provider:
				</label>
				<div className="flex gap-4">
					<select id="ai-provider" value={embeddingProvider} onChange={handleProviderChange} className="w-full p-2 border bg-[var(--vscode-input-background)] border-[var(--vscode-editor-foreground)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
						{Settings_1.EmbeddingProvidersList.map((ab) => (<option key={ab} value={ab}>
								{ab}
							</option>))}
					</select>
					<button type="button" onClick={() => copyProviderSettings()} className="px-3 py-2 bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded-md hover:bg-[var(--vscode-button-hoverBackground)] focus:outline-none focus:ring-2 focus:ring-[var(--vscode-focusBorder)]" title="Copy Settings">
						<vsc_1.VscSync size={16}/>
					</button>
				</div>
			</div>
			<div className="flex flex-col items-start gap-4">
				<div className="flex flex-col items-center gap-2">
					<div className="flex gap-2 w-full">
						<input id="enabled" type="checkbox" className="px-3 py-2 bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--vscode-focusBorder)]" onChange={handleChangeInput} checked={embeddingSettings.General.enabled} data-name="enabled" title="Enable Embedding"/>
						<label htmlFor="enabled" className="text-sm font-medium text-[var(--vscode-foreground)]">
							Enabled
						</label>
					</div>
					<p className="mt-1 text-xs text-[var(--vscode-descriptionForeground)]">
						Enables indexing files and semantic search tools
					</p>
				</div>
				<div className="flex flex-col">
					<label htmlFor="globPattern" className="mb-1 text-sm font-medium text-[var(--vscode-foreground)]">
						File Inclusion Glob:
					</label>
					<input id="globPattern" type="text" className="px-3 py-2 bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--vscode-focusBorder)]" onChange={handleChangeInput} value={embeddingSettings.General.globPattern} data-name="globPattern" title="File Inclusion Pattern"/>
					<p className="mt-1 text-xs text-[var(--vscode-descriptionForeground)]">
						Filters files for indexing
					</p>
				</div>
				<div className="flex flex-col">
					<IndexedFilesProgress_1.IndexedFilesProgress indexedFiles={indexedFiles}/>
				</div>
			</div>
			<hr className="my-4 border-t border-[var(--vscode-editor-foreground)]"/>
			{embeddingProvider === "Ollama" && (
        //@ts-expect-error
        <EmbeddingOllamaSettingsView_1.OllamaSettingsView {...Ollama} onChange={onProviderSettingsChanged}/>)}
			{embeddingProvider === "OpenAI" && (
        //@ts-expect-error
        <EmbeddingOpenAISettingsView_1.OpenAISettingsView {...OpenAI} onChange={onProviderSettingsChanged}/>)}
			{embeddingProvider === "AzureAI" && (
        //@ts-expect-error
        <EmbeddingAzureAISettingsView_1.AzureAISettingsView {...AzureAI} onChange={onProviderSettingsChanged}/>)}
			{embeddingProvider === "Google" && (
        //@ts-expect-error
        <EmbeddingGoogleSettingsView_1.GoogleSettingsView {...Google} onChange={onProviderSettingsChanged}/>)}
			{embeddingProvider === "OpenRouter" && (
        //@ts-expect-error
        <EmbeddingOpenRouterSettingsView_1.OpenRouterSettingsView {...OpenRouter} onChange={onProviderSettingsChanged}/>)}
			{embeddingProvider === "LMStudio" && (
        //@ts-expect-error
        <EmbeddingLMStudioSettingsView_1.LMStudioSettingsView {...LMStudio} onChange={onProviderSettingsChanged}/>)}
		</div>);
};
exports.EmbeddingProvider = EmbeddingProvider;
//# sourceMappingURL=EmbeddingProvider.js.map