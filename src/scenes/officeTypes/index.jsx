import { useCallback, useRef, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useTranslation } from "react-i18next";
import ResourceTable from "../../components/ResourceTable";
import { createOfficeType, deleteOfficeType, getOfficeTypes, updateOfficeType } from "../../api/adminResources";

const columns = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "name", headerName: "Office type", flex: 1, minWidth: 180 },
  { field: "description", headerName: "Description", flex: 2, minWidth: 240 },
];
export default function OfficeTypes() {
  const { t } = useTranslation();
  const busy = useRef(false);
  const [creating, setCreating] = useState(false);
  const [values, setValues] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const getPage = useCallback(params => getOfficeTypes({ ...params, ...(search.trim() ? { name: search.trim() } : {}) }), [search]);
  const create = async event => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true; setSaving(true); setError("");
    try {
      await createOfficeType({ ...values, name: values.name.trim() });
      setCreating(false); setRevision(value => value + 1);
    } catch (error) { setError(error.response?.data?.errors?.map(item => item.msg || item.message).join(", ") || error.response?.data?.message || error.message); }
    finally { busy.current = false; setSaving(false); }
  };
  return <>
    <ResourceTable key={revision} title="Office Types" subtitle="Manage office classifications" columns={columns} getPage={getPage} queryKey={search}
      headerActions={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => { setValues({ name: "", description: "" }); setError(""); setCreating(true); }}>{t("Create office type")}</Button>}
      filterControls={<TextField size="small" label={t("Search by name")} value={search} onChange={event => setSearch(event.target.value)} sx={{ mb: 2 }} />}
      crud={{ update: updateOfficeType, remove: deleteOfficeType, fields: [
        { name: "name", label: "Office type" },
        { name: "description", label: "Description", multiline: true, required: false },
      ] }} />
    <Dialog open={creating} onClose={() => !saving && setCreating(false)} fullWidth maxWidth="sm"><Box component="form" onSubmit={create}>
      <DialogTitle>{t("Create office type")}</DialogTitle>
      <DialogContent><Stack spacing={2} pt={1}>{error && <Alert severity="error">{t(error)}</Alert>}
        <TextField required label={t("Office type")} value={values.name} disabled={saving} onChange={event => setValues({ ...values, name: event.target.value })} />
        <TextField multiline minRows={3} label={t("Description")} value={values.description} disabled={saving} onChange={event => setValues({ ...values, description: event.target.value })} />
      </Stack></DialogContent>
      <DialogActions><Button disabled={saving} onClick={() => setCreating(false)}>{t("Cancel")}</Button><Button disabled={saving} variant="contained" type="submit">{t(saving ? "Saving..." : "Create office type")}</Button></DialogActions>
    </Box></Dialog>
  </>;
}
