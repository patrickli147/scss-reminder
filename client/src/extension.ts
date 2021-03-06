import * as path from 'path';
import * as vscode from 'vscode';
import { workspace, ExtensionContext, commands, window, Position } from 'vscode';
import {messageItems} from './constants';
import registerCommands from './registerCommands';
import {registerAllHandlers} from './serverRequestHandlers/registerAllHandlers';

import {
	ExecuteCommandRequest,
	LanguageClient,
	LanguageClientOptions,
	ProtocolRequestType0,
	ServerOptions,
	TransportKind,
} from 'vscode-languageclient/node';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
	await registerCommands();

	// test
	// await vscode.workspace.getConfiguration().update('scssReminder.sourceFile', []);

	console.log("activate");

	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', pattern: '**/*.{scss,sass}' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'scssReminder',
		'SCSS Reminder',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
	await registerAllHandlers(client);
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
