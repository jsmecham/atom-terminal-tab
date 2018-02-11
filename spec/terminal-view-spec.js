/** @babel */

import TerminalSession from '../lib/terminal-session';
import TerminalView from '../lib/terminal-view';

describe('TerminalView', () => {
  let terminalView, testSession;

  beforeEach(() => {
    testSession = new TerminalSession();
    terminalView = new TerminalView(testSession);

    jasmine.attachToDOM(terminalView.element);
    terminalView.openTerminal();
  });

  afterEach(() => {
    terminalView.destroy();
    testSession.destroy();
  });

  describe('focus', () => {

    it('transfers focus to xterm when focused', () => {
      const xtermTextareaElement = terminalView.element.querySelector('.xterm-helper-textarea');
      expect(xtermTextareaElement).not.toBe(null);

      terminalView.element.focus();
      expect(xtermTextareaElement).toHaveFocus();
    });

  });

  describe('xterm', () => {

    it('element is present in the dom', () => {
      let xtermElement = terminalView.element.querySelector('.xterm');
      expect(xtermElement).toExist();
    });

  });

});
