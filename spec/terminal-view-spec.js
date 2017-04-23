'use babel';

import TerminalView from '../lib/terminal-view';

describe('TerminalView', () => {
  let terminalView;

  beforeEach(() => {
    terminalView = new TerminalView();
    terminalViewElement = terminalView.element;
    jasmine.attachToDOM(terminalViewElement);
  });

  afterEach(() => {
    terminalView.destroy();
  });

  describe('focus', () => {

    it('transfers focus to xterm when focused', () => {
      let xtermTextareaElement = terminalViewElement.querySelector('.xterm-helper-textarea');
      terminalView.element.focus();
      expect(xtermTextareaElement).toHaveFocus();
    });

  });

  describe('xterm', () => {

    it('is initialized', () => {
      expect(terminalView.terminal).not.toBe(null);
    });

    it('is present in the dom', () => {
      let xtermElement = terminalViewElement.querySelector('.xterm');
      expect(xtermElement).toExist();
    });

  });

});
