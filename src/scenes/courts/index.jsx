import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Grid, MenuItem, TextField } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ResourceTable, { displayRelatedValue } from "../../components/ResourceTable";
import { deleteCourt, getCourts, getCourtTypes } from "../../api/adminResources";
import { getGovernorates } from "../../api/governorates";
import { useTranslation } from "react-i18next";

const loadOptions = async (getPage) => {
  let page = 1;
  let result;
  const items = [];
  do {
    result = await getPage({ page, limit: 100 });
    items.push(...(result.data?.list || []));
    page += 1;
  } while (result.data?.paginationResult?.next);
  return items;
};

export default function Courts() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [courtType, setCourtType] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [options, setOptions] = useState({ courtTypes: [], governorates: [] });
  const [filterError, setFilterError] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setName(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    let active = true;
    Promise.all([loadOptions(getCourtTypes), loadOptions(getGovernorates)])
      .then(([courtTypes, governorates]) => { if (active) setOptions({ courtTypes, governorates }); })
      .catch((error) => { if (active) setFilterError(error.response?.data?.message || error.message); });
    return () => { active = false; };
  }, []);
  const getPage = useCallback((params) => getCourts({
    ...params, ...(name ? { name } : {}), ...(courtType ? { courtType } : {}), ...(governorate ? { governorate } : {}),
  }), [name, courtType, governorate]);
  const columns = [
    {
      field: "name",
      headerName: "Court",
      flex: 1,
      minWidth: 190,
      renderCell: (params) => (
        <Button
          variant="text"
          onClick={() => navigate(`/courts/${params.row._id || params.row.id}`)}
          sx={{ minWidth: 0, px: 0.5, fontWeight: 700, textAlign: "start" }}
        >
          {params.value}
        </Button>
      ),
    },
    { field: "address", headerName: "Address", flex: 1.5, minWidth: 200 },
    {
      field: "governorate",
      headerName: "Governorate",
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => displayRelatedValue(params.row.governorate),
    },
    {
      field: "courtType",
      headerName: "Court type",
      flex: 1,
      minWidth: 160,
      valueGetter: (params) => displayRelatedValue(params.row.courtType),
    },
    { field: "nFloors", headerName: "Floors", width: 90 },
    { field: "nOffices", headerName: "Offices", width: 95 },
  
  ];

  return (
    <ResourceTable
      title="Courts"
      subtitle="Browse courts and their locations"
      getPage={getPage}
      queryKey={JSON.stringify([name, courtType, governorate])}
      filterControls={<>
        {filterError && <Alert severity="error" sx={{ mb: 2 }}>{t(filterError)}</Alert>}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={4}><TextField fullWidth label={t("Search by court name")} value={search} onChange={(event) => setSearch(event.target.value)} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth select label={t("Court type")} value={courtType} onChange={(event) => setCourtType(event.target.value)}><MenuItem value="">{t("All court types")}</MenuItem>{options.courtTypes.map((item) => <MenuItem key={item._id || item.id} value={item.name}>{item.name}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth select label={t("Governorate")} value={governorate} onChange={(event) => setGovernorate(event.target.value)}><MenuItem value="">{t("All governorates")}</MenuItem>{options.governorates.map((item) => <MenuItem key={item._id || item.id} value={item.name}>{item.name}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><Button onClick={() => { setSearch(""); setName(""); setCourtType(""); setGovernorate(""); }}>{t("Clear filters")}</Button></Grid>
        </Grid>
      </>}
      columns={columns}
      headerActions={(
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/courts/create")}>
          {t("Create court")}
        </Button>
      )}
      crud={{
        onEdit: (row) => navigate(`/courts/${row._id || row.id}/edit`),
        remove: deleteCourt,
        deleteMessage: "This will permanently delete the court and all its floors and offices. This action cannot be undone.",
        fields: [
          { name: "name", label: "Court" },
          { name: "address", label: "Address" },
          { name: "governorate", label: "Governorate" },
          { name: "courtType", label: "Court type" },
          { name: "startingWorkingHours", label: "Starting working hours", fullWidth: false },
          { name: "endWorkingHours", label: "End working hours", fullWidth: false },
        ],
      }}
    />
  );
}
