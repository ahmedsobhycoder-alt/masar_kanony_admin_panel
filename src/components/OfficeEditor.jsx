import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Grid, Typography, Chip, IconButton, InputAdornment, CircularProgress } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useTranslation } from "react-i18next";
import { createOffice, updateOffice, deleteOffice, getOfficeTypes } from "../api/adminResources";
export const officeFields = [
  ["roomNumber", "Room"], ["locationDirection", "Location"], ["description", "Description"],
  ["startingWorkingHours", "Opens"], ["endWorkingHours", "Closes"],
  ["services", "Services (comma-separated)"], ["mapUrl", "Map URL"],
];
const message = (error) => error.response?.data?.errors?.map(item => item.msg || item.message).join(", ") || error.response?.data?.message || error.message;
export default function OfficeEditor({ office, floorId, floorName, onClose, onSaved }) {
  const { t } = useTranslation();
  const busy = useRef(false);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState(() => ({
    officeType: office?.officeType?._id || office?.officeType || "",
    ...Object.fromEntries(officeFields.map(([key]) => [key, key === "services" ? (office?.services || []).join(", ") : office?.[key] || (key === "startingWorkingHours" ? "10:00" : key === "endWorkingHours" ? "20:00" : "")])),
  }));
  useEffect(() => {
    let active = true;
    (async () => {
      const items = [];
      let page = 1;
      let result;
      do {
        result = await getOfficeTypes({ page: page++, limit: 100 });
        items.push(...(result.data?.list || []));
      } while (result.data?.paginationResult?.next);
      if (active) setTypes(items);
    })().catch(error => { if (active) setError(message(error)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const save = async event => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true; setSaving(true); setError("");
    try {
      const payload = { ...values, roomNumber: values.roomNumber.trim(), services: values.services.split(",").map(value => value.trim()).filter(Boolean) };
      // Omit the optional empty location on creation.
      if (!office && !payload.locationDirection) delete payload.locationDirection;
      const result = office ? await updateOffice(office._id || office.id, payload) : await createOffice({ ...payload, floor: floorId });
      onSaved(result.data);
      onClose();
    } catch (error) { setError(message(error)); }
    finally { busy.current = false; setSaving(false); }
  };
  const field = (key, label, wide = false) => <Grid item xs={12} sm={wide ? 12 : 6} key={key}>
    <TextField fullWidth label={t(label)} required={key === "roomNumber"} value={values[key]} disabled={saving} multiline={key === "description"} minRows={key === "description" ? 2 : undefined} type={key.includes("WorkingHours") ? "time" : "text"} InputLabelProps={{ shrink: true }} helperText={key === "services" ? t("Separate services with commas") : undefined} onChange={event => setValues({ ...values, [key]: event.target.value })} />
  </Grid>;
  return <Dialog open onClose={() => !saving && onClose()} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
    <Box component="form" onSubmit={save}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 2 }}>
        <Box sx={{ bgcolor: "action.hover", p: 1.25, borderRadius: 2, display: "flex" }}><BusinessRoundedIcon color="secondary" /></Box>
        <Box flex={1}><Typography variant="h5" fontWeight={700}>{t(office ? "Edit office" : "Add office")}</Typography><Typography variant="body2" color="text.secondary">{floorName || office?.floorName || t("Office details")}</Typography></Box>
        <IconButton aria-label={t("Close")} disabled={saving} onClick={onClose}><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{t(error)}</Alert>}
          {!loading && !types.length && <Alert severity="info">{t("No office types available")}</Alert>}
          <Box><Typography fontWeight={700} mb={2}>{t("Office details")}</Typography><Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth select required label={t("Office type")} value={values.officeType} disabled={saving || loading} helperText={loading ? t("Loading") : " "} onChange={event => setValues({ ...values, officeType: event.target.value })}>
              {types.map(type => <MenuItem key={type._id || type.id} value={type._id || type.id}>{type.name}</MenuItem>)}
            </TextField></Grid>
            {field("roomNumber", "Room")}{field("locationDirection", "Location", true)}{field("description", "Description", true)}
          </Grid></Box>
          <Box><Typography fontWeight={700} mb={2}>{t("Working hours")}</Typography><Grid container spacing={2}>{field("startingWorkingHours", "Opens")}{field("endWorkingHours", "Closes")}</Grid></Box>
          <Box><Typography fontWeight={700} mb={2}>{t("Services and map")}</Typography><Grid container spacing={2}>{field("services", "Services (comma-separated)", true)}{field("mapUrl", "Map URL", true)}</Grid></Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}><Button disabled={saving} onClick={onClose}>{t("Cancel")}</Button><Button variant="contained" color="secondary" type="submit" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : !office ? <AddRoundedIcon /> : undefined} disabled={saving || loading || !types.length}>{t(saving ? "Saving..." : office ? "Save changes" : "Add office")}</Button></DialogActions>
    </Box>
  </Dialog>;
}

