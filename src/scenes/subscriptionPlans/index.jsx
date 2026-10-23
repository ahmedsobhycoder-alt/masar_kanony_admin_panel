import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import axiosClient from "../../api/axoisClient";

const emptyPlan = { title: "", subtitle: "", price: "", currency: "EGP", currencySymbol: "ج.م", billingPeriod: "monthly", billingLabel: "", features: "", isPopular: false };
const message = (error) => error.response?.data?.message || error.message || "Save failed";

export default function SubscriptionPlans() {
  const { t, i18n } = useTranslation();
  const [plan, setPlan] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsError, setStatsError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [editor, setEditor] = useState(false);
  const [values, setValues] = useState(emptyPlan);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setStatsError("");
    Promise.allSettled([axiosClient.get("/subscriptionPlan/admin"), axiosClient.get("/subscriptionPlan/stats")]).then(([plans, statistics]) => {
      if (!active) return;
      if (plans.status === "fulfilled") setPlan(plans.value.data.data);
      else { setPlan(null); setError(message(plans.reason)); }
      if (statistics.status === "fulfilled") setStats(statistics.value.data.data);
      else { setStats(null); setStatsError(message(statistics.reason)); }
      setLoading(false);
    });
    return () => { active = false; };
  }, [refresh]);

  const openEditor = () => {
    setValues(plan ? { ...emptyPlan, ...plan, features: (plan.features || []).join("\n") } : emptyPlan);
    setSaveError("");
    setEditor(true);
  };
  const save = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    const features = values.features.split("\n").map((value) => value.trim()).filter(Boolean);
    if (!features.length) { setSaveError("At least one feature is required"); return; }
    busy.current = true;
    setSaving(true);
    setSaveError("");
    try {
      const payload = Object.fromEntries(Object.keys(emptyPlan).map((key) => [key, typeof values[key] === "string" ? values[key].trim() : values[key]]));
      payload.features = features;
      payload.price = Number(values.price);
      payload.currency = payload.currency.toUpperCase();
      if (plan) await axiosClient.put(`/subscriptionPlan/${plan._id || plan.id}`, payload);
      else await axiosClient.post("/subscriptionPlan", payload);
      setEditor(false);
      setNotice("Changes saved");
      setRefresh((previous) => previous + 1);
    } catch (requestError) { setSaveError(message(requestError)); }
    finally { busy.current = false; setSaving(false); }
  };
  const columns = [
    { field: "title", headerName: t("Title"), minWidth: 180, flex: 1 },
    { field: "subtitle", headerName: t("Subtitle"), minWidth: 220, flex: 1.4 },
    { field: "price", headerName: t("Price"), minWidth: 130, valueGetter: ({ row }) => `${row.price} ${row.currency}` },
    { field: "billingPeriod", headerName: t("Billing period"), minWidth: 150, renderCell: ({ value }) => t(value) },
    { field: "billingLabel", headerName: t("Billing label"), minWidth: 160 },
    { field: "features", headerName: t("Features"), minWidth: 230, flex: 1.5, valueGetter: ({ value }) => (value || []).join(" · ") },
    { field: "isPopular", headerName: t("Popular plan"), type: "boolean", width: 130 },
    { field: "actions", headerName: t("Actions"), width: 110, renderCell: () => <Button onClick={openEditor}>{t("Edit")}</Button> },
  ].map((column) => ({ ...column, sortable: false }));
  const locale = i18n.resolvedLanguage?.startsWith("ar") ? "ar-EG" : "en-US";
  const cards = [["Plan GET requests", stats?.requests], ["Unique signed-in users", stats?.uniqueUsers], ["Signed-in GET requests", stats?.authenticatedRequests], ["Guest GET requests", stats?.guestRequests]];

  return (
    <Box m={{ xs: 2, md: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Header title="Subscription plan" subtitle="Manage your plan and measure public API requests" />
        <Stack direction="row" spacing={1}><Button disabled={loading} onClick={() => setRefresh((previous) => previous + 1)}>{t("Refresh")}</Button><Button variant="contained" disabled={loading || !!error} onClick={openEditor}>{t(plan ? "Edit plan" : "Create plan")}</Button></Stack>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{t(error)}</Alert>}
      {statsError && <Alert severity="error" sx={{ mb: 2 }}>{t(statsError)}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice("")} sx={{ mb: 2 }}>{t(notice)}</Alert>}
      <Grid container spacing={2} mb={2}>{cards.map(([label, value]) => <Grid item xs={12} sm={6} lg={3} key={label}><Box className="court-detail-panel"><Typography color="text.secondary">{t(label)}</Typography><Typography variant="h3" mt={1}>{loading ? "…" : value ?? "—"}</Typography></Box></Grid>)}</Grid>
      <Typography variant="body2" color="text.secondary" mb={1}>{t("Counts successful public plan GET requests. Admin reads are excluded. Guests cannot be counted as unique users.")}</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>{stats?.startedAt ? t("Tracking since {{date}}", { date: new Date(stats.startedAt).toLocaleString(locale) }) : t("Tracking starts with the first public request after deployment.")}</Typography>
      <Box height={320}><DataGrid rows={plan ? [plan] : []} getRowId={(row) => row._id || row.id} columns={columns} loading={loading} hideFooter disableSelectionOnClick disableColumnMenu disableColumnFilter localeText={{ noRowsLabel: t("No subscription plan yet") }} /></Box>
      <Dialog open={editor} onClose={() => { if (!saving) setEditor(false); }} fullWidth maxWidth="md">
        <Box component="form" onSubmit={save}>
          <DialogTitle>{t(plan ? "Edit plan" : "Create plan")}</DialogTitle>
          <DialogContent><Grid container spacing={2} mt={0}>
            {saveError && <Grid item xs={12}><Alert severity="error">{t(saveError)}</Alert></Grid>}
            {[["title", "Title"], ["subtitle", "Subtitle"], ["price", "Price"], ["currency", "Currency"], ["currencySymbol", "Currency symbol"], ["billingLabel", "Billing label"]].map(([name, label]) => <Grid item xs={12} sm={6} key={name}><TextField fullWidth required label={t(label)} type={name === "price" ? "number" : "text"} value={values[name]} disabled={saving} onChange={(event) => setValues({ ...values, [name]: event.target.value })} inputProps={name === "price" ? { min: 0.01, step: 0.01 } : name === "currency" ? { minLength: 3, maxLength: 3 } : { pattern: ".*\\S.*" }} /></Grid>)}
            <Grid item xs={12} sm={6}><TextField fullWidth select label={t("Billing period")} value={values.billingPeriod} disabled={saving} onChange={(event) => setValues({ ...values, billingPeriod: event.target.value })}>{["monthly", "quarterly", "yearly"].map((period) => <MenuItem value={period} key={period}>{t(period)}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12}><TextField fullWidth required multiline minRows={4} label={t("Features")} helperText={t("One feature per line")} value={values.features} disabled={saving} onChange={(event) => setValues({ ...values, features: event.target.value })} /></Grid>
            <Grid item xs={12}><FormControlLabel label={t("Popular plan")} control={<Checkbox checked={values.isPopular} disabled={saving} onChange={(event) => setValues({ ...values, isPopular: event.target.checked })} />} /></Grid>
          </Grid></DialogContent>
          <DialogActions><Button disabled={saving} onClick={() => setEditor(false)}>{t("Cancel")}</Button><Button type="submit" variant="contained" disabled={saving}>{t(saving ? "Saving..." : "Save")}</Button></DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
