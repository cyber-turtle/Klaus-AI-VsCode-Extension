"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagePreview = void 0;
const react_1 = require("react");
const fa_1 = require("react-icons/fa");
const ImagePreview = ({ imageUrl, onRemove }) => {
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [hasError, setHasError] = (0, react_1.useState)(false);
    const handleImageLoad = () => {
        setIsLoading(false);
    };
    const handleImageError = () => {
        setIsLoading(false);
        setHasError(true);
    };
    return (<div className="p-2 relative flex items-center" aria-label="Image preview">
			{isLoading && (<div className="w-[160px] h-[120px] bg-gray-200 animate-pulse rounded-lg" aria-label="Loading image..."/>)}
			{hasError ? (<div className="w-[160px] h-[120px] flex items-center justify-center bg-red-100 text-red-500 rounded-lg" aria-label="Failed to load image">
					Failed to load image
				</div>) : (<div className="pl-2 relative text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)] bg-[var(--vscode-input-background)] rounded-md p-2 flex gap-2">
					<div className="w-[160px] h-[120px] flex items-center justify-center overflow-hidden">
						<img src={imageUrl} alt="Preview" crossOrigin="anonymous" className={`w-full h-full rounded-lg object-contain pointer-events-none select-none ${isLoading ? "opacity-0" : "opacity-100"}`} onLoad={handleImageLoad} onError={handleImageError}/>
					</div>
					<button type="button" onClick={onRemove} className="absolute top-1 right-1 flex items-center justify-center w-6 h-6 p-0 border-none rounded-full bg-black/70 text-white cursor-pointer transition-all duration-200 ease-in-out shadow-md hover:bg-black/85 hover:shadow-lg pointer-events-auto z-10" aria-label="Remove image" title="Remove image" tabIndex={0}>
						<fa_1.FaTimes size={14}/>
					</button>
				</div>)}
		</div>);
};
exports.ImagePreview = ImagePreview;
//# sourceMappingURL=ImagePreview.js.map