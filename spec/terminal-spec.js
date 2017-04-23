'use babel';

import Terminal from '../lib/terminal';
import TerminalView from '../lib/terminal-view';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('Terminal', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('atom-terminal-tab');
  });

  describe('when the terminal:open event is triggered', () => {

    it('opens a new terminal', () => {

      // Ensure that the terminal view element is not present in the workspace.
      expect(workspaceElement.querySelector('terminal-view')).not.toExist();

      atom.commands.dispatch(workspaceElement, 'terminal:open');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Ensure that the terminal view element is present in the workspace.
        let terminalViewElement = workspaceElement.querySelector('terminal-view');
        expect(terminalViewElement).toExist();

        // Ensure that the bottom dock is visible.
        let bottomDock = atom.workspace.getBottomDock();
        expect(bottomDock.isVisible()).toBe(true);

        // Ensure that the terminal view is present in the bottom dock's pane.
        let activePaneItem = bottomDock.getActivePaneItem();
        expect(activePaneItem).toBeInstanceOf(TerminalView);
        expect(activePaneItem.element).toEqual(terminalViewElement);
      });

    });

  });
});
