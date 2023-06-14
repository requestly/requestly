const { colors } = require("./colors");
const { utils } = require("./utils");

// ant-design overrides
// NOTE: DO NOT USE THIS VALUES DIRECTLY IN ANY FILE
module.exports.theme = {
  // font
  "@font-family": "Roboto, sans-serif",

  // colors
  "@primary-color": colors.primary,
  "@body-background": colors.background,
  "@layout-body-background": colors.background,
  "@component-background": colors.background,
  "@link-color": colors.link,
  "@badge-color": colors.primary,
  "@error-color": colors.danger,

  // border radius
  "@border-radius-base": utils.borderRadius,

  // collapse
  "@collapse-header-padding": "0",
  "@collapse-header-padding-extra": "0",
  "@collapse-content-padding": "0",

  // input
  "@input-color": colors.white,
  "@input-icon-color": colors.textGray,
  "@input-border-color": colors.border,
  "@input-bg": colors.inputBackground,
  "@input-placeholder-color": colors.textGray,
  "@input-height-lg": "38px",

  // select
  "@select-border-color": colors.border,
  "@select-dropdown-bg": colors.componentDarkBackground,
  "@select-background": colors.componentDarkBackground,
  "@select-single-item-height-lg": "38px",
  "@select-item-selected-bg": colors.selectedItemBackground,

  // dropdown
  "@dropdown-menu-bg": colors.componentDarkBackground,

  // menu
  "@menu-dark-bg": colors.backgroundDark,

  // Layout header
  "@layout-header-height": "56px",
  "@layout-header-padding": "9px 16px",
  "@layout-header-background": colors.backgroundDark,
  "@layout-sider-background": colors.backgroundDark,

  // Drawer
  "@drawer-bg": colors.backgroundDark,

  // Modal
  "@modal-mask-bg": colors.modalBackdrop,

  // Button
  "btn-height-base": "30px",

  // Tootltip
  "@tooltip-bg": colors.darkGray,
};
