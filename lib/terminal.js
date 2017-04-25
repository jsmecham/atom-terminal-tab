/** @babel */

import { CompositeDisposable } from 'atom';

let TerminalView;
const TERMINAL_TAB_URI = 'atom-terminal-tab://';

export default {

  disposables: null,
  terminalViews: [],

  activate() {
    this.disposables = new CompositeDisposable();

    // Register Opener for the Terminal URI (`terminal://`)
    this.disposables.add(atom.workspace.addOpener((uri) => {
      if (uri === TERMINAL_TAB_URI) {
        return this._openTerminal();
      }
    }));

    this.disposables.add(atom.commands.add('atom-workspace', {
      'terminal:open': this.handleOpen.bind(this)
    }));

    this.disposables.add(atom.commands.add('terminal-view', {
      'terminal:copy': this.handleCopy.bind(this),
      'terminal:paste': this.handlePaste.bind(this),
      'terminal:clear': this.handleClear.bind(this)
    }));
  },

  deserializeTerminalView() {
    return this._openTerminal();
  },

  deactivate() {
    this.disposables.dispose();
  },

  handleOpen() {
    atom.workspace.open(TERMINAL_TAB_URI);
  },

  handleCopy() {
    let activeTerminalView = atom.workspace.getActivePaneItem();
    activeTerminalView.copySelection();
  },

  handlePaste() {
    let activeTerminalView = atom.workspace.getActivePaneItem();
    activeTerminalView.pasteFromClipboard();
  },

  handleClear() {
    let activeTerminalView = atom.workspace.getActivePaneItem();
    activeTerminalView.clear();
  },

  _openTerminal() {
    if (!TerminalView) {
      // Defer loading of TerminalView for faster activation time
      TerminalView = require('./terminal-view');
    }

    const terminalView = new TerminalView();
    this.terminalViews.push(terminalView);

    return terminalView;
  }

};
