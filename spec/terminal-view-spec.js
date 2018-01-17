/** @babel */

import TerminalSession from '../lib/terminal-session';
import TerminalView from '../lib/terminal-view';

describe('TerminalView', () => {
  let terminalView, testSession;

  beforeEach(() => {
    testSession = new TerminalSession();
    terminalView = new TerminalView();
    terminalView.initialize(testSession);

    jasmine.attachToDOM(terminalView);
  });

  afterEach(() => {
    terminalView.destroy();
    testSession.destroy();
  });

  describe('focus', () => {

    it('transfers focus to xterm when focused', () => {
      const xtermTextareaElement = terminalView.querySelector('.xterm-helper-textarea');
      expect(xtermTextareaElement).not.toBe(null);

      terminalView.focus();
      expect(xtermTextareaElement).toHaveFocus();
    });

  });

  describe('xterm', () => {

    it('element is present in the dom', () => {
      let xtermElement = terminalView.querySelector('.xterm');
      expect(xtermElement).toExist();
    });

  });

});
