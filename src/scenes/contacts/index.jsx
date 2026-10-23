import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataContacts } from "../../data/mockData";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

const Contacts = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const columns = [
    { field: "id", headerName: t("ID"), flex: 0.5 },
    { field: "registrarId", headerName: t("Registrar ID") },
    {
      field: "name",
      headerName: t("Name"),
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "age",
      headerName: t("Age"),
      type: "number",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "phone",
      headerName: t("Phone Number"),
      flex: 1,
    },
    {
      field: "email",
      headerName: t("Email"),
      flex: 1,
    },
    {
      field: "address",
      headerName: t("Address"),
      flex: 1,
    },
    {
      field: "city",
      headerName: t("City"),
      flex: 1,
    },
    {
      field: "zipCode",
      headerName: t("Zip Code"),
      flex: 1,
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="CONTACTS"
        subtitle="List of Contacts for Future Reference"
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={mockDataContacts}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          localeText={{
            toolbarColumns: t("Columns"),
            toolbarFilters: t("Filters"),
            toolbarDensity: t("Density"),
            toolbarExport: t("Export"),
            footerPaginationRowsPerPage: t("Rows per page:"),
            noRowsLabel: t("No data"),
          }}
        />
      </Box>
    </Box>
  );
};

export default Contacts;
