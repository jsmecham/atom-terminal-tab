## 0.6.0

* Updated to Xterm 4.2.0.
* Switched to node-pty-prebuilt-multiarch (thanks @the-j0k3r, @ozno).
* Updated CircleCI configuration for CircleCI 2.0.

## 0.5.7

* Added a custom close handler.

## 0.5.6

* Fixed a race condition while opening terminals in tests (thanks @edjubuh).
* Include the initial working directory in serialized session state.
* Eliminated a workspace lookup on pty-based exits.
* Removed the polyfill for ResizeObserver and set the required Atom version to 1.19+ to ensure the presence of native support.

## 0.5.5

* Fixed an issue that prevented shell-related configuration (shell path, arguments and sanitized environment keys) from being used.

## 0.5.4

* Added support for specifying a custom font family.
* Cleaned up the settings configuration with better descriptions and layout.

## 0.5.3

* Fixed serialization of sanitized environment variables.

## 0.5.2

* Fixed serialization of shell arguments.

## 0.5.1

* Improved serialization of terminal sessions so that the configuration in effect when a session is opened (i.e. shell path, arguments, etc) gets restored properly when reopening Atom.

## 0.5.0

* Prevented duplicate calls to `applyThemeStyles` when opening new tabs.
* Reimplemented etch on `TerminalView`.
* Extracted business logic from `TerminalView` into a new `TerminalSession` model.
* Updated to Xterm 3.1.
* Refactored the theme matching logic into a new `ThemeMatcher` class, which creates a DOM tree to read Atom styles from using `getComputedStyle()`.
* Added spacing and proper sizing logic to ensure that the terminal consumes all available space in its container.

## 0.4.0

* Switched to node-pty-prebuilt which eliminates the compilation step on install! (thanks @daviwil).
* Added an option to configure where terminal tabs get opened by default (thanks @HebaruSan).
* Use active file's project folder as initial working path for new terminal tabs (thanks @HebaruSan).

## 0.3.4

* Fixed issues caused by renaming the package to `terminal-tab`.

## 0.3.3

* Renamed the package to `terminal-tab`.

## 0.3.2

* Added support for configuring the shell that is launched (thanks @daviwil).

## 0.3.1

* Added a conditional around environment sanitation to prevent Atom freezing on startup and to fix CI (thanks @daviwil).

## 0.3.0

* Added support for inheriting styles from the current theme.
* Removed our bundled copy of the Xterm styles. In order to keep more up-to-date with changes, we now import the styles directly from the package.
* Removed dependency on etch.
* Added support for unsetting inherited environment variables in the terminal instance. This unsets `NODE_ENV`, by default.
* Fixed line-height style to make ncurses-based applications look correct (thanks @w8jcik and @HebaruSan).

## 0.2.1, 0.2.2

* Fixed the scrollbar position and background color.
* Fixed the focus warning that would pop up periodically.

## 0.2.0

* Added support for serializing and deserializing open terminals when closing and reopening Atom windows.

## 0.1.3

* Fixed launching of terminals in windows without projects.

## 0.1.2

* Added configuration for ESLint.
* Added configuration for CircleCI.
* Deferred loading of TerminalView for faster package activation.
* Changed TerminalView to use a custom element (`<terminal-view/>`).
* Changed protocol to use the proper package name (`atom-terminal-tab`) to avoid conflicts.

## 0.1.1

* Updated node-pty to 0.6.4.
* Tweaked the package description.
* Updated the README to point to the preview on GitHub.

## 0.1.0 - Initial Release

* Basic support for opening terminals in panes and docks.
