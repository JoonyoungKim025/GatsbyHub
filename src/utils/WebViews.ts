import { window, ViewColumn } from 'vscode';
import got from 'got';
import * as marked from 'marked';
import PluginData from '../models/NpmData';
import { PluginPkg } from '../utils/Interfaces';

export default class WebViews {
	static async openWebView(npmPackage: PluginPkg) {
		const { links, name, version, description } = npmPackage;
		const readMe = await PluginData.mdToHtml(links.repository, links.homepage);

		// turn npm package name from snake-case to standard capitalized title
		const title = name
			.replace(/-/g, ' ')
			.replace(/^\w?|\s\w?/g, (match: string) => match.toUpperCase());

		// createWebviewPanel takes in the type of the webview panel & Title of the panel & showOptions
		const panel = window.createWebviewPanel(
			'plugin',
			`Gatsby Plugin: ${title}`,
			ViewColumn.One,
			{
				enableScripts: true,
			}
		);

		// create a header for each npm package and display README underneath header
		// currently #install-btn does not work
		panel.webview.onDidReceiveMessage(
			(message) => {
				switch (message.command) {
					case 'sendPluginName':
						window.showErrorMessage(message.info);
						break;
					default:
				}
			},
			undefined
			// ExtensionContext.context.subscriptions
		);

		panel.webview.html = `
    <style>
      .plugin-header {
        position: fixed;
        top: 0;
        background-color: var(--vscode-editor-background);
        width: 100vw;
      }

      #title-btn {
        display: flex;
        flex-direction: row;
        align-items: center;
        align-text: center;
      }

      #install-btn {
        height: 1.5rem;
        margin: 1rem;
      }

      body {
        position: absolute;
        top: 9rem;
      }
    </style>
    <div class="plugin-header">
      <div id="title-btn">
        <h1 id="title">${title}</h1>
        <button id="install-btn" onclick="findPluginName()">Install</button>
      </div>
      <p>Version: ${version}</p>
      <p>${description}</p>
      
      <hr class="solid">
    </div>
    <script>
		// write a function that searches for the name of the specific plugin and sends to extension
		function findPluginName() {
			const vscode = acquireVsCodeApi();
			const pluginName = document.getElementById('title');
			console.log('sending message');
			vscode.postMessage({ command: 'sendPluginName', info: pluginName });
		};

    </script>

    ${readMe}
    `;

		// close the webview when not looking at it
		panel.onDidChangeViewState((e) => {
			if (!e.webviewPanel.active) {
				panel.dispose();
			}
		});
	}

	// open webview readme fo the Gatsby CLI commands
	static async openCommandDocs() {
		const url =
			'https://raw.githubusercontent.com/gatsbyjs/gatsby/master/packages/gatsby-cli/README.md';
		const response = await got(url);
		const readMe = marked(response.body);

		const panel = window.createWebviewPanel(
			'CLI Docs',
			`CLI Docs`,
			ViewColumn.One
		);

		panel.webview.html = `${readMe}`;

		// close the webview when not looking at it
		panel.onDidChangeViewState((e) => {
			if (!e.webviewPanel.active) {
				panel.dispose();
			}
		});
	}

	// Open webview readme of Plugin docs -- has to be seperate function because the command has to be pushed to subscriptions in extension.ts file -- same for starters and themes
	static async openPluginDocs() {
		const url =
			'https://raw.githubusercontent.com/gatsbyjs/gatsby/master/docs/docs/plugins.md';
		const response = await got(url);
		const readMe = marked(response.body);

		const panel = window.createWebviewPanel(
			'Plugin Docs',
			`Plugin Docs`,
			ViewColumn.One
		);

		panel.webview.html = `${readMe}`;

		// close the webview when not looking at it
		panel.onDidChangeViewState((e) => {
			if (!e.webviewPanel.active) {
				panel.dispose();
			}
		});
	}

	// opens webview for Starter readmen has to be seperate function to push to subscriptions
	static async openStarterDocs() {
		const url =
			'https://raw.githubusercontent.com/gatsbyjs/gatsby/master/docs/docs/starters.md';
		const response = await got(url);
		const readMe = marked(response.body);

		const panel = window.createWebviewPanel(
			'Starter Docs',
			`Starter Docs`,
			ViewColumn.One
		);

		panel.webview.html = `${readMe}`;

		// close the webview when not looking at it
		panel.onDidChangeViewState((e) => {
			if (!e.webviewPanel.active) {
				panel.dispose();
			}
		});
	}

	// opens webview for Themes readme -- has to be seperate function in order to be pushed to subscriptions in extension.ts
	static async openThemeDocs() {
		const url =
			'https://raw.githubusercontent.com/gatsbyjs/gatsby/master/docs/docs/themes.md';
		const response = await got(url);
		const readMe = marked(response.body);

		const panel = window.createWebviewPanel(
			'Theme Docs',
			`Theme Docs`,
			ViewColumn.One
		);

		panel.webview.html = `${readMe}`;

		// close the webview when not looking at it
		panel.onDidChangeViewState((e) => {
			if (!e.webviewPanel.active) {
				panel.dispose();
			}
		});
	}
}
