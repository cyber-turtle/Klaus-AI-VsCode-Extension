/// <reference types="react" />
import "./App.css";
import { CodeReviewComment, FileReviewDetails } from "@shared/types/Message";
export interface DiffProps {
    reviewDetails: FileReviewDetails;
    isDarkTheme: boolean;
    onDiffAccepted: (fileDiff: FileReviewDetails, comment: CodeReviewComment) => void;
    onDiffRejected: (fileDiff: FileReviewDetails, comment: CodeReviewComment) => void;
}
export default function DiffViewWithComments({ reviewDetails, isDarkTheme, onDiffAccepted, onDiffRejected, }: DiffProps): import("react").JSX.Element;
//# sourceMappingURL=DiffViewWithComments.d.ts.map