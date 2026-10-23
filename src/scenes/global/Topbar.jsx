import { Box, IconButton, ToggleButton, ToggleButtonGroup, Tooltip, useTheme } from "@mui/material";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import SearchIcon from "@mui/icons-material/Search";

const Topbar = ({ session, onLogout }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.startsWith("ar") ? "ar" : "en";

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder={t("Search")} />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* ICONS */}
      <Box display="flex">
        <Tooltip title={t("Switch language")}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={language}
            onChange={(_, value) => value && i18n.changeLanguage(value)}
            aria-label={t("Switch language")}
            sx={{ alignSelf: "center", mr: 1, height: 34 }}
          >
            <ToggleButton value="ar" aria-label={t("Arabic")}>عربي</ToggleButton>
            <ToggleButton value="en" aria-label={t("English")}>EN</ToggleButton>
          </ToggleButtonGroup>
        </Tooltip>
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <LightModeOutlinedIcon />
          ) : (
            <DarkModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>
        <Box display="flex" alignItems="center" gap={1} sx={{ ml: 1 }}>
          <Box display={{ xs: "none", sm: "block" }} textAlign="end">
            <Box component="span" sx={{ display: "block", fontSize: 12, fontWeight: 700 }}>
              {session?.user?.name || session?.user?.email}
            </Box>
            <Box component="span" sx={{ display: "block", fontSize: 10, color: "text.secondary" }}>
              {t("Administrator")}
            </Box>
          </Box>
          <Tooltip title={t("Sign out")}>
            <IconButton onClick={onLogout} aria-label={t("Sign out")}>
              <ExitToAppOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default Topbar;
