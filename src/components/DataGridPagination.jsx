import { Button, MenuItem, Select, Stack, Typography } from "@mui/material";
import { gridPageCountSelector, gridPageSelector, gridPageSizeSelector, useGridApiContext, useGridSelector } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";

export default function DataGridPagination({ pageSizeOptions = [5, 10, 20, 50] }) {
  const { t } = useTranslation();
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const options = [...new Set([...pageSizeOptions, pageSize])].sort((a, b) => a - b);

  return <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="center" spacing={1.25} sx={{ width: "100%", py: 0.75 }}>
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="body2" color="text.secondary">{t("Rows per page")}</Typography>
      <Select size="small" value={pageSize} aria-label={t("Rows per page")} onChange={(event) => { apiRef.current.setPageSize(Number(event.target.value)); apiRef.current.setPage(0); }} sx={{ minWidth: 70 }}>
        {options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </Select>
    </Stack>
    <Button size="small" variant="outlined" disabled={page <= 0} onClick={() => apiRef.current.setPage(page - 1)}>{t("Previous")}</Button>
    <Typography variant="body2" sx={{ minWidth: 90, textAlign: "center" }}>{t("Page {{page}} of {{count}}", { page: page + 1, count: Math.max(pageCount, 1) })}</Typography>
    <Button size="small" variant="outlined" disabled={page >= pageCount - 1} onClick={() => apiRef.current.setPage(page + 1)}>{t("Next")}</Button>
  </Stack>;
}
