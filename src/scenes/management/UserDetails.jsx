import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import axiosClient from "../../api/axoisClient";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setUser(null);
    axiosClient.get(`/admin-management/users/${id}`).then(({ data }) => { if (active) setUser(data.data); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, refresh]);
  const date = (value) => value ? new Date(value).toLocaleString(i18n.resolvedLanguage?.startsWith("ar") ? "ar-EG" : "en-US") : "—";
  const details = user ? [
    ["ID", user._id || user.id], ["Name", user.name], ["Email", user.email], ["Phone Number", user.phone],
    ["Role", t(user.role)], ["Status", t(user.active === false ? "Blocked" : "Active")],
    ["Verified", t(user.verified ? "Yes" : "No")], ["Subscription", t(user.isSubscribed ? "Subscribed" : "Unsubscribed")],
    ["Subscription status", user.currentsubscriptionStatus ? t(user.currentsubscriptionStatus) : "—"],
    ["Current subscription ID", user.currentSubscriptionId], ["Created", date(user.createdAt)], ["Last updated", date(user.updatedAt)], ["Profile image", user.profileImage],
  ] : [];
  return <Box m={{ xs: 2, md: 3 }}><Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>{t("Back")}</Button><Header title={user?.name || "User details"} subtitle="Complete user information" />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{t(error)}<Button onClick={() => setRefresh((previous) => previous + 1)}>{t("Retry")}</Button></Alert>}
    {loading && <CircularProgress />}
    {!loading && user && <Box className="court-detail-panel"><Grid container spacing={3}>{details.map(([label, value]) => <Grid item xs={12} sm={6} md={4} key={label}><Typography variant="caption" color="text.secondary">{t(label)}</Typography><Typography sx={{ overflowWrap: "anywhere" }}>{value || "—"}</Typography></Grid>)}</Grid></Box>}
  </Box>;
}
