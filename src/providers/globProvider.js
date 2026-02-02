"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWorkspaceGlobPatterns = void 0;
const node_path_1 = __importDefault(require("node:path"));
const utils_1 = require("../composer/utils");
const generateWorkspaceGlobPatterns = async (aiProvider, workspace) => {
    const model = aiProvider.getModel();
    const contents = await (0, utils_1.scanDirectory)(workspace, 5);
    const fileExts = new Set(contents.filter((c) => c.type === "file").map((f) => node_path_1.default.extname(f.path)));
    return model.invoke(`Analyze the following file extensions and create a glob pattern.
The glob pattern must only match files that can contain code such as js,ts,tsx,jsx,cs etc.

File Extensions:
${Array.from(fileExts).join("\n")}

Do not return any additional text just the glob pattern!
`);
};
exports.generateWorkspaceGlobPatterns = generateWorkspaceGlobPatterns;
//# sourceMappingURL=globProvider.js.map