import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import client from "../../api/axoisClient";
export default function Notifications() {
  const { t } = useTranslation();
  const [values, setValues] = useState({ audience: "user", userId: "", title: "", body: "" });
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0);
  const busy = useRef(false);
  const message = (err) => err.response?.data?.message || err.message;
  useEffect(() => {
    let active = true; setLoading(true);
    client.get("/notifications/admin", { params: { page: page + 1, limit: 20 } }).then(({ data }) => {
      if (active) { setRows(data.data.list); setTotal(data.data.paginationResult?.totalDocuments || 0); }
    }).catch((err) => { if (active) setError(message(err)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, reload]);
  const send = async (event) => {
    event.preventDefault(); if (busy.current) return;
    busy.current = true; setSending(true); setError(""); setNotice("");
    try {
      const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
      if (payload.audience === "all") delete payload.userId;
      const { data } = await client.post("/notifications", payload);
      setNotice(t("Delivery result", data.data)); setReload((value) => value + 1);
    } catch (err) { setError(message(err)); }
    finally { busy.current = false; setSending(false); }
  };
  const remove = async (id) => {
    if (!window.confirm(t("Delete this notification?"))) return;
    try { await client.delete(`/notifications/${id}`); setReload((value) => value + 1); } catch (err) { setError(message(err)); }
  };
  const change = (key) => (event) => setValues({ ...values, [key]: event.target.value });
  return <Box m={3}>
    <Header title="Notifications" subtitle="Send messages to all users or a specific user" />
    {error && <Alert severity="error">{error}<Button onClick={() => setReload((value) => value + 1)}>{t("Retry")}</Button></Alert>}
    {notice && <Alert severity="success">{notice}</Alert>}
    <Box component="form" onSubmit={send} className="court-detail-panel"><Stack spacing={2}>
      <TextField select label={t("Audience")} value={values.audience} disabled={sending} onChange={change("audience")}>
        <MenuItem value="user">{t("Specific user")}</MenuItem><MenuItem value="all">{t("All active users")}</MenuItem>
      </TextField>
      {values.audience === "user" && <TextField required label={t("User ID")} value={values.userId} disabled={sending} onChange={change("userId")} inputProps={{ pattern: "[a-fA-F0-9]{24}" }} />}
      <TextField required label={t("Title")} value={values.title} disabled={sending} onChange={change("title")} inputProps={{ minLength: 3, maxLength: 200 }} />
      <TextField required multiline minRows={3} label={t("Message")} value={values.body} disabled={sending} onChange={change("body")} inputProps={{ minLength: 5, maxLength: 2000 }} />
      <Button variant="contained" type="submit" disabled={sending}>{t(sending ? "Sending..." : "Send notification")}</Button>
    </Stack></Box>
    <Box height={500} mt={3}><DataGrid rows={rows} getRowId={(row) => row._id || row.id} loading={loading} pagination paginationMode="server" page={page} onPageChange={setPage} pageSize={20} rowsPerPageOptions={[20]} rowCount={total} columns={[
      { field: "title", headerName: t("Title"), flex: 1 }, { field: "body", headerName: t("Message"), flex: 2 },
      { field: "userId", headerName: t("User ID"), width: 220 }, { field: "isRead", headerName: t("Read"), type: "boolean", width: 80 },
      { field: "createdAt", headerName: t("Created"), width: 180, valueFormatter: ({ value }) => value ? new Date(value).toLocaleString() : "" },
      { field: "actions", headerName: t("Actions"), width: 100, sortable: false, renderCell: ({ id }) => <Button color="error" onClick={() => remove(id)}>{t("Delete")}</Button> },
    ]} /></Box>
  </Box>;
}
