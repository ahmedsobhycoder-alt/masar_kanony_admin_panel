import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useTranslation } from "react-i18next";
import ResourceTable from "../../components/ResourceTable";
import {
  createGovernorate,
  deleteGovernorate,
  getGovernorates,
  updateGovernorate,
} from "../../api/governorates";

const columns = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
];

export default function Governorates() {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await createGovernorate(name.trim());
      setCreateOpen(false);
      setName("");
      setTableKey((key) => key + 1);
      setNotice("Governorate created successfully");
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Failed to create governorate");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ResourceTable
        key={tableKey}
        title="Governorates"
        subtitle="List of Governorates"
        getPage={getGovernorates}
        columns={columns}
        headerActions={(
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ mb: "30px", flexShrink: 0 }}
          >
            {t("New Governorate")}
          </Button>
        )}
        crud={{
          update: updateGovernorate,
          remove: deleteGovernorate,
          fields: [{ name: "name", label: "Governorate name" }],
        }}
      />
      {error && <Alert severity="error" sx={{ mx: 3, mb: 2 }}>{t(error)}</Alert>}
      <Dialog open={createOpen} onClose={() => !saving && setCreateOpen(false)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handleCreate}>
          <DialogTitle>{t("New Governorate")}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              fullWidth
              margin="dense"
              label={t("Governorate name")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              inputProps={{ maxLength: 100 }}
              disabled={saving}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateOpen(false)} disabled={saving}>{t("Cancel")}</Button>
            <Button type="submit" variant="contained" color="secondary" disabled={!name.trim() || saving}>
              {saving ? t("Creating...") : t("Create")}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice("")}>
        <Alert severity="success" onClose={() => setNotice("")}>{t(notice)}</Alert>
      </Snackbar>
    </>
  );
}
