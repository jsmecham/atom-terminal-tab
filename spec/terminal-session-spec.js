/** @babel */

import TerminalSession from '../lib/terminal-session';
import { Terminal as Xterm } from 'xterm';

describe('TerminalSession', () => {

  let testSession;

  beforeEach(() => {
    testSession = new TerminalSession();
  });

  afterEach(() => {
    testSession.destroy();
  });

  describe('xterm', () => {

    it('instance is initialized', () => {
      expect(testSession.xterm).not.toBe(null);
      expect(testSession.xterm).toBeInstanceOf(Xterm);
    });

  });

});
