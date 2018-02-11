/** @babel */

// TODO: Atom has a wonderful Color class (https://atom.io/docs/api/v1.23.3/Color), but I can't figure out how to import it directly... It's not exported: https://github.com/atom/atom/blob/ff6dc42fcd7d533cf4f50b2874e09cce24c77c28/exports/atom.js
import rgbHex from 'rgb-hex';

// TODO: Selection is rendered in the canvas, and therefore isn't a straight
//       "background color". It renders above text and needs alpha in order
//       to see the text. Therefore, we can't simply take the selection
//       color from Atom and set it here, because it will mask the actual
//       text without alpha. If we make the selection color semi-transparent,
//       the color won't match the original selection color from Atom.

const COLOR_KEYS = [
  'foreground', 'background', 'cursor', 'cursorAccent', /* 'selection', */ 'black',
  'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'brightBlack',
  'brightRed', 'brightGreen', 'brightYellow', 'brightBlue', 'brightMagenta',
  'brightCyan', 'brightWhite'
];

export default class ThemeMatcher {

  writeElements() {
    this.colorElements = document.createElement('div');
    this.colorElements.classList.add('terminal-view-color-elements');

    COLOR_KEYS.forEach((colorKey) => {
      const colorElement = document.createElement('span');
      colorElement.dataset.colorKey = colorKey;
      this.colorElements.appendChild(colorElement);
    });

    document.body.appendChild(this.colorElements);
  }

  readStyles() {
    const colors = {};

    Array.from(this.colorElements.children).forEach((colorElement) => {
      const colorKey = colorElement.dataset.colorKey;
      const computedStyle = getComputedStyle(colorElement);
      colors[colorKey] = `#${rgbHex(computedStyle.color)}`;
    });

    return colors;
  }

  cleanup() {
    this.colorElements.remove();
  }

  static parseThemeStyles() {
    const themeMatcher = new this();
    themeMatcher.writeElements();
    const themeColors = themeMatcher.readStyles();
    themeMatcher.cleanup();
    return themeColors;
  }

}
