import { useCallback, useEffect, useState } from "react";
import { Grid, TextField } from "@mui/material";
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
  const [editing, setEditing] = useState(null);
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
      filterControls={<Grid container spacing={2} mb={2}>
        {[["name", "Search by office name"], ["governorate", "Governorate"], ["courtName", "Court"], ["courtType", "Court type"]].map(([key, label]) => <Grid item xs={12} sm={6} md={3} key={key}><TextField fullWidth label={t(label)} value={filters[key]} onChange={event => setFilters({ ...filters, [key]: event.target.value })} /></Grid>)}
      </Grid>}
      columns={columns}
      crud={{ onEdit: setEditing, remove: deleteOffice }}
    />
    {editing && <OfficeEditor office={editing} onClose={() => setEditing(null)} onSaved={() => setRevision(value => value + 1)} />}
  </>;
}
