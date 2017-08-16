/** @babel */

import { CompositeDisposable } from 'atom';

let TerminalView;
const TERMINAL_TAB_URI = 'terminal-tab://';

export default {

  disposables: null,
  terminalViews: [],

  config: {
    matchTheme: {
      title: 'Match Theme',
      description: 'Attempt to match the current UI and Syntax themes.',
      type: 'boolean',
      default: true
    },
    sanitizeEnvironment: {
      title: 'Sanitize Environment',
      description: 'Specify environment variables to unset in terminal sessions (e.g. NODE_ENV).',
      type: 'array',
      default: [ 'NODE_ENV' ]
    },
    shellPath: {
      title: 'Shell Application Path',
      description: 'Path to your shell application.  Uses $SHELL environment variable by default on *NIX and %COMSPEC% on Windows.',
      type: 'string',
      default: (function() {
        if (process.platform === 'win32') {
          return process.env.COMSPEC || 'cmd.exe';
        }
        else {
          return process.env.SHELL || '/bin/bash';
        }
      })()
    },
    shellArgs: {
      title: 'Shell Application Arguments',
      description: 'Arguments to send to the shell application on launch.  Sends "-l" by default on *NIX and nothing on Windows.',
      type: 'string',
      default: (function() {
        if (process.platform !== 'win32' && process.env.SHELL === '/bin/bash') {
          return '--login';
        }
        else {
          return '';
        }
      })()
    },
    defaultLocation: {
      title: 'Default Location',
      description: 'Where to open new terminals',
      type: 'string',
      default: 'bottom',
      enum: [ 'bottom', 'left', 'right', 'center' ]
    }
  },

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
