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
import Offices from "./scenes/offices";
import Settings from "./scenes/settings";
import TermsAndConditions from "./scenes/termsAndConditions";
import PrivacyPolicy from "./scenes/privacyPolicy";
import Management from "./scenes/management";
import SubscriptionPlans from "./scenes/subscriptionPlans";
import Payments from "./scenes/payments";
import PaymentDetails from "./scenes/payments/PaymentDetails";
import UserDetails from "./scenes/management/UserDetails";

const ltrCache = createCache({ key: "mui" });
const rtlCache = createCache({ key: "muirtl", stylisPlugins: [prefixer, rtlPlugin] });

function App() {
  const { i18n } = useTranslation();
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
            <div className="app" dir={direction}>
              <Sidebar isSidebar={isSidebar} />
              <main className="content">
                <Topbar setIsSidebar={setIsSidebar} session={session} onLogout={handleLogout} />
              <Routes>
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/" element={<Dashboard user={session.user} />} />
              <Route path="/team" element={<Management key="users" resource="users" />} />
              <Route path="/users" element={<Management key="users" resource="users" />} />
              <Route path="/users/:id" element={<UserDetails />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/payments/:id" element={<PaymentDetails />} />
              <Route path="/wallet-types" element={<Management key="wallets" resource="wallets" />} />
              <Route path="/subscription-plans" element={<SubscriptionPlans />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/governorates" element={<Goverorates />} />
              <Route path="/court-types" element={<CourtTypes />} />
              <Route path="/courts" element={<Courts />} />
              <Route path="/courts/create" element={<CreateCourt />} />
              <Route path="/courts/:id/edit" element={<EditCourt />} />
              <Route path="/courts/:id" element={<CourtDetails />} />
              <Route path="/floors" element={<Floors />} />
              <Route path="/floor-names" element={<FloorNames />} />
              <Route path="/offices" element={<Offices />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/invoices" element={<Payments />} />
              <Route path="/form" element={<Form />} />
              <Route path="/bar" element={<Bar />} />
              <Route path="/pie" element={<Pie />} />
              <Route path="/line" element={<Line />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/geography" element={<Geography />} />
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
