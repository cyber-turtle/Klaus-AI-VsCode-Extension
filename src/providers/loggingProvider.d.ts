import type { ILoggingProvider } from "@shared/types/Logger";
export declare class VSCodeLoggingProvider implements ILoggingProvider {
    private dbgChannel;
    constructor();
    logInfo(message: string): void;
    logError(messageOrError: string | Error | unknown, showErrorModal?: boolean): void;
    dispose(): void;
}
declare const loggingProvider: VSCodeLoggingProvider;
export { loggingProvider };
//# sourceMappingURL=loggingProvider.d.ts.map