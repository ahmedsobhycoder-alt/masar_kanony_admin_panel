import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
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

const sections = [
    {
        title: "Workspace",
        items: [
            { title: "Dashboard", to: "/", icon: <HomeOutlinedIcon /> },
            { title: "Notifications", to: "/notifications", icon: <NotificationsOutlinedIcon /> },
            { title: "Users", to: "/users", icon: <PeopleOutlinedIcon /> },
            { title: "Wallet types", to: "/wallet-types", icon: <AccountBalanceWalletOutlinedIcon /> },
            { title: "Subscription plan", to: "/subscription-plans", icon: <ReceiptOutlinedIcon /> },
            { title: "Contacts Information", to: "/contacts", icon: <ContactsOutlinedIcon /> },
            { title: "Pending payments", to: "/payments", icon: <ReceiptOutlinedIcon /> },
        ],
    },
    {
        title: "Court Directory",
        items: [
            { title: "Governorates", to: "/governorates", icon: <GavelOutlinedIcon /> },
            { title: "Court Types", to: "/court-types", icon: <BalanceOutlinedIcon /> },
            { title: "Courts", to: "/courts", icon: <AccountBalanceOutlinedIcon /> },
            { title: "Floors", to: "/floors", icon: <LayersOutlinedIcon /> },
            { title: "Floor Names", to: "/floor-names", icon: <LayersOutlinedIcon /> },
            { title: "Offices", to: "/offices", icon: <MeetingRoomOutlinedIcon /> },
        ],
    },
    {
        title: "Administration",
        items: [
            { title: "Settings", to: "/settings", icon: <SettingsOutlinedIcon /> },
            { title: "Terms & Conditions", to: "/terms-and-conditions", icon: <DescriptionOutlinedIcon /> },
            { title: "Privacy Policy", to: "/privacy-policy", icon: <PrivacyTipOutlinedIcon /> },
            //   { title: "Profile Form", to: "/form", icon: <PersonOutlinedIcon /> },
            { title: "Calendar", to: "/calendar", icon: <CalendarTodayOutlinedIcon /> },
            { title: "FAQ Page", to: "/faq", icon: <HelpOutlineOutlinedIcon /> },
        ],
    },
    {
        title: "Analytics",
        items: [
            { title: "Bar Chart", to: "/bar", icon: <BarChartOutlinedIcon /> },
            { title: "Pie Chart", to: "/pie", icon: <PieChartOutlineOutlinedIcon /> },
            { title: "Line Chart", to: "/line", icon: <TimelineOutlinedIcon /> },
            { title: "Geography Chart", to: "/geography", icon: <MapOutlinedIcon /> },
        ],
    },
];

const Sidebar = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { t } = useTranslation();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const sidebarText = theme.palette.mode === "light" ? "#f4f6f5" : colors.grey[100];

    return (
        <Box
            sx={{
                "& .pro-sidebar-inner": { background: `${(theme.palette.mode === "dark" ? colors.primary[600] : colors.primary[100])} !important` },
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
                                    <img src="/assets/masar-kanony-logo.svg" alt="" width="36" height="40" />
                                    <Box>
                                        <Typography variant="h6" color={sidebarText} fontWeight="700">Masar Kanony</Typography>
                                        <Typography variant="caption" color={(theme.palette.mode === "dark" ? colors.greenAccent[300] : colors.greenAccent[500])}>مسار قانوني</Typography>
                                    </Box>
                                </Box>
                                <IconButton aria-label="Collapse sidebar" onClick={(event) => { event.stopPropagation(); setCollapsed((value) => !value); }} size="small">
                                    <MenuOutlinedIcon sx={{ color: sidebarText }} />
                                </IconButton>
                            </Box>
                        )}
                    </MenuItem>

                    {sections.map((section) => (
                        <Box key={section.title}>
                            {!collapsed && (
                                <Typography
                                    variant="overline"
                                    color={theme.palette.mode === "light" ? colors.grey[700] : colors.grey[300]}
                                    sx={{ display: "block", mt: "16px", mb: "5px", mx: "26px", textAlign: "start", fontSize: 9, fontWeight: 700 }}
                                >
                                    {t(section.title)}
                                </Typography>
                            )}
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
                        </Box>
                    ))}
                </Menu>
            </ProSidebar>
        </Box>
    );
};

export default Sidebar;
