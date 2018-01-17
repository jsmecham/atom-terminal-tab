/** @babel */

import { spawn as spawnPty } from 'node-pty-prebuilt';
import Xterm from 'xterm';
import path from 'path';

Xterm.loadAddon('fit');

//
// Terminal Session
//
// Maintains all of the essential state for a Terminal Tab.
//
export default class TerminalSession {

  constructor() {
    this.pty = this.openPseudoterminal();
    this.xterm = new Xterm();

    this.handleEvents();
  }

  handleEvents() {

    // Process Terminal Input Events
    this.xterm.on('data', (data) => {
      return this.pty.write(data);
    });

    // Process Terminal Output Events
    this.pty.on('data', (data) => {
      return this.xterm.write(data);
    });

    // Process Terminal Exit Events
    this.pty.on('exit', () => {
      const pane = atom.workspace.paneForItem(this);
      if (pane) pane.destroyItem(this);
    });

  }

  openPseudoterminal() {
    const shellPath = atom.config.get('terminal-tab.shellPath') || process.env.SHELL || process.env.COMSPEC;
    const shellArgsString = atom.config.get('terminal-tab.shellArgs') || '';
    const shellArgs = shellArgsString.split(/\s+/g).filter(arg => arg);

    return spawnPty(shellPath, shellArgs, {
      name: 'xterm-color',
      env: this.sanitizedEnvironment,
      cwd: this._getWorkingDirectory()
    });
  }

  //
  // Select a working directory for a new terminal.
  // Uses the project folder of the currently active file, if any,
  // otherwise falls back to the first project's folder, if any,
  // or the user's home directory.
  //
  _getWorkingDirectory() {
    const activeItem = atom.workspace.getActivePaneItem();
    if (activeItem
        && activeItem.buffer
        && activeItem.buffer.file
        && activeItem.buffer.file.path) {
      return atom.project.relativizePath(activeItem.buffer.file.path)[0];
    } else {
      const projectPaths = atom.project.getPaths();
      let cwd;
      if (projectPaths.length > 0) {
        cwd = projectPaths[0];
      } else {
        cwd = process.env.HOME;
      }
      return path.resolve(cwd);
    }
  }

  //
  // Clears the contents of the terminal buffer. This is a simple proxy to the
  // `clear()` function on the Xterm instance.
  //
  clear() {
    this.xterm.clear();
  }

  //
  // Copies the current selection to the Atom clipboard.
  //
  copySelection() {
    const selectedText = this.xterm.getSelection();
    atom.clipboard.write(selectedText);
  }

  //
  // Pastes the contents of the Atom clipboard to the terminal (via the
  // pseudoterminal).
  //
  pasteFromClipboard() {
    const text = atom.clipboard.read();
    this.pty.write(text);
  }

  serialize() {
    return {
      deserializer: 'TerminalSession'
    };
  }

  // TODO: Where to call this?
  destroy() {

    // Kill the Pseudoterminal (pty) Process
    if (this.pty) this.pty.kill();

    // Destroy the Terminal Instance
    if (this.xterm) this.xterm.destroy();

  }

  get sanitizedEnvironment() {
    const sanitizedEnvironment = Object.assign({}, process.env);
    const variablesToDelete = atom.config.get('terminal-tab.sanitizeEnvironment');

    if (variablesToDelete) {
      variablesToDelete.forEach((variable) => {
        delete sanitizedEnvironment[variable];
      });
    }

    return sanitizedEnvironment;
  }

  getDefaultLocation() {
    return atom.config.get('terminal-tab.defaultLocation');
  }

  getIconName() {
    return 'terminal';
  }

  getTitle() {
    return 'Terminal';
  }

}
