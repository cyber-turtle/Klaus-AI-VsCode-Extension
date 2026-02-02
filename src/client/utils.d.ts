import type { DocumentSymbol, Location, LocationLink } from "vscode-languageclient/node";
import type { Range } from "vscode-languageserver-textdocument";
export declare function getPlatformIdentifier(): Promise<string>;
export declare const mapLocation: (location: Location | LocationLink) => {
    uri: string;
    range: {
        start: {
            line: number;
            character: number;
        };
        end: {
            line: number;
            character: number;
        };
    };
};
export declare const mapSymbol: (symbol: DocumentSymbol) => DocumentSymbol;
export declare const mapRange: (range: Range) => Range;
//# sourceMappingURL=utils.d.ts.map