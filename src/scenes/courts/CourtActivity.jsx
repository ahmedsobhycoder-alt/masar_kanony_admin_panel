import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Button, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import ResourceTable from "../../components/ResourceTable";
import { getCourtActivity } from "../../api/adminResources";

export default function CourtActivity() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const court = params.get("court") || "";
  const getPage = useCallback(query => getCourtActivity({ ...query, ...(court ? { court } : {}) }), [court]);
  const columns = [
    { field: "courtName", headerName: "Court", flex: 1, minWidth: 180 },
    { field: "action", headerName: "Action", width: 140, renderCell: ({ value }) => <Chip size="small" label={t(value)} color={value === "deleted" ? "error" : value === "created" ? "success" : "info"} variant="outlined" /> },
    { field: "adminName", headerName: "Admin user", flex: 1, minWidth: 160 },
    { field: "adminEmail", headerName: "Email", flex: 1, minWidth: 210 },
    { field: "createdAt", headerName: "Date", minWidth: 200, flex: 1, valueGetter: ({ value }) => value ? new Date(value).toLocaleString(i18n.resolvedLanguage?.startsWith("ar") ? "ar-EG" : "en-US") : "" },
  ];
  return <ResourceTable title="Court activity" subtitle="Court changes and the admins responsible" getPage={getPage} queryKey={court} columns={columns}
    headerActions={<Button onClick={() => navigate(court ? "/courts/activity" : "/courts")}>{t(court ? "All court activity" : "Back to courts")}</Button>}
    filterControls={<Alert severity="info" sx={{ mb: 2 }}>{t("History starts when activity tracking is enabled. Deleted courts remain in this log.")}</Alert>} />;
}
