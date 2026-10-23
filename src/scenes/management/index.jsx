import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import axiosClient from "../../api/axoisClient";
import { useNavigate } from "react-router-dom";

const message = (error) => error.response?.data?.message || error.message || "Save failed";

export default function Management({ resource }) {
  const navigate = useNavigate();
  const users = resource === "users";
  const { t } = useTranslation();
  const path = `/admin-management/${resource}`;
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState(null);
  const [values, setValues] = useState({});
  const [action, setAction] = useState(null);
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => { setQuery(search.trim()); setPage(0); }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      axiosClient.get(path, { params: { page: page + 1, limit: pageSize, search: query } }),
      axiosClient.get(`${path}/stats`),
    ]).then(([result, summary]) => {
      if (!active) return;
      setRows(result.data.data.list);
      setTotal(result.data.data.paginationResult.totalDocuments);
      setStats(summary.data.data);
    }).catch((requestError) => {
      if (active) { setError(message(requestError)); setRows([]); setStats({}); setTotal(0); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path, page, pageSize, query, refresh]);

  const openEditor = (row = null) => {
    setActionError("");
    setEditor({ row });
    setValues(users ? {
      name: row?.name || "", email: row?.email || "", phone: row?.phone || "", password: "", role: row?.role === "admin" ? "admin" : "user",
    } : { paymentType: row?.paymentType || "", phone: row?.phone || "" });
  };
  const confirm = (row, label, data, remove = false) => {
    setActionError("");
    setAction({ row, label, data, remove });
  };
  const mutate = async (operation) => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setActionError("");
    try {
      await operation();
      setEditor(null);
      setAction(null);
      setNotice("Changes saved");
      setRefresh((previous) => previous + 1);
    } catch (requestError) {
      setActionError(message(requestError));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const save = (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(Object.entries(values).filter(([key]) => key !== "password" || !editor.row).map(([key, value]) => [key, key === "password" ? value : value.trim()]));
    mutate(() => editor.row ? axiosClient.put(`${path}/${editor.row._id || editor.row.id}`, payload) : axiosClient.post(path, payload));
  };
  const execute = () => mutate(async () => {
    const target = `${path}/${action.row._id || action.row.id}`;
    if (action.remove) {
      await axiosClient.delete(target);
      if (rows.length === 1 && page > 0) setPage((previous) => previous - 1);
    } else await axiosClient.put(target, action.data);
  });
  const columns = users ? [
    { field: "name", headerName: t("Name"), flex: 1, minWidth: 160, renderCell: ({ row }) => <Button onClick={() => navigate(`/users/${row._id || row.id}`)}>{row.name}</Button> },
    { field: "email", headerName: t("Email"), flex: 1.3, minWidth: 210 },
    { field: "phone", headerName: t("Phone Number"), minWidth: 140, flex: 1 },
    { field: "isSubscribed", headerName: t("Subscription"), width: 160, renderCell: ({ value }) => <Chip size="small" label={t(value ? "Subscribed" : "Unsubscribed")} color={value ? "success" : "default"} /> },
    { field: "role", headerName: t("Role"), width: 110, renderCell: ({ value }) => t(value) },
  ] : [
    { field: "paymentType", headerName: t("Wallet type"), flex: 1, minWidth: 180 },
    { field: "phone", headerName: t("Wallet phone"), flex: 1, minWidth: 160 },
    { field: "usage", headerName: t("Payment requests"), width: 160, valueGetter: ({ row }) => stats.usage?.find((item) => item._id === row.paymentType)?.count || 0 },
  ];
  columns.push(
    { field: "active", headerName: t("Status"), width: 125, renderCell: ({ value }) => <Chip size="small" label={t(value === false ? (users ? "Blocked" : "Inactive") : "Active")} color={value === false ? "error" : "success"} /> },
    { field: "actions", headerName: t("Actions"), width: users ? 390 : 320, sortable: false, filterable: false, renderCell: ({ row }) => <Stack direction="row" spacing={0.5}>
      <Button size="small" onClick={() => openEditor(row)}>{t("Edit")}</Button>
      <Button size="small" color={row.active === false ? "success" : "warning"} onClick={() => confirm(row, row.active === false ? (users ? "Unblock user" : "Activate wallet") : (users ? "Block user" : "Deactivate wallet"), { active: row.active === false })}>{t(row.active === false ? (users ? "Unblock" : "Activate") : (users ? "Block" : "Deactivate"))}</Button>
      {users ? <Button size="small" onClick={() => confirm(row, row.role === "admin" ? "Make user" : "Make admin", { role: row.role === "admin" ? "user" : "admin" })}>{t(row.role === "admin" ? "Make user" : "Make admin")}</Button> : <Button size="small" color="error" onClick={() => confirm(row, "Delete wallet", null, true)}>{t("Delete")}</Button>}
    </Stack> }
  );
  const cards = users ? [["Number of users", stats.total], ["Subscribed users", stats.subscribed], ["Unsubscribed users", stats.unsubscribed]] : [["Wallet types", stats.total], ["Active wallets", stats.active], ["Most used wallet type", stats.mostUsed?._id || t("No payment requests")]];
  const editorFields = users ? [["name", "Name"], ["email", "Email"], ["phone", "Phone Number"], ...(!editor?.row ? [["password", "Password"]] : [])] : [["paymentType", "Wallet type"], ["phone", "Wallet phone"]];

  return (
    <Box m={{ xs: 2, md: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Header title={users ? "Users" : "Wallet types"} subtitle={users ? "Manage users, subscriptions and access" : "Manage payment wallets and availability"} />
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openEditor()}>{t(users ? "Create New User" : "Create wallet")}</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{t(error)}<Button onClick={() => setRefresh((previous) => previous + 1)}>{t("Retry")}</Button></Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice("")} sx={{ mb: 2 }}>{t(notice)}</Alert>}
      <Grid container spacing={2} mb={3}>
        {cards.map(([label, value]) => <Grid item xs={12} md={4} key={label}><Box className="court-detail-panel"><Typography color="text.secondary">{t(label)}</Typography><Typography variant="h3" mt={1}>{loading ? "…" : value ?? "—"}</Typography>{label === "Most used wallet type" && stats.mostUsed && <Typography variant="caption">{t("Based on all payment requests")}: {stats.mostUsed.count}</Typography>}</Box></Grid>)}
      </Grid>
      <TextField fullWidth label={t(users ? "Search by name, phone or email" : "Search by wallet type or phone")} value={search} onChange={(event) => setSearch(event.target.value)} sx={{ mb: 2 }} />
      <Box height="65vh" minHeight={400}><DataGrid rows={rows} getRowId={(row) => row._id || row.id} columns={columns.map((column) => ({ ...column, sortable: false }))} loading={loading} rowCount={total} page={page} pageSize={pageSize} pagination paginationMode="server" onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(0); }} rowsPerPageOptions={[10, 25, 50]} disableSelectionOnClick disableColumnFilter disableColumnMenu localeText={{ noRowsLabel: t("No data"), footerPaginationRowsPerPage: t("Rows per page:") }} /></Box>
      <Dialog open={!!editor} onClose={() => { if (!saving) setEditor(null); }} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={save}>
          <DialogTitle>{t(editor?.row ? (users ? "Edit user" : "Edit wallet") : (users ? "Create New User" : "Create wallet"))}</DialogTitle>
          <DialogContent><Stack spacing={2} mt={1}>
            {actionError && <Alert severity="error">{t(actionError)}</Alert>}
            {editorFields.map(([name, label]) => <TextField key={name} fullWidth required label={t(label)} type={name === "password" ? "password" : name === "email" ? "email" : "text"} value={values[name] || ""} disabled={saving} onChange={(event) => setValues({ ...values, [name]: event.target.value })} inputProps={name === "phone" ? { pattern: "01[0125][0-9]{8}", maxLength: 11 } : name === "password" ? { minLength: 8, maxLength: 72 } : name === "name" ? { minLength: 2, maxLength: 20, pattern: ".*\\S.*" } : name === "paymentType" ? { minLength: 2, maxLength: 50, pattern: ".*\\S.*" } : {}} />)}
            {users && <TextField select label={t("Role")} value={values.role || "user"} disabled={saving} onChange={(event) => setValues({ ...values, role: event.target.value })}>{[...new Set([values.role, "user", "admin"])].filter(Boolean).map((role) => <MenuItem key={role} value={role}>{t(role)}</MenuItem>)}</TextField>}
            {users && !editor?.row && <Typography variant="caption">{t("New accounts are verified and ready to sign in.")}</Typography>}
          </Stack></DialogContent>
          <DialogActions><Button disabled={saving} onClick={() => setEditor(null)}>{t("Cancel")}</Button><Button disabled={saving} type="submit" variant="contained">{t(saving ? "Saving..." : "Save")}</Button></DialogActions>
        </Box>
      </Dialog>
      <Dialog open={!!action} onClose={() => { if (!saving) setAction(null); }} fullWidth maxWidth="xs">
        <DialogTitle>{t(action?.label || "Confirm")}</DialogTitle>
        <DialogContent>{actionError && <Alert severity="error" sx={{ mb: 2 }}>{t(actionError)}</Alert>}<DialogContentText>{action?.row.name || action?.row.paymentType} — {action?.row.email || action?.row.phone}</DialogContentText></DialogContent>
        <DialogActions><Button disabled={saving} onClick={() => setAction(null)}>{t("Cancel")}</Button><Button disabled={saving} variant="contained" color={action?.remove ? "error" : "primary"} onClick={execute}>{t(saving ? "Saving..." : "Confirm")}</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
