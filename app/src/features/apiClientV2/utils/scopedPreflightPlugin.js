/**
 * Scoped Preflight Plugin for Tailwind CSS
 *
 * This plugin creates a scoped version of Tailwind's preflight (base reset styles)
 * that only applies within .bs-ds-scope containers, preventing global style leakage
 * that would break Ant Design components.
 */

const plugin = require('tailwindcss/plugin');

const scopedPreflightPlugin = plugin(function ({ addBase }) {
  addBase({
    // Scope all preflight styles to .bs-ds-scope
    '.bs-ds-scope': {
      // Box sizing
      '*, ::before, ::after': {
        boxSizing: 'border-box',
        borderWidth: '0',
        borderStyle: 'solid',
        borderColor: 'theme("borderColor.DEFAULT", currentColor)'
      },

      // HTML & Body base
      '&, & *': {
        lineHeight: '1.5'
      },

      // Prevent font size adjustments
      html: {
        WebkitTextSizeAdjust: '100%',
        tabSize: '4'
      },

      // Body defaults
      body: {
        margin: '0',
        lineHeight: 'inherit'
      },

      // Headings
      'h1, h2, h3, h4, h5, h6': {
        fontSize: 'inherit',
        fontWeight: 'inherit'
      },

      // Links
      a: {
        color: 'inherit',
        textDecoration: 'inherit'
      },

      // Text elements
      'b, strong': {
        fontWeight: 'bolder'
      },

      'code, kbd, samp, pre': {
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: '1em'
      },

      small: {
        fontSize: '80%'
      },

      'sub, sup': {
        fontSize: '75%',
        lineHeight: '0',
        position: 'relative',
        verticalAlign: 'baseline'
      },

      sub: {
        bottom: '-0.25em'
      },

      sup: {
        top: '-0.5em'
      },

      // Tables
      table: {
        textIndent: '0',
        borderColor: 'inherit',
        borderCollapse: 'collapse'
      },

      // Forms
      'button, input, optgroup, select, textarea': {
        fontFamily: 'inherit',
        fontSize: '100%',
        fontWeight: 'inherit',
        lineHeight: 'inherit',
        color: 'inherit',
        margin: '0',
        padding: '0'
      },

      'button, select': {
        textTransform: 'none'
      },

      'button, [type="button"], [type="reset"], [type="submit"]': {
        WebkitAppearance: 'button',
        backgroundColor: 'transparent',
        backgroundImage: 'none'
      },

      ':-moz-focusring': {
        outline: 'auto'
      },

      ':-moz-ui-invalid': {
        boxShadow: 'none'
      },

      progress: {
        verticalAlign: 'baseline'
      },

      '::-webkit-inner-spin-button, ::-webkit-outer-spin-button': {
        height: 'auto'
      },

      '[type="search"]': {
        WebkitAppearance: 'textfield',
        outlineOffset: '-2px'
      },

      '::-webkit-search-decoration': {
        WebkitAppearance: 'none'
      },

      '::-webkit-file-upload-button': {
        WebkitAppearance: 'button',
        font: 'inherit'
      },

      // Interactive elements
      summary: {
        display: 'list-item'
      },

      // Lists
      'blockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre': {
        margin: '0'
      },

      fieldset: {
        margin: '0',
        padding: '0'
      },

      legend: {
        padding: '0'
      },

      'ol, ul, menu': {
        listStyle: 'none',
        margin: '0',
        padding: '0'
      },

      // Prevent resizing textarea
      textarea: {
        resize: 'vertical'
      },

      // Placeholders
      'input::placeholder, textarea::placeholder': {
        opacity: '1',
        color: 'theme("colors.gray.400", #9ca3af)'
      },

      'button, [role="button"]': {
        cursor: 'pointer'
      },

      ':disabled': {
        cursor: 'default'
      },

      // Media elements - THIS IS KEY to fix the issue in the screenshot
      'img, svg, video, canvas, audio, iframe, embed, object': {
        display: 'block',
        verticalAlign: 'middle'
      },

      'img, video': {
        maxWidth: '100%',
        height: 'auto'
      },

      // Hidden
      '[hidden]': {
        display: 'none'
      }
    }
  });
});

module.exports = scopedPreflightPlugin;
