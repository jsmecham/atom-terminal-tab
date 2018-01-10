/** @babel */

import { CompositeDisposable } from 'atom';
import TerminalElement from './terminal-element';
import TerminalSession from './terminal-session';

const TERMINAL_TAB_URI = 'terminal-tab://';

export default {

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

    // Register View Provider for Terminal Sessions
    this.disposables.add(atom.views.addViewProvider(TerminalSession, (session) => {
      const element = new TerminalElement();
      return element.initialize(session);
    }));

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
    // TODO: Destroy all the sessions here?
    this.disposables.dispose();
  },

  deserializeTerminalSession() {
    return null;
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
