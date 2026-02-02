"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaView = exports.OpenAIView = exports.AnthropicView = exports.XAIView = exports.ProviderInfoView = void 0;
const ProviderInfoView = ({ aiProvider }) => {
    return (<div className="mt-4">
			<h3 className="text-md font-bold">Supported Models:</h3>
			{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
			<label>
				In order for models to be supported by Wingman, they must
				support tool calling capabilities. We support the following models:
			</label>
			{aiProvider === "Ollama" && <exports.OllamaView />}
			{aiProvider === "OpenAI" && <exports.OpenAIView />}
			{aiProvider === "Anthropic" && <exports.AnthropicView />}
			{aiProvider === "AzureAI" && <exports.OpenAIView />}
			{aiProvider === "xAI" && <exports.XAIView />}
		</div>);
};
exports.ProviderInfoView = ProviderInfoView;
const XAIView = () => {
    return (<div className="mt-4">
			<ul>
				<li>grok-beta</li>
				<li>grok-2</li>
			</ul>
		</div>);
};
exports.XAIView = XAIView;
const AnthropicView = () => {
    return (<div className="mt-4">
			<ul>
				<li>claude-3-7-sonnet</li>
				<li>claude-3-5-sonnet</li>
				<li>claude-3-5-haiku</li>
				<li>claude-3-haiku</li>
				<li>claude-3-opus</li>
			</ul>
			<caption className="italic">
				Prompt caching is enabled for complex operations.
			</caption>
		</div>);
};
exports.AnthropicView = AnthropicView;
const OpenAIView = () => {
    return (<div className="mt-4">
			<ul>
				<li>gpt-4o</li>
				<li>gpt-4o-mini</li>
				<li>gpt-4-turbo</li>
				<li>gpt-4</li>
				<li>o1</li>
				<li>o3-mini</li>
			</ul>
		</div>);
};
exports.OpenAIView = OpenAIView;
const OllamaView = () => {
    return (<div className="mt-4">
			<h4 className="font-bold text-md">Code:</h4>
			<ul>
				<li>
					<a href="https://ollama.com/library/deepseek-r1">
						deepseek-r1
					</a>
				</li>
				<li>
					<a href="https://ollama.com/library/phi4">
						phi4
					</a>
				</li>
				<li>
					<a href="https://ollama.com/library/qwen2.5-coder">
						qwen2.5-coder
					</a>
				</li>
				<li>
					<a href="https://ollama.ai/library/deepseek-coder:6.7b-base-q8_0">
						deepseek-coder
					</a>
				</li>
				<li>
					<a href="https://ollama.com/wojtek/magicoder:6.7b-s-ds-q8_0">
						magicoder DS
					</a>
				</li>
				<li>
					<a href="https://ollama.ai/library/codellama:7b-code-q4_K_M">
						codellama-code
					</a>
				</li>
				<li>
					<a href="https://ollama.com/library/codeqwen:7b-code-v1.5-q5_1">
						codeqwen-1.5
					</a>
				</li>
				<li>
					<a href="https://ollama.com/library/codestral">codestral</a>
				</li>
			</ul>
			<h4 className="mt-4 font-bold text-md">Chat:</h4>
			<ul>
				<li>
					<a href="https://ollama.com/library/deepseek-r1">
						deepseek-r1
					</a>
				</li>
				<li>
					<a href="https://ollama.com/library/phi4">
						phi4
					</a>
				</li>
				<li>
					<a href="https://ollama.com/library/qwen2.5-coder">
						qwen2.5-coder
					</a>
				</li>
				<li>
					<a href="https://ollama.ai/library/deepseek-coder:6.7b-instruct-q8_0">
						deepseek-instruct
					</a>
				</li>
				<li>
					<a href="https://ollama.ai/library/codellama:7b-instruct">
						codellama-instruct
					</a>
				</li>
				<li>
					<a href="https://ollama.ai/library/phind-codellama:34b-v2-q2_K">
						phind-codellama
					</a>
				</li>
				<li>
					<a href="https://ollama.com/wojtek/magicoder:6.7b-s-ds-q8_0">
						magicoder DS
					</a>
				</li>
				<li>
					<a href="https://ollama.com/library/llama3:8b-instruct-q6_K">
						llama-3 Instruct
					</a>
				</li>
				<li>
					<a href="https://ollama.com/library/codeqwen:7b-code-v1.5-q8_0">
						codeqwen-1.5 code
					</a>
				</li>
				<li>
					<a href="https://ollama.com/library/codestral">codestral</a>
				</li>
			</ul>
		</div>);
};
exports.OllamaView = OllamaView;
//# sourceMappingURL=ProviderInfoView.js.map