"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposerProvider = exports.useComposerContext = void 0;
const Composer_1 = require("@shared/types/Composer");
const react_1 = require("react");
const vscode_1 = require("../utilities/vscode");
const ComposerContext = (0, react_1.createContext)(undefined);
const useComposerContext = () => {
    const context = (0, react_1.useContext)(ComposerContext);
    if (!context)
        throw new Error("useComposerContext must be used within ComposerProvider");
    return context;
};
exports.useComposerContext = useComposerContext;
const ComposerProvider = ({ children }) => {
    const [composerStates, setComposerStates] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [activeComposerState, setActiveComposerState] = (0, react_1.useState)();
    const [chips, setChips] = (0, react_1.useState)([]);
    const [fileDiagnostics, setFileDiagnostics] = (0, react_1.useState)([]);
    const [initialized, setInitialized] = (0, react_1.useState)(false);
    const [inputTokens, setInputTokens] = (0, react_1.useState)(0);
    const [outputTokens, setOutputTokens] = (0, react_1.useState)(0);
    // Thread management state
    const [threads, setThreads] = (0, react_1.useState)([]);
    const [activeThread, setActiveThread] = (0, react_1.useState)(null);
    const activeThreadRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        activeThreadRef.current = activeThread;
    }, [activeThread]);
    (0, react_1.useEffect)(() => {
        window.addEventListener("message", handleResponse);
        return () => {
            window.removeEventListener("message", handleResponse);
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (composerStates.length === 0 && !activeComposerState) {
            setLoading(false);
        }
    }, [composerStates, activeComposerState]);
    const createThread = (title, fromMessage = false) => {
        const timestamp = Date.now();
        const newThread = {
            id: crypto.randomUUID(),
            title,
            createdAt: timestamp,
            fromMessage
        };
        setThreads(prevThreads => [...prevThreads, newThread]);
        setActiveThread(newThread);
        activeThreadRef.current = newThread;
        vscode_1.vscode.postMessage({
            command: "create-thread",
            value: newThread
        });
        return newThread;
    };
    const switchThread = (threadId) => {
        const thread = threads.find(t => t.id === threadId);
        if (thread) {
            setActiveThread(thread);
            activeThreadRef.current = thread;
            // Notify extension about thread switch
            vscode_1.vscode.postMessage({
                command: "switch-thread",
                value: threadId
            });
        }
    };
    const deleteThread = (threadId) => {
        // // Don't delete if it's the only thread
        if (threads.length <= 1) {
            return;
        }
        setThreads(prevThreads => {
            const updatedThreads = prevThreads.filter(t => t.id !== threadId);
            // If we're deleting the active thread, switch to another one
            if (activeThread?.id === threadId && updatedThreads.length > 0 && composerStates.length > 0) {
                const newActiveThread = updatedThreads[0];
                setActiveThread(newActiveThread);
                activeThreadRef.current = newActiveThread;
                setActiveComposerState(composerStates[0]);
            }
            return updatedThreads;
        });
        // Notify extension about thread deletion
        vscode_1.vscode.postMessage({
            command: "delete-thread",
            value: threadId
        });
    };
    const branchThread = (threadId) => {
        const originalThread = threads.find(t => t.id === threadId);
        if (!originalThread)
            return;
        const timestamp = Date.now();
        const newThread = {
            id: crypto.randomUUID(),
            title: `Branch: ${originalThread.title}`,
            createdAt: timestamp,
            parentThreadId: originalThread.id
        };
        setThreads(prevThreads => [...prevThreads, newThread]);
        setActiveThread(newThread);
        activeThreadRef.current = newThread;
        vscode_1.vscode.postMessage({
            command: "branch-thread",
            value: newThread
        });
    };
    const renameThread = (threadId, newTitle) => {
        setThreads(prevThreads => {
            return prevThreads.map(thread => {
                if (thread.id === threadId) {
                    const updatedThread = {
                        ...thread,
                        title: newTitle,
                        updatedAt: Date.now()
                    };
                    // Update active thread if it's the one being renamed
                    if (activeThread?.id === threadId) {
                        setActiveThread(updatedThread);
                        activeThreadRef.current = updatedThread;
                    }
                    return updatedThread;
                }
                return thread;
            });
        });
        // Notify extension about thread rename
        vscode_1.vscode.postMessage({
            command: "rename-thread",
            value: { threadId, title: newTitle }
        });
    };
    const handleComposerEvent = (value) => {
        const { event, state } = value;
        switch (event) {
            case "composer-message": {
                setLoading(true);
                if (activeThreadRef.current?.id === state.threadId) {
                    setActiveComposerState(prev => {
                        if (!prev)
                            return prev;
                        const mergedState = mergeState(prev, state);
                        setInputTokens(currentTotal => {
                            return currentTotal + mergedState.inputTokens;
                        });
                        setOutputTokens(currentTotal => {
                            return currentTotal + mergedState.outputTokens;
                        });
                        return mergedState;
                    });
                }
                setComposerStates(states => {
                    const stateIndex = states.findIndex(s => s.threadId === state.threadId);
                    if (stateIndex === -1)
                        return [...states];
                    const updatedStates = [...states];
                    const mergedState = mergeState(updatedStates[stateIndex], state);
                    setInputTokens(currentTotal => currentTotal + mergedState.inputTokens);
                    setOutputTokens(currentTotal => currentTotal + mergedState.outputTokens);
                    updatedStates[stateIndex] = mergedState;
                    return updatedStates;
                });
                break;
            }
            case "composer-error": {
                if (activeThreadRef.current?.id === state.threadId) {
                    setActiveComposerState(prev => {
                        if (!prev)
                            return prev;
                        return mergeState(prev, state);
                    });
                }
                setComposerStates(states => {
                    const stateIndex = states.findIndex(s => s.threadId === state.threadId);
                    if (stateIndex === -1)
                        return [...states];
                    const updatedStates = [...states];
                    updatedStates[stateIndex] = mergeState(updatedStates[stateIndex], state);
                    return updatedStates;
                });
                setLoading(false);
                break;
            }
            case "composer-done": {
                setComposerStates(states => {
                    const stateIndex = states.findIndex(s => s.threadId === state.threadId);
                    if (stateIndex === -1)
                        return [...states];
                    const updatedStates = [...states];
                    if (stateIndex === -1) {
                        updatedStates.push(state);
                    }
                    else {
                        updatedStates[stateIndex] = state;
                    }
                    return updatedStates;
                });
                if (activeThreadRef.current && activeThreadRef.current.id === state.threadId) {
                    setActiveComposerState(prev => ({
                        title: state.title,
                        createdAt: state.createdAt,
                        messages: state.messages,
                        threadId: state.threadId,
                        ...prev,
                        canResume: state.canResume
                    }));
                }
                setLoading(false);
                break;
            }
        }
    };
    const handleResponse = (event) => {
        const { data } = event;
        const { command, value } = data;
        switch (command) {
            case "init": {
                const { threads, activeThreadId } = value;
                if (!threads)
                    return;
                const stateThreads = threads.map(state => ({
                    id: state.threadId,
                    title: state.title,
                    createdAt: state.createdAt,
                    parentThreadId: state.parentThreadId
                }));
                setThreads(stateThreads);
                setComposerStates(threads);
                if (activeThreadId) {
                    activeThreadRef.current = stateThreads.find(t => t.id === activeThreadId) ?? null;
                    setActiveThread(activeThreadRef.current);
                    setActiveComposerState(threads.find(t => t.threadId === activeThreadId));
                }
                setInitialized(true);
                break;
            }
            case "compose-response":
                handleComposerEvent(value);
                break;
            case "thread-data": {
                const { state, activeThreadId } = value;
                if (!state)
                    return;
                const composerThread = {
                    id: state.threadId,
                    title: state.title,
                    createdAt: state.createdAt,
                    parentThreadId: state.parentThreadId
                };
                setThreads(threads => {
                    const threadIndex = threads.findIndex(t => t.id === state.threadId);
                    threads[threadIndex] = composerThread;
                    return [...threads];
                });
                setComposerStates(states => {
                    const stateIndex = states.findIndex(t => t.threadId === state.threadId);
                    states[stateIndex] = state;
                    return [...states];
                });
                if (!activeComposerState || (activeComposerState && activeComposerState.threadId === activeThreadRef.current?.id)) {
                    setActiveComposerState(state);
                    activeThreadRef.current = composerThread;
                    setActiveThread(composerThread);
                }
                break;
            }
            case "diagnostics": {
                setFileDiagnostics(value ?? []);
                break;
            }
        }
    };
    const clearActiveMessage = () => {
        setLoading(false);
        setInputTokens(0);
        setOutputTokens(0);
        setFileDiagnostics([]);
        vscode_1.vscode.postMessage({
            command: "cancel",
            value: activeThreadRef.current?.id
        });
    };
    const sendComposerRequest = (request, thread) => {
        vscode_1.vscode.postMessage({
            command: "compose",
            value: request,
        });
        setActiveComposerState(state => {
            if (state) {
                state.messages.push(new Composer_1.UserMessage(crypto.randomUUID(), request.input, request.image));
            }
            else {
                state = {
                    messages: [new Composer_1.UserMessage(crypto.randomUUID(), request.input, request.image)],
                    threadId: thread.id,
                    title: thread.title,
                    createdAt: thread.createdAt
                };
            }
            return state;
        });
        setInputTokens(0);
        setOutputTokens(0);
        setLoading(true);
    };
    return (<ComposerContext.Provider value={{
            composerStates,
            sendComposerRequest,
            setComposerStates: setComposerStates,
            loading, setLoading,
            inputTokens, outputTokens,
            activeComposerState,
            clearActiveMessage,
            setActiveComposerState,
            setFileDiagnostics,
            activeFiles: chips,
            setActiveFiles: setChips,
            fileDiagnostics: fileDiagnostics ?? [],
            initialized,
            // Thread management
            threads,
            activeThread,
            branchThread,
            createThread,
            switchThread,
            deleteThread,
            renameThread
        }}>
      {children}
    </ComposerContext.Provider>);
};
exports.ComposerProvider = ComposerProvider;
const mergeState = (prev, state) => {
    let inputTokens = 0;
    let outputTokens = 0;
    for (const message of state.messages) {
        // Find any existing message with the same ID, regardless of type
        const matchingMessage = prev?.messages.find(m => m.id === message.id &&
            m.role === message.role);
        if (message.role === "assistant") {
            inputTokens += message.inputTokens ?? 0;
            outputTokens += message.outputTokens ?? 0;
        }
        if (!matchingMessage) {
            // If no matching message found, add the new message
            // Always add tool messages, and also add non-tool messages
            prev?.messages.push(message);
        }
        else if (matchingMessage.role === message.role) {
            // Only update content if the roles match (tool updates tool, assistant updates assistant)
            // This prevents a tool message from overwriting an assistant message with the same ID
            matchingMessage.content = message.content;
            if (matchingMessage.role === "tool") {
                matchingMessage.metadata = message.metadata;
            }
        }
    }
    return {
        ...state,
        messages: [...(prev?.messages ?? [])],
        inputTokens,
        outputTokens
    };
};
//# sourceMappingURL=composerContext.js.map