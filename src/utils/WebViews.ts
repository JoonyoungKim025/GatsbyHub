import { window, ViewColumn } from 'vscode';
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
      ViewColumn.One
    );

    // create a header for each npm package and display README underneath header
    // currently #install-btn does not work
    // const gatsbycli = new GatsbyCli();
    let installCmnd;

    async function installPlugin(npmName: string, npmLinks: any): Promise<void> {
      const activeTerminal = Utilities.getActiveTerminal();
      const rootPath = Utilities.getRootPath();
      // gets to npmPackage
      // const { name, links } = npmPackage
      // plugin.command.arguments[0];

      if (npmLinks) {
        console.log('npmlinks!');
        installCmnd =
          (await PluginData.getNpmInstall(npmLinks.repository, npmLinks.homepage)) ||
          `npm install ${npmName}`;
  
        if (rootPath) {
          activeTerminal.sendText(`cd && cd ${rootPath}`);
          activeTerminal.sendText(installCmnd);
          activeTerminal.show(true);
        } else {
          activeTerminal.sendText(installCmnd);
          activeTerminal.show(true);
        }
        // check for if "plugin" is a theme or actual plugin
        if (npmName.startsWith('gatsby-theme')) {
          window.showInformationMessage(
            'Refer to this theme\'s documentation regarding implementation. Simply click on the theme in the "Themes" section.',
            'OK'
          );
        } else {
          window.showInformationMessage(
            'Refer to this plugin\'s documentation regarding further configuration. Simply click on the plugin in the "Plugins" section.',
            'OK'
          );
        }
      }
    }

    const installPlugin2 = () => installPlugin(name, links);
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
        <a id="install-btn">Install</a>
      </div>
      <p>Version: ${version}</p>
      <p>${description}</p>
      
      <hr class="solid">
    </div>
    <script>
      const installPlugin2 = () => ${installCmnd}
    <script>

    ${readMe}
    `;

    // close the webview when not looking at it
    panel.onDidChangeViewState((e) => {
      if (!e.webviewPanel.active) {
        panel.dispose();
      }
    });
  }

  // potentially add in install functionality in webview
  // static installPlugin() {
  //   document.getElementById('install-btn').innerHTML = 'Installing...';
  //   setTimeout(() => {
  //     document.getElementById('install-btn').innerHTML = 'Installed';
  //   }, 3000);
  //   // const cmdString = await PluginData.getNpmInstall(
  //   //   links.repository,
  //   //   links.homepage,
  //   // );
  //   // document.getElementById('install-btn').innerHTML = cmdString;
  // }
}
