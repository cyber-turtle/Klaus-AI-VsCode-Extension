import { useEffect, useState } from "react";
import type { AppMessage } from "@shared/types/Message";
import type {
	AiProviders,
	ApiSettingsType,
	AzureAISettingsType,
	InteractionSettings,
	OllamaSettingsType,
	Settings,
	AgentSettings,
	xAISettingsType,
	EmbeddingProviders,
	EmbeddingSettingsType,
	MCPTool,
} from "@shared/types/Settings";
import { AiProvider } from "./AiProvider";
import { InteractionSettingsConfig } from "./InteractionSettingsConfig";
import { vscode } from "./utilities/vscode";
import "./App.css";
import { AgentFeaturesView } from "./AgentFeaturesView";
import { MCPConfiguration } from "./McpTools";
import { EmbeddingProvider } from "./EmbeddingProvider";

export type InitSettings = Settings;

export const App = () => {
	const [loading, setLoading] = useState(true);
	const [settings, setSettings] = useState<InitSettings | null>(null);
	const [indexedFiles, setIndexedFiles] = useState<string[] | undefined>([]);
	const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
	const [isLightTheme, setIsLightTheme] = useState(false);
	const [mcpTools, setMCPTools] = useState<Map<string, MCPTool[]>>(new Map());

	useEffect(() => {
		vscode.postMessage({
			command: "init",
		});

		window.addEventListener("message", handleResponse);
		return () => {
			window.removeEventListener("message", handleResponse);
		};
	}, []);

	useEffect(() => {
		// Reset error status after a timeout
		if (saveStatus === "error") {
			setTimeout(() => setSaveStatus("idle"), 3000);
		}
	}, [saveStatus]);

	const saveSettings = (updatedSettings: Settings) => {
		setSaveStatus("saving");
		vscode.postMessage({
			command: "saveSettings",
			value: updatedSettings,
		});
	};

	const handleResponse = (event: MessageEvent<AppMessage>) => {
		const { command, value } = event.data;

		switch (command) {
			case "init": {
				const settings = value as { settings: InitSettings, theme: number, indexedFiles: string[], tools: [string, MCPTool[]][] };
				setSettings(settings.settings);
				setIsLightTheme(settings.theme === 1 || settings.theme === 4)
				setIndexedFiles(settings.indexedFiles ?? []);
				setLoading(false);
				setMCPTools(new Map(settings.tools));
				break;
			}
			case "save-failed": {
				setSaveStatus("error");
				break;
			}
			case "files": {
				setIndexedFiles((value as string[]) ?? []);
				break;
			}
			case "settingsSaved":
				setSaveStatus("saved");
				setTimeout(() => setSaveStatus("idle"), 2000);
				break;
			case "tools": {
				const tools = value as [string, MCPTool[]][];
				console.log("Tools:", tools);
				setMCPTools(new Map(tools));
				break;
			}
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-pulse flex flex-col items-center">
					<div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
					<h3 className="text-lg font-medium text-[var(--vscode-foreground)]">Loading settings...</h3>
				</div>
			</div>
		);
	}

	if (!settings) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md">
					<h3 className="font-bold">Error loading settings</h3>
					<p>Unable to load configuration. Please try refreshing the page.</p>
				</div>
			</div>
		);
	}

	const onInteractionSettingsChanged = (settings: InteractionSettings) => {
		setSettings((prevSettings) => ({
			...prevSettings!,
			interactionSettings: settings,
		}));
	};

	const onAiProviderChanged = (provider: AiProviders) => {
		setSettings((s) => ({
			...s!,
			aiProvider: provider,
		}));
	};

	const onEmbeddingAiProviderChanged = (provider: EmbeddingProviders) => {
		setSettings((s) => ({
			...s!,
			embeddingProvider: provider,
		}));
	};

	const onAiProviderSettingsChanged = (
		aiProviderSettings:
			| OllamaSettingsType
			| ApiSettingsType
			| AzureAISettingsType
	) => {
		const currentProviderSettings = settings.providerSettings;
		const updatedProviderSettings = { ...currentProviderSettings };

		if (settings.aiProvider === "Ollama") {
			updatedProviderSettings.Ollama =
				aiProviderSettings as OllamaSettingsType;
		} else if (settings.aiProvider === "OpenAI") {
			updatedProviderSettings.OpenAI =
				aiProviderSettings as ApiSettingsType;
		} else if (settings.aiProvider === "Anthropic") {
			updatedProviderSettings.Anthropic =
				aiProviderSettings as ApiSettingsType;
		} else if (settings.aiProvider === "HuggingFace") {
			updatedProviderSettings.HuggingFace =
				aiProviderSettings as ApiSettingsType;
		} else if (settings.aiProvider === "AzureAI") {
			updatedProviderSettings.AzureAI =
				aiProviderSettings as AzureAISettingsType;
		} else if (settings.aiProvider === "xAI") {
			updatedProviderSettings.xAI =
				aiProviderSettings as xAISettingsType;
		} else if (settings.aiProvider === "Google") {
			updatedProviderSettings.Google =
				aiProviderSettings as ApiSettingsType;
		} else if (settings.aiProvider === "OpenRouter") {
			updatedProviderSettings.OpenRouter =
				aiProviderSettings as ApiSettingsType;
		} else if (settings.aiProvider === "LMStudio") {
			updatedProviderSettings.LMStudio =
				aiProviderSettings as OllamaSettingsType;
		}

		setSettings((s) => ({
			...s!,
			providerSettings: updatedProviderSettings,
		}));
	};

	const onEmbeddingAiProviderSettingsChanged = (
		aiProviderSettings: EmbeddingSettingsType
	) => {
		const currentProviderSettings = settings.embeddingSettings;
		const updatedProviderSettings = { ...currentProviderSettings };

		if (settings.embeddingProvider === "Ollama") {
			updatedProviderSettings.Ollama =
				aiProviderSettings as Settings["embeddingSettings"]["Ollama"];
		} else if (settings.embeddingProvider === "OpenAI") {
			updatedProviderSettings.OpenAI =
				aiProviderSettings as Settings["embeddingSettings"]["OpenAI"];
		} else if (settings.embeddingProvider === "AzureAI") {
			updatedProviderSettings.AzureAI =
				aiProviderSettings as Settings["embeddingSettings"]["AzureAI"];
		} else if (settings.embeddingProvider === "Google") {
			updatedProviderSettings.Google =
				aiProviderSettings as Settings["embeddingSettings"]["Google"];
		} else if (settings.embeddingProvider === "OpenRouter") {
			updatedProviderSettings.OpenRouter =
				aiProviderSettings as Settings["embeddingSettings"]["OpenRouter"];
		} else if (settings.embeddingProvider === "LMStudio") {
			updatedProviderSettings.LMStudio =
				aiProviderSettings as Settings["embeddingSettings"]["LMStudio"];
		}

		setSettings((s) => ({
			...s!,
			embeddingSettings: updatedProviderSettings,
		}));
	};

	const onValidationSettingsChanged = (settings: AgentSettings) => {
		setSettings((s) => ({
			...s!,
			agentSettings: settings,
		}));
	};

	const buttonClass = `
    ${saveStatus === "saving"
			? "bg-blue-500 cursor-wait"
			: saveStatus === "saved"
				? "bg-green-600 hover:bg-green-700"
				: saveStatus === "error"
					? "bg-red-600 hover:bg-red-700"
					: "bg-blue-600 hover:bg-blue-700"
		}
    text-white py-2 px-8 rounded-full shadow-lg hover:shadow-xl
    transition duration-300 ease-in-out transform hover:-translate-y-0.5
    text-sm font-semibold flex items-center gap-2
  `;

	const sectionTitleClass = "text-xl font-medium mb-6 text-[var(--vscode-foreground)] flex items-center gap-2";
	const sectionContainerClass = `
		mb-12 p-8 rounded-2xl
		${isLightTheme ? 'bg-gray-50' : 'bg-[#181818]'}
		border border-[var(--vscode-editorWidget-border)]
	`;

	return (
		<div className="flex flex-col p-6 max-w-4xl mx-auto font-sans">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 pb-6 border-b border-[var(--vscode-panel-border)]">
				<div className="flex-1">
					<h1 className="text-4xl font-bold mb-3 text-[var(--vscode-foreground)] tracking-tight">
						Settings
					</h1>
					<p className="text-[var(--vscode-descriptionForeground)] text-lg leading-relaxed max-w-2xl">
						Configure your AI assistant's brain and behavior. Need help? Visit{" "}
						<a
							href="https://docs.maepllabs.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[var(--vscode-textLink-foreground)] hover:underline font-medium"
						>
							docs.maepllabs.com
						</a>
					</p>
				</div>
				
				<button
					type="button"
					onClick={() => saveSettings(settings)}
					disabled={saveStatus === "saving"}
					className={buttonClass}
				>
					{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? "Error" : "Save Changes"}
				</button>
			</div>

			{/* Info / Rules Section */}
			<div className="mb-12 bg-opacity-10 bg-blue-500 rounded-xl p-6 border border-blue-500/20">
				<div className="flex items-start gap-4">
					<div className="p-2 bg-blue-500/10 rounded-lg">
						{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div>
						<h3 className="font-semibold text-lg text-[var(--vscode-foreground)] mb-1">Custom Rules</h3>
						<p className="text-[var(--vscode-descriptionForeground)] leading-relaxed">
							Create a <code className="px-1.5 py-0.5 rounded bg-[var(--vscode-textBlockQuote-background)] font-mono text-sm">.klausrules</code> file in your project root to customize how the AI behaves.{" "}
							<a
								href="https://github.com/PatrickJS/awesome-cursorrules"
								target="_blank"
								rel="noopener noreferrer"
								className="text-[var(--vscode-textLink-foreground)] font-medium hover:underline"
							>
								See examples &rarr;
							</a>
						</p>
					</div>
				</div>
			</div>

			<div className="space-y-8">
				{/* AI Provider Section */}
				<section className={sectionContainerClass}>
					<h2 className={sectionTitleClass}>
						<span className="opacity-50">01</span> AI Provider
					</h2>
					<div className="pl-0 md:pl-2">
						<AiProvider
							settings={settings}
							onProviderChanged={onAiProviderChanged}
							onProviderSettingsChanged={onAiProviderSettingsChanged}
						/>
					</div>
				</section>

				{/* Interaction Settings */}
				<section className={sectionContainerClass}>
					<h2 className={sectionTitleClass}>
						<span className="opacity-50">02</span> Interaction Style
					</h2>
					<div className="pl-0 md:pl-2">
						<InteractionSettingsConfig
							interactions={settings.interactionSettings}
							onChange={onInteractionSettingsChanged}
						/>
					</div>
				</section>

				{/* Agent Features at the same level */}
				<section className={sectionContainerClass}>
					<h2 className={sectionTitleClass}>
						<span className="opacity-50">03</span> Agent Capabilities
					</h2>
					<div className="pl-0 md:pl-2">
						<AgentFeaturesView
							validationSettings={settings.agentSettings}
							onValidationChanged={onValidationSettingsChanged}
						/>
						<div className="mt-8 pt-8 border-t border-[var(--vscode-editorWidget-border)]">
							<MCPConfiguration
								mcpTools={mcpTools || []}
							/>
						</div>
					</div>
				</section>

				{/* Embeddings Provider */}
				<section className={sectionContainerClass}>
					<h2 className={sectionTitleClass}>
						<span className="opacity-50">04</span> Embeddings
					</h2>
					<div className="pl-0 md:pl-2">
						<EmbeddingProvider
							settings={settings}
							indexedFiles={indexedFiles}
							onProviderChanged={onEmbeddingAiProviderChanged}
							onProviderSettingsChanged={onEmbeddingAiProviderSettingsChanged}
						/>
					</div>
				</section>
			</div>

			{/* Floating Status Toast (if valid error) */}
			{saveStatus === "error" && (
				<div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span className="font-medium">Failed to save settings</span>
				</div>
			)}
		</div>
	);
};