"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkeletonLoader = void 0;
require("./SkeletonLoader.css");
const SkeletonLoader = ({ isDarkTheme }) => {
    return (<div className={`${isDarkTheme ? 'loader-light' : 'loader-dark'}`}/>);
};
exports.SkeletonLoader = SkeletonLoader;
//# sourceMappingURL=SkeletonLoader.js.map