import { useState } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

const sections = [
    {
        title: "Workspace",
        items: [
            { title: "Dashboard", to: "/", permission: "dashboard", icon: <HomeOutlinedIcon /> },
            { title: "Notifications", to: "/notifications", permission: "notifications", icon: <NotificationsOutlinedIcon /> },
            { title: "Users", to: "/users", superOnly: true, icon: <PeopleOutlinedIcon /> },
            { title: "Admin Management", to: "/admins", superOnly: true, icon: <PeopleOutlinedIcon /> },
            { title: "Wallet types", to: "/wallet-types", permission: "wallet-types", icon: <AccountBalanceWalletOutlinedIcon /> },
            { title: "Subscription plan", to: "/subscription-plans", permission: "subscription-plans", icon: <ReceiptOutlinedIcon /> },
            { title: "Contacts Information", to: "/contacts", permission: "contacts", icon: <ContactsOutlinedIcon /> },
            { title: "Pending payments", to: "/payments", permission: "payments", icon: <ReceiptOutlinedIcon /> },
        ],
    },
    {
        title: "Court Directory",
        items: [
            { title: "Governorates", to: "/governorates", permission: "governorates", icon: <GavelOutlinedIcon /> },
            { title: "Court Types", to: "/court-types", permission: "court-types", icon: <BalanceOutlinedIcon /> },
            { title: "Courts", to: "/courts", permission: "courts", icon: <AccountBalanceOutlinedIcon /> },
            { title: "Floors", to: "/floors", permission: "floors", icon: <LayersOutlinedIcon /> },
            { title: "Floor Names", to: "/floor-names", permission: "floor-names", icon: <LayersOutlinedIcon /> },
            { title: "Office Types", to: "/office-types", permission: "office-types", icon: <MeetingRoomOutlinedIcon /> },
            { title: "Audit logs", to: "/admin-audit", superOnly: true, icon: <HistoryOutlinedIcon /> },
            { title: "Offices", to: "/offices", permission: "offices", icon: <MeetingRoomOutlinedIcon /> },
        ],
    },
    {
        title: "Administration",
        items: [
            { title: "Settings", to: "/settings", permission: "settings", icon: <SettingsOutlinedIcon /> },
            { title: "Terms & Conditions", to: "/terms-and-conditions", permission: "policies", icon: <DescriptionOutlinedIcon /> },
            { title: "Privacy Policy", to: "/privacy-policy", permission: "policies", icon: <PrivacyTipOutlinedIcon /> },
            //   { title: "Profile Form", to: "/form", icon: <PersonOutlinedIcon /> },
            { title: "Calendar", to: "/calendar", permission: "settings", icon: <CalendarTodayOutlinedIcon /> },
            { title: "FAQ Page", to: "/faq", permission: "settings", icon: <HelpOutlineOutlinedIcon /> },
        ],
    },
    {
        title: "Analytics",
        items: [
            { title: "Bar Chart", to: "/bar", permission: "analytics", icon: <BarChartOutlinedIcon /> },
            { title: "Pie Chart", to: "/pie", permission: "analytics", icon: <PieChartOutlineOutlinedIcon /> },
            { title: "Line Chart", to: "/line", permission: "analytics", icon: <TimelineOutlinedIcon /> },
            { title: "Geography Chart", to: "/geography", permission: "analytics", icon: <MapOutlinedIcon /> },
        ],
    },
];

