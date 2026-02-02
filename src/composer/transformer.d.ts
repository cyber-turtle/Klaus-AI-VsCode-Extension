import { type ComposerState } from "@shared/types/Composer";
import type { GraphStateAnnotation } from ".";
/**
 * Transforms a GraphStateAnnotation into a ComposerState
 */
export declare const transformState: (state: GraphStateAnnotation, threadId: string, workspace: string, canResume?: boolean) => Promise<ComposerState>;
//# sourceMappingURL=transformer.d.ts.map