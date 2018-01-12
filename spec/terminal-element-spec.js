/** @babel */

import TerminalElement from '../lib/terminal-element';
import TerminalSession from '../lib/terminal-session';

describe('TerminalElement', () => {
  let terminalElement, testSession;

  beforeEach(() => {
    testSession = new TerminalSession();
    terminalElement = new TerminalElement();
    terminalElement.initialize(testSession);

    jasmine.attachToDOM(terminalElement);
  });

  afterEach(() => {
    terminalElement.destroy();
    testSession.destroy();
  });

  describe('focus', () => {

    it('transfers focus to xterm when focused', () => {
      const xtermTextareaElement = terminalElement.querySelector('.xterm-helper-textarea');
      expect(xtermTextareaElement).not.toBe(null);

      terminalElement.focus();
      expect(xtermTextareaElement).toHaveFocus();
    });

  });

  describe('xterm', () => {

    it('element is present in the dom', () => {
      let xtermElement = terminalElement.querySelector('.xterm');
      expect(xtermElement).toExist();
    });

  });

});
