/** @babel */

import TerminalSession from '../lib/terminal-session';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('TerminalTab', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('terminal-tab');
  });

  describe('when the terminal:open event is triggered', () => {

    it('opens a new terminal', () => {

      // Ensure that the terminal view element is not present in the workspace.
      expect(workspaceElement.querySelector('terminal-view')).not.toExist();

      let terminalPromise = atom.commands.dispatch(workspaceElement, 'terminal:open');

      waitsForPromise(() => {
        return activationPromise;
      });

      waitsForPromise(() => {
        return terminalPromise;
      })

      runs(() => {
        // Ensure that the terminal view element is present in the workspace.
        const terminalViewElement = workspaceElement.querySelector('terminal-view');
        expect(terminalViewElement).toExist();

        // Ensure that the bottom dock is visible.
        let bottomDock = atom.workspace.getBottomDock();
        expect(bottomDock.isVisible()).toBe(true);

        // Ensure that the terminal view is present in the bottom dock's pane.
        let activePaneItem = bottomDock.getActivePaneItem();
        expect(activePaneItem).toBeInstanceOf(TerminalSession);
        let terminalView = atom.views.getView(activePaneItem);
        expect(terminalView).toEqual(terminalViewElement);
      });

    });

  });
});
