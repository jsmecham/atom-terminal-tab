/** @babel */
/** @jsx etch.dom */

import { CompositeDisposable } from 'atom';
import ResizeObserver from 'resize-observer-polyfill';
import etch from 'etch';

export default class TerminalView {

  constructor(session) {
    this.disposables = new CompositeDisposable();
    this.session = session;

    //
    // Observe the Session to know when it is destroyed so that we can
    // clean up our state (i.e. remove event observers).
    //
    this.session.onDidDestroy(this.destroy.bind(this));

    // TODO: Documentation says this should be set for Atom... Research!
    // etch.setScheduler(atom.views);
    etch.initialize(this);

    this.openTerminal();
    this.observeResizeEvents();
  }

  render() {
    // TODO: Convert to <div class="terminal-view">
    return (
      <terminal-view attributes={{tabindex: -1}} on={{focus: this.didFocus}} />
    );
  }

  update() {
    return etch.update(this);
  }

  destroy() {
    this.resizeObserver.disconnect();
    this.disposables.dispose();
    etch.destroy(this);
  }

  //
  // Attach the Xterm instance from the session to this view's element, then
  // focus and resize it to fit its viewport.
  //
  openTerminal() {
    this.session.xterm.open(this.element, true);
    this.observeAndApplyThemeStyles();

    // TODO: Move this.session.xterm.fit() to update()? Can we rely strictly on the ResizeObserver?
    this.session.xterm.fit();
  }

  //
  // Observe for resize events so that we can instruct the Xterm instance
  // to recalculate rows and columns to fit into its viewport when it
  // changes.
  //
  observeResizeEvents() {
    this.resizeObserver = new ResizeObserver(this.didResize.bind(this));
    this.resizeObserver.observe(this.element);
  }

  //
  // Resizes the terminal instance to fit its parent container. Once the new
  // dimensions are established, the calculated columns and rows are passed to
  // the pseudoterminal (pty) to remain consistent.
  //
  didResize() {
    if (this.session && this.session.pty && this.session.xterm) {

      // Resize Terminal to Container
      this.session.xterm.fit();

      // Update Pseudoterminal Process w/New Dimensions
      this.session.pty.resize(this.session.xterm.cols, this.session.xterm.rows);

    }
  }

  //
  // Transfer focus to the Xterm instance when the element is focused. When
  // switching between tabs, Atom will send a focus event to the element,
  // which makes it easy for us to delegate focus to the Xterm instance, whose
  // element we are managing in our view.
  //
  didFocus(/* event */) {
    this.session.xterm.focus();
  }

  //
  // Observe for changes to the matchTheme configuration directive and apply
  // the styles when the value changes. This will also apply them when called
  // for the first time.
  //
  observeAndApplyThemeStyles() {
    if (typeof this._applyThemeStylesObserver !== 'undefined') return;
    this._applyThemeStylesObserver = atom.config.observe('terminal-tab.matchTheme', this.applyThemeStyles.bind(this));
    this.disposables.add(this._applyThemeStylesObserver);
  }

  //
  // Attempts to match the Xterm instance with the current Atom theme colors.
  //
  // TODO: This should take advantage of update()
  // TODO: This doesn't undo the font settings when the theme is disabled...
  //
  applyThemeStyles() {
    // Bail out if the user has not requested to match the theme styles
    if (!atom.config.get('terminal-tab.matchTheme')) {
      this.element.classList.remove('themed');
      return;
    }

    this.element.classList.add('themed');

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
    // TODO: We could move this to update()...?
    this.session.xterm.fit();
  }

}
