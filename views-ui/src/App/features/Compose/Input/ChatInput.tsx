import type React from "react";
import { useEffect, useRef, useState } from "react";
import { FaPlay, FaStopCircle, FaPaperclip, FaArrowUp } from "react-icons/fa";
import type { AppMessage } from "@shared/types/Message";
import type { FileDiagnostic, FileSearchResult } from "@shared/types/Composer";
import { useAutoFocus } from "../../../hooks/useAutoFocus";
import { useOnScreen } from "../../../hooks/useOnScreen";
import { handleAutoResize } from "../../../utilities/utils";
import { FileDropdown } from "./components/FileDropdown";
import { FileChips } from "./components/FileChips";
import { ImagePreview } from "./components/ImagePreview";
import { CollapsibleSection } from "./components/CollapsibleSection";
import { useSettingsContext } from "../../../context/settingsContext";
import { useComposerContext } from "../../../context/composerContext";
import { vscode } from "../../../utilities/vscode";
import { FaPencil } from "react-icons/fa6";
import { debounce } from "../../../utilities/debounce";

const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const QUALITY = 0.8;

const dataUrlToFile = (dataUrl: string, fileName: string): File => {
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

const compressImage = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const reader = new FileReader();

		reader.onload = (e) => {
			img.src = e.target?.result as string;

			img.onload = () => {
				let width = img.width;
				let height = img.height;

				if (width > height) {
					if (width > MAX_WIDTH) {
						height = Math.round((height * MAX_WIDTH) / width);
						width = MAX_WIDTH;
					}
				} else {
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

interface ChatInputProps {
	onChatSubmitted: (input: string, contextFiles: string[], image?: File) => void;
	onChatCancelled: () => void;
	loading: boolean;
	threadId?: string;
	suggestionItems?: FileDiagnostic[];
	suggestionTitle?: string;
}

const ChatInput = ({
	loading,
	onChatSubmitted,
	onChatCancelled,
	threadId,
	suggestionItems = [],
	suggestionTitle = "Diagnostics"
}: ChatInputProps) => {
	const [ref, isVisible] = useOnScreen();
	const { isLightTheme, settings } = useSettingsContext();
	const { activeFiles, setActiveFiles, activeComposerState } = useComposerContext();
	const [inputValue, setInputValue] = useState("");
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const chatInputBox = useAutoFocus();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const [focusedDropdownIndex, setFocusedDropdownIndex] = useState<number>(1);
	const [allDropdownItems, setDropdownItems] = useState<FileSearchResult[]>([]);
	const [inputRect, setInputRect] = useState<DOMRect | null>(null);
	const [cursorPosition, setCursorPosition] = useState<number>(0);

	useEffect(() => {
		if (isVisible) {
			chatInputBox.current?.focus();
		}
	}, [isVisible, chatInputBox.current]);

	useEffect(() => {
		if (chatInputBox.current) {
			const rect = chatInputBox.current.getBoundingClientRect();
			setInputRect(rect);
		}
	}, [chatInputBox.current]);

	useEffect(() => {
		const handleResponse = (event: MessageEvent<AppMessage>) => {
			const { data } = event;
			const { command, value } = data;

			if (command === "get-files-result" && value) {
				const fileResults = value as FileSearchResult[];
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

	const debouncedFetchFiles = useRef(
		debounce((filter: string) => {
			if (filter.length >= 2) {
				vscode.postMessage({
					command: "get-files",
					value: filter,
				});
			}
		}, 50)
	).current;

	const handlePaste = (e: ClipboardEvent) => {
		const items = e.clipboardData?.items;
		if (!items) return;

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

	const handleImageSelect = async (file: File) => {
		if (!file.type.startsWith("image/")) return;

		try {
			const compressedDataUrl = await compressImage(file);
			const compressedFile = dataUrlToFile(compressedDataUrl, file.name);
			setSelectedImage(compressedFile);
			setImagePreview(compressedDataUrl);
		} catch (error) {
			console.error('Error compressing image:', error);
			const reader = new FileReader();
			reader.onloadend = () => {
				setSelectedImage(file);
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleImageUpload = () => fileInputRef.current?.click();

	const openCanvas = () => {
		vscode.postMessage({
			command: "image-editor"
		})
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleImageSelect(file);
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
	const handleCursorPositionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
		setCursorPosition(e.currentTarget.selectionStart);
	};

	// Function to extract the word at the current cursor position
	const getWordAtCursor = (text: string, cursorPos: number): { word: string, start: number, end: number } => {
		// Handle empty text
		if (!text) return { word: "", start: 0, end: 0 };

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

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
		} else {
			setShowDropdown(false);
		}
	};

	const handleDropdownSelect = (item: FileSearchResult) => {
		if (!item) return;

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

	const handleChipRemove = (chip: FileSearchResult) => {
		setActiveFiles(activeFiles.filter((c) => c !== chip));
	};

	const handleUserInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (!inputValue.trim() && !selectedImage || loading) return;

		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (showDropdown && filteredDropDownItems.length > 0) {
				handleDropdownSelect(filteredDropDownItems[focusedDropdownIndex]);
				chatInputBox.current?.focus();
			} else {
				const message = activeFiles.map((chip) => `@${chip.file}`).join(" ") +
					(activeFiles.length > 0 && inputValue ? " " : "") + inputValue;

				if (message.trim() || selectedImage) {
					onChatSubmitted(
						inputValue.trim(),
						activeFiles.map((chip) => chip.path),
						selectedImage || undefined
					);
					setInputValue("");
					removeImage();
					handleAutoResize(e.target as HTMLTextAreaElement, true);
				}
			}
		} else if (e.key === "ArrowDown" && showDropdown && filteredDropDownItems.length > 0) {
			e.preventDefault();
			setFocusedDropdownIndex((prevIndex) =>
				Math.min(prevIndex + 1, filteredDropDownItems.length - 1)
			);
		} else if (e.key === "ArrowUp" && showDropdown && filteredDropDownItems.length > 0) {
			e.preventDefault();
			setFocusedDropdownIndex((prevIndex) => Math.max(prevIndex - 1, 0));
		}
	};

	// Inside component, replace fetchFiles with:
	const fetchFiles = (filter: string) => {
		debouncedFetchFiles(filter);
	};

	const inputContainerClass = `
		relative flex flex-col items-stretch p-3 rounded-xl
		${isLightTheme
			? 'bg-white border border-gray-200 shadow-sm'
			: 'bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)]'
		}
		focus-within:ring-1 focus-within:ring-[var(--vscode-focusBorder)]
		transition-all duration-200
	`;

	const textareaClass = `
		flex-grow resize-none text-[var(--vscode-input-foreground)] 
		focus:outline-none outline-none bg-transparent overflow-y-auto min-h-[44px] p-2 leading-relaxed
		placeholder-[var(--vscode-input-placeholderForeground)]
	`;

	const buttonContainerClass = `
		flex justify-between items-center gap-2 pt-2 border-t border-[var(--vscode-widget-border)] mt-2
	`;

	const iconButtonClass = `
		p-2 rounded-lg transition-all duration-200 flex items-center gap-2 
		text-[var(--vscode-icon-foreground)]
		hover:bg-[var(--vscode-toolbar-hoverBackground)] hover:text-[var(--vscode-foreground)]
	`;

	const sendButtonClass = `
		p-2 rounded-lg transition-all duration-200 flex items-center justify-center
		${!inputValue.trim() && !selectedImage 
			? 'opacity-40 cursor-not-allowed bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)]' 
			: 'bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)] shadow-sm'
		}
	`;

	const shouldShowButtons = !activeComposerState || !activeComposerState.threadId || activeComposerState.threadId === threadId;

	return (
		<div className="pt-4 flex flex-col items-stretch px-4" ref={ref}>
			{!loading && suggestionItems.length > 0 && (
				<CollapsibleSection
					items={suggestionItems}
					title={suggestionTitle}
					isLightTheme={isLightTheme}
				/>
			)}
			<div className={inputContainerClass}>
				{imagePreview && (
					<ImagePreview
						imageUrl={imagePreview}
						onRemove={removeImage}
					/>
				)}
				
				<div className="mb-1">
					<FileChips
						chips={activeFiles}
						onChipRemove={handleChipRemove}
						isLightTheme={isLightTheme}
					/>
				</div>

				<textarea
					placeholder={
						activeFiles.length === 0
							? "Ask a question or type @ to add context..."
							: ""
					}
					value={inputValue}
					onChange={(e) => {
						handleInputChange(e);
						handleAutoResize(e.target);
					}}
					onKeyUp={handleCursorPositionChange}
					onClick={handleCursorPositionChange}
					ref={chatInputBox}
					tabIndex={0}
					rows={1}
					className={textareaClass}
					onKeyDown={handleUserInput}
				/>
				
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					accept="image/*"
					className="hidden"
				/>

				{shouldShowButtons && (
					<div className={buttonContainerClass}>
						<div className="flex flex-row gap-1">
							<button
								type="button"
								className={iconButtonClass}
								onClick={handleImageUpload}
								title="Attach image"
							>
								<FaPaperclip size={14} />
							</button>
							{settings?.aiProvider === "Google" && (<button
								type="button"
								className={iconButtonClass}
								onClick={openCanvas}
								title="Image Canvas"
							>
								<FaPencil size={14} />
							</button>)}
						</div>
						
						{!loading ? (
							<button
								type="button"
								className={`${iconButtonClass} ${!inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''} bg-[var(--vscode-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] text-[var(--vscode-button-foreground)] rounded-full p-2 h-8 w-8 flex items-center justify-center transition-all shadow-sm`}
								onClick={() => handleUserInput({ key: "Enter", preventDefault: () => { }, shiftKey: false } as React.KeyboardEvent<HTMLTextAreaElement>)}
								disabled={!inputValue.trim() && !selectedImage}
								title="Send message"
							>
								<FaArrowUp size={14} />
							</button>
						) : (
							<button
								type="button"
								className="p-2 rounded-lg bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)] hover:bg-[var(--vscode-toolbar-hoverBackground)]"
								onClick={onChatCancelled}
								title="Cancel"
							>
								<FaStopCircle size={14} />
							</button>
						)}
					</div>
				)}
			</div>

			{showDropdown && filteredDropDownItems.length > 0 && inputRect && (
				<FileDropdown
					dropdownItems={filteredDropDownItems}
					onSelect={handleDropdownSelect}
					isLightTheme={isLightTheme}
					showDropdown={showDropdown}
					focusedDropdownIndex={focusedDropdownIndex}
				/>
			)}
		</div>
	);
};

export { ChatInput };
