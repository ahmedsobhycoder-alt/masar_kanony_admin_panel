import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Grid, MenuItem, Stack, Step, StepLabel, Stepper, TextField, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useTranslation } from "react-i18next";
import { FloorOffices } from "../../components/OfficeEditor";
import Header from "../../components/Header";
import { createCourt, createFloor, getCourtTypes, getFloorNames } from "../../api/adminResources";
import { getGovernorates } from "../../api/governorates";

const loadOptions = async (getPage) => {
  const options = [];
  let page = 1;
  let result;
  do {
    result = await getPage({ page, limit: 100 });
    options.push(...(result.data?.list || []));
    page += 1;
  } while (result.data?.paginationResult?.next);
  return options;
};

const requestMessage = (error) => {
  const errors = error.response?.data?.errors;
  return (Array.isArray(errors) && errors.map((item) => item.msg || item.message).filter(Boolean).join(" — ")) ||
    error.response?.data?.message || error.message || "Save failed";
};

export default function CreateCourt() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const submitting = useRef(false);
  const [options, setOptions] = useState({ governorates: [], courtTypes: [], floorNames: [] });
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [court, setCourt] = useState(null);
  const [values, setValues] = useState({ name: "", address: "", governorate: "", courtType: "", startingWorkingHours: "", endWorkingHours: "" });
  const [floorName, setFloorName] = useState("");
  const [image, setImage] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [floors, setFloors] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([loadOptions(getGovernorates), loadOptions(getCourtTypes), loadOptions(getFloorNames)])
      .then(([governorates, courtTypes, floorNames]) => {
        if (active) setOptions({ governorates, courtTypes, floorNames });
      })
      .catch((requestError) => { if (active) setError(requestMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  const saveCourt = async (event) => {
    event.preventDefault();
    if (submitting.current || court) return;
    submitting.current = true;
    setSaving(true);
    setError("");
    try {
      const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]).filter(([, value]) => value));
      const result = await createCourt(payload);
      setCourt(result.data);
    } catch (requestError) {
      setError(requestMessage(requestError));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  const saveFloor = async (event) => {
    event.preventDefault();
    if (submitting.current || !court || !floorName || !image) return;
    if (!image.type.startsWith("image/") || image.size > 2000000) {
      setError("Choose an image no larger than 2 MB.");
      return;
    }
    submitting.current = true;
    setSaving(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("court", court._id || court.id);
      payload.append("floorName", floorName);
      payload.append("image", image);
      const floorResult = await createFloor(payload);
      const name = options.floorNames.find((item) => (item._id || item.id) === floorName)?.name;
      setFloors((previous) => [...previous, { ...floorResult.data, floorNameId: floorName, name, offices: [] }]);
      setFloorName("");
      setImage(null);
      setFileKey((previous) => previous + 1);
    } catch (requestError) {
      setError(requestMessage(requestError));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return (
    <Box m={{ xs: 2, md: 3 }} maxWidth={1000}>
      <Button startIcon={<ArrowBackRoundedIcon />} disabled={saving} onClick={() => navigate("/courts")} sx={{ mb: 1.5 }}>{t("Back to courts")}</Button>
      <Header title="Create court" subtitle="Create a court, then add its floors on this page" />
      <Stepper activeStep={court ? 1 : 0} sx={{ mb: 3 }}>
        {["Court information", "Add floors"].map((label) => <Step key={label}><StepLabel>{t(label)}</StepLabel></Step>)}
      </Stepper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{t(error)}{!court && <Button onClick={() => setReload((previous) => previous + 1)} disabled={loading || saving}>{t("Retry")}</Button>}</Alert>}
      {loading ? <CircularProgress aria-label={t("Loading")} /> : (
        <Stack spacing={3}>
          <Box component="form" onSubmit={saveCourt} className="court-detail-panel">
            <Typography variant="h5" mb={2}>{t("Court information")}</Typography>
            <Grid container spacing={2}>
              {[ ["name", "Court"], ["address", "Address"] ].map(([name, label]) => (
                <Grid item xs={12} sm={6} key={name}><TextField fullWidth required disabled={!!court || saving} label={t(label)} value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })} inputProps={{ pattern: ".*\\S.*" }} /></Grid>
              ))}
              {[ ["governorate", "Governorate", options.governorates], ["courtType", "Court type", options.courtTypes] ].map(([name, label, items]) => (
                <Grid item xs={12} sm={6} key={name}><TextField fullWidth select required disabled={!!court || saving} label={t(label)} value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })}>
                  {items.map((item) => <MenuItem key={item._id || item.id} value={item._id || item.id}>{item.name}</MenuItem>)}
                </TextField></Grid>
              ))}
              {[ ["startingWorkingHours", "Starting working hours"], ["endWorkingHours", "End working hours"] ].map(([name, label]) => (
                <Grid item xs={12} sm={6} key={name}><TextField fullWidth type="time" disabled={!!court || saving} label={t(label)} InputLabelProps={{ shrink: true }} value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })} /></Grid>
              ))}
            </Grid>
            {!court && <Button type="submit" variant="contained" disabled={saving || !options.governorates.length || !options.courtTypes.length} sx={{ mt: 2 }}>{t(saving ? "Saving..." : "Create court and continue")}</Button>}
          </Box>
          {court && (
            <Box className="court-detail-panel">
              <Alert severity="success" sx={{ mb: 2 }}>{t("Court created. Add floors below or finish.")}</Alert>
              <Typography variant="h5" mb={2}>{t("Add floors")}</Typography>
              {floors.length > 0 && <Stack spacing={1} mb={2}>{floors.map((floor) => <Box key={floor._id || floor.id}><Alert severity="success">{t("Floor added")}: {floor.name}</Alert><FloorOffices floor={floor} onChanged={offices => setFloors(previous => previous.map(item => item === floor ? { ...item, offices } : item))} /></Box>)}</Stack>}
              <Box component="form" onSubmit={saveFloor}>
                <Stack spacing={2}>
                  <TextField select required fullWidth label={t("Floor name")} value={floorName} disabled={saving} onChange={(event) => setFloorName(event.target.value)}>
                    {options.floorNames.filter((item) => !floors.some((floor) => floor.floorNameId === (item._id || item.id))).map((item) => <MenuItem key={item._id || item.id} value={item._id || item.id}>{item.name}</MenuItem>)}
                  </TextField>
                  <TextField key={fileKey} type="file" required fullWidth label={t("Floor image")} InputLabelProps={{ shrink: true }} inputProps={{ accept: "image/*" }} helperText={t("Choose an image no larger than 2 MB.")} disabled={saving} onChange={(event) => setImage(event.target.files?.[0] || null)} />
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" type="submit" disabled={saving || !floorName || !image}>{t(saving ? "Saving..." : "Add floor")}</Button>
                    <Button variant="outlined" disabled={saving} onClick={() => navigate(`/courts/${court._id || court.id}`)}>{t("Finish")}</Button>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}
