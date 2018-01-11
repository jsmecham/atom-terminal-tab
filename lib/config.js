/** @babel */

export default {

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

};
