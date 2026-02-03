/** @type {import('tailwindcss').Config} */
module.exports = {
  // CRITICAL: Only scan srcv2 folder to avoid conflicts with src folder
  content: ["./srcv2/**/*.{js,jsx,ts,tsx}"],

  // No prefix - use standard Tailwind utility classes
  // Tailwind is used ONLY for utilities: positioning, spacing, margins, flex, grid, etc.
  // Ant Design is the primary design system for all components
  prefix: "",

  // Important flag disabled - Ant Design takes precedence
  important: false,

  theme: {
    extend: {
      // Colors from design-system-v2 (src/lib/design-system-v2/tokens/colors.ts)
      colors: {
        // Primary colors
        primary: {
          0: "#cbe2fe",
          50: "#cbe2fe",
          100: "#97c3fd",
          200: "#639ff9",
          300: "#3c7ff3",
          400: "#004eeb", // Main primary
          DEFAULT: "#004eeb",
          500: "#003cca",
          600: "#002ca9",
          700: "#001f88",
          800: "#001670",
          900: "#111a2c",
          darker: "#001670",
          dark: "#002ca9",
          soft: "#3c7ff3",
          text: "#639ff9",
        },
        // Secondary colors
        secondary: {
          0: "#e3dbf6",
          50: "#c8b7ec",
          100: "#ae93e0",
          200: "#956fd4",
          300: "#7e48c6",
          400: "#680cb7", // Main secondary
          DEFAULT: "#680cb7",
          500: "#50078f",
          600: "#390469",
          700: "#240245",
          800: "#100024",
          900: "#020007",
        },
        // Neutral colors
        neutral: {
          0: "#e9e9e9",
          50: "#e9e9e9",
          100: "#d1d1d1",
          200: "#bbbbbb",
          300: "#8f8f8f",
          400: "#787878", // Main neutral
          DEFAULT: "#787878",
          500: "#5c5c5c",
          600: "#383838",
          700: "#282828",
          800: "#212121",
          900: "#1a1a1a",
          1000: "#141414",
        },
        // Success colors
        success: {
          0: "#a6e9c8",
          50: "#a6e9c8",
          100: "#6fdaa6",
          200: "#4dcc8f",
          300: "#28c07a",
          400: "#0baa60", // Main success
          DEFAULT: "#0baa60",
          500: "#0a9c55",
          600: "#0c7844",
          700: "#104b2f",
          800: "#00210e",
          900: "#0d1f11",
          darker: "#104b2f",
          text: "#6fdaa6",
        },
        // Error colors
        error: {
          0: "#ffc7c7",
          50: "#ffc7c7",
          100: "#ffa7a7",
          200: "#ff8080",
          300: "#f95e5e",
          400: "#dc2626", // Main error
          DEFAULT: "#dc2626",
          500: "#cf2a2a",
          600: "#a41f1f",
          700: "#591a1a",
          800: "#2f0404",
          900: "#271111",
          darker: "#591a1a",
          dark: "#a41f1f",
          soft: "#f95e5e",
          text: "#ff8080",
        },
        // Warning colors
        warning: {
          0: "#ffdd86",
          50: "#ffdd86",
          100: "#ffcb45",
          200: "#fdba0f",
          300: "#f2aa09",
          400: "#e09400", // Main warning
          DEFAULT: "#e09400",
          500: "#d07d00",
          600: "#b55e0f",
          700: "#5c3111",
          800: "#2e1b00",
          900: "#27170b",
          darker: "#5c3111",
          dark: "#b55e0f",
          soft: "#f2aa09",
          text: "#ffcb45",
        },
        // Surface colors
        surface: {
          0: "#212121",
          1: "#282828",
          2: "#383838",
          3: "#5c5c5c",
        },
        // Background colors
        background: {
          DEFAULT: "#1a1a1a",
          dark: "#141414",
        },
        // Text colors
        text: {
          placeholder: "#8f8f8f",
          subtle: "#bbbbbb",
          default: "#ffffff",
        },
      },

      // Custom spacing
      spacing: {
        128: "32rem",
        144: "36rem",
      },

      // Font family from design-system-v2
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["Roboto Mono", "Consolas", "Monaco", "monospace"],
        code: ["Roboto Mono", "Consolas", "Monaco", "monospace"],
      },

      // Custom border radius
      borderRadius: {
        "4xl": "2rem",
      },

      // Custom box shadow
      boxShadow: {
        "custom-light": "0 2px 8px rgba(0, 0, 0, 0.08)",
        "custom-medium": "0 4px 16px rgba(0, 0, 0, 0.12)",
        "custom-heavy": "0 8px 24px rgba(0, 0, 0, 0.16)",
      },

      // Custom z-index
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },

      // Custom animations
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },

  plugins: [],

  // Disable preflight to avoid conflicts with Ant Design
  corePlugins: {
    preflight: false, // CRITICAL: Preserves Ant Design base styles
  },
};
