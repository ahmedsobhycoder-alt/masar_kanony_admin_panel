import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useTranslation } from "react-i18next";
import { FloorOffices } from "../../components/OfficeEditor";
import Header from "../../components/Header";
import { getCourtById, getCourtTypes, updateCourt, updateFloor, createFloor, getFloorNames } from "../../api/adminResources";
import { getGovernorates } from "../../api/governorates";

const fields = [
  ["name", "Court"], ["address", "Address"],
  ["governorate", "Governorate"], ["courtType", "Court type"],
  ["startingWorkingHours", "Starting working hours"], ["endWorkingHours", "End working hours"],
];
const errorMessage = (error) => error.response?.data?.message || error.message || "Update failed";
const imageUrl = (value) => !value ? "" : value.startsWith("http") || value.startsWith("/") ? value : `/uploads/floors/${value}`;
const loadOptions = async (getPage) => {
  const items = [];
  let page = 1;
  let result;
  do {
    result = await getPage({ page, limit: 100 });
    items.push(...(result.data?.list || []));
    page += 1;
  } while (result.data?.paginationResult?.next);
  return items;
};

function FloorEditor({ floor, names, onSaved }) {
  const { t } = useTranslation();
  const busy = useRef(false);
  const [name, setName] = useState(floor.floorName || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fileKey, setFileKey] = useState(0);

  useEffect(() => {
    if (!image) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const save = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    setError("");
    setNotice("");
    if (!name.trim()) { setError("Floor name is required"); return; }
    if (image && (!image.type.startsWith("image/") || image.size > 2000000)) {
      setError("Choose an image no larger than 2 MB.");
      return;
    }
    busy.current = true;
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("floorName", name.trim());
      if (image) payload.append("image", image);
      const result = await updateFloor(floor._id || floor.id, payload);
      onSaved({ ...floor, ...result.data });
      setName(result.data.floorName);
      setImage(null);
      setFileKey((previous) => previous + 1);
      setNotice("Changes saved");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={save} sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" mb={2}>{floor.floorName}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{t(error)}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{t(notice)}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          {(preview || floor.image) && <Box component="img" src={preview || imageUrl(floor.image)} alt={t("Floor image")} sx={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 1 }} />}
        </Grid>
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            <TextField select required fullWidth label={t("Floor name")} value={name} disabled={saving} onChange={(event) => setName(event.target.value)}>
              {[...new Set([floor.floorName, ...names.map((item) => item.name)])].filter(Boolean).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>
            <TextField key={fileKey} type="file" label={t("Replace floor image")} InputLabelProps={{ shrink: true }} inputProps={{ accept: "image/*" }} helperText={t("Leave empty to keep the current image. Maximum 2 MB.")} disabled={saving} onChange={(event) => setImage(event.target.files?.[0] || null)} />
            <Box><Button variant="contained" type="submit" disabled={saving}>{t(saving ? "Saving..." : "Save floor")}</Button></Box>
            <Typography variant="body2">{t("{{count}} offices", { count: floor.nOfficesPerFloor ?? floor.offices?.length ?? 0 })}</Typography>

          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

function AddFloor({ courtId, names, onAdded }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fileKey, setFileKey] = useState(0);
  const busy = useRef(false);
  const save = async (event) => {
    event.preventDefault();
    if (busy.current || !name || !image) return;
    if (!image.type.startsWith("image/") || image.size > 2000000) { setError("Choose an image no larger than 2 MB."); return; }
    busy.current = true; setSaving(true); setError("");
    try {
      const payload = new FormData();
      payload.append("court", courtId); payload.append("floorName", name); payload.append("image", image);
      const result = await createFloor(payload);
      onAdded(result.data); setName(""); setImage(null); setFileKey((key) => key + 1);
    } catch (err) { setError(errorMessage(err)); }
    finally { busy.current = false; setSaving(false); }
  };
  return <Box component="form" onSubmit={save} className="court-detail-panel"><Stack spacing={2}>
    <Typography variant="h5">{t("Add floors")}</Typography>
    {error && <Alert severity="error">{t(error)}</Alert>}
    <TextField select required label={t("Floor name")} value={name} disabled={saving} onChange={(event) => setName(event.target.value)}>{names.map((item) => <MenuItem key={item._id || item.id} value={item._id || item.id}>{item.name}</MenuItem>)}</TextField>
    <TextField key={fileKey} type="file" required label={t("Floor image")} InputLabelProps={{ shrink: true }} inputProps={{ accept: "image/*" }} disabled={saving} onChange={(event) => setImage(event.target.files?.[0] || null)} />
    <Button type="submit" variant="contained" disabled={saving || !name || !image}>{t(saving ? "Saving..." : "Add floor")}</Button>
  </Stack></Box>;
}

export default function EditCourt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const busy = useRef(false);
  const [court, setCourt] = useState(null);
  const [values, setValues] = useState({});
  const [options, setOptions] = useState({ governorate: [], courtType: [], floorNames: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setCourt(null);
    Promise.all([getCourtById(id), loadOptions(getGovernorates), loadOptions(getCourtTypes), loadOptions(getFloorNames)])
      .then(([result, governorates, courtTypes, floorNames]) => {
        if (!active) return;
        if (!result.data) throw new Error("Court not found");
        setCourt(result.data);
        setValues(Object.fromEntries(fields.map(([name]) => [name, result.data[name] || ""])));
        setOptions({ governorate: governorates, courtType: courtTypes, floorNames });
      })
      .catch((requestError) => { if (active) setError(errorMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, reload]);

  const save = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = Object.fromEntries(fields.map(([name]) => [name, values[name].trim()]));
      const result = await updateCourt(id, payload);
      setCourt((previous) => ({ ...previous, ...result.data, floors: previous.floors }));
      setNotice("Changes saved");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const locale = i18n.resolvedLanguage?.startsWith("ar") ? "ar-EG" : "en-US";

  return (
    <Box m={{ xs: 2, md: 3 }}>
      <Button startIcon={<ArrowBackRoundedIcon />} disabled={saving} onClick={() => navigate("/courts")} sx={{ mb: 1.5 }}>{t("Back to courts")}</Button>
      <Button onClick={() => navigate(`/courts/activity?court=${id}`)} sx={{ mb: 1.5 }}>{t("View history")}</Button>
      <Header title="Edit court" subtitle={court?.name || "Court information"} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{t(error)}{!court && <Button disabled={loading} onClick={() => setReload((previous) => previous + 1)}>{t("Retry")}</Button>}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{t(notice)}</Alert>}
      {loading && <CircularProgress />}
      {!loading && court && <Stack spacing={3}>
        <Box component="form" onSubmit={save} className="court-detail-panel">
          <Typography variant="h5" mb={2}>{t("Court information")}</Typography>
          <Grid container spacing={2}>
            {fields.map(([name, label]) => <Grid item xs={12} sm={6} key={name}>
              <TextField fullWidth label={t(label)} value={values[name]} disabled={saving} required={!name.includes("WorkingHours")} select={!!options[name]} type={name.includes("WorkingHours") ? "time" : "text"} InputLabelProps={{ shrink: true }} onChange={(event) => setValues({ ...values, [name]: event.target.value })} inputProps={name.includes("WorkingHours") || options[name] ? {} : { pattern: ".*\\S.*" }}>
                {options[name] && [...new Set([values[name], ...options[name].map((item) => item.name)])].filter(Boolean).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
              </TextField>
            </Grid>)}
          </Grid>
          <Button type="submit" variant="contained" disabled={saving} sx={{ mt: 2 }}>{t(saving ? "Saving..." : "Save court")}</Button>
          <Grid container spacing={2} mt={1}>
            {[["Floors", court.nFloors ?? court.floors?.length ?? 0], ["Offices", court.nOffices ?? 0], ["Views", court.nViews ?? 0], ["Created", court.createdAt ? new Date(court.createdAt).toLocaleString(locale) : "—"], ["Last updated", court.updatedAt ? new Date(court.updatedAt).toLocaleString(locale) : "—"]].map(([label, value]) => <Grid item xs={12} sm={4} key={label}><Typography variant="caption" color="text.secondary">{t(label)}</Typography><Typography>{value}</Typography></Grid>)}
          </Grid>
          <Typography variant="caption" color="text.secondary">ID: {court._id || court.id}</Typography>
        </Box>
        <Typography variant="h4">{t("Floors and offices")}</Typography>
        <AddFloor names={options.floorNames} courtId={id} onAdded={(floor) => setCourt((previous) => ({ ...previous, nFloors: (previous.nFloors ?? previous.floors?.length ?? 0) + 1, floors: [...(previous.floors || []), floor] }))} />
        {court.floors?.length ? court.floors.map((floor) => <Box key={floor._id || floor.id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden", bgcolor: "background.paper" }}><FloorEditor names={options.floorNames} key={floor._id || floor.id} floor={floor} onSaved={(updated) => setCourt((previous) => ({ ...previous, floors: previous.floors.map((item) => (item._id || item.id) === (updated._id || updated.id) ? { ...updated, offices: item.offices } : item) }))} /><FloorOffices floor={floor} onChanged={(offices) => setCourt(previous => ({ ...previous, nOffices: (previous.nOffices || 0) + offices.length - (floor.offices?.length || 0), floors: previous.floors.map(item => (item._id || item.id) === (floor._id || floor.id) ? { ...item, offices, nOfficesPerFloor: offices.length } : item) }))} /></Box>) : <Alert severity="info">{t("No floor details available.")}</Alert>}
      </Stack>}
    </Box>
  );
}
