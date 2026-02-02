"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProvider = void 0;
const Settings_1 = require("@shared/types/Settings");
const OllamaSettingsView_1 = require("./OllamaSettingsView");
const OpenAISettingsView_1 = require("./OpenAISettingsView");
const AnthropicSettingsView_1 = require("./AnthropicSettingsView");
const ProviderInfoView_1 = require("./ProviderInfoView");
const AzureAISettingsView_1 = require("./AzureAISettingsView");
const xAISettingsView_1 = require("./xAISettingsView");
const OpenRouterSettingsView_1 = require("./OpenRouterSettingsView");
const GoogleSettingsView_1 = require("./GoogleSettingsView");
const HFSettingsView_1 = require("./HFSettingsView");
const LMStudioSettingsView_1 = require("./LMStudioSettingsView");
const AiProvider = ({ settings, onProviderChanged, onProviderSettingsChanged, }) => {
    const { aiProvider, providerSettings } = settings;
    const { Ollama, HuggingFace, OpenAI, Anthropic, AzureAI, xAI, OpenRouter, Google, LMStudio } = providerSettings;
    const handleProviderChange = (e) => {
        onProviderChanged(e.target.value);
    };
    return (<div className="container mx-auto">
			<div className="mb-4">
				<label htmlFor="ai-provider" className="block mb-2 text-sm font-medium">
					AI Provider:
				</label>
				<select id="ai-provider" value={aiProvider} onChange={handleProviderChange} className="w-full p-2 border bg-[var(--vscode-input-background)] border-[var(--vscode-editor-foreground)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
					{Settings_1.AiProvidersList.map((ab) => (<option key={ab} value={ab}>
							{ab}
						</option>))}
				</select>
			</div>
			<hr className="my-4 border-t border-[var(--vscode-editor-foreground)]"/>
			{aiProvider === "Ollama" && (
        //@ts-expect-error
        <OllamaSettingsView_1.OllamaSettingsView {...Ollama} onChange={onProviderSettingsChanged}/>)}
			{aiProvider === "Google" && (<GoogleSettingsView_1.GoogleSettingsView {...Google} onChange={onProviderSettingsChanged}/>)}
			{aiProvider === "HuggingFace" && (
        //@ts-expect-error
        <HFSettingsView_1.HFSettingsView {...HuggingFace} onChange={onProviderSettingsChanged}/>)}
			{aiProvider === "OpenAI" && (
        //@ts-expect-error
        <OpenAISettingsView_1.OpenAISettingsView {...OpenAI} onChange={onProviderSettingsChanged}/>)}
			{aiProvider === "Anthropic" && (
        //@ts-expect-error
        <AnthropicSettingsView_1.AnthropicSettingsView {...Anthropic} onChange={onProviderSettingsChanged}/>)}
			{aiProvider === "AzureAI" && (
        //@ts-expect-error
        <AzureAISettingsView_1.AzureAISettingsView {...AzureAI} onChange={onProviderSettingsChanged}/>)}
			{aiProvider === "xAI" && (
        //@ts-expect-error
        <xAISettingsView_1.XAISettingsView {...xAI} onChange={onProviderSettingsChanged}/>)}
			{aiProvider === "OpenRouter" && (
        //@ts-expect-error
        <OpenRouterSettingsView_1.OpenRouterSettingsView {...OpenRouter} onChange={onProviderSettingsChanged}/>)}
			{aiProvider === "LMStudio" && (
        //@ts-expect-error
        <LMStudioSettingsView_1.LMStudioSettingsView {...LMStudio} onChange={onProviderSettingsChanged}/>)}
			<ProviderInfoView_1.ProviderInfoView {...settings} aiProvider={aiProvider}/>
		</div>);
};
exports.AiProvider = AiProvider;
//# sourceMappingURL=AiProvider.js.map