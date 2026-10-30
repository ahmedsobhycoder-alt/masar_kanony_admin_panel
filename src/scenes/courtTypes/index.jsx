import { useCallback, useRef, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useTranslation } from "react-i18next";
import ResourceTable from "../../components/ResourceTable";
import { createCourtType, deleteCourtType, getCourtTypes, updateCourtType } from "../../api/adminResources";

const columns = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "name", headerName: "Court type", flex: 1, minWidth: 180 },
  { field: "description", headerName: "Description", flex: 2, minWidth: 240 },
];

export default function CourtTypes() {
  const { t } = useTranslation();
  const busy = useRef(false);
  const [creating, setCreating] = useState(false);
  const [values, setValues] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const getPage = useCallback(
    (params) => getCourtTypes({ ...params, ...(search.trim() ? { name: search.trim() } : {}) }),
    [search],
  );
  const create = async (event) => {
    event.preventDefault();
    if (busy.current || !values.name.trim()) return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      await createCourtType({ name: values.name.trim(), description: values.description.trim() });
      setCreating(false);
      setRevision((value) => value + 1);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.map((item) => item.msg || item.message).join(", ") || requestError.response?.data?.message || requestError.message);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const openCreate = () => {
    setValues({ name: "", description: "" });
    setError("");
    setCreating(true);
  };
  return <>
    <ResourceTable
      key={revision}
      title="Court Types"
      subtitle="Manage court classifications"
      getPage={getPage}
      queryKey={search}
      columns={columns}
      headerActions={<Button variant="contained" color="secondary" startIcon={<AddRoundedIcon />} onClick={openCreate}>{t("Create court type")}</Button>}
      filterControls={<TextField size="small" label={t("Search by name")} value={search} onChange={(event) => setSearch(event.target.value)} sx={{ mb: 2 }} />}
      crud={{
        update: updateCourtType,
        remove: deleteCourtType,
        fields: [
          { name: "name", label: "Court type" },
          { name: "description", label: "Description", multiline: true, required: false },
        ],
      }}
    />
    <Dialog open={creating} onClose={() => !saving && setCreating(false)} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={create}>
        <DialogTitle>{t("Create court type")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            {error && <Alert severity="error">{t(error)}</Alert>}
            <TextField id="new-court-type-name" autoFocus required fullWidth label={t("Court type")} value={values.name} disabled={saving} inputProps={{ maxLength: 100 }} onChange={(event) => setValues({ ...values, name: event.target.value })} />
            <TextField id="new-court-type-description" fullWidth multiline minRows={3} label={t("Description")} value={values.description} disabled={saving} onChange={(event) => setValues({ ...values, description: event.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button disabled={saving} onClick={() => setCreating(false)}>{t("Cancel")}</Button>
          <Button disabled={saving || !values.name.trim()} color="secondary" variant="contained" type="submit">{t(saving ? "Creating..." : "Create")}</Button>
        </DialogActions>
      </Box>
    </Dialog>
  </>;
}
