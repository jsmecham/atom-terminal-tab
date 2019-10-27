/** @babel */
/** @jsx etch.dom */

import { CompositeDisposable } from 'atom';
import { FitAddon } from 'xterm-addon-fit';
import etch from 'etch';
import ThemeMatcher from './theme-matcher';

const TERMINAL_PADDING = 5;

export default class TerminalView {

  constructor(session) {
    this.disposables = new CompositeDisposable();
    this.session = session;

    // Load the Fit Addon
    this.fitAddon = new FitAddon();
    this.session.xterm.loadAddon(this.fitAddon);
    this.disposables.add(this.fitAddon);

    //
    // Observe the Session to know when it is destroyed so that we can
    // clean up our state (i.e. remove event observers).
    //
    this.session.onDidDestroy(this.destroy.bind(this));

    // TODO: Documentation says this should be set for Atom... Research!
    etch.setScheduler(atom.views);
    etch.initialize(this);

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
    this.session.xterm.open(this.element);
    this.session.xterm.focus();

    this.observeAndApplyThemeStyles();
    this.observeAndApplyTypeSettings();
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

  resizeTerminalToFitContainer() {
    if (!this.session && !this.session.pty && !this.session.xterm) {
      return;
    }

    // Set padding and resize the terminal to fit its container (as best as possible)
    this.session.xterm.element.style.padding = `${TERMINAL_PADDING}px`;
    try { this.fitAddon.fit()} catch(error) { } // TODO: Yuck

    // Check the new size and add additional padding to the top of the
    // terminal so that it fills all available space.
    // TODO: Extract this into a new calculatePadding() or something...
    const elementStyles = getComputedStyle(this.element);
    const xtermElementStyles = getComputedStyle(this.session.xterm.element);
    const elementHeight = parseInt(elementStyles.height, 10);
    const xtermHeight = parseInt(xtermElementStyles.height, 10);
    const newHeight = elementHeight - xtermHeight + TERMINAL_PADDING;

    if (!isNaN(newHeight)) {
      this.fitAddon.fit();
      this.session.xterm.element.style.paddingBottom = `${newHeight}px`;
    }

    // Update Pseudoterminal Process w/New Dimensions
    this.session.pty.resize(this.session.xterm.cols, this.session.xterm.rows);
  }

  //
  // Resizes the terminal instance to fit its parent container. Once the new
  // dimensions are established, the calculated columns and rows are passed to
  // the pseudoterminal (pty) to remain consistent.
  //
  didResize() {
    if (!this.session.xterm.element) {
      this.openTerminal();
    }

    this.resizeTerminalToFitContainer();
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
    if (this.isObservingThemeSettings) return;
    this.disposables.add(atom.config.onDidChange('terminal-tab.matchTheme', this.applyThemeStyles.bind(this)));
    this.disposables.add(atom.themes.onDidChangeActiveThemes(this.applyThemeStyles.bind(this)));
    this.isObservingThemeSettings = true;
    this.applyThemeStyles();
  }

  //
  // Observe for changes to the Editor configuration for Atom and apply
  // the type settings when the values we are interested in change. This
  // will also apply them when called for the first time.
  //
  observeAndApplyTypeSettings() {
    if (this.isObservingTypeSettings) return;
    this.disposables.add(atom.config.onDidChange('terminal-tab.fontFamily', this.applyTypeSettings.bind(this)));
    this.disposables.add(atom.config.onDidChange('editor.fontFamily', this.applyTypeSettings.bind(this)));
    this.disposables.add(atom.config.onDidChange('editor.fontSize', this.applyTypeSettings.bind(this)));
    this.disposables.add(atom.config.onDidChange('editor.lineHeight', this.applyTypeSettings.bind(this)));
    this.isObservingTypeSettings = true;
    this.applyTypeSettings();
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
      this.session.xterm.setOption('theme', {});
      return;
    }

    // Parse the Atom theme styles and configure the Xterm to match.
    const themeStyles = ThemeMatcher.parseThemeStyles();
    this.session.xterm.setOption('theme', themeStyles);

  }

  //
  // Attempts to match the Atom type settings (font family, size and line height) with
  // Xterm.
  //
  applyTypeSettings() {

    //
    // Set the font family in Xterm to match Atom.
    //
    const fontFamily = atom.config.get('terminal-tab.fontFamily')
      || atom.config.get('editor.fontFamily')
      || 'Menlo, Consolas, "DejaVu Sans Mono", monospace'; // Atom default (as of 1.25.0)
    this.session.xterm.setOption('fontFamily', fontFamily);

    //
    // Set the font size in Xterm to match Atom.
    //
    const fontSize = atom.config.get('editor.fontSize');
    this.session.xterm.setOption('fontSize', fontSize);

    //
    // Set the line height in Xterm to match Atom.
    //
    // TODO: This is disabled, because the line height as specified in
    //       Atom is not the same as what Xterm is using to render its
    //       lines (i.e. 1.5 in Atom is more like 2x in Xterm). Need to
    //       figure out the correct conversion or fix the bug, if there
    //       is one.
    //
    // const lineHeight = atom.config.get('editor.lineHeight');
    // this.session.xterm.setOption('lineHeight', lineHeight);

    //
    // Changing the font size and/or line height requires that we
    // recalcuate the size of the Xterm instance.
    //
    // TODO: Call the renamed method (i.e. resizeTerminalToFitContainer())
    //
    this.didResize();

  }

}
