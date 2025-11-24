module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Branding ImmoForge
        primary: {
          DEFAULT: "#0A3A32",        // Vert foncé
          light: "#0F4F44",
          dark: "#062821",
        },
        secondary: {
          DEFAULT: "#D4A44B",        // Doré
          light: "#E5BE76",
          dark: "#9E7834",
        },
        stone: {
          DEFAULT: "#F2F2F0",        // Gris pierre
        },
        charcoal: {
          DEFAULT: "#1A1A1A",        // Texte principal / premium
        },
        bluegray: {
          DEFAULT: "#3F4B54",        // Option pour sections modernes
        },
      },

      fontFamily: {
        // Si tu veux une identité plus premium
        sans: ["Poppins", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
}
