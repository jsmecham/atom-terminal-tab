/** @babel */

export default {

  defaultLocation: {
    title: 'Default Location',
    description: 'Where to open new terminals. They will open in the bottom pane, by default.',
    type: 'string',
    default: 'bottom',
    enum: [
      { value: 'bottom', description: 'Bottom' },
      { value: 'center', description: 'Center' },
      { value: 'left', description: 'Left' },
      { value: 'right', description: 'Right' }
    ]
  },

  fontFamily: {
    title: 'Font Family',
    description: 'The name of the font family used for terminal text. By default, this matches the editor font family.',
    type: 'string',
    default: ''
  },

  matchTheme: {
    title: 'Match Theme',
    description: 'When enabled, the look of the terminal will match the currently configured Atom theme.',
    type: 'boolean',
    default: true
  },

  shellSettings: {
    type: 'object',
    properties: {

      sanitizeEnvironment: {
        title: 'Sanitized Environment Variables',
        description: 'Specify variables to remove from the environment in the terminal session. For example, the default behavior is to unset `NODE_ENV`, since Atom sets this to "production" on launch and may not be what you want when developing a Node application.',
        type: 'array',
        default: [ 'NODE_ENV' ]
      },

      shellPath: {
        title: 'Shell Path',
        description: 'Path to your shell application. Uses the $SHELL environment variable by default on *NIX and %COMSPEC% on Windows.',
        type: 'string',
        default: (() => {
          if (process.platform === 'win32') {
            return process.env.COMSPEC || 'cmd.exe';
          } else {
            return process.env.SHELL || '/bin/bash';
          }
        })()
      },

      shellArgs: {
        title: 'Shell Arguments',
        description: 'Arguments to send to the shell application on launch. Sends "--login" by default on *NIX and nothing on Windows.',
        type: 'string',
        default: (() => {
          if (process.platform !== 'win32' && process.env.SHELL === '/bin/bash') {
            return '--login';
          } else {
            return '';
          }
        })()
      }

    }
  },

};
