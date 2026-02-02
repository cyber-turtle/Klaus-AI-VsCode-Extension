"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInput = void 0;
const react_1 = require("react");
const fa_1 = require("react-icons/fa");
const useAutoFocus_1 = require("../../../hooks/useAutoFocus");
const useOnScreen_1 = require("../../../hooks/useOnScreen");
const utils_1 = require("../../../utilities/utils");
const FileDropdown_1 = require("./components/FileDropdown");
const FileChips_1 = require("./components/FileChips");
const ImagePreview_1 = require("./components/ImagePreview");
const CollapsibleSection_1 = require("./components/CollapsibleSection");
const settingsContext_1 = require("../../../context/settingsContext");
const composerContext_1 = require("../../../context/composerContext");
const vscode_1 = require("../../../utilities/vscode");
const fa6_1 = require("react-icons/fa6");
const debounce_1 = require("../../../utilities/debounce");
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const QUALITY = 0.8;
const dataUrlToFile = (dataUrl, fileName) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
};
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }
                }
                else {
                    if (height > MAX_HEIGHT) {
                        width = Math.round((width * MAX_HEIGHT) / height);
                        height = MAX_HEIGHT;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
                resolve(dataUrl);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};
const ChatInput = ({ loading, onChatSubmitted, onChatCancelled, threadId, suggestionItems = [], suggestionTitle = "Diagnostics" }) => {
    const [ref, isVisible] = (0, useOnScreen_1.useOnScreen)();
    const { isLightTheme, settings } = (0, settingsContext_1.useSettingsContext)();
    const { activeFiles, setActiveFiles, activeComposerState } = (0, composerContext_1.useComposerContext)();
    const [inputValue, setInputValue] = (0, react_1.useState)("");
    const [selectedImage, setSelectedImage] = (0, react_1.useState)(null);
    const [imagePreview, setImagePreview] = (0, react_1.useState)(null);
    const chatInputBox = (0, useAutoFocus_1.useAutoFocus)();
    const fileInputRef = (0, react_1.useRef)(null);
    const [showDropdown, setShowDropdown] = (0, react_1.useState)(false);
    const [focusedDropdownIndex, setFocusedDropdownIndex] = (0, react_1.useState)(1);
    const [allDropdownItems, setDropdownItems] = (0, react_1.useState)([]);
    const [inputRect, setInputRect] = (0, react_1.useState)(null);
    const [cursorPosition, setCursorPosition] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        if (isVisible) {
            chatInputBox.current?.focus();
        }
    }, [isVisible, chatInputBox.current]);
    (0, react_1.useEffect)(() => {
        if (chatInputBox.current) {
            const rect = chatInputBox.current.getBoundingClientRect();
            setInputRect(rect);
        }
    }, [chatInputBox.current]);
    (0, react_1.useEffect)(() => {
        const handleResponse = (event) => {
            const { data } = event;
            const { command, value } = data;
            if (command === "get-files-result" && value) {
                const fileResults = value;
                setDropdownItems(fileResults);
                setFocusedDropdownIndex(0);
                setShowDropdown(fileResults.length > 0);
            }
        };
        window.addEventListener("message", handleResponse);
        window.addEventListener("paste", handlePaste);
        return () => {
            window.removeEventListener("message", handleResponse);
            window.removeEventListener("paste", handlePaste);
        };
    }, []);
    const debouncedFetchFiles = (0, react_1.useRef)((0, debounce_1.debounce)((filter) => {
        if (filter.length >= 2) {
            vscode_1.vscode.postMessage({
                command: "get-files",
                value: filter,
            });
        }
    }, 50)).current;
    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items)
            return;
        //@ts-expect-error
        for (const item of items) {
            if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (file) {
                    handleImageSelect(file);
                }
                break;
            }
        }
    };
    const handleImageSelect = async (file) => {
        if (!file.type.startsWith("image/"))
            return;
        try {
            const compressedDataUrl = await compressImage(file);
            const compressedFile = dataUrlToFile(compressedDataUrl, file.name);
            setSelectedImage(compressedFile);
            setImagePreview(compressedDataUrl);
        }
        catch (error) {
            console.error('Error compressing image:', error);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(file);
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleImageUpload = () => fileInputRef.current?.click();
    const openCanvas = () => {
        vscode_1.vscode.postMessage({
            command: "image-editor"
        });
    };
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file)
            handleImageSelect(file);
    };
    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    const chipMap = new Set(activeFiles.map((chip) => chip.path));
    const filteredDropDownItems = allDropdownItems.filter((d) => !chipMap.has(d.path));
    // Track when cursor position changes to get correct word at cursor
    const handleCursorPositionChange = (e) => {
        setCursorPosition(e.currentTarget.selectionStart);
    };
    // Function to extract the word at the current cursor position
    const getWordAtCursor = (text, cursorPos) => {
        // Handle empty text
        if (!text)
            return { word: "", start: 0, end: 0 };
        // Find word boundary characters (space, newline, tab)
        const boundaryRegex = /[\s\n\t]/;
        // Find the start of the current word
        let startPos = cursorPos;
        while (startPos > 0 && !boundaryRegex.test(text.charAt(startPos - 1))) {
            startPos--;
        }
        // Find the end of the current word
        let endPos = cursorPos;
        while (endPos < text.length && !boundaryRegex.test(text.charAt(endPos))) {
            endPos++;
        }
        // Extract the current word
        const word = text.substring(startPos, endPos);
        return { word, start: startPos, end: endPos };
    };
    const handleInputChange = (e) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;
        setInputValue(value);
        setCursorPosition(cursorPos);
        // Get the word where the cursor is currently positioned
        const { word, start } = getWordAtCursor(value, cursorPos);
        // If the word starts with @ and has at least one character after it, trigger file search
        if (word.startsWith("@") && word.length > 1) {
            const searchTerm = word.slice(1);
            fetchFiles(searchTerm);
        }
        else {
            setShowDropdown(false);
        }
    };
    const handleDropdownSelect = (item) => {
        if (!item)
            return;
        if (!activeFiles.some((chip) => chip.path === item.path)) {
            const newChips = [...activeFiles, item];
            setActiveFiles(newChips);
            // Find the "@word" at the cursor position and replace it
            const { word, start, end } = getWordAtCursor(inputValue, cursorPosition);
            if (word.startsWith("@")) {
                // Replace the @word with empty string
                const newValue = inputValue.substring(0, start) +
                    inputValue.substring(end);
                setInputValue(newValue);
            }
        }
        setShowDropdown(false);
        setFocusedDropdownIndex(0);
        chatInputBox.current?.focus();
    };
    const handleChipRemove = (chip) => {
        setActiveFiles(activeFiles.filter((c) => c !== chip));
    };
    const handleUserInput = (e) => {
        if (!inputValue.trim() && !selectedImage || loading)
            return;
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (showDropdown && filteredDropDownItems.length > 0) {
                handleDropdownSelect(filteredDropDownItems[focusedDropdownIndex]);
                chatInputBox.current?.focus();
            }
            else {
                const message = activeFiles.map((chip) => `@${chip.file}`).join(" ") +
                    (activeFiles.length > 0 && inputValue ? " " : "") + inputValue;
                if (message.trim() || selectedImage) {
                    onChatSubmitted(inputValue.trim(), activeFiles.map((chip) => chip.path), selectedImage || undefined);
                    setInputValue("");
                    removeImage();
                    (0, utils_1.handleAutoResize)(e.target, true);
                }
            }
        }
        else if (e.key === "ArrowDown" && showDropdown && filteredDropDownItems.length > 0) {
            e.preventDefault();
            setFocusedDropdownIndex((prevIndex) => Math.min(prevIndex + 1, filteredDropDownItems.length - 1));
        }
        else if (e.key === "ArrowUp" && showDropdown && filteredDropDownItems.length > 0) {
            e.preventDefault();
            setFocusedDropdownIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        }
    };
    // Inside component, replace fetchFiles with:
    const fetchFiles = (filter) => {
        debouncedFetchFiles(filter);
    };
    const inputContainerClass = `
		relative flex flex-col items-stretch p-4 
		${isLightTheme
        ? 'bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),0_12px_24px_rgba(0,0,0,0.15)]'
        : 'bg-[#1e1e1e] shadow-[0_2px_4px_rgba(0,0,0,0.2),0_8px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.25),0_12px_24px_rgba(0,0,0,0.25)]'}
		transition-shadow duration-300 ease-in-out rounded-xl
	`;
    const textareaClass = `
		flex-grow resize-none text-[var(--vscode-input-foreground)] 
		focus:outline-none outline-none bg-transparent overflow-y-auto min-h-[36px] p-2 transition-all duration-200
	`;
    const buttonContainerClass = `
		flex justify-between items-center gap-2 pt-4 h-[52px]
	`;
    const iconButtonClass = `
		p-2.5 rounded-lg transition-all duration-200 flex items-center gap-2
		${isLightTheme
        ? 'hover:bg-gray-100 active:bg-gray-200'
        : 'hover:bg-gray-800 active:bg-gray-700'}
	`;
    const shouldShowButtons = !activeComposerState || !activeComposerState.threadId || activeComposerState.threadId === threadId;
    return (<div className="pt-3 flex flex-col items-stretch" ref={ref}>
			{!loading && suggestionItems.length > 0 && (<CollapsibleSection_1.CollapsibleSection items={suggestionItems} title={suggestionTitle} isLightTheme={isLightTheme}/>)}
			<div className={inputContainerClass}>
				{imagePreview && (<ImagePreview_1.ImagePreview imageUrl={imagePreview} onRemove={removeImage}/>)}
				<FileChips_1.FileChips chips={activeFiles} onChipRemove={handleChipRemove} isLightTheme={isLightTheme}/>
				<textarea placeholder={activeFiles.length === 0
            ? "Ask me anything"
            : ""} value={inputValue} onChange={(e) => {
            handleInputChange(e);
            (0, utils_1.handleAutoResize)(e.target);
        }} onKeyUp={handleCursorPositionChange} onClick={handleCursorPositionChange} ref={chatInputBox} tabIndex={0} rows={1} className={textareaClass} onKeyDown={handleUserInput}/>
				<input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
				{shouldShowButtons && (<div className={buttonContainerClass}>
						<div className="flex flex-row gap-4">
							<button type="button" className={iconButtonClass} onClick={handleImageUpload} title="Attach image">
								<fa_1.FaPaperclip size={16} className={isLightTheme ? 'text-gray-600' : 'text-gray-300'}/>
							</button>
							{settings?.aiProvider === "Google" && (<button type="button" className={iconButtonClass} onClick={openCanvas} title="Image Canvas">
								<fa6_1.FaPencil size={16} className={isLightTheme ? 'text-gray-600' : 'text-gray-300'}/>
							</button>)}
						</div>
						{!loading ? (<button type="button" className={`${iconButtonClass} ${!inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''} p-2.5`} onClick={() => handleUserInput({ key: "Enter", preventDefault: () => { }, shiftKey: false })} disabled={!inputValue.trim() && !selectedImage} title="Send message">
								<fa_1.FaPlay size={16}/>
							</button>) : (<button type="button" className={`${iconButtonClass} p-2.5`} onClick={onChatCancelled} title="Cancel">
								<fa_1.FaStopCircle size={16}/>
							</button>)}
					</div>)}
			</div>
			{showDropdown && filteredDropDownItems.length > 0 && inputRect && (<FileDropdown_1.FileDropdown dropdownItems={filteredDropDownItems} onSelect={handleDropdownSelect} isLightTheme={isLightTheme} showDropdown={showDropdown} focusedDropdownIndex={focusedDropdownIndex}/>)}
		</div>);
};
exports.ChatInput = ChatInput;
//# sourceMappingURL=ChatInput.js.map