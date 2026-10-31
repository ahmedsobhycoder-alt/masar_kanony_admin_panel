import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useTranslation } from "react-i18next";
import ResourceTable, { displayRelatedValue } from "../../components/ResourceTable";
import { createFloor, deleteFloor, getCourts, getFloorNames, getFloors, updateFloor } from "../../api/adminResources";

const columns = [
  { field: "floorName", headerName: "Floor", flex: 1, minWidth: 180 },
  { field: "court", headerName: "Court", flex: 1.5, minWidth: 220, valueGetter: (params) => displayRelatedValue(params.row.court) },
  { field: "nOfficesPerFloor", headerName: "Offices", width: 120 },
];
const message = (error) => error.response?.data?.errors?.map((item) => item.msg || item.message).join(", ") || error.response?.data?.message || error.message;
const optionId = (item) => item?._id || item?.id || "";
const loadAll = async (loader, params = {}) => {
  const items = [];
  let page = 1;
  let result;
  do {
    result = await loader({ ...params, page: page++, limit: 100 });
    items.push(...(result.data?.list || []));
  } while (result.data?.paginationResult?.next);
  return items;
};

export default function Floors() {
  const { t } = useTranslation();
  const busy = useRef(false);
  const [creating, setCreating] = useState(false);
  const [courts, setCourts] = useState([]);
  const [floorNames, setFloorNames] = useState([]);
  const [court, setCourt] = useState("");
  const [floorName, setFloorName] = useState("");
  const [image, setImage] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [existingFloors, setExistingFloors] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  const openCreate = () => {
    setCourt(""); setFloorName(""); setImage(null); setExistingFloors([]); setError(""); setFileKey((value) => value + 1); setCreating(true);
    if (!courts.length || !floorNames.length) {
      setLoadingOptions(true);
      Promise.all([loadAll(getCourts), loadAll(getFloorNames)])
        .then(([courtItems, nameItems]) => { setCourts(courtItems); setFloorNames(nameItems); })
        .catch((requestError) => setError(message(requestError)))
        .finally(() => setLoadingOptions(false));
    }
  };

  useEffect(() => {
    if (!creating || !court) { setExistingFloors([]); return undefined; }
    let active = true;
    setLoadingFloors(true); setFloorName(""); setError("");
    loadAll(getFloors, { courtId: court })
      .then((items) => { if (active) setExistingFloors(items); })
      .catch((requestError) => { if (active) setError(message(requestError)); })
      .finally(() => { if (active) setLoadingFloors(false); });
    return () => { active = false; };
  }, [court, creating]);

  const usedNames = new Set(existingFloors.map((floor) => String(floor.floorName || "").trim().toLocaleLowerCase()));
  const availableNames = floorNames.filter((item) => !usedNames.has(String(item.name || "").trim().toLocaleLowerCase()));
  const create = async (event) => {
    event.preventDefault();
    if (busy.current || !court || !floorName || !image) return;
    if (!image.type.startsWith("image/") || image.size > 2000000) { setError("Choose an image no larger than 2 MB."); return; }
    busy.current = true; setSaving(true); setError("");
    try {
      const payload = new FormData();
      payload.append("court", court); payload.append("floorName", floorName); payload.append("image", image);
      await createFloor(payload);
      setCreating(false); setRevision((value) => value + 1);
    } catch (requestError) { setError(message(requestError)); }
    finally { busy.current = false; setSaving(false); }
  };

  return <>
    <ResourceTable key={revision} title="Floors" subtitle="Browse floors by court" getPage={getFloors} columns={columns}
      headerActions={<Button variant="contained" color="secondary" startIcon={<AddRoundedIcon />} onClick={openCreate}>{t("Create floor")}</Button>}
      crud={{ update: updateFloor, remove: deleteFloor, fields: [{ name: "floorName", label: "Floor name" }] }} />
    <Dialog open={creating} onClose={() => !saving && setCreating(false)} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={create}>
        <DialogTitle>{t("Create floor")}</DialogTitle>
        <DialogContent><Stack spacing={2} pt={1}>
          {error && <Alert severity="error">{t(error)}</Alert>}
          {loadingOptions ? <CircularProgress size={28} /> : <>
            <TextField id="new-floor-court" select required fullWidth label={t("Court")} value={court} disabled={saving} onChange={(event) => setCourt(event.target.value)}>
              {courts.map((item) => <MenuItem key={optionId(item)} value={optionId(item)}>{item.name}</MenuItem>)}
            </TextField>
            <TextField id="new-floor-name" select required fullWidth label={t("Floor name")} value={floorName} disabled={saving || !court || loadingFloors} helperText={loadingFloors ? t("Loading") : court && !availableNames.length ? t("All configured floor names are already used by this court") : t("Only unused floor names are shown")} onChange={(event) => setFloorName(event.target.value)}>
              {availableNames.map((item) => <MenuItem key={optionId(item)} value={optionId(item)}>{item.name}</MenuItem>)}
            </TextField>
            {court && existingFloors.length > 0 && <Alert severity="info">{t("Already added")}: {existingFloors.map((item) => item.floorName).join(", ")}</Alert>}
            <TextField key={fileKey} type="file" required fullWidth label={t("Floor image")} InputLabelProps={{ shrink: true }} inputProps={{ accept: "image/*" }} helperText={t("Choose an image no larger than 2 MB.")} disabled={saving} onChange={(event) => setImage(event.target.files?.[0] || null)} />
          </>}
        </Stack></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button disabled={saving} onClick={() => setCreating(false)}>{t("Cancel")}</Button><Button type="submit" variant="contained" color="secondary" disabled={saving || loadingOptions || loadingFloors || !court || !floorName || !image}>{t(saving ? "Saving..." : "Create floor")}</Button></DialogActions>
      </Box>
    </Dialog>
  </>;
}
