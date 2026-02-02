import type { ILoggingProvider } from "@shared/types/Logger";
export declare class ConsoleLoggingProvider implements ILoggingProvider {
    logInfo(message: string): void;
    logError(messageOrError: string | Error | unknown): void;
    dispose(): void;
}
declare const loggingProvider: ConsoleLoggingProvider;
export { loggingProvider };
//# sourceMappingURL=loggingProvider.d.ts.map