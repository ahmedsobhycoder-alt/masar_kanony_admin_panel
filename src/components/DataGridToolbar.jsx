import { GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport } from "@mui/x-data-grid";

// Keep the toolbar focused on display/export controls. CSV uses a UTF-8 BOM
// so Arabic text is decoded correctly when opened directly in Microsoft Excel.
export default function DataGridToolbar({ fileName = "export" }) {
  return <GridToolbarContainer>
    <GridToolbarColumnsButton />
    <GridToolbarDensitySelector />
    <GridToolbarExport
      csvOptions={{ fileName, utf8WithBom: true, delimiter: "," }}
      printOptions={{ disableToolbarButton: true }}
    />
  </GridToolbarContainer>;
}

