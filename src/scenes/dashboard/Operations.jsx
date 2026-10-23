import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import { getAppConfig } from "../../api/settings";
import { getCourts, getFloors, getOffices, getPayments } from "../../api/adminResources";
import "./operations.css";

const readTotal = (response) => response?.data?.paginationResult?.totalDocuments;

const Operations = ({ user }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({
    config: null,
    courtsTotal: null,
    floorsTotal: null,
    officesTotal: null,
    payments: [],
    pendingTotal: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      const results = await Promise.allSettled([
        getAppConfig(),
        getCourts({ page: 1, limit: 1, sort: "-updatedAt" }),
        getFloors({ page: 1, limit: 1 }),
        getOffices({ page: 1, limit: 1 }),
        getPayments({ page: 1, limit: 6, sort: "-createdAt" }),
        getPayments({ page: 1, limit: 1, status: "PENDING" }),
      ]);

      if (!isMounted) return;
      const value = (index) => results[index].status === "fulfilled" ? results[index].value : null;
      const courtsResponse = value(1);
      const paymentsResponse = value(4);
      setDashboard({
        config: value(0)?.data || null,
        courtsTotal: readTotal(courtsResponse),
        floorsTotal: readTotal(value(2)),
        officesTotal: readTotal(value(3)),
        payments: paymentsResponse?.data?.list || [],
        pendingTotal: readTotal(value(5)),
      });

      if (results.every((result) => result.status === "rejected")) {
        setError(t("Dashboard data is temporarily unavailable."));
      }
      setLoading(false);
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [t]);

  const stats = [
    {
      label: "Published courts",
      value: dashboard.config?.stats?.courtsCount ?? dashboard.courtsTotal,
      detail: t("Across {{count}} governorates", { count: dashboard.config?.stats?.governoratesCount ?? "—" }),
      icon: <AccountBalanceOutlinedIcon />,
      tone: "gold",
    },
    {
      label: "Directory floors",
      value: dashboard.floorsTotal,
      detail: t("Across all listed courts"),
      icon: <LayersOutlinedIcon />,
      tone: "sage",
    },
    {
      label: "Directory offices",
      value: dashboard.officesTotal,
      detail: t("Office records available"),
      icon: <MeetingRoomOutlinedIcon />,
      tone: "blue",
    },
    {
      label: "Pending reviews",
      value: dashboard.pendingTotal,
      detail: t("Subscription payments awaiting review"),
      icon: <PendingActionsOutlinedIcon />,
      tone: "amber",
    },
  ];

  const dateLocale = i18n.resolvedLanguage === "ar" ? "ar-EG" : "en-US";
  const lastUpdated = dashboard.config?.stats?.lastDataUpdate
    ? new Date(dashboard.config.stats.lastDataUpdate).toLocaleString(dateLocale, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : t("Waiting for directory update");

  return (
    <Box className="operations-dashboard" sx={{ px: { xs: 2, md: 3 }, py: 2, maxWidth: 1600, mx: "auto" }}>
      <Box className="operations-heading">
        <Header
          title="Your operations, at a glance."
          subtitle={t("Welcome back, {{name}}. Here's the latest across Masar Kanony.", { name: user?.name || t("Administrator") })}
        />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AccountBalanceOutlinedIcon />}
          onClick={() => navigate("/courts")}
          sx={{ mb: "30px", whiteSpace: "nowrap" }}
        >
          {t("Open court directory")}
        </Button>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Box className="operations-stat-grid">
        {stats.map((stat) => (
          <Box className={`operations-stat-card ${stat.tone}`} key={stat.label}>
            <Box className="operations-stat-icon">{stat.icon}</Box>
            <Box className="operations-stat-content">
              <Typography className="operations-stat-label">{t(stat.label)}</Typography>
              <Box className="operations-stat-value">
                {loading ? <CircularProgress size={20} /> : stat.value ?? "—"}
                {stat.label === "Pending reviews" && !loading && stat.value > 0 && (
                  <Chip size="small" label={t("Needs attention")} />
                )}
              </Box>
              <Typography className="operations-stat-detail">{stat.detail}</Typography>
            </Box>
            <NorthEastRoundedIcon className="operations-stat-arrow" />
          </Box>
        ))}
      </Box>

      <Box className="operations-main-grid">
        <Box className="operations-panel operations-courts-panel">
          <Box className="operations-panel-heading">
            <Box>
              <Typography component="h2">{t("Recent subscription requests")}</Typography>
              <Typography>{t("Latest payment activity across the directory")}</Typography>
            </Box>
            <Chip size="small" label={t("{{count}} pending", { count: dashboard.pendingTotal ?? "—" })} />
          </Box>

          <Box className="operations-table-wrap">
            <Box className="operations-table-head">
              <span>{t("Subscriber")}</span>
              <span>{t("Request")}</span>
              <span>{t("Amount")}</span>
              <span>{t("Submitted")}</span>
              <span>{t("Status")}</span>
            </Box>
            {loading ? (
              <Stack spacing={1} sx={{ p: 2.5 }}>
                <LinearProgress color="secondary" />
                <Typography variant="caption" color="text.secondary">{t("Loading requests...")}</Typography>
              </Stack>
            ) : dashboard.payments.length ? (
              dashboard.payments.map((payment) => (
                <Box
                  className="operations-table-row"
                  key={payment._id || payment.id}
                >
                  <Box>
                    <strong>{payment.userWalletNumber || t("Subscriber")}</strong>
                    <small>{payment.walletType || t("Subscription")}</small>
                  </Box>
                  <span>{payment.requestNumber || "—"}</span>
                  <span>{payment.currencySymbol || ""}{Number(payment.amount || 0).toLocaleString(dateLocale)}</span>
                  <span>{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString(dateLocale) : "—"}</span>
                  <Chip
                    size="small"
                    className={`payment-status ${String(payment.paymentStatus || "").toLowerCase()}`}
                    label={t(payment.paymentStatus || "Unknown")}
                  />
                </Box>
              ))
            ) : (
              <Box className="operations-empty-row">{t("No subscription requests found")}</Box>
            )}
          </Box>
        </Box>

        <Box className="operations-side-column">
          <Box className="operations-panel directory-status-panel">
            <Box className="operations-panel-heading compact">
              <Box>
                <Typography component="h2">{t("Directory status")}</Typography>
                <Typography>{t("Court data stays in sync with the app")}</Typography>
              </Box>
              <span className="status-indicator" />
            </Box>
            <Box className="directory-status-meter">
              <Box className="directory-status-line">
                <span>{t("Last update")}</span>
                <strong>{loading ? "—" : lastUpdated}</strong>
              </Box>
              <Divider />
              <Box className="directory-breakdown">
                <span><b>{dashboard.courtsTotal ?? "—"}</b>{t("Courts")}</span>
                <span><b>{dashboard.floorsTotal ?? "—"}</b>{t("Floors")}</span>
                <span><b>{dashboard.officesTotal ?? "—"}</b>{t("Offices")}</span>
              </Box>
            </Box>
            <Button fullWidth variant="outlined" onClick={() => navigate("/floor-names")}>
              {t("Manage directory labels")}
            </Button>
          </Box>

          <Box className="operations-panel review-panel">
            <Box className="review-panel-icon"><PendingActionsOutlinedIcon /></Box>
            <Typography component="h2">{t("Payment review queue")}</Typography>
            <Typography>{t("Pending subscription requests")}</Typography>
            <Box className="review-count">
              {loading ? "—" : dashboard.pendingTotal ?? "—"}
              <span>{t("Awaiting review")}</span>
            </Box>
            <LinearProgress
              variant="determinate"
              value={dashboard.pendingTotal ? Math.min(100, dashboard.pendingTotal * 8) : 0}
              color="secondary"
            />
            <Typography className="review-footnote">
              {t("Review payment receipts from the administration queue.")}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box className="operations-footer-note">
        <VerifiedUserOutlinedIcon />
        <span>{t("Administrative changes are protected and recorded.")}</span>
      </Box>
    </Box>
  );
};

export default Operations;