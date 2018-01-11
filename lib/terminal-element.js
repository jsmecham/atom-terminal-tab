/** @babel */

import { CompositeDisposable } from 'atom';
import ResizeObserver from 'resize-observer-polyfill';

class TerminalElement extends HTMLElement {

  initialize(session) {
    this.disposables = new CompositeDisposable();
    this.session = session;
    this.tabIndex = 0;

    return this;
  }

  createdCallback() {
    console.log('[TerminalTabView] createdCallback()', arguments);
  }

  attachedCallback() {
    console.log('[TerminalTabView] attachedCallback()', arguments);

    // Open the Xterm on this element and focus it
    this.session.xterm.open(this, true);
    this.applyThemeStyles();
    this.session.xterm.fit();

    // Observe Resize Events
    this.resizeObserver = new ResizeObserver(this._didResize.bind(this));
    this.resizeObserver.observe(this);

    // Transfer Focus to Terminal
    // TODO: This no longer works when clicking on the tab of an already open tab
    this.addEventListener('focus', () => this.session.xterm.focus());

    // Observe Configuration Changes
    this.disposables.add(
      atom.config.observe('terminal-tab.matchTheme', this.applyThemeStyles.bind(this))
    );

  }

  detachedCallback() {
    console.log('[TerminalTabView] detachedCallback()', arguments);

    // Stop Observing Resize Events
    this.resizeObserver.disconnect();

    // Dispose of Disposables
    this.disposables.dispose();

  }

  //
  // Resizes the terminal instance to fit its parent container. Once the new
  // dimensions are established, the calculated columns and rows are passed to
  // the pseudoterminal (pty) to remain consistent.
  //
  _didResize() {

    // Resize Terminal to Container
    this.session.xterm.fit();

    // Update Pseudoterminal Process w/New Dimensions
    this.session.pty.resize(this.session.xterm.cols, this.session.xterm.rows);

  }

  applyThemeStyles() {

    // Bail out if the user has not requested to match the theme styles
    if (!atom.config.get('terminal-tab.matchTheme')) {
      this.classList.remove('themed');
      return;
    }

    this.classList.add('themed');

    const xtermElement = this.session.xterm.element;
    if (typeof atom.config.settings.editor !== 'undefined') {
      if (typeof atom.config.settings.editor.fontSize !== 'undefined')
        xtermElement.style.fontSize = `${atom.config.settings.editor.fontSize}px`;
      if (typeof atom.config.settings.editor.fontFamily !== 'undefined')
        xtermElement.style.fontFamily = atom.config.settings.editor.fontFamily;
      // if (typeof atom.config.settings.editor.lineHeight !== 'undefined')
      //   xtermElement.style.lineHeight = atom.config.settings.editor.lineHeight;
    }

    this.session.xterm.fit();
  }

}

export default document.registerElement('terminal-view', TerminalElement);
