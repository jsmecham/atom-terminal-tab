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
        return new TerminalSession();
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

  deactivate() {
    this.disposables.dispose();
  },

  deserializeTerminalSession(data) {
    return new TerminalSession(data.config);
  },

  provideTerminalSession() {
    return (config={}) => atom.workspace.open(new TerminalSession(config));
  },

  handleOpen() {
    atom.workspace.open(TERMINAL_TAB_URI);
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
  }

};