const Sidebar = ({ session }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { t } = useTranslation();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const sidebarText = theme.palette.mode === "light" ? "#f4f6f5" : colors.grey[100];
    const user = session?.user || {};
    const superAdmin = user.role === "admin" && user.isSuperAdmin !== false;
    const canSee = (item) => superAdmin || (!item.superOnly && (!item.permission || user.adminPermissions?.includes(item.permission)));

    return (
        <Box
            sx={{
                height: "100vh",
                maxHeight: "100vh",
                "@supports (height: 100dvh)": {
                    height: "100dvh",
                    maxHeight: "100dvh",
                },
                position: "sticky",
                top: 0,
                flexShrink: 0,
                overflow: "hidden",
                "& .pro-sidebar": { height: "100% !important", minHeight: 0 },
                "& .pro-sidebar-inner": {
                    height: "100%",
                    minHeight: 0,
                    overflow: "hidden !important",
                    background: `${(theme.palette.mode === "dark" ? colors.primary[600] : colors.primary[100])} !important`,
                },
                "& .pro-sidebar-layout": {
                    height: "100% !important",
                    minHeight: 0,
                    overflowY: "auto !important",
                    overflowX: "hidden !important",
                    overscrollBehavior: "contain",
                    scrollbarGutter: "stable",
                },
                "& .pro-menu": { paddingBottom: "28px" },
                "& .pro-icon-wrapper": { backgroundColor: "transparent !important" },
                "& .pro-inner-item": {
                    padding: "7px 18px !important",
                    color: `${sidebarText} !important`,
                    borderRadius: "5px",
                    margin: "2px 8px",
                    justifyContent: "flex-start !important",
                    textAlign: "start !important",
                },
                "& .pro-inner-item > .pro-item-content": {
                    flex: 1,
                    textAlign: "start",
                },
                "& .pro-inner-item:hover": { color: `${(theme.palette.mode === "dark" ? colors.greenAccent[300] : colors.greenAccent[500])} !important` },
                "& .pro-menu-item.active > .pro-inner-item": {
                    color: `${(theme.palette.mode === "dark" ? colors.greenAccent[300] : colors.greenAccent[500])} !important`,
                    background: "rgba(255,255,255,0.08) !important",
                },
                "& .pro-sub-menu > .pro-inner-item": {
                    marginTop: "10px",
                    fontWeight: "700",
                    background: "rgba(255,255,255,0.05) !important",
                },
                "& .pro-sub-menu > .pro-inner-list-item": {
                    background: "transparent !important",
                },
                "& .pro-sub-menu .pro-menu-item > .pro-inner-item": {
                    paddingInlineStart: collapsed ? "18px !important" : "30px !important",
                },
            }}
        >
            <ProSidebar collapsed={collapsed}>
                <Menu iconShape="square">
                    <MenuItem
                        onClick={() => setCollapsed((value) => !value)}
                        icon={collapsed ? <MenuOutlinedIcon /> : undefined}
                        style={{ margin: "12px 0 20px", color: sidebarText }}
                    >
                        {!collapsed && (
                            <Box display="flex" justifyContent="space-between" alignItems="center" ml="8px">
                                <Box display="flex" alignItems="center" gap="10px">
                                    <img src={`${process.env.PUBLIC_URL}/assets/masar-kanony-logo.svg`} alt="" width="36" height="40" />
                                    <Box>
                                        <Typography variant="h6" color={sidebarText} fontWeight="700">Masar Kanony</Typography>
                                        <Typography variant="caption" color={(theme.palette.mode === "dark" ? colors.greenAccent[300] : colors.greenAccent[500])}>مسار قانوني</Typography>
                                    </Box>
                                </Box>
                                <IconButton aria-label={t("Collapse sidebar")} onClick={(event) => { event.stopPropagation(); setCollapsed((value) => !value); }} size="small">
                                    <MenuOutlinedIcon sx={{ color: sidebarText }} />
                                </IconButton>
                            </Box>
                        )}
                    </MenuItem>

                    {sections.map((section) => ({ ...section, items: section.items.filter(canSee) })).filter((section) => section.items.length).map((section) => (
                        <SubMenu
                            key={section.title}
                            title={t(section.title)}
                            defaultOpen={section.items.some((item) => location.pathname === item.to)}
                        >
                            {section.items.map((item) => (
                                <MenuItem
                                    key={item.to}
                                    active={location.pathname === item.to}
                                    icon={item.icon}
                                    onClick={() => { }}
                                >
                                    <Typography>{t(item.title)}</Typography>
                                    <Link to={item.to} />
                                </MenuItem>
                            ))}
                        </SubMenu>
                    ))}
                </Menu>
            </ProSidebar>
        </Box>
    );
};

export default Sidebar;
