import { useNavigate } from "react-router-dom";
import { Button, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import ResourceTable from "../../components/ResourceTable";
import { getPayments } from "../../api/adminResources";

const getPendingPayments = (params) => getPayments({ ...params, status: "PENDING" });

export default function Payments() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const columns = [
    { field: "requestNumber", headerName: "Request", minWidth: 180, flex: 1, renderCell: ({ row }) => <Button onClick={(event) => { event.stopPropagation(); navigate(`/payments/${row._id || row.id}`); }}>{row.requestNumber || row._id || row.id}</Button> },
    { field: "user", headerName: "Subscriber", minWidth: 180, flex: 1, renderCell: ({ row }) => row.user ? <Button onClick={(event) => { event.stopPropagation(); navigate(`/users/${row.user._id || row.user.id || row.user}`); }}>{row.user.name || t("View user")}</Button> : t("User not found") },
    { field: "amount", headerName: "Amount", width: 150, valueGetter: ({ row }) => `${row.amount} ${row.currency}` },
    { field: "walletType", headerName: "Wallet type", minWidth: 160, flex: 1 },
    { field: "walletNumber", headerName: "Wallet phone", minWidth: 150 },
    { field: "createdAt", headerName: "Submitted", minWidth: 210, valueGetter: ({ value }) => value ? new Date(value).toLocaleString(i18n.resolvedLanguage?.startsWith("ar") ? "ar-EG" : "en-US") : "—" },
    { field: "paymentStatus", headerName: "Status", width: 130, renderCell: () => <Chip color="warning" size="small" label={t("PENDING")} /> },
    { field: "review", headerName: "Actions", width: 120, sortable: false, renderCell: ({ row }) => <Button onClick={(event) => { event.stopPropagation(); navigate(`/payments/${row._id || row.id}`); }}>{t("Review")}</Button> },
  ];
  return <ResourceTable title="Pending payments" subtitle="Review subscription payment requests" getPage={getPendingPayments} columns={columns} onRowClick={({ row }) => navigate(`/payments/${row._id || row.id}`)} />;
}
