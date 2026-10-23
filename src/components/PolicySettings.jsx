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
  IconButton,
  Snackbar,
  TextField,
  Tooltip,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Header from "./Header";
import {
  createAppPolicy,
  deleteAppPolicy,
  getAppPolicy,
  updateAppPolicy,
} from "../api/settings";

const emptyPolicy = () => ({
  intro: "",
  sections: [{ sectionTitle: "", sectionContent: "" }],
});

const PolicySettings = ({ type, title, subtitle }) => {
  const { t } = useTranslation();
  const [policyData, setPolicyData] = useState(emptyPolicy);
  const [hasPolicy, setHasPolicy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadPolicy = async () => {
      try {
        setLoading(true);
        const result = await getAppPolicy(type);
        if (isMounted && result.data) {
          setPolicyData({
            intro: result.data.intro || "",
            sections: result.data.sections?.length
              ? result.data.sections.map((section) => ({
                  sectionTitle: section.sectionTitle || "",
                  sectionContent: section.sectionContent || "",
                }))
              : emptyPolicy().sections,
          });
          setHasPolicy(true);
        }
      } catch (requestError) {
        if (isMounted && requestError.response?.status !== 404) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              `Failed to load ${title.toLowerCase()}`
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadPolicy();
    return () => {
      isMounted = false;
    };
  }, [type, title]);

  const updateSection = (index, field, value) => {
    setPolicyData((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section
      ),
    }));
  };

  const addSection = () => {
    setPolicyData((current) => ({
      ...current,
      sections: [...current.sections, { sectionTitle: "", sectionContent: "" }],
    }));
  };

  const removeSection = (index) => {
    setPolicyData((current) => ({
      ...current,
      sections: current.sections.filter((_, sectionIndex) => sectionIndex !== index),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const payload = {
      type,
      intro: policyData.intro.trim(),
      sections: policyData.sections.map((section, index) => ({
        order: index + 1,
        sectionTitle: section.sectionTitle.trim(),
        sectionContent: section.sectionContent.trim(),
      })),
    };

    try {
      setSaving(true);
      setError("");
      if (hasPolicy) {
        await updateAppPolicy(type, payload);
      } else {
        await createAppPolicy(type, payload);
        setHasPolicy(true);
      }
      setNotice(hasPolicy ? "Policy updated" : "Policy created");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          `Failed to save ${title.toLowerCase()}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      setError("");
      await deleteAppPolicy(type);
      setPolicyData(emptyPolicy());
      setHasPolicy(false);
      setConfirmDelete(false);
      setNotice("Policy deleted");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          `Failed to delete ${title.toLowerCase()}`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box m="20px">
      <Header title={title} subtitle={subtitle} />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t(error)}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSave} maxWidth="1000px">
        <TextField
          fullWidth
          required
          multiline
          minRows={3}
          label={t("Introduction")}
          value={policyData.intro}
          onChange={(event) => setPolicyData((current) => ({ ...current, intro: event.target.value }))}
          disabled={loading || saving}
          sx={{ mb: 3 }}
        />
        {policyData.sections.map((section, index) => (
          <Box key={index} sx={{ borderTop: 1, borderColor: "divider", py: 2.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box component="h3" sx={{ fontSize: 16, fontWeight: 700, m: 0 }}>
                {t("Section {{number}}", { number: index + 1 })}
              </Box>
              <Tooltip title={t("Remove section")}>
                <span>
                  <IconButton
                    aria-label={`Remove section ${index + 1}`}
                    color="error"
                    onClick={() => removeSection(index)}
                    disabled={loading || saving || policyData.sections.length === 1}
                  >
                    <DeleteOutlineOutlinedIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label={t("Section title")}
                  value={section.sectionTitle}
                  onChange={(event) => updateSection(index, "sectionTitle", event.target.value)}
                  disabled={loading || saving}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  minRows={4}
                  label={t("Section content")}
                  value={section.sectionContent}
                  onChange={(event) => updateSection(index, "sectionContent", event.target.value)}
                  disabled={loading || saving}
                />
              </Grid>
            </Grid>
          </Box>
        ))}
        <Box display="flex" justifyContent="space-between" gap={2} mt={2}>
          <Button
            type="button"
            startIcon={<AddOutlinedIcon />}
            onClick={addSection}
            disabled={loading || saving}
          >
            {t("Add section")}
          </Button>
          <Box display="flex" gap={1.5}>
            {hasPolicy && (
              <Button
                color="error"
                variant="outlined"
                startIcon={<DeleteOutlineOutlinedIcon />}
                onClick={() => setConfirmDelete(true)}
                disabled={loading || saving}
              >
                {t("Delete")}
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              startIcon={<SaveOutlinedIcon />}
              disabled={loading || saving}
            >
              {saving ? t("Saving...") : hasPolicy ? t("Save changes") : t("Create policy")}
            </Button>
          </Box>
        </Box>
      </Box>
      <Dialog open={confirmDelete} onClose={() => !saving && setConfirmDelete(false)}>
        <DialogTitle>{t(type === "termsAndConditions" ? "Delete terms & conditions?" : "Delete privacy policy?")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("This permanently removes the policy and its sections.")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} disabled={saving}>{t("Cancel")}</Button>
          <Button color="error" onClick={handleDelete} disabled={saving}>
            {saving ? t("Deleting...") : t("Delete")}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={4000} onClose={() => setNotice("")}>
        <Alert severity="success" onClose={() => setNotice("")}>{t(notice)}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PolicySettings;