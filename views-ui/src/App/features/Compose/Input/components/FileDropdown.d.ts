import type React from "react";
import type { FileSearchResult } from "@shared/types/Composer";
interface FileDropdownProps {
    isLightTheme: boolean;
    showDropdown: boolean;
    dropdownItems: FileSearchResult[];
    focusedDropdownIndex: number;
    onSelect: (item: FileSearchResult) => void;
}
export declare const FileDropdown: React.FC<FileDropdownProps>;
export {};
//# sourceMappingURL=FileDropdown.d.ts.map