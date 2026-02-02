/// <reference types="react" />
import type { ToolMessage } from "@shared/types/Composer";
export interface ToolOutputProps {
    messages: ToolMessage[];
    isLightTheme: boolean;
    loading: boolean;
}
export declare const ToolOutput: import("react").MemoExoticComponent<({ messages, isLightTheme, loading }: ToolOutputProps) => import("react").JSX.Element>;
//# sourceMappingURL=ToolOutput.d.ts.map