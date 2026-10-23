import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// color design tokens export
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        grey: {
          100: "#f4f6f5",
          200: "#dce3e1",
          300: "#bbc6c3",
          400: "#98a6a3",
          500: "#74827f",
          600: "#566460",
          700: "#3e4c49",
          800: "#2a3735",
          900: "#182523",
        },
        primary: {
          100: "#f4f6f5",
          200: "#dce3e1",
          300: "#b8c4c1",
          400: "#263640",
          500: "#182832",
          600: "#101f28",
          700: "#30434d",
          800: "#3e535d",
          900: "#526670",
        },
        greenAccent: {
          100: "#f5ede3",
          200: "#ead8c1",
          300: "#d7b78f",
          400: "#c6a176",
          500: "#b68d60",
          600: "#96714b",
          700: "#745738",
          800: "#543e28",
          900: "#302319",
        },
        redAccent: {
          100: "#f8dcdb",
          200: "#f1b9b7",
          300: "#e99592",
          400: "#e2726e",
          500: "#db4f4a",
          600: "#af3f3b",
          700: "#832f2c",
          800: "#58201e",
          900: "#2c100f",
        },
        blueAccent: {
          100: "#e9f0ee",
          200: "#d1e0dc",
          300: "#b5ccc6",
          400: "#8eada5",
          500: "#718f87",
          600: "#526f68",
          700: "#38534e",
          800: "#273e3c",
          900: "#162b2b",
        },
      }
    : {
        grey: {
          100: "#182523",
          200: "#2a3735",
          300: "#3e4c49",
          400: "#566460",
          500: "#74827f",
          600: "#98a6a3",
          700: "#bbc6c3",
          800: "#dce3e1",
          900: "#f4f6f5",
        },
        primary: {
          100: "#142633",
          200: "#253946",
          300: "#40525d",
          400: "#ffffff",
          500: "#f4f6f5",
          600: "#b68d60",
          700: "#e8edeb",
          800: "#d5ddda",
          900: "#c0cbc7",
        },
        greenAccent: {
          100: "#302319",
          200: "#543e28",
          300: "#745738",
          400: "#96714b",
          500: "#b68d60",
          600: "#c6a176",
          700: "#d7b78f",
          800: "#ead8c1",
          900: "#f5ede3",
        },
        redAccent: {
          100: "#2c100f",
          200: "#58201e",
          300: "#832f2c",
          400: "#af3f3b",
          500: "#db4f4a",
          600: "#e2726e",
          700: "#e99592",
          800: "#f1b9b7",
          900: "#f8dcdb",
        },
        blueAccent: {
          100: "#162b2b",
          200: "#273e3c",
          300: "#38534e",
          400: "#526f68",
          500: "#718f87",
          600: "#8eada5",
          700: "#b5ccc6",
          800: "#d1e0dc",
          900: "#e9f0ee",
        },
      }),
});

// mui theme settings
export const themeSettings = (mode, direction = "ltr") => {
  const colors = tokens(mode);
  return {
    direction,
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            primary: {
              main: colors.primary[100],
              contrastText: colors.primary[500],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.primary[500],
              paper: colors.primary[400],
            },
            text: { primary: colors.grey[100], secondary: colors.grey[300] },
          }
        : {
            primary: {
              main: colors.primary[100],
              contrastText: colors.primary[400],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: "#f4f6f5",
              paper: colors.primary[400],
            },
            text: { primary: colors.primary[100], secondary: colors.grey[400] },
          }),
      divider: mode === "dark" ? "#3e535d" : "#e1e7e4",
    },
    typography: {
      fontFamily: ["Manrope", "Noto Sans Arabic", "sans-serif"].join(","),
      fontSize: 12,
      button: { fontWeight: 700, textTransform: "none" },
      h1: {
        fontFamily: ["Manrope", "Noto Sans Arabic", "sans-serif"].join(","),
        fontSize: 40,
        fontWeight: 700,
      },
      h2: {
        fontFamily: ["Manrope", "Noto Sans Arabic", "sans-serif"].join(","),
        fontSize: 32,
        fontWeight: 700,
      },
      h3: {
        fontFamily: ["Manrope", "Noto Sans Arabic", "sans-serif"].join(","),
        fontSize: 24,
        fontWeight: 700,
      },
      h4: {
        fontFamily: ["Manrope", "Noto Sans Arabic", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Manrope", "Noto Sans Arabic", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Manrope", "Noto Sans Arabic", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
    shape: { borderRadius: 4 },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiButton: { styleOverrides: { root: { borderRadius: 4 } } },
    },
  };
};

// context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = (direction = "ltr") => {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode, direction)), [mode, direction]);
  return [theme, colorMode];
};
