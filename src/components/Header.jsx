import { Typography, Box, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { tokens } from "../theme";

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  return (
    <Box mb="30px">
      <Typography
        variant="h2"
        color={colors.grey[100]}
        fontWeight="bold"
        sx={{ m: "0 0 5px 0" }}
      >
        {t(title)}
      </Typography>
      <Typography variant="h5" color={colors.greenAccent[400]}>
        {t(subtitle)}
      </Typography>
    </Box>
  );
};

export default Header;
