import type React from 'react';
import 'reactflow/dist/style.css';
import './ThreadVisualization.css';
import type { ComposerThread } from '@shared/types/Composer';
interface ThreadVisualizationProps {
    threads: ComposerThread[];
    activeThreadId?: string;
    onThreadSelect?: (threadId: string) => void;
    onClose?: () => void;
}
declare const ThreadVisualization: React.FC<ThreadVisualizationProps>;
export default ThreadVisualization;
//# sourceMappingURL=ThreadVisualization.d.ts.map