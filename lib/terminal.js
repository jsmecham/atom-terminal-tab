/** @babel */

import { CompositeDisposable } from 'atom';
import TerminalView from './terminal-view';

const TERMINAL_TAB_URI = 'atom-terminal-tab://'

export default {

  disposables: null,
  terminalViews: [],

  activate(state) {
    this.disposables = new CompositeDisposable();

    // Register Opener for the Terminal URI (`terminal://`)
    this.disposables.add(atom.workspace.addOpener((uri) => {
      if (uri === TERMINAL_TAB_URI) {
        const terminalView = new TerminalView();
        this.terminalViews.push(terminalView);
        return terminalView;
      }
    }));

    this.disposables.add(atom.commands.add('atom-workspace', {
      'terminal:open': this.open.bind(this),
    }));
    this.disposables.add(atom.commands.add('terminal-view', {
      'terminal:copy': this.handleCopy.bind(this),
      'terminal:paste': this.handlePaste.bind(this),
      'terminal:clear': this.handleClear.bind(this),
    }))
  },

  deactivate() {
    this.disposables.dispose();
  },

  open() {
    atom.workspace.open(TERMINAL_TAB_URI);
  },

  handleCopy(event) {
    let activeTerminalView = atom.workspace.getActivePaneItem();
    activeTerminalView.copySelection();
  },

  handlePaste(event) {
    let activeTerminalView = atom.workspace.getActivePaneItem();
    activeTerminalView.pasteFromClipboard();
  },

  handleClear(event) {
    let activeTerminalView = atom.workspace.getActivePaneItem();
    activeTerminalView.clear();
  }

};
