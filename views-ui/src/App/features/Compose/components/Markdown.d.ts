/// <reference types="react" />
export type MarkDownObject = {
    props: {
        children: [boolean, MarkDownEntry[] | string];
    };
};
export type MarkDownEntry = {
    props: {
        children: string[];
    };
};
export declare const MessageWithMarkdown: import("react").MemoExoticComponent<({ message, fromUser, isLightTheme }: {
    message: string;
    fromUser: boolean;
    isLightTheme: boolean;
}) => import("react").JSX.Element>;
//# sourceMappingURL=Markdown.d.ts.map