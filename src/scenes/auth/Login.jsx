import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { useTranslation } from "react-i18next";
import { login, requestPasswordReset } from "../../api/auth";
import { saveAdminSession } from "../../auth/session";
import "./login.css";

const Login = ({ onAuthenticated }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.resolvedLanguage?.startsWith("ar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      setError("");
      const response = await login(email.trim().toLowerCase(), password);
      const { user, token } = response.data || {};

      if (!user || !token) {
        setError(t("Unable to sign in. Please try again."));
        return;
      }
      if (user.role !== "admin") {
        setError(t("Administrator access only."));
        return;
      }

      onAuthenticated(saveAdminSession(user, token));
    } catch (requestError) {
      setError(
        requestError.response?.status === 400
          ? t("Invalid email or password")
          : t("Unable to sign in. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    try {
      setResetBusy(true);
      setResetError("");
      await requestPasswordReset(resetEmail.trim().toLowerCase());
      setResetMessage(t("Password reset code sent. Check your email."));
    } catch (requestError) {
      setResetError(
        requestError.response?.data?.message ||
          t("Unable to send a reset code. Check the email and try again.")
      );
    } finally {
      setResetBusy(false);
    }
  };

  const language = isArabic ? "ar" : "en";

  return (
    <Box className="login-screen" dir="ltr">
      <section className="login-form-panel" dir={isArabic ? "rtl" : "ltr"}>
        <Box className="login-panel-top">
          <Box className="login-brand">
            <img src="/assets/masar-kanony-logo.svg" alt={t("Masar Kanony")} />
            <Box>
              <Typography className="login-brand-name">Masar Kanony</Typography>
              <Typography className="login-brand-arabic">مسار قانوني</Typography>
            </Box>
          </Box>
          <Tooltip title={t("Switch language")}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={language}
              onChange={(_, value) => value && i18n.changeLanguage(value)}
              aria-label={t("Switch language")}
              className="login-language-toggle"
            >
              <ToggleButton value="ar" aria-label={t("Arabic")}>عربي</ToggleButton>
              <ToggleButton value="en" aria-label={t("English")}>EN</ToggleButton>
            </ToggleButtonGroup>
          </Tooltip>
        </Box>

        <Box className="login-form-wrap">
          <Box className="login-access-label">
            <VerifiedUserOutlinedIcon fontSize="small" />
            <span>{t("Authorized administrators only")}</span>
          </Box>
          <Typography component="h1" className="login-title">
            {t("Welcome back.")}
          </Typography>
          <Typography className="login-description">
            {t("Sign in to manage Egypt's courts directory and keep legal information moving forward.")}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} className="login-form">
            <TextField
              fullWidth
              required
              autoComplete="username"
              type="email"
              label={t("Work email")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              required
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              label={t("Password")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? t("Hide password") : t("Show password")}
                      onClick={() => setShowPassword((visible) => !visible)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box className="login-options-row">
              <FormControlLabel
                control={<Checkbox defaultChecked size="small" color="secondary" />}
                label={t("Keep me signed in for one day")}
              />
              <Button variant="text" onClick={() => { setResetEmail(email); setResetOpen(true); }}>
                {t("Forgot password?")}
              </Button>
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
              disabled={submitting}
              className="login-submit"
              endIcon={submitting ? <CircularProgress color="inherit" size={17} /> : <ArrowForwardRoundedIcon />}
            >
              {submitting ? t("Signing in...") : t("Sign in to administration")}
            </Button>
          </Box>

          <Box className="login-secure-note">
            <LockOutlinedIcon fontSize="inherit" />
            <span>{t("Secure session. Access is monitored and recorded.")}</span>
          </Box>
        </Box>

        <Box className="login-footer">
          <span>© 2026 {t("Masar Kanony")}. {t("All rights reserved.")}</span>
          <span>{t("Need access? Contact your administrator")}</span>
        </Box>
      </section>

      <section className="login-visual-panel" dir={isArabic ? "rtl" : "ltr"}>
        <Typography className="login-eyebrow">{t("Egypt's courts directory")}</Typography>
        <Typography component="p" className="login-hero-title">
          {t("A clearer path to every court.")}
        </Typography>
        <Typography className="login-hero-arabic">مسار أوضح لكل خطوة قانونية</Typography>
        <Typography className="login-hero-copy">
          {t("One trusted workspace for accurate court records, organized offices, and a better legal journey.")}
        </Typography>

        <Box className="login-courthouse-art" aria-hidden="true">
          <div className="login-orbit login-orbit-one" />
          <div className="login-orbit login-orbit-two" />
          <div className="login-court-building">
            <div className="login-court-roof" />
            <div className="login-court-columns">
              <span /><span /><span /><span />
            </div>
            <div className="login-court-base" />
          </div>
          <Box className="login-verified-chip">
            <VerifiedUserOutlinedIcon />
            {t("Verified directory")}
          </Box>
          <Box className="login-court-chip">
            <Box className="login-chip-icon"><AccountBalanceOutlinedIcon /></Box>
            <Box>
              <Typography>{t("North Cairo Court")}</Typography>
              <span>{t("Cairo / First instance court")}</span>
            </Box>
            <VerifiedUserOutlinedIcon className="login-chip-check" />
          </Box>
        </Box>

        <Box className="login-proof-row">
          <span>{t("Accurate records")}</span>
          <span>{t("Connected courts")}</span>
          <span>{t("Confident decisions")}</span>
        </Box>
      </section>

      <Dialog open={resetOpen} onClose={() => !resetBusy && setResetOpen(false)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handlePasswordReset}>
          <DialogTitle>{t("Reset your password")}</DialogTitle>
          <DialogContent>
            <Typography color="text.secondary" mb={2}>{t("Enter your account email to receive a reset code.")}</Typography>
            {resetError && <Alert severity="error" sx={{ mb: 2 }}>{resetError}</Alert>}
            {resetMessage && <Alert severity="success" sx={{ mb: 2 }}>{resetMessage}</Alert>}
            <TextField
              autoFocus
              required
              fullWidth
              type="email"
              label={t("Work email")}
              value={resetEmail}
              onChange={(event) => setResetEmail(event.target.value)}
              disabled={resetBusy}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setResetOpen(false)} disabled={resetBusy}>{t("Cancel")}</Button>
            <Button type="submit" variant="contained" color="secondary" disabled={resetBusy}>
              {resetBusy ? t("Sending...") : t("Send reset code")}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Login;