"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Toolbar_1 = __importDefault(require("./Toolbar"));
const react_1 = require("react");
const Compose_1 = __importDefault(require("./features/Compose"));
require("./App.css");
const composerContext_1 = require("./context/composerContext");
const App = () => {
    const { initialized } = (0, composerContext_1.useComposerContext)();
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setIsVisible(true);
    }, []);
    return (<main className={`h-full flex flex-col overflow-hidden text-base transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
			{initialized && (<>
					<Toolbar_1.default />
					<div className="border-b border-stone-500 mb-2"/>
					<Compose_1.default />
				</>)}
			{!initialized && (<Compose_1.default />)}
		</main>);
};
exports.default = App;
//# sourceMappingURL=App.js.map