import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import axiosClient from "../../api/axoisClient";

const receiptUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value.replace(/:(\/uploads\/)/, "$1");
  return value.startsWith("/") ? value : `/uploads/payments/${encodeURIComponent(value)}`;
};
const message = (error) => error.response?.data?.message || error.message || "Update failed";

export default function PaymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const busy = useRef(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setPayment(null);
    setImageFailed(false);
    axiosClient.get(`/payment/${id}`).then(({ data }) => {
      if (active) setPayment(data.data);
    }).catch((requestError) => { if (active) setError(message(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, refresh]);
  const review = async (event) => {
    event.preventDefault();
    if (busy.current || payment?.paymentStatus !== "PENDING") return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      const { data } = await axiosClient.post(`/payment/${action === "APPROVED" ? "approve" : "decline"}/${id}`, action === "REJECTED" ? { rejectionReason: reason.trim(), rejectionMessage: rejectionMessage.trim() } : {});
      setPayment((previous) => ({ ...previous, ...data.data, user: previous.user }));
      setNotice(action === "APPROVED" ? "Payment approved successfully" : "Payment declined successfully");
      setAction("");
    } catch (requestError) {
      setError(message(requestError));
      if (requestError.response?.status === 409) { setAction(""); setRefresh((previous) => previous + 1); }
    } finally { busy.current = false; setSaving(false); }
  };
  const date = (value) => value ? new Date(value).toLocaleString(i18n.resolvedLanguage?.startsWith("ar") ? "ar-EG" : "en-US") : "—";
  const userId = payment?.user?._id || payment?.user?.id || (typeof payment?.user === "string" ? payment.user : "");
  const reviewer = payment?.reviewedByAdminId;
  const details = payment ? [
    ["Request", payment.requestNumber], ["ID", payment._id || payment.id], ["Amount", `${payment.amount} ${payment.currency} (${payment.currencySymbol || ""})`],
    ["Wallet type", payment.walletType], ["Receiving wallet", payment.walletNumber], ["User wallet", payment.userWalletNumber],
    ["Reference number", payment.referenceNumber], ["Submitted", date(payment.createdAt)], ["Last updated", date(payment.updatedAt)],
    ["Reviewed at", date(payment.reviewedAt)], ["Reviewed by", reviewer?.name || reviewer?.email || (typeof reviewer === "string" ? reviewer : "")],
    ["Rejection reason", payment.rejectionReason], ["Rejection message", payment.rejectionMessage],
  ] : [];
  const image = receiptUrl(payment?.receiptImageUrl);
  return (
    <Box m={{ xs: 2, md: 3 }}>
      <Button disabled={saving} onClick={() => navigate("/payments")} sx={{ mb: 2 }}>{t("Back to payments")}</Button>
      <Header title="Payment details" subtitle={payment?.requestNumber || "Review subscription payment requests"} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{t(error)}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{t(notice)}</Alert>}
      <Button disabled={loading || saving} onClick={() => setRefresh((previous) => previous + 1)} sx={{ mb: 2 }}>{t("Refresh")}</Button>
      {loading && <CircularProgress />}
      {!loading && payment && <Stack spacing={3}>
        <Box className="court-detail-panel">
          <Chip label={t(payment.paymentStatus)} color={payment.paymentStatus === "PENDING" ? "warning" : payment.paymentStatus === "APPROVED" ? "success" : "error"} sx={{ mb: 2 }} />
          <Grid container spacing={2}>{details.map(([label, value]) => <Grid item xs={12} sm={6} md={4} key={label}><Typography variant="caption" color="text.secondary">{t(label)}</Typography><Typography sx={{ overflowWrap: "anywhere" }}>{value || "—"}</Typography></Grid>)}</Grid>
        </Box>
        <Box className="court-detail-panel"><Typography variant="h5" mb={1}>{t("Subscriber")}</Typography>
          {userId ? <><Button onClick={() => navigate(`/users/${userId}`)}>{payment.user.name || t("View user")}</Button><Typography>{payment.user.email}</Typography><Typography>{payment.user.phone}</Typography><Button onClick={() => navigate(`/users/${userId}`)}>{t("View all user information")}</Button></> : <Typography>{t("User not found")}</Typography>}
        </Box>
        <Box className="court-detail-panel"><Typography variant="h5" mb={2}>{t("Payment receipt")}</Typography>
          {image ? <><Button component="a" href={image} target="_blank" rel="noreferrer" sx={{ mb: 2 }}>{t("Open original receipt")}</Button>{imageFailed ? <Alert severity="warning">{t("Unable to load receipt image")}</Alert> : <Box component="img" src={image} alt={t("Payment receipt")} onError={() => setImageFailed(true)} sx={{ display: "block", width: "100%", maxHeight: 750, objectFit: "contain", bgcolor: "action.hover" }} />}</> : <Alert severity="info">{t("No receipt attached")}</Alert>}
        </Box>
        {payment.paymentStatus === "PENDING" && <Stack direction="row" spacing={2}><Button color="success" variant="contained" disabled={saving} onClick={() => { setError(""); setAction("APPROVED"); }}>{t("Approve payment")}</Button><Button color="error" variant="outlined" disabled={saving} onClick={() => { setError(""); setReason(""); setRejectionMessage(""); setAction("REJECTED"); }}>{t("Reject payment")}</Button></Stack>}
      </Stack>}
      <Dialog open={!!action} onClose={() => { if (!saving) setAction(""); }} fullWidth maxWidth="sm"><Box component="form" onSubmit={review}>
        <DialogTitle>{t(action === "APPROVED" ? "Approve payment" : "Reject payment")}</DialogTitle>
        <DialogContent><Stack spacing={2} mt={1}>{error && <Alert severity="error">{t(error)}</Alert>}<Typography>{payment?.requestNumber} — {payment?.amount} {payment?.currency}</Typography>
          {action === "REJECTED" ? <><TextField required label={t("Rejection reason")} disabled={saving} value={reason} onChange={(event) => setReason(event.target.value)} inputProps={{ maxLength: 200, pattern: ".*\\S.*" }} /><TextField multiline minRows={3} label={t("Rejection message")} disabled={saving} value={rejectionMessage} onChange={(event) => setRejectionMessage(event.target.value)} inputProps={{ maxLength: 1000 }} /></> : <Typography>{t("Approving this payment activates the user's subscription.")}</Typography>}
        </Stack></DialogContent><DialogActions><Button disabled={saving} onClick={() => setAction("")}>{t("Cancel")}</Button><Button type="submit" variant="contained" color={action === "APPROVED" ? "success" : "error"} disabled={saving}>{t(saving ? "Saving..." : "Confirm")}</Button></DialogActions>
      </Box></Dialog>
    </Box>
  );
}
