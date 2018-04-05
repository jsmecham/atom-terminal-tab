/** @babel */

import { CompositeDisposable } from 'atom';
import TerminalSession from './terminal-session';
import TerminalView from './terminal-view';
import config from './config';

const TERMINAL_TAB_URI = 'terminal-tab://';

export default {

  config,

  initialize() {
    this.disposables = new CompositeDisposable();

    // Register View Provider for Terminal Sessions
    this.disposables.add(atom.views.addViewProvider(TerminalSession, (session) => {
      return new TerminalView(session).element;
    }));
  },

  activate() {

    // Register Opener for the Terminal URI (`terminal-tab://`)
    this.disposables.add(atom.workspace.addOpener((uri) => {
      if (uri === TERMINAL_TAB_URI) {
        this.lastActivePane = atom.workspace.getActivePane();
        return new TerminalSession();
      }
    }.bind(this)));

    this.disposables.add(atom.commands.add('atom-workspace', {
      'terminal:open': this.handleOpen.bind(this),
      'terminal:focus': this.handleFocus.bind(this),
    }));

    this.disposables.add(atom.commands.add('terminal-view', {
      'terminal:copy': this.handleCopy.bind(this),
      'terminal:paste': this.handlePaste.bind(this),
      'terminal:clear': this.handleClear.bind(this),
      'terminal:unfocus': this.handleUnfocus.bind(this),
    }));

  },

  deactivate() {
    this.disposables.dispose();
    this._closeTerminals();
  },

  deserializeTerminalSession(data) {
    return new TerminalSession(data.config);
  },

  handleOpen() {
    atom.workspace.open(TERMINAL_TAB_URI);
  },

  handleFocus() {
    const terminal = this._getOpenTerminal();
    if (terminal) {
      const pane = atom.workspace.paneForItem(terminal);
      this.lastActivePane = atom.workspace.getActivePane();
      pane.activate();
    } else {
      this.handleOpen();
    }
  },

  handleUnfocus() {
    if (this.lastActivePane) {
      this.lastActivePane.activate();
      this.lastActivePane = null;
    }
  },

  handleCopy() {
    const activeSession = atom.workspace.getActivePaneItem();
    activeSession.copySelection();
  },

  handlePaste() {
    const activeSession = atom.workspace.getActivePaneItem();
    activeSession.pasteFromClipboard();
  },

  handleClear() {
    const activeSession = atom.workspace.getActivePaneItem();
    activeSession.clear();
  },

  // Traverses all open panes and searches for
  // one that is a TerminalSession instance,
  // and returns one if found.
  _getOpenTerminal() {
    for (let item of atom.workspace.getPaneItems()) {
      if (item instanceof TerminalSession) {
        return item;
      }
    }
  },

  // close all active terminals
  _closeTerminals() {
    for (let item of atom.workspace.getPaneItems()) {
      if (item instanceof TerminalSession) {
        const pane = atom.workspace.paneForItem(item);
        pane.destroy();
      }
    }
  }

};
