/** @babel */

import { CompositeDisposable, Emitter } from 'atom';
import { spawn as spawnPty } from 'node-pty-prebuilt-multiarch';
import { Terminal as Xterm } from 'xterm';
import path from 'path';

//
// Terminal Session
//
// Maintains all of the essential state for a Terminal Tab.
//
export default class TerminalSession {

  constructor(config = {}) {
    this.config = config;
    this.disposables = new CompositeDisposable();
    this.emitter = new Emitter();
    this.pty = this.openPseudoterminal();
    this.xterm = new Xterm();

    this.handleEvents();
  }

  handleEvents() {

    // Process Terminal Input Events
    this.xterm.onData(data => this.pty.write(data));

    // Process Terminal Output Events
    this.pty.onData((data) => {
      if (this.xterm.element) {
        return this.xterm.write(data);
      }
    });

    // Process Terminal Exit Events
    this.pty.onExit(this.destroy.bind(this));

  }

  openPseudoterminal() {
    const shellArguments = this.shellArguments.split(/\s+/g).filter(arg => arg);

    return spawnPty(this.shellPath, shellArguments, {
      name: 'xterm-color',
      env: this.sanitizedEnvironment,
      cwd: this.workingDirectory
    });
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
      deserializer: 'TerminalSession',
      config: {
        sanitizeEnvironment: this.sanitizedEnvironmentKeys,
        shellArgs: this.shellArguments,
        shellPath: this.shellPath,
        workingDirectory: this.workingDirectory
      }
    };
  }

  destroy() {

    // Kill the Pseudoterminal (pty) Process
    if (this.pty) this.pty.kill();

    // Destroy the Terminal Instance
    if (this.xterm) this.xterm.dispose();

    // Notify any observers that this session is being destroyed.
    this.emitter.emit('did-destroy', this);

    // Clean up any disposables we're responsible for.
    this.emitter.dispose();
    this.disposables.dispose();

  }

  onDidDestroy(callback) {
    return this.emitter.on('did-destroy', callback);
  }

  //
  // Select a working directory for a new terminal.
  // Uses the project folder of the currently active file, if any,
  // otherwise falls back to the first project's folder, if any,
  // or the user's home directory.
  //
  _getWorkingDirectory() {
    if (this._workingDirectory) return this._workingDirectory;

    const activeItem = atom.workspace.getActivePaneItem();
    if (activeItem && activeItem.buffer && activeItem.buffer.file && activeItem.buffer.file.path) {
      return atom.project.relativizePath(activeItem.buffer.file.path)[0];
    }

    const projectPaths = atom.project.getPaths();
    let cwd;
    if (projectPaths.length > 0) {
      cwd = projectPaths[0];
    } else {
      cwd = process.env.HOME;
    }
    return path.resolve(cwd);
  }

  get sanitizedEnvironment() {
    const sanitizedEnvironment = Object.assign({}, process.env);
    const variablesToDelete = this.sanitizedEnvironmentKeys;

    if (variablesToDelete) {
      variablesToDelete.forEach((variable) => {
        delete sanitizedEnvironment[variable];
      });
    }

    return sanitizedEnvironment;
  }

  get shellPath() {
    if (this._shellPath) return this._shellPath;
    return this._shellPath = this.config.shellPath
      || atom.config.get('terminal-tab.shellSettings.shellPath')
      || process.env.SHELL
      || process.env.COMSPEC;
  }

  get shellArguments() {
    if (this._shellArguments) return this._shellArguments;
    return this._shellArguments = this.config.shellArgs
      || atom.config.get('terminal-tab.shellSettings.shellArgs')
      || '';
  }

  get sanitizedEnvironmentKeys() {
    if (this._sanitizedEnvironmentKeys) return this._sanitizedEnvironmentKeys;
    return this._sanitizedEnvironmentKeys = this.config.sanitizeEnvironment
      || atom.config.get('terminal-tab.shellSettings.sanitizeEnvironment');
  }

  get workingDirectory() {
    if (this._workingDirectory) return this._workingDirectory;
    return this._workingDirectory = this.config.workingDirectory
      || this._getWorkingDirectory();
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
