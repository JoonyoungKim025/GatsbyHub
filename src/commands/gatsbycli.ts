import { window, commands, workspace } from 'vscode';
import StatusBar from '../utils/statusBarItem';
import Utilities from '../utils/Utilities';
import { getRootPath } from '../utils/workspaceResolver';
import PluginData from '../models/PluginData';

// Defines the functionality of the Gatsby CLI Commands
export default class GatsbyCli {
  private serverStatus: boolean;

  initStatusBar: void;

  constructor() {
    // Defines whether the statusBarItem toggle is on or off
    this.serverStatus = false;

    // Initialize the statusBarItem
    this.initStatusBar = StatusBar.init();
    this.toggleStatusBar = this.toggleStatusBar.bind(this);
    this.developServer = this.developServer.bind(this);
    this.disposeServer = this.disposeServer.bind(this);
    this.showPopUpMsg = this.showPopUpMsg.bind(this);
  }

  // Installs gatsby-cli for the user when install gatsby button is clicked
  static async installGatsby() {
    // TODO: If a gatsby terminal isn't open, create new terminal. Otherwise, use gatsbyhub terminal
    const activeTerminal = Utilities.getActiveTerminal();
    activeTerminal.sendText('sudo npm install -g gatsby-cli');

    // Creates a password inputbox when install gatsby button is clicked
    const inputPassword = await window.showInputBox({
      password: true,
      placeHolder: 'Input administrator password',
    });

    if (inputPassword !== undefined) activeTerminal.sendText(inputPassword);
    // TODO: if the password is wrong, show inputbox again
    // else, show terminal
    activeTerminal.show();
  }

  /**  Creates a new site when 'Create New Site' button is clicked.
   * Currently uses default gatsby starter, but uses gatsby new url. see https://www.gatsbyjs.com/docs/gatsby-cli/
   * NOTE: new site will be created wherever the root directory is currently located
   * The user terminal should be at the directory user wishes to download the files.
   */
  static async createSite(starterObj?: any) {
    // TODO: Get GatsbyHub terminal or create a new terminal if it doesn't exist
    const activeTerminal = Utilities.getActiveTerminal();

    // Defines string for button in information message
    const openFolderMsg: string = 'Open Folder';

    // Tells user that new site will be created in current directory
    const choice = await window.showInformationMessage(
      `New Gatsby site will be created in current directory 
        unless you open a different folder for your project`,
      openFolderMsg,
    );

    // ????
    if (choice && choice === openFolderMsg) {
      commands.executeCommand('vscode.openFolder');
    }

    // Gives user a place to write the name of their site
    const siteName = await window.showInputBox({
      placeHolder: 'Enter-new-site-filename',
    });

    // Sends command to the terminal
    if (siteName) {
      // starterObj is ???
      if (starterObj) {
        console.log('starterObj', starterObj);
        const { repository } = starterObj.command.arguments[0].links;
        activeTerminal.sendText(`gatsby new ${siteName} ${repository} && cd ${siteName}`);
      } else {
        activeTerminal.sendText(`gatsby new ${siteName} && cd ${siteName}`);
      }
      activeTerminal.show();
    } else {
      window.showWarningMessage(
        'Must enter a name for your new Gatsby directory',
      );
    }
  }

  // Starts development server and opens project in a new browser
  public async developServer() {
    if (!workspace.workspaceFolders) {
      return this.showPopUpMsg(
        'Open a folder or workspace... (File -> Open Folder)',
        true,
      );
    }

    if (!workspace.workspaceFolders.length) {
      return this.showPopUpMsg(
        "You don't have any Gatsby folders in this workspace",
        true,
      );
    }

    // Finds path to file in text editor and drops the file name from the path
    const rootPath = getRootPath();

    const activeTerminal = Utilities.getActiveTerminal();
    activeTerminal.show();

    // Only cd into rootpath if it exists, otherwise just run command on current workspace
    if (rootPath) {
      activeTerminal.sendText(`cd && cd ${rootPath}`);
    }

    activeTerminal.sendText('gatsby develop --open');

    // Changes status bar to working message while server finishes developing
    StatusBar.working('Starting server');

    // Toggles statusBar after 4 seconds so it will dispose server if clicked again
    setTimeout(this.toggleStatusBar, 4000);
    window.showInformationMessage('Gatsby Server Running on port:8000');
    /** write options to set host, set port, to open site, and to use https
     * gatsby develop only works in the site directory
     * allow user to open folder for their site directory */
  }

  // Disposes development server by disposing the terminal
  public disposeServer() {
    const activeTerminal = Utilities.getActiveTerminal();
    activeTerminal.dispose();

    // Changes status bar to working message while server finishes disposing
    StatusBar.working('Disposing server');

    // If statusBar is clicked and toggled on, disposes server.
    setTimeout(this.toggleStatusBar, 3000);
    window.showInformationMessage('Disposing Gatsby Server on port:8000');
  }

  // Builds and packages Gatsby site
  static async build() {
    // Finds path to file in text editor and drops the file name from the path
    const rootPath = getRootPath();

    const activeTerminal = Utilities.getActiveTerminal();
    activeTerminal.show();

    // Directs to rootpath only if it exists. If not, just run command on current workspace
    if (rootPath) {
      activeTerminal.sendText(`cd && cd ${rootPath}`);
    }
    activeTerminal.sendText('gatsby build');
  }

  // Toggles statusBar between developing server and disposing server
  private toggleStatusBar(): void {
    if (!this.serverStatus) {
      StatusBar.offline(8000);
    } else {
      StatusBar.online();
    }
    // ????
    this.serverStatus = !this.serverStatus;
  }

  public dispose() {
    StatusBar.dispose();
  }

  // Displays pop-up error message to user
  private showPopUpMsg(
    msg: string,
    isErrorMsg: boolean = false,
    // isWarning: boolean = false,
  ) {
    if (isErrorMsg) window.showErrorMessage(msg);
    // else if (isWarning) window.showWarningMessage(msg);
    else window.showInformationMessage(msg);
  }

  // Installs plugin when user clicks on download & install button
  static async installPlugin(plugin?: any) {
    const activeTerminal = Utilities.getActiveTerminal();
    if (plugin) {
      const { homepage, repository } = plugin.command.arguments[0].links;
      const installCmnd = await PluginData.getNpmInstall(repository, homepage);
      activeTerminal.sendText(installCmnd);
      activeTerminal.show();
    }
  }
}
