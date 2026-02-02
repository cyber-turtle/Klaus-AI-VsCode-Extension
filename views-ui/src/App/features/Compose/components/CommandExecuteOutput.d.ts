/// <reference types="react" />
import type { ToolMessage } from "@shared/types/Composer";
interface CommandExecuteOutputProps {
    messages: ToolMessage[];
    isLightTheme: boolean;
    onAccept?: (command: string) => void;
    onReject?: (command: string) => void;
}
export declare const CommandExecuteOutput: import("react").MemoExoticComponent<({ messages, isLightTheme, }: CommandExecuteOutputProps) => import("react").JSX.Element | null>;
export {};
//# sourceMappingURL=CommandExecuteOutput.d.ts.map