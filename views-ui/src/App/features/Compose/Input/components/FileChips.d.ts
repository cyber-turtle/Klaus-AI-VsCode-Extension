import type React from "react";
import type { FileSearchResult } from "@shared/types/Composer";
interface FileChipsProps {
    chips: FileSearchResult[];
    onChipRemove: (chip: FileSearchResult) => void;
    isLightTheme: boolean;
}
export declare const FileChips: React.FC<FileChipsProps>;
export {};
//# sourceMappingURL=FileChips.d.ts.map