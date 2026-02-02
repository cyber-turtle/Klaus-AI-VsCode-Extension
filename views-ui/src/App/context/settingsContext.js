"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsProvider = exports.useSettingsContext = void 0;
const react_1 = require("react");
const SettingsContext = (0, react_1.createContext)(undefined);
const useSettingsContext = () => {
    const context = (0, react_1.useContext)(SettingsContext);
    if (!context)
        throw new Error("useSettingsContext must be used within SettingsProvider");
    return context;
};
exports.useSettingsContext = useSettingsContext;
const SettingsProvider = ({ children }) => {
    const [theme, setTheme] = (0, react_1.useState)(1);
    const [view, setView] = (0, react_1.useState)("composer");
    const [appState, setAppState] = (0, react_1.useState)();
    const [settings, setSettings] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        const handleResponse = (event) => {
            const { command, value } = event.data;
            switch (command) {
                case "init": {
                    const storedAppState = value;
                    setAppState(storedAppState);
                    setTheme(storedAppState?.theme ?? 1);
                    break;
                }
                case "settings": {
                    setSettings(value);
                    break;
                }
                case "setTheme":
                    setTheme(value);
                    break;
                case "switchView":
                    setView(value);
                    break;
            }
        };
        window.addEventListener("message", handleResponse);
        return () => window.removeEventListener("message", handleResponse);
    }, []);
    return (<SettingsContext.Provider value={{
            view,
            setView,
            settings,
            isLightTheme: theme === 1,
        }}>
      {children}
    </SettingsContext.Provider>);
};
exports.SettingsProvider = SettingsProvider;
//# sourceMappingURL=settingsContext.js.map