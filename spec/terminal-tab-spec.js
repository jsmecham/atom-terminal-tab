/** @babel */

import TerminalSession from '../lib/terminal-session';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

function terminalOpenAndWait(workspaceElement) {
    let terminalPromise = atom.commands.dispatch(workspaceElement, 'terminal:open');
    waitsForPromise(() => {
      return terminalPromise;
    })
}

describe('TerminalTab', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('terminal-tab');
    waitsForPromise(() => {
      return activationPromise;
    });
  });

  afterEach(() => {
    waitsForPromise(() => {
      return atom.packages.deactivatePackage('terminal-tab')
    });
  });

  describe('when the terminal:open event is triggered', () => {

    it('opens a new terminal', () => {

      // Ensure that the terminal view element is not present in the workspace.
      expect(workspaceElement.querySelector('terminal-view')).not.toExist();

      terminalOpenAndWait(workspaceElement);

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

  describe('when the terminal:focus event is triggered', () => {
    it ('navigates to an open terminal', () => {
      terminalOpenAndWait(workspaceElement);
      let bottomDock = atom.workspace.getBottomDock();


      runs(() => {
        bottomDock.hide();
        let terminalPromise = atom.commands.dispatch(workspaceElement, 'terminal:focus');
        waitsForPromise(() => {
          return terminalPromise;
        });

        // ensure the bottom dock is visible, and is the active item.
        expect(bottomDock.isVisible()).toBe(true);

        let activePaneItem = bottomDock.getActivePaneItem();
        expect(activePaneItem).toBeInstanceOf(TerminalSession);

        activePaneItem = atom.workspace.getActivePaneItem();
        expect(activePaneItem).toBeInstanceOf(TerminalSession);
      });
    });

    it ('opens and focuses a new terminal, if one does not exist', () => {
      let bottomDock = atom.workspace.getBottomDock();
      let terminalPromise = atom.commands.dispatch(workspaceElement, 'terminal:focus');
      waitsForPromise(() => {
        return terminalPromise;
      });

      runs(() => {
        // ensure the bottom dock is visible, and is the active item.
        expect(bottomDock.isVisible()).toBe(true);

        let activePaneItem = bottomDock.getActivePaneItem();
        expect(activePaneItem).toBeInstanceOf(TerminalSession);

        activePaneItem = atom.workspace.getActivePaneItem();
        expect(activePaneItem).toBeInstanceOf(TerminalSession);
      });
    });

    it ('keeps focus if the terminal is already focused', () => {
      terminalOpenAndWait(workspaceElement);

      runs(() => {
        activePaneItem = atom.workspace.getActivePaneItem();
        expect(activePaneItem).toBeInstanceOf(TerminalSession);
      });

      let terminalPromise = atom.commands.dispatch(workspaceElement, 'terminal:focus');
      waitsForPromise(() => {
        return terminalPromise;
      });

      runs(() => {
        activePaneItem = atom.workspace.getActivePaneItem();
        expect(activePaneItem).toBeInstanceOf(TerminalSession);
      });

    });
  });

  describe('when the terminal:unfocus event is triggered', () => {
    it ('returns focus to the previously active panel', () => {
        let originalActivePane = atom.workspace.getActivePane();
        let terminalView;
        terminalOpenAndWait(workspaceElement);

        runs(() => {
          expect(atom.workspace.getActivePane()).toNotBe(originalActivePane);
          let activePaneItem = atom.workspace.getActivePaneItem();
          expect(activePaneItem).toBeInstanceOf(TerminalSession);
          terminalView = workspaceElement.querySelector('terminal-view');
        });

        waitsForPromise(() => {
          let terminalPromise = atom.commands.dispatch(terminalView, 'terminal:unfocus');
          return terminalPromise;
        });

        runs(() => {
          expect(atom.workspace.getActivePane()).toBe(originalActivePane);
        });
    });
  });
});
