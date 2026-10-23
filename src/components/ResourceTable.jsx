import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Snackbar,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Header from "./Header";
import { tokens } from "../theme";

export const displayRelatedValue = (value) => {
  if (!value || typeof value !== "object") return value || "—";
  return value.name || value.title || value._id || "—";
};

const ResourceTable = ({ title, subtitle, getPage, columns, crud, headerActions, filterControls, queryKey, onRowClick }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingRow, setEditingRow] = useState(null);
  const [deletingRow, setDeletingRow] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [savingAction, setSavingAction] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => { setPage(0); }, [queryKey]);
  const editorFields = crud?.fields || [];
  const startEditing = (row) => {
    if (crud?.onEdit) {
      crud.onEdit(row);
      return;
    }
    setActionError("");
    setFormValues(Object.fromEntries(editorFields.map((field) => {
      const value = field.getValue ? field.getValue(row) : row[field.name];
      return [field.name, Array.isArray(value) ? value.join(", ") : value ?? ""];
    })));
    setEditingRow(row);
  };
  const updateColumns = crud ? [{
    field: "actions",
    headerName: t("Actions"),
    width: 170,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => (
      <Stack direction="row" spacing={0.5}>
        <Button
          size="small"
          startIcon={<EditOutlinedIcon />}
          onClick={(event) => { event.stopPropagation(); startEditing(params.row); }}
        >
          {t("Edit")}
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteOutlineOutlinedIcon />}
          onClick={(event) => { event.stopPropagation(); setActionError(""); setDeletingRow(params.row); }}
        >
          {t("Delete")}
        </Button>
      </Stack>
    ),
  }] : [];
  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editingRow || !crud || savingAction) return;
    const payload = Object.fromEntries(editorFields.map((field) => [
      field.name,
      field.parse ? field.parse(formValues[field.name]) : formValues[field.name],
    ]));
    try {
      setSavingAction(true);
      setActionError("");
      await crud.update(editingRow._id || editingRow.id, payload);
      setEditingRow(null);
      setRefreshKey((value) => value + 1);
      setNotice("Changes saved");
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || requestError.message || "Update failed");
    } finally {
      setSavingAction(false);
    }
  };
  const confirmDelete = async () => {
    if (!deletingRow || !crud || savingAction) return;
    try {
      setSavingAction(true);
      setActionError("");
      await crud.remove(deletingRow._id || deletingRow.id);
      setDeletingRow(null);
      setRefreshKey((value) => value + 1);
      setNotice("Item deleted");
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || requestError.message || "Delete failed");
    } finally {
      setSavingAction(false);
    }
  };
  const localizedColumns = columns.map((column) => ({
    ...column,
    headerName: t(column.headerName),
  }));

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getPage({ page: page + 1, limit: pageSize });
        if (isMounted) {
          setRows(result.data?.list || []);
          setTotalRows(result.data?.paginationResult?.totalDocuments || 0);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
                t(`Failed to load ${title.toLowerCase()}`)
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [getPage, page, pageSize, title, t, refreshKey]);

  const allColumns = [...localizedColumns, ...updateColumns];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Header title={title} subtitle={subtitle} />
        {headerActions}
      </Box>
      {filterControls}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t(error)}
        </Alert>
      )}
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{t(actionError)}</Alert>}
      <Box
        height="70vh"
        minHeight={380}
        sx={{
          "& .MuiDataGrid-root": {
            border: "1px solid #e4e9eb",
            borderRadius: "8px",
            backgroundColor: "#fff",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #edf0f1",
            color: colors.primary[100],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f4f6f7",
            borderBottom: "1px solid #e4e9eb",
            color: colors.primary[100],
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: "#fff",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #e4e9eb",
            backgroundColor: "#fff",
            color: colors.grey[500],
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#f7f9f8",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          onRowClick={onRowClick}
          rows={rows}
          columns={allColumns}
          getRowId={(row) => row._id || row.id}
          loading={loading}
          paginationMode="server"
          rowCount={totalRows}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
          components={{ Toolbar: GridToolbar }}
          componentsProps={{
            toolbar: {
              showQuickFilter: false,
            },
          }}
          localeText={{
            noRowsLabel: t(`No ${title.toLowerCase()} found`),
            toolbarColumns: t("Columns"),
            toolbarFilters: t("Filters"),
            toolbarDensity: t("Density"),
            toolbarExport: t("Export"),
            footerPaginationRowsPerPage: t("Rows per page:"),
            footerPaginationDisplayedRows: ({ from, to, count }) =>
              `${from}-${to} ${t("of")} ${count}`,
            columnMenuLabel: t("Column menu"),
            columnMenuSortAsc: t("Sort by ASC"),
            columnMenuSortDesc: t("Sort by DESC"),
            columnMenuUnsort: t("Unsort"),
            filterPanelAddFilter: t("Add filter"),
          }}
        />
      </Box>
      <Dialog open={Boolean(editingRow)} onClose={() => !savingAction && setEditingRow(null)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={saveEdit}>
          <DialogTitle>{t("Edit {{title}}", { title: t(title) })}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              {editorFields.map((field) => (
                <Grid item xs={12} sm={field.fullWidth === false ? 6 : 12} key={field.name}>
                  <TextField
                    fullWidth
                    label={t(field.label)}
                    value={formValues[field.name] ?? ""}
                    onChange={(event) => setFormValues((values) => ({ ...values, [field.name]: event.target.value }))}
                    multiline={Boolean(field.multiline)}
                    minRows={field.multiline ? 3 : undefined}
                    required={field.required !== false}
                    disabled={savingAction}
                    type={field.type || "text"}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditingRow(null)} disabled={savingAction}>{t("Cancel")}</Button>
            <Button type="submit" variant="contained" color="secondary" disabled={savingAction}>
              {savingAction ? t("Saving...") : t("Save changes")}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog open={Boolean(deletingRow)} onClose={() => !savingAction && setDeletingRow(null)}>
        <DialogTitle>{t("Delete this item?")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t(crud?.deleteMessage || "This action cannot be undone. Referenced records must be removed first.")}</DialogContentText>
          {actionError && <Alert severity="error" sx={{ mt: 2 }}>{t(actionError)}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeletingRow(null)} disabled={savingAction}>{t("Cancel")}</Button>
          <Button color="error" onClick={confirmDelete} disabled={savingAction}>
            {savingAction ? t("Deleting...") : t("Delete")}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice("")}>
        <Alert severity="success" onClose={() => setNotice("")}>{t(notice)}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ResourceTable;
