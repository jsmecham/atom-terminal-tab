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

  attachedCallback() {

    //
    // Attach the Xterm instance from the session to this element, focus
    // and resize it to fit its viewport.
    //
    this.session.xterm.open(this, true);
    this.applyThemeStyles();
    this.session.xterm.fit();

    //
    // Observe for resize events so that we can instruct the Xterm instance
    // to recalculate rows and columns to fit into its viewport when it
    // changes.
    //
    this.resizeObserver = new ResizeObserver(this._didResize.bind(this));
    this.resizeObserver.observe(this);

    //
    // When this element is focused, transfer the focus to the Xterm instance.
    // This requires that this element is focusable (i.e. a `tabIndex` is set).
    //
    this.addEventListener('focus', () => this.session.xterm.focus());

    // Observe Configuration Changes
    this.disposables.add(
      atom.config.observe('terminal-tab.matchTheme', this.applyThemeStyles.bind(this))
    );

  }

  detachedCallback() {

    // TODO: Additional cleanup here?
    // TODO: Does the focus listener need to be removed?

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

    // TODO: We need to call this when the user changes the setting, but it is being called twice on first initialization.
    this.session.xterm.fit();
  }

}

export default document.registerElement('terminal-view', TerminalElement);
