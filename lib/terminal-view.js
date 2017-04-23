/** @babel */
/** @jsx etch.dom */

import ResizeObserver from 'resize-observer-polyfill';
import Terminal from 'xterm';
import etch from 'etch';
import os from 'os';
import path from 'path';
import { spawn as spawnPty } from 'node-pty';

Terminal.loadAddon('fit');

export default class TerminalView {

  _resizeObserver: null
  pty: null
  terminal: null

  constructor(serializedState) {
    etch.initialize(this);
    this._openTerminal();
    this._handleEvents();
  }

  destroy() {

    // Stop Observing Resize Events
    this._resizeObserver.disconnect();

    // Kill the Pseudoterminal (pty) Process
    if (this.pty) this.pty.kill();

    // Destroy the Terminal Instance
    if (this.terminal) this.terminal.destroy();

    // Detach from the DOM
    etch.destroy(this);

  }

  _handleEvents() {

    // Transfer Focus to Terminal
    this.element.addEventListener('focus', () => this.terminal.focus());

    // Observe Resize Events
    this._resizeObserver = new ResizeObserver(this._didResize.bind(this));
    this._resizeObserver.observe(this.element);

    // Process Terminal Input Events
    this.terminal.on('data', (data) => {
      return this.pty.write(data);
    });

    // Process Terminal Output Events
    this.pty.on('data', (data) => {
      return this.terminal.write(data);
    });

    // Process Terminal Exit Events
    this.pty.on('exit', (data) => {
      let pane = atom.workspace.paneForItem(this);
      if (pane) pane.destroyItem(this);
    });

  }

  //
  // Resizes the terminal instance to fit its parent container. Once the new
  // dimensions are established, the calculated columns and rows are passed to
  // the pseudoterminal (pty) to remain consistent.
  //
  _didResize() {

    // Resize Terminal to Container
    this.terminal.fit();

    // Update Pseudoterminal Process w/New Dimensions
    this.pty.resize(this.terminal.cols, this.terminal.rows);

  }

  render() {
    return (
      <terminal-view attributes={{tabindex: 0}} />
    );
  }

  update() {
    return etch.update(this);
  }

  _openTerminal() {
    this.pty = this._openPseudoterminal();
    this.terminal = new Terminal();
    this.terminal.open(this.element);
  }

  _openPseudoterminal() {
    return spawnPty(process.env.SHELL, [], {
      name: 'xterm-color',
      cwd: path.resolve(atom.project.getPaths()[0]),
      env: process.env
    });
  }

  //
  // Clears the contents of the terminal buffer. This is a simple proxy to the
  // `clear()` function on the Xterm instance.
  //
  clear() {
    this.terminal.clear();
  }

  //
  // Copies the current selection to the Atom clipboard.
  //
  copySelection() {
    let selectedText = window.getSelection().toString();
    let preparedText = this._prepareTextForClipboard(selectedText.toString());
    atom.clipboard.write(preparedText);
  }

  //
  // Pastes the contents of the Atom clipboard to the terminal (via the
  // pseudoterminal).
  //
  pasteFromClipboard() {
    let text = atom.clipboard.read();
    this.pty.write(text);
  }

  //
  // Xterm.js replaces all spaces with non-breaking space characters. Before
  // writing the selection to the clipboard, we need to convert these back to
  // standard space characters.
  //
  // This method was lifted from the Xterm.js source, with some slight
  // modifications.
  //
  _prepareTextForClipboard(text) {
    const space = String.fromCharCode(32);
    const nonBreakingSpace = String.fromCharCode(160);
    const allNonBreakingSpaces = new RegExp(nonBreakingSpace, 'g');

    return text.split('\n').map((line) => {
      return line.replace(/\s+$/g, '').replace(allNonBreakingSpaces, space);
    }).join('\n');
  }

  getDefaultLocation() {
    return 'bottom';
  }

  getIconName() {
    return 'terminal';
  }

  getTitle() {
    return 'Terminal';
  }

}
