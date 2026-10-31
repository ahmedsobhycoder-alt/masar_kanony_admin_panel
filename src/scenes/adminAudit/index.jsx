import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import axiosClient from "../../api/axoisClient";

const errorMessage = (error) => error.response?.data?.message || error.message || "Operation failed";

export default function AdminAuditLogs() {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [resource, setResource] = useState("");
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restore, setRestore] = useState(null);
  const [saving, setSaving] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    axiosClient.get("/admin-audit", { params: { page: page + 1, limit: pageSize, ...(resource ? { resource } : {}), ...(action ? { action } : {}) } })
      .then(({ data }) => { if (active) { setRows(data.data.list); setTotal(data.data.paginationResult.totalDocuments); } })
      .catch((requestError) => { if (active) setError(errorMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, pageSize, resource, action, refresh]);

  const confirmRestore = async () => {
    if (!restore || saving) return;
    setSaving(true);
    setError("");
    try {
      await axiosClient.post(`/admin-audit/${restore._id}/restore`);
      setRestore(null);
      setRefresh((value) => value + 1);
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setSaving(false); }
  };
  const date = (value) => new Date(value).toLocaleString(i18n.resolvedLanguage?.startsWith("ar") ? "ar-EG" : "en-US");
  const columns = [
    { field: "resource", headerName: t("Item type"), width: 120, valueFormatter: ({ value }) => t(value) },
    { field: "resourceName", headerName: t("Item"), flex: 1, minWidth: 160 },
    { field: "action", headerName: t("Action"), width: 120, renderCell: ({ value }) => <Chip size="small" color={value === "deleted" ? "error" : "warning"} label={t(value)} /> },
    { field: "actorName", headerName: t("Administrator"), flex: 1, minWidth: 160 },
    { field: "actorEmail", headerName: t("Email"), flex: 1, minWidth: 200 },
    { field: "createdAt", headerName: t("Date"), width: 190, valueFormatter: ({ value }) => date(value) },
    { field: "restore", headerName: t("Restore"), width: 130, sortable: false, renderCell: ({ row }) => row.restoredAt ? <Chip size="small" color="success" label={t("Restored")} /> : <Button size="small" startIcon={<RestoreRoundedIcon />} onClick={() => setRestore(row)}>{t("Restore")}</Button> },
  ];
  return <Box m={{ xs: 2, md: 3 }}>
    <Header title="Audit logs" subtitle="Review and restore court directory changes" />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{t(error)}</Alert>}
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
      <TextField select label={t("Item type")} value={resource} onChange={(event) => { setResource(event.target.value); setPage(0); }} sx={{ minWidth: 180 }}><MenuItem value="">{t("All")}</MenuItem>{["court", "floor", "office"].map((value) => <MenuItem key={value} value={value}>{t(value)}</MenuItem>)}</TextField>
      <TextField select label={t("Action")} value={action} onChange={(event) => { setAction(event.target.value); setPage(0); }} sx={{ minWidth: 180 }}><MenuItem value="">{t("All")}</MenuItem>{["updated", "deleted"].map((value) => <MenuItem key={value} value={value}>{t(value)}</MenuItem>)}</TextField>
    </Stack>
    <Box height="70vh" minHeight={420}><DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} loading={loading} rowCount={total} page={page} pageSize={pageSize} paginationMode="server" onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(0); }} rowsPerPageOptions={[10, 20, 50]} disableSelectionOnClick /></Box>
    <Dialog open={!!restore} onClose={() => !saving && setRestore(null)} fullWidth maxWidth="xs"><DialogTitle>{t("Restore item?")}</DialogTitle><DialogContent><DialogContentText>{t("The saved version will replace the current item. Related floors and offices are restored with a deleted court.")}<br />{restore?.resourceName}</DialogContentText></DialogContent><DialogActions><Button disabled={saving} onClick={() => setRestore(null)}>{t("Cancel")}</Button><Button disabled={saving} variant="contained" onClick={confirmRestore}>{t(saving ? "Restoring..." : "Restore")}</Button></DialogActions></Dialog>
  </Box>;
}

