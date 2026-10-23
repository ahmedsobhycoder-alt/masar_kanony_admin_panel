import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Snackbar,
  TextField,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Header from "../../components/Header";
import {
  createAppConfig,
  deleteAppConfig,
  getAppConfig,
  updateAppConfig,
} from "../../api/settings";

const emptyConfig = {
  appName: "",
  appVersion: "",
  description: "",
  contactInfo: { whatsappNumber: "", email: "", workingHours: "" },
  socialMediaLinks: { facebook: "", instagram: "" },
  stats: {},
};

const Settings = () => {
  const { t } = useTranslation();
  const [appConfigData, setAppConfigData] = useState(emptyConfig);
  const [hasConfig, setHasConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      try {
        setLoading(true);
        const result = await getAppConfig();
        const config = result.data;
        if (isMounted && config) {
          setAppConfigData({ ...emptyConfig, ...config });
          setHasConfig(true);
        }
      } catch (requestError) {
        if (isMounted && requestError.response?.status !== 404) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Failed to load app settings"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateTopLevel = (field, value) => {
    setAppConfigData((current) => ({ ...current, [field]: value }));
  };

  const updateNested = (group, field, value) => {
    setAppConfigData((current) => ({
      ...current,
      [group]: { ...current[group], [field]: value },
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const payload = {
      appName: appConfigData.appName.trim(),
      appVersion: appConfigData.appVersion.trim(),
      description: appConfigData.description.trim(),
      contactInfo: {
        whatsappNumber: appConfigData.contactInfo.whatsappNumber.trim(),
        email: appConfigData.contactInfo.email.trim(),
        workingHours: appConfigData.contactInfo.workingHours.trim(),
      },
      socialMediaLinks: {
        facebook: appConfigData.socialMediaLinks.facebook.trim(),
        instagram: appConfigData.socialMediaLinks.instagram.trim(),
      },
    };

    try {
      setSaving(true);
      setError("");
      const save = hasConfig ? updateAppConfig : createAppConfig;
      const result = await save(payload);
      setAppConfigData({ ...emptyConfig, ...result.data });
      setHasConfig(true);
      setNotice(hasConfig ? "Settings updated" : "Settings created");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to save app settings"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      setError("");
      await deleteAppConfig();
      setAppConfigData(emptyConfig);
      setHasConfig(false);
      setConfirmDelete(false);
      setNotice("App settings deleted");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to delete app settings"
      );
    } finally {
      setSaving(false);
    }
  };

  const textField = (label, value, onChange, options = {}) => (
    <TextField
      fullWidth
      label={t(label)}
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      disabled={loading || saving}
      {...options}
    />
  );

  return (
    <Box m="20px">
      <Header title="Settings" subtitle="Application configuration" />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t(error)}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSave} maxWidth="1000px">
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            {textField("App name", appConfigData.appName, (value) => updateTopLevel("appName", value), { required: true })}
          </Grid>
          <Grid item xs={12} md={4}>
            {textField("App version", appConfigData.appVersion, (value) => updateTopLevel("appVersion", value), { required: true })}
          </Grid>
          <Grid item xs={12}>
            {textField("Description", appConfigData.description, (value) => updateTopLevel("description", value), { required: true, multiline: true, minRows: 3 })}
          </Grid>
          <Grid item xs={12}>
            {textField("WhatsApp number", appConfigData.contactInfo.whatsappNumber, (value) => updateNested("contactInfo", "whatsappNumber", value), { required: true, inputProps: { maxLength: 11 } })}
          </Grid>
          <Grid item xs={12} md={6}>
            {textField("Contact email", appConfigData.contactInfo.email, (value) => updateNested("contactInfo", "email", value), { required: true, type: "email" })}
          </Grid>
          <Grid item xs={12} md={6}>
            {textField("Working hours", appConfigData.contactInfo.workingHours, (value) => updateNested("contactInfo", "workingHours", value), { required: true })}
          </Grid>
          <Grid item xs={12} md={6}>
            {textField("Facebook URL", appConfigData.socialMediaLinks.facebook, (value) => updateNested("socialMediaLinks", "facebook", value), { type: "url" })}
          </Grid>
          <Grid item xs={12} md={6}>
            {textField("Instagram URL", appConfigData.socialMediaLinks.instagram, (value) => updateNested("socialMediaLinks", "instagram", value), { type: "url" })}
          </Grid>
          {hasConfig && (
            <>
              <Grid item xs={12} md={4}>
                {textField("Courts", appConfigData.stats.courtsCount, () => {}, { disabled: true })}
              </Grid>
              <Grid item xs={12} md={4}>
                {textField("Governorates", appConfigData.stats.governoratesCount, () => {}, { disabled: true })}
              </Grid>
              <Grid item xs={12} md={4}>
                {textField("Last data update", appConfigData.stats.lastDataUpdate ? new Date(appConfigData.stats.lastDataUpdate).toLocaleString() : "", () => {}, { disabled: true })}
              </Grid>
            </>
          )}
          <Grid item xs={12} display="flex" justifyContent="space-between" gap={2}>
            {hasConfig && (
              <Button
                color="error"
                variant="outlined"
                startIcon={<DeleteOutlineOutlinedIcon />}
                onClick={() => setConfirmDelete(true)}
                disabled={saving || loading}
              >
                Delete settings
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              startIcon={<SaveOutlinedIcon />}
              disabled={saving || loading}
              sx={{ ml: "auto" }}
            >
              {saving ? "Saving..." : hasConfig ? "Save changes" : "Create settings"}
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Dialog open={confirmDelete} onClose={() => !saving && setConfirmDelete(false)}>
        <DialogTitle>Delete app settings?</DialogTitle>
        <DialogContent>
          <DialogContentText>This removes the app configuration record.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} disabled={saving}>Cancel</Button>
          <Button color="error" onClick={handleDelete} disabled={saving}>
            {saving ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={4000} onClose={() => setNotice("")}>
        <Alert severity="success" onClose={() => setNotice("")}>{t(notice)}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;