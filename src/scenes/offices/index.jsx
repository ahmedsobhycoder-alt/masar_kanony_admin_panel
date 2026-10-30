import { useCallback, useEffect, useState } from "react";
import { Button, Grid, TextField } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useTranslation } from "react-i18next";
import OfficeEditor from "../../components/OfficeEditor";
import ResourceTable, { displayRelatedValue } from "../../components/ResourceTable";
import { deleteOffice, getOffices } from "../../api/adminResources";

const columns = [
  { field: "roomNumber", headerName: "Room", width: 120 },
  {
    field: "officeType",
    headerName: "Office type",
    flex: 1,
    minWidth: 170,
    valueGetter: (params) => params.row.name || displayRelatedValue(params.row.officeType),
  },
  {
    field: "court",
    headerName: "Court",
    flex: 1,
    minWidth: 180,
    valueGetter: (params) => params.row.courtName || displayRelatedValue(params.row.court),
  },
  {
    field: "floor",
    headerName: "Floor",
    flex: 1,
    minWidth: 150,
    valueGetter: (params) => params.row.floorName || displayRelatedValue(params.row.floor),
  },
  { field: "governorate", headerName: "Governorate", minWidth: 150 },
  { field: "courtType", headerName: "Court type", minWidth: 150 },
  { field: "locationDirection", headerName: "Location", flex: 1, minWidth: 160 },
  { field: "startingWorkingHours", headerName: "Opens", width: 110 },
  { field: "endWorkingHours", headerName: "Closes", width: 110 },
];

export default function Offices() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({ name: "", governorate: "", courtName: "", courtType: "" });
  const [query, setQuery] = useState(filters);
  // `undefined` means the editor is closed; `null` opens it in create mode.
  const [editing, setEditing] = useState(undefined);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setQuery(Object.fromEntries(Object.entries(filters).filter(([, value]) => value.trim()).map(([key, value]) => [key, value.trim()]))), 350);
    return () => clearTimeout(timer);
  }, [filters]);
  const getPage = useCallback(params => getOffices({ ...params, ...query }), [query]);
  return <>
    <ResourceTable
      key={revision}
      title="Offices"
      subtitle="Browse court offices and services locations"
      getPage={getPage}
      queryKey={JSON.stringify(query)}
      headerActions={<Button variant="contained" color="secondary" startIcon={<AddRoundedIcon />} onClick={() => setEditing(null)}>{t("Add office")}</Button>}
      filterControls={<Grid container spacing={2} mb={2}>
        {[["name", "Search by office name"], ["governorate", "Governorate"], ["courtName", "Court"], ["courtType", "Court type"]].map(([key, label]) => <Grid item xs={12} sm={6} md={3} key={key}><TextField fullWidth label={t(label)} value={filters[key]} onChange={event => setFilters({ ...filters, [key]: event.target.value })} /></Grid>)}
      </Grid>}
      columns={columns}
      crud={{ onEdit: setEditing, remove: deleteOffice }}
    />
    {editing !== undefined && <OfficeEditor allowRelocation office={editing} onClose={() => setEditing(undefined)} onSaved={() => setRevision(value => value + 1)} />}
  </>;
}
