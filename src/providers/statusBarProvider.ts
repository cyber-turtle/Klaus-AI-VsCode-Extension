import * as vscode from "vscode";
import { eventEmitter } from "../events/eventEmitter";

export class ActivityStatusBar {
	activityStatusBarItem: vscode.StatusBarItem;
	isInErrorState = false;

	public readonly onFatalError: vscode.Event<void> =
		eventEmitter._onFatalError.event;

	public readonly onQueryStart: vscode.Event<void> =
		eventEmitter._onQueryStart.event;

	public readonly onQueryComplete: vscode.Event<void> =
		eventEmitter._onQueryComplete.event;

	constructor() {
		this.activityStatusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Right,
			100,
		);

		this.activityStatusBarItem.text = "Klaus";
		this.activityStatusBarItem.show();

		this.onQueryStart(() => {
			this.TogglePending(true);
		});

		this.onQueryComplete(() => {
			this.TogglePending(false);
		});

		this.onFatalError(() => {
			this.ToggleError();
		});
	}

	public TogglePending(pending: boolean) {
		if (this.isInErrorState) {
			return;
		}

		this.activityStatusBarItem.text = `${
			pending ? "$(sync~spin) " : ""
		}Klaus`;
	}

	public ToggleError() {
		this.isInErrorState = true;
		this.activityStatusBarItem.text = "$(testing-error-icon) Klaus";
	}

	dispose() {
		this.activityStatusBarItem?.dispose();
	}
}
