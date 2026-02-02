import TelemetryReporter, { type TelemetryEventProperties } from "@vscode/extension-telemetry";
export declare const EVENT_EXTENSION_LOADED = "EXTENSION_LOADED";
export declare const EVENT_AI_PROVIDER_VALIDATION_FAILED = "AI_PROVIDER_VALIDATION_FAILED";
export declare const EVENT_VECTOR_STORE_LOAD_FAILED = "VECTOR_STORE_LOAD_FAILED";
export declare const EVENT_COMPOSE_STARTED = "COMPOSE_STARTED";
export declare const EVENT_COMPOSE_PHASE = "COMPOSE_PHASE";
export declare const EVENT_FULL_INDEX_BUILD = "INDEX_BUILD_STARTED";
export declare const EVENT_VALIDATE_SUCCEEDED = "VALIDATE_SUCCEEDED";
export declare const EVENT_VALIDATE_FAILED = "VALIDATE_FAILED";
export declare const EVENT_CHAT_SENT = "CHAT_SENT";
export declare const EVENT_CODE_COMPLETE_CACHE = "CODE_COMPLETE_CACHE";
export declare const EVENT_CODE_COMPLETE = "CODE_COMPLETE_SENT";
export declare const EVENT_CODE_COMPLETE_HOTKEY = "CODE_COMPLETE_HOTKEY";
export declare const EVENT_DOC_GEN = "DOC_GEN";
export declare const EVENT_REFACTOR = "REFACTOR";
export declare const EVENT_REVIEW_STARTED = "CODE_REVIEW";
export declare const EVENT_REVIEW_FILE_BY_FILE = "CODE_REVIEW_FILES";
export declare const EVENT_COMMIT_MSG = "COMMIT_MSG";
export declare const EVENT_BINDINGS_FAILED = "BINDINGS_FAILED";
export declare class Telemetry {
    reporter: TelemetryReporter | undefined;
    private enabled;
    private disposables;
    constructor();
    dispose(): void;
    sendEvent(eventName: string, eventPropeties?: TelemetryEventProperties): void;
    sendError(eventName: string, eventPropeties?: TelemetryEventProperties): void;
}
declare const telemetry: Telemetry;
export { telemetry };
//# sourceMappingURL=telemetryProvider.d.ts.map