export function FloorOffices({ floor, onChanged }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(undefined);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const remove = async () => {
    if (saving) return;
    setSaving(true); setError("");
    try {
      await deleteOffice(deleting._id || deleting.id);
      onChanged((floor.offices || []).filter(item => (item._id || item.id) !== (deleting._id || deleting.id)));
      setDeleting(null);
    } catch (error) { setError(message(error)); }
    finally { setSaving(false); }
  };
  const offices = floor.offices || [];
  const visible = offices.filter(office => [office.name, office.officeType?.name, office.roomNumber, office.locationDirection, ...(office.services || [])].filter(Boolean).join(" ").toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return <Stack spacing={2.5} sx={{ p: { xs: 2, md: 3 }, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2}>
      <Box><Stack direction="row" alignItems="center" spacing={1}><Typography variant="h5" fontWeight={700}>{t("Offices")}</Typography><Chip size="small" label={offices.length} /></Stack><Typography variant="body2" color="text.secondary" mt={0.5}>{t("Manage offices on this floor")}</Typography></Box>
      <Button variant="contained" color="secondary" startIcon={<AddRoundedIcon />} onClick={() => setEditing(null)}>{t("Add office")}</Button>
    </Stack>
    {offices.length > 0 && <TextField size="small" fullWidth placeholder={t("Search offices on this floor")} inputProps={{ "aria-label": t("Search offices on this floor") }} value={search} onChange={event => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }} />}
    {!offices.length ? <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, textAlign: "center", py: 5, px: 2 }}>
      <BusinessRoundedIcon sx={{ color: "text.disabled", fontSize: 40, mb: 1 }} /><Typography fontWeight={700}>{t("No offices on this floor.")}</Typography><Typography variant="body2" color="text.secondary" mt={0.75}>{t("Add the first office when you are ready")}</Typography>
    </Box> : !visible.length ? <Alert severity="info">{t("No matching offices")}</Alert> : <Grid container spacing={2} sx={{ width: "auto" }}>
      {visible.map(office => <Grid item xs={12} md={6} xl={4} key={office._id || office.id}>
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2.5, height: "100%", display: "flex", flexDirection: "column", gap: 1.75, transition: "box-shadow 180ms", "&:hover": { boxShadow: "0 4px 18px rgba(0,0,0,0.06)" } }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}><Typography variant="h6" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>{office.name || office.officeType?.name || t("Office")}</Typography><Chip size="small" variant="outlined" label={`${t("Room")} ${office.roomNumber}`} /></Stack>
          {office.locationDirection && <Stack direction="row" spacing={1} alignItems="flex-start"><PlaceOutlinedIcon fontSize="small" color="action" /><Typography variant="body2">{office.locationDirection}</Typography></Stack>}
          {office.description && <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{office.description}</Typography>}
          {(office.startingWorkingHours || office.endWorkingHours) && <Stack direction="row" spacing={1} alignItems="center"><AccessTimeRoundedIcon fontSize="small" color="action" /><Typography variant="body2" dir="ltr">{office.startingWorkingHours || "--:--"} - {office.endWorkingHours || "--:--"}</Typography></Stack>}
          {!!office.services?.length && <Box display="flex" flexWrap="wrap" gap={0.75}>{office.services.map((service, index) => <Chip key={`${service}-${index}`} label={service} size="small" sx={{ maxWidth: "100%" }} />)}</Box>}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: "auto", pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
            <Box>{office.mapUrl && /^(https?:\/\/)/i.test(office.mapUrl) && <Button size="small" component="a" href={office.mapUrl} target="_blank" rel="noopener noreferrer">{t("View map")}</Button>}</Box>
            <Stack direction="row" spacing={0.5}><Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setEditing(office)}>{t("Edit")}</Button><IconButton size="small" color="error" aria-label={`${t("Delete")} ${office.name || office.roomNumber}`} onClick={() => { setError(""); setDeleting(office); }}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Stack>
          </Stack>
        </Box>
      </Grid>)}
    </Grid>}
    {editing !== undefined && <OfficeEditor office={editing} floorName={floor.floorName || floor.name} floorId={floor._id || floor.id} onClose={() => setEditing(undefined)} onSaved={saved => onChanged(editing ? floor.offices.map(item => (item._id || item.id) === (saved._id || saved.id) ? saved : item) : [...(floor.offices || []), saved])} />}
    <Dialog open={!!deleting} onClose={() => !saving && setDeleting(null)}>
      <DialogTitle>{t("Delete this item?")}</DialogTitle>
      <DialogContent>{deleting?.name} / {deleting?.roomNumber}{error && <Alert severity="error">{t(error)}</Alert>}</DialogContent>
      <DialogActions><Button disabled={saving} onClick={() => setDeleting(null)}>{t("Cancel")}</Button><Button color="error" disabled={saving} onClick={remove}>{t("Delete")}</Button></DialogActions>
    </Dialog>
  </Stack>;
}
