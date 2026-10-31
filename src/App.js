import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard/Operations";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Login from "./scenes/auth/Login";
import { logout as logoutApi } from "./api/auth";
import { clearAdminSession, getAdminSession } from "./auth/session";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import Goverorates from "./scenes/governorates";
import CourtTypes from "./scenes/courtTypes";
import Courts from "./scenes/courts";
import CourtDetails from "./scenes/courts/CourtDetails";
import CreateCourt from "./scenes/courts/CreateCourt";
import EditCourt from "./scenes/courts/EditCourt";
import Notifications from "./scenes/notifications";
import Floors from "./scenes/floors";
import FloorNames from "./scenes/floorNames";
import OfficeTypes from "./scenes/officeTypes";
import CourtActivity from "./scenes/courts/CourtActivity";
import Offices from "./scenes/offices";
import Settings from "./scenes/settings";
import TermsAndConditions from "./scenes/termsAndConditions";
import PrivacyPolicy from "./scenes/privacyPolicy";
import Management from "./scenes/management";
import SubscriptionPlans from "./scenes/subscriptionPlans";
import Payments from "./scenes/payments";
import PaymentDetails from "./scenes/payments/PaymentDetails";
import UserDetails from "./scenes/management/UserDetails";
import AdminAuditLogs from "./scenes/adminAudit";

const ltrCache = createCache({ key: "mui" });
const rtlCache = createCache({ key: "muirtl", stylisPlugins: [prefixer, rtlPlugin] });

function App() {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.resolvedLanguage?.startsWith("ar");
  const direction = isArabic ? "rtl" : "ltr";
  const [theme, colorMode] = useMode(direction);
  const [isSidebar, setIsSidebar] = useState(true);
  const [session, setSession] = useState(() => getAdminSession());

  useEffect(() => {
    if (!session) return undefined;
    const remaining = session.expiresAt - Date.now();
    if (remaining <= 0) {
      clearAdminSession();
      setSession(null);
      return undefined;
    }

    const expiryTimer = window.setTimeout(() => {
      clearAdminSession();
      setSession(null);
    }, remaining);
    return () => window.clearTimeout(expiryTimer);
  }, [session]);

  useEffect(() => {
    const expireSession = () => setSession(null);
    window.addEventListener("masar-session-expired", expireSession);
    return () => window.removeEventListener("masar-session-expired", expireSession);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Local expiry still applies when the server cannot be reached.
    } finally {
      clearAdminSession();
      setSession(null);
    }
  };

  const guard = (element, permission, superOnly = false) => {
    const user = session?.user || {};
    const superAdmin = user.role === "admin" && user.isSuperAdmin !== false;
    const allowed = superAdmin || (!superOnly && user.adminPermissions?.includes(permission));
    return allowed ? element : <div style={{ padding: 32 }}>{t("Access denied")}</div>;
  };

  useEffect(() => {
    document.documentElement.lang = isArabic ? "ar" : "en";
    document.documentElement.dir = direction;
  }, [direction, isArabic]);

  return (
    <CacheProvider value={isArabic ? rtlCache : ltrCache}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {session ? (
            <div className={`app theme-${theme.palette.mode}`} dir={direction}>
              <Sidebar isSidebar={isSidebar} session={session} />
              <main className="content">
                <Topbar setIsSidebar={setIsSidebar} session={session} onLogout={handleLogout} />
              <Routes>
              <Route path="/notifications" element={guard(<Notifications />, "notifications")} />
              <Route path="/" element={guard(<Dashboard user={session.user} />, "dashboard")} />
              <Route path="/team" element={guard(<Management key="users" resource="users" />, "users", true)} />
              <Route path="/users" element={guard(<Management key="users" resource="users" />, "users", true)} />
              <Route path="/admins" element={guard(<Management key="admins" resource="users" adminOnly />, "users", true)} />
              <Route path="/users/:id" element={guard(<UserDetails />, "users", true)} />
              <Route path="/payments" element={guard(<Payments />, "payments")} />
              <Route path="/payments/:id" element={<PaymentDetails />} />
              <Route path="/wallet-types" element={guard(<Management key="wallets" resource="wallets" />, "wallet-types")} />
              <Route path="/subscription-plans" element={guard(<SubscriptionPlans />, "subscription-plans")} />
              <Route path="/contacts" element={guard(<Contacts />, "contacts")} />
              <Route path="/governorates" element={guard(<Goverorates />, "governorates")} />
              <Route path="/court-types" element={guard(<CourtTypes />, "court-types")} />
              <Route path="/courts" element={guard(<Courts />, "courts")} />
              <Route path="/office-types" element={guard(<OfficeTypes />, "office-types")} />
              <Route path="/courts/activity" element={guard(<CourtActivity />, "audit", true)} />
              <Route path="/admin-audit" element={guard(<AdminAuditLogs />, "audit", true)} />
              <Route path="/courts/create" element={guard(<CreateCourt />, "courts")} />
              <Route path="/courts/:id/edit" element={guard(<EditCourt />, "courts")} />
              <Route path="/courts/:id" element={guard(<CourtDetails />, "courts")} />
              <Route path="/floors" element={guard(<Floors />, "floors")} />
              <Route path="/floor-names" element={guard(<FloorNames />, "floor-names")} />
              <Route path="/offices" element={guard(<Offices />, "offices")} />
              <Route path="/settings" element={guard(<Settings />, "settings")} />
              <Route path="/terms-and-conditions" element={guard(<TermsAndConditions />, "policies")} />
              <Route path="/privacy-policy" element={guard(<PrivacyPolicy />, "policies")} />
              <Route path="/invoices" element={<Payments />} />
              <Route path="/form" element={<Form />} />
              <Route path="/bar" element={guard(<Bar />, "analytics")} />
              <Route path="/pie" element={guard(<Pie />, "analytics")} />
              <Route path="/line" element={guard(<Line />, "analytics")} />
              <Route path="/faq" element={guard(<FAQ />, "settings")} />
              <Route path="/calendar" element={guard(<Calendar />, "settings")} />
              <Route path="/geography" element={guard(<Geography />, "analytics")} />
              </Routes>
              </main>
            </div>
          ) : (
            <Login onAuthenticated={setSession} />
          )}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </CacheProvider>
  );
}

export default App;
