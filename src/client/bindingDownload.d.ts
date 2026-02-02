import * as vscode from "vscode";
import type { ILoggingProvider } from "@shared/types/Logger";
export interface BindingConfig {
    name: string;
    version: string;
    packagePrefix: string;
    usePackagePrefixInFilename?: boolean;
}
export declare class BindingDownloader {
    private logger;
    private readonly storageDir;
    private readonly extensionDir;
    private readonly maxRetries;
    private readonly retryDelay;
    private readonly bindings;
    constructor(context: vscode.ExtensionContext, logger: ILoggingProvider);
    private getBindingStorageDir;
    private getNapiPackageName;
    private getStoredBindingPath;
    private getTempExtractPath;
    private getTargetBindingPath;
    private retryOperation;
    private downloadBinding;
    ensureBindings(): Promise<void>;
    ensureBinding(binding: BindingConfig): Promise<void>;
}
//# sourceMappingURL=bindingDownload.d.ts.map