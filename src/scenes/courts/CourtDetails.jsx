import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import { displayRelatedValue } from "../../components/ResourceTable";
import { getCourtById } from "../../api/adminResources";

const CourtDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dateLocale = i18n.resolvedLanguage === "ar" ? "ar-EG" : "en-US";

  useEffect(() => {
    let isMounted = true;
    const loadCourt = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getCourtById(id);
        if (isMounted) setCourt(result.data);
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Failed to load court details"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadCourt();
    return () => { isMounted = false; };
  }, [id]);

  const info = court ? [
    ["Address", court.address],
    ["Governorate", displayRelatedValue(court.governorate)],
    ["Court type", displayRelatedValue(court.courtType)],
    ["Working hours", `${court.startingWorkingHours || "—"} - ${court.endWorkingHours || "—"}`],
    ["Floors", court.nFloors ?? court.floors?.length ?? 0],
    ["Offices", court.nOffices ?? 0],
    ["Views", court.nViews ?? 0],
    ["Created", court.createdAt ? new Date(court.createdAt).toLocaleString(dateLocale) : "—"],
    ["Last updated", court.updatedAt ? new Date(court.updatedAt).toLocaleString(dateLocale) : "—"],
  ] : [];

  return (
    <Box m={{ xs: 2, md: 3 }}>
      <Button
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => navigate("/courts")}
        sx={{ mb: 1.5 }}
      >
        {t("Back to courts")}
      </Button>
      <Header title={court?.name || "Court details"} subtitle={t("Complete court record and facilities")} />

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress color="secondary" />
        </Box>
      )}
      {!loading && error && <Alert severity="error">{t(error)}</Alert>}
      {!loading && court && (
        <Stack spacing={3}>
          <Box className="court-detail-panel">
            <Typography component="h2">{t("Court information")}</Typography>
            <Grid container spacing={2.5} mt={0.5}>
              {info.map(([label, value]) => (
                <Grid item xs={12} sm={6} md={4} key={label}>
                  <Typography variant="caption" color="text.secondary" display="block">{t(label)}</Typography>
                  <Typography variant="body1" fontWeight={600}>{value || "—"}</Typography>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box>
            <Box display="flex" alignItems="baseline" justifyContent="space-between" gap={2} mb={1.5}>
              <Box>
                <Typography component="h2" variant="h5" fontWeight={750}>{t("Floors and offices")}</Typography>
                <Typography variant="body2" color="text.secondary">{t("Floor layouts and office information")}</Typography>
              </Box>
              <Button onClick={() => navigate(`/courts/${id}/edit`)}>{t("Edit offices")}</Button>
              <Chip label={t("{{count}} floors", { count: court.floors?.length || 0 })} size="small" />
            </Box>
            {court.floors?.length ? (
              <Stack spacing={2}>
                {court.floors.map((floor, index) => (
                  <Box className="court-detail-floor" key={floor._id || `${floor.floorName}-${index}`}>
                    <Grid container spacing={2.5}>
                      {floor.image && (
                        <Grid item xs={12} md={4}>
                          <Box
                            component="img"
                            src={floor.image.startsWith("http") || floor.image.startsWith("/") ? floor.image : `/uploads/floors/${floor.image}`}
                            alt={`${floor.floorName || `${t("Floor")} ${index + 1}`} ${t("Floor image")}`}
                            loading="lazy"
                            onError={(event) => { event.currentTarget.style.display = "none"; }}
                            sx={{ width: "100%", aspectRatio: "3 / 2", objectFit: "contain", bgcolor: "action.hover", borderRadius: 1 }}
                          />
                        </Grid>
                      )}
                      <Grid item xs={12} md={floor.image ? 8 : 12}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mb={1.5}>
                          <Typography fontWeight={750}>{floor.floorName || `${t("Floor")} ${index + 1}`}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t("{{count}} offices", { count: floor.nOfficesPerFloor ?? floor.offices?.length ?? 0 })}
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 1.5 }} />
                        {floor.offices?.length ? (
                          <Grid container spacing={1.5}>
                            {floor.offices.map((office, officeIndex) => (
                              <Grid item xs={12} sm={6} key={office._id || `${office.roomNumber}-${officeIndex}`}>
                                <Box className="court-detail-office">
                                  <Typography variant="body2" fontWeight={700}>
                                    {displayRelatedValue(office.name || office.officeType)}{office.roomNumber ? ` · ${office.roomNumber}` : ""}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {office.locationDirection || office.description || t("No location details")}
                                  </Typography>
                                  {office.description && office.locationDirection && (
                                    <Typography variant="body2" color="text.secondary" mt={0.5}>{office.description}</Typography>
                                  )}
                                  {office.startingWorkingHours && (
                                    <Typography variant="caption" color="text.secondary">
                                      {office.startingWorkingHours} - {office.endWorkingHours || "—"}
                                    </Typography>
                                  )}
                                  {office.services?.length > 0 && (
                                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                                      {office.services.map((service, serviceIndex) => (
                                        <Chip key={`${service}-${serviceIndex}`} label={service} size="small" variant="outlined" />
                                      ))}
                                    </Box>
                                  )}
                                  {office.mapUrl && (
                                    <Button component="a" href={office.mapUrl} target="_blank" rel="noreferrer" size="small" sx={{ px: 0, mt: 0.5 }}>
                                      {t("View map")}
                                    </Button>
                                  )}
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Typography variant="body2" color="text.secondary">{t("No offices on this floor.")}</Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box className="court-detail-panel">{t("No floor details available.")}</Box>
            )}
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default CourtDetails;
