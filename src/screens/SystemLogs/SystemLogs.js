import React, { useState, useEffect, useRef } from 'react';
import {
    Container, Paper, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    Box, Chip, Tooltip, IconButton, Tabs, Tab, Button,
    Grid, Card, CardContent, TextField, InputAdornment
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PublicIcon from '@mui/icons-material/Public';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import LanguageIcon from '@mui/icons-material/Language';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import axios from 'axios';
import { toast } from 'sonner';
import dayjs from 'dayjs';

const adminApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8386';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            style={{ padding: 0 }}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

// Leaflet World Map Component
const LeafletWorldMap = ({ locations }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        const loadLeaflet = () => {
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            if (!window.L) {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => initMap();
                document.body.appendChild(script);
            } else {
                initMap();
            }
        };

        const initMap = () => {
            if (!mapRef.current || mapInstanceRef.current || !window.L) return;

            const L = window.L;
            const map = L.map(mapRef.current).setView([20.0, 15.0], 2);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18
            }).addTo(map);

            mapInstanceRef.current = map;
            renderMarkers();
        };

        loadLeaflet();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const renderMarkers = () => {
        if (!mapInstanceRef.current || !window.L || !locations) return;
        const L = window.L;
        const map = mapInstanceRef.current;

        markersRef.current.forEach(m => map.removeLayer(m));
        markersRef.current = [];

        locations.forEach(loc => {
            if (!loc.lat || !loc.lng) return;

            const isBlocked = loc.isBlocked;
            const markerBg = isBlocked ? '#ef4444' : '#2563eb';
            const iconHtml = `
                <div style="
                    background: ${markerBg};
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    border: 2px solid #ffffff;
                    box-shadow: 0 0 10px ${isBlocked ? 'rgba(239,68,68,0.9)' : 'rgba(37,99,235,0.9)'};
                "></div>
            `;

            const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-map-marker',
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });

            const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

            const popupContent = `
                <div style="font-family: Arial, sans-serif; padding: 4px; min-width: 190px;">
                    <div style="font-weight: bold; color: #0f172a; font-size: 0.9rem; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; pb: 4px;">
                        📍 ${loc.city || 'Unknown'}, ${loc.country || 'Unknown'}
                    </div>
                    <div style="font-size: 0.78rem; color: #334155; margin-bottom: 3px;">
                        👤 <strong>Người dùng:</strong> ${loc.username || 'Khách vãng lai'}
                    </div>
                    <div style="font-size: 0.78rem; color: #334155; margin-bottom: 3px;">
                        🌐 <strong>Địa chỉ IP:</strong> ${loc.ip}
                    </div>
                    <div style="font-size: 0.78rem; color: #334155; margin-bottom: 3px;">
                        💻 <strong>Thiết bị:</strong> ${loc.device || 'N/A'}
                    </div>
                    <div style="font-size: 0.78rem; color: #334155; margin-bottom: 3px;">
                        📄 <strong>Trang xem:</strong> ${loc.page || '/'}
                    </div>
                    <div style="font-size: 0.78rem; color: #334155; margin-bottom: 3px;">
                        🔢 <strong>Lượt truy cập:</strong> ${loc.visitCount || 1}
                    </div>
                    <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">
                        ⏱️ ${dayjs(loc.lastSeen).format('DD/MM/YYYY HH:mm:ss')}
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            markersRef.current.push(marker);
        });
    };

    useEffect(() => {
        if (mapInstanceRef.current && locations) {
            renderMarkers();
        }
    }, [locations]);

    return (
        <Box sx={{ width: '100%', position: 'relative' }}>
            <div 
                ref={mapRef} 
                style={{ width: '100%', height: '480px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }} 
            />
            <Box 
                sx={{ 
                    position: 'absolute', 
                    bottom: 16, 
                    left: 16, 
                    zIndex: 1000, 
                    bgcolor: 'rgba(255,255,255,0.92)', 
                    p: 1.5, 
                    borderRadius: 2, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    backdropFilter: 'blur(4px)'
                }}
            >
                <Typography variant="caption" fontWeight="bold" display="block" color="textSecondary" mb={0.5}>
                    Chú thích bản đồ:
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2563eb' }} />
                    <Typography variant="caption">Vị trí truy cập bình thường</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />
                    <Typography variant="caption">Vị trí IP đang bị chặn</Typography>
                </Box>
            </Box>
        </Box>
    );
};

const SystemLogs = () => {
    const [tabIndex, setTabIndex] = useState(0);

    // Summary Stats
    const [stats, setStats] = useState({
        totalVisits: 0,
        uniqueIpsCount: 0,
        todayVisits: 0,
        activeOnline: 0,
        topCountries: []
    });

    // Map Locations
    const [mapLocations, setMapLocations] = useState([]);

    // IP Visitor Logs
    const [visitorLogs, setVisitorLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [pageVisitor, setPageVisitor] = useState(0);
    const [rowsPerPageVisitor, setRowsPerPageVisitor] = useState(10);

    // Online Visitors
    const [onlineVisitors, setOnlineVisitors] = useState([]);

    // System Action Logs
    const [actionLogs, setActionLogs] = useState([]);
    const [loadingActionLogs, setLoadingActionLogs] = useState(false);
    const [pageAction, setPageAction] = useState(0);
    const [rowsPerPageAction, setRowsPerPageAction] = useState(10);

    // Blocked IPs
    const [blockedIps, setBlockedIps] = useState([]);

    const fetchAllData = async () => {
        try {
            // Stats
            const statsRes = await axios.get(`${adminApiUrl}/api/visitors/stats`);
            if (statsRes.data?.status === 'success') {
                setStats(statsRes.data.data);
            }

            // Map Locations
            const mapRes = await axios.get(`${adminApiUrl}/api/visitors/map-locations`);
            if (mapRes.data?.status === 'success') {
                setMapLocations(mapRes.data.data);
            }

            // Visitor Logs
            const vLogRes = await axios.get(`${adminApiUrl}/api/visitors/logs`);
            if (vLogRes.data?.status === 'success') {
                setVisitorLogs(vLogRes.data.data);
            }

            // Action Logs
            setLoadingActionLogs(true);
            const aLogRes = await axios.get(`${adminApiUrl}/api/log`);
            if (aLogRes.data?.status === 'success') {
                setActionLogs(aLogRes.data.data);
            }
        } catch (error) {
            console.error("Error fetching system log data:", error);
        } finally {
            setLoadingActionLogs(false);
        }
    };

    const fetchOnlineVisitors = async () => {
        try {
            const res = await axios.get(`${adminApiUrl}/api/visitors/active`);
            if (res.data?.status === 'success') {
                setOnlineVisitors(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching active visitors:", err);
        }
    };

    const fetchBlockedIps = async () => {
        try {
            const res = await axios.get(`${adminApiUrl}/api/visitors/blocked`);
            if (res.data?.status === 'success') {
                setBlockedIps(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching blocked IPs:", err);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (tabIndex === 2) {
            fetchOnlineVisitors();
            const interval = setInterval(fetchOnlineVisitors, 5000);
            return () => clearInterval(interval);
        }
        if (tabIndex === 4) {
            fetchBlockedIps();
        }
    }, [tabIndex]);

    const handleBlockIp = async (ip) => {
        try {
            await axios.post(`${adminApiUrl}/api/visitors/block`, { ip });
            toast.success(`Đã chặn địa chỉ IP ${ip}`);
            fetchAllData();
            if (tabIndex === 2) fetchOnlineVisitors();
            if (tabIndex === 4) fetchBlockedIps();
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi chặn IP");
        }
    };

    const handleUnblockIp = async (ip) => {
        try {
            await axios.post(`${adminApiUrl}/api/visitors/unblock`, { ip });
            toast.success(`Đã gỡ chặn địa chỉ IP ${ip}`);
            fetchAllData();
            if (tabIndex === 2) fetchOnlineVisitors();
            if (tabIndex === 4) fetchBlockedIps();
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi gỡ chặn IP");
        }
    };

    // Filter visitor logs
    const filteredVisitorLogs = visitorLogs.filter(log => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            (log.ip && log.ip.toLowerCase().includes(query)) ||
            (log.username && log.username.toLowerCase().includes(query)) ||
            (log.city && log.city.toLowerCase().includes(query)) ||
            (log.country && log.country.toLowerCase().includes(query)) ||
            (log.device && log.device.toLowerCase().includes(query)) ||
            (log.page && log.page.toLowerCase().includes(query))
        );
    });

    return (
        <Container maxWidth="xl" sx={{ mt: 3, mb: 5 }}>
            {/* Header Title */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" fontWeight="800" color="#0f172a" display="flex" alignItems="center" gap={1}>
                        <PublicIcon sx={{ color: '#2563eb' }} /> NHẬT KÝ HOẠT ĐỘNG & BẢN ĐỒ TRUY CẬP WEBSITE
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Theo dõi tổng hợp lượt truy cập, bản đồ thế giới geolocation, nhật ký IP và quản lý bảo mật hệ thống.
                    </Typography>
                </Box>
                <IconButton color="primary" onClick={fetchAllData} sx={{ bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }}>
                    <RefreshIcon />
                </IconButton>
            </Box>

            {/* Summary Analytics Cards */}
            <Grid container spacing={2.5} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                        <CardContent sx={{ py: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="#0369a1">TỔNG LƯỢT TRUY CẬP</Typography>
                                    <Typography variant="h4" fontWeight="800" color="#0c4a6e" mt={0.5}>
                                        {stats.totalVisits.toLocaleString('vi-VN')}
                                    </Typography>
                                </Box>
                                <VisibilityIcon sx={{ fontSize: 40, color: '#0284c7', opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <CardContent sx={{ py: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="#15803d">SỐ IP KHÁC NHAU</Typography>
                                    <Typography variant="h4" fontWeight="800" color="#14532d" mt={0.5}>
                                        {stats.uniqueIpsCount.toLocaleString('vi-VN')}
                                    </Typography>
                                </Box>
                                <LanguageIcon sx={{ fontSize: 40, color: '#16a34a', opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', bgcolor: '#fff7ed', border: '1px solid #fed7aa' }}>
                        <CardContent sx={{ py: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="#c2410c">TRUY CẬP HÔM NAY</Typography>
                                    <Typography variant="h4" fontWeight="800" color="#7c2d12" mt={0.5}>
                                        {stats.todayVisits.toLocaleString('vi-VN')}
                                    </Typography>
                                </Box>
                                <PeopleIcon sx={{ fontSize: 40, color: '#ea580c', opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
                        <CardContent sx={{ py: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="#b91c1c">ĐANG ONLINE REALTIME</Typography>
                                    <Typography variant="h4" fontWeight="800" color="#7f1d1d" mt={0.5} display="flex" alignItems="center" gap={1}>
                                        {stats.activeOnline}
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444', animation: 'blink 1.5s infinite' }} />
                                    </Typography>
                                </Box>
                                <SecurityIcon sx={{ fontSize: 40, color: '#dc2626', opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Main Tabs Navigation */}
            <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                    <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} variant="scrollable" scrollButtons="auto">
                        <Tab label="🗺️ Bản Đồ Thế Giới Truy Cập" sx={{ fontWeight: '700', textTransform: 'none' }} />
                        <Tab label="🌐 Nhật Ký Truy Cập IP" sx={{ fontWeight: '700', textTransform: 'none' }} />
                        <Tab 
                            label={
                                <Box display="flex" alignItems="center">
                                    🟢 Khách Đang Online
                                    <Typography variant="caption" sx={{ ml: 1, bgcolor: '#dbeafe', color: '#1d4ed8', px: 1, borderRadius: 2, fontWeight: 'bold' }}>
                                        {onlineVisitors.length}
                                    </Typography>
                                </Box>
                            } 
                            sx={{ fontWeight: '700', textTransform: 'none' }} 
                        />
                        <Tab label="⚙️ Thao Tác Hệ Thống" sx={{ fontWeight: '700', textTransform: 'none' }} />
                        <Tab label="🚫 IP Bị Chặn" sx={{ fontWeight: '700', textTransform: 'none' }} />
                    </Tabs>
                </Box>

                {/* TAB 0: BẢN ĐỒ THẾ GIỚI GEOLOCATION */}
                <CustomTabPanel value={tabIndex} index={0}>
                    <Box p={2.5}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={8.5}>
                                <Typography variant="subtitle1" fontWeight="700" color="#1e293b" mb={1.5} display="flex" alignItems="center" gap={1}>
                                    📍 Vị trí các User & IP đã truy cập trên Bản đồ Thế giới:
                                </Typography>
                                <LeafletWorldMap locations={mapLocations} />
                            </Grid>

                            <Grid item xs={12} lg={3.5}>
                                <Typography variant="subtitle1" fontWeight="700" color="#1e293b" mb={1.5}>
                                    🏆 Quốc gia truy cập nhiều nhất:
                                </Typography>
                                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                    {stats.topCountries.length === 0 ? (
                                        <Box p={2} textAlign="center" color="text.secondary">Chưa có dữ liệu quốc gia.</Box>
                                    ) : (
                                        stats.topCountries.map((item, index) => (
                                            <Box 
                                                key={index} 
                                                p={1.5} 
                                                display="flex" 
                                                justifyContent="space-between" 
                                                alignItems="center"
                                                borderBottom={index < stats.topCountries.length - 1 ? '1px solid #f1f5f9' : 'none'}
                                                bgcolor={index === 0 ? '#f0f9ff' : '#ffffff'}
                                            >
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Chip label={`#${index + 1}`} size="small" color={index === 0 ? "primary" : "default"} />
                                                    <Typography variant="body2" fontWeight="600" color="#334155">
                                                        {item.country}
                                                    </Typography>
                                                </Box>
                                                <Chip label={`${item.count} lượt`} size="small" variant="outlined" style={{ fontWeight: 600 }} />
                                            </Box>
                                        ))
                                    )}
                                </Paper>

                                <Box mt={3} p={2} bgcolor="#f8fafc" borderRadius="10px" border="1px solid #e2e8f0">
                                    <Typography variant="subtitle2" fontWeight="700" color="#0f172a" mb={1}>
                                        ℹ️ Về dữ liệu vị trí:
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" display="block" paragraph style={{ marginBottom: '6px' }}>
                                        - Bản đồ tự động định vị vị trí địa lý (Quốc gia, Thành phố, Tọa độ Lat/Lng) dựa trên địa chỉ IP của từng truy cập.
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        - Nhấp vào từng ghim trên bản đồ để xem chi tiết tên User, IP, Thiết bị và nút thao tác Chặn IP trực tiếp.
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </CustomTabPanel>

                {/* TAB 1: NHẬT KÝ TRUY CẬP IP */}
                <CustomTabPanel value={tabIndex} index={1}>
                    <Box px={2.5} pb={1} display="flex" justifyContent="space-between" alignItems="center">
                        <TextField
                            size="small"
                            placeholder="Tìm theo IP, Người dùng, Thành phố, Quốc gia, Thiết bị..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ width: 380 }}
                        />
                        <Typography variant="caption" color="textSecondary">
                            Hiển thị <strong>{filteredVisitorLogs.length}</strong> nhật ký IP
                        </Typography>
                    </Box>

                    <TableContainer>
                        <Table sx={{ minWidth: 700 }}>
                            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Thời gian gần nhất</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Địa chỉ IP</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Vị trí (City / Country)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Tài khoản / Khách</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Lượt xem</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Thiết bị</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Trang xem</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredVisitorLogs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 3, color: '#64748b' }}>
                                            Chưa có nhật ký truy cập IP nào.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {(rowsPerPageVisitor > 0
                                    ? filteredVisitorLogs.slice(pageVisitor * rowsPerPageVisitor, pageVisitor * rowsPerPageVisitor + rowsPerPageVisitor)
                                    : filteredVisitorLogs
                                ).map((log) => (
                                    <TableRow key={log._id} hover>
                                        <TableCell>{dayjs(log.lastSeen).format('DD/MM/YYYY HH:mm:ss')}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="700" color="#2563eb">
                                                {log.ip}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={`📍 ${log.city || 'N/A'}, ${log.country || 'N/A'}`} 
                                                size="small" 
                                                variant="outlined"
                                                style={{ fontSize: '0.75rem', fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={log.username || 'Khách vãng lai'} 
                                                color={log.username && log.username !== 'Khách vãng lai' ? "primary" : "default"} 
                                                size="small" 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={`${log.visitCount || 1} lần`} size="small" color="info" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={log.device || 'N/A'}>
                                                <Typography variant="body2" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {log.device || 'N/A'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {log.page || '/'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            {log.isBlocked ? (
                                                <Button size="small" variant="contained" color="success" onClick={() => handleUnblockIp(log.ip)}>
                                                    Gỡ chặn
                                                </Button>
                                            ) : (
                                                <Button size="small" variant="outlined" color="error" startIcon={<BlockIcon />} onClick={() => handleBlockIp(log.ip)}>
                                                    Chặn IP
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={filteredVisitorLogs.length}
                            rowsPerPage={rowsPerPageVisitor}
                            page={pageVisitor}
                            onPageChange={(e, newPage) => setPageVisitor(newPage)}
                            onRowsPerPageChange={(e) => { setRowsPerPageVisitor(parseInt(e.target.value, 10)); setPageVisitor(0); }}
                            labelRowsPerPage="Số dòng:"
                        />
                    </TableContainer>
                </CustomTabPanel>

                {/* TAB 2: KHÁCH ĐANG ONLINE */}
                <CustomTabPanel value={tabIndex} index={2}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ backgroundColor: '#e0f2fe' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Người dùng</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Địa chỉ IP</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Vị trí</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Thiết bị</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Trang đang xem</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {onlineVisitors.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                            Hiện tại không có khách hàng nào đang online.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {onlineVisitors.map((v) => (
                                    <TableRow key={v.id} hover>
                                        <TableCell>
                                            <Chip label={v.isBlocked ? "Bị chặn" : "Online"} color={v.isBlocked ? "error" : "success"} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="700">
                                                {v.username || 'Khách vãng lai'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{v.ip}</TableCell>
                                        <TableCell>📍 {v.city || 'Hà Nội'}, {v.country || 'Việt Nam'}</TableCell>
                                        <TableCell>{v.device}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="primary" fontWeight="600">
                                                {v.page}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {v.isBlocked ? (
                                                <Button size="small" variant="contained" color="success" onClick={() => handleUnblockIp(v.ip)}>Gỡ chặn</Button>
                                            ) : (
                                                <Button size="small" variant="outlined" color="error" onClick={() => handleBlockIp(v.ip)}>Chặn IP</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CustomTabPanel>

                {/* TAB 3: NHẬT KÝ THAO TÁC HỆ THỐNG */}
                <CustomTabPanel value={tabIndex} index={3}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Người thực hiện</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Thiết bị</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Chi tiết</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {actionLogs.length === 0 && !loadingActionLogs && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">Không có dữ liệu thao tác.</TableCell>
                                    </TableRow>
                                )}
                                {(rowsPerPageAction > 0
                                    ? actionLogs.slice(pageAction * rowsPerPageAction, pageAction * rowsPerPageAction + rowsPerPageAction)
                                    : actionLogs
                                ).map((log) => (
                                    <TableRow key={log._id} hover>
                                        <TableCell>{dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}</TableCell>
                                        <TableCell>
                                            <Chip label={log.user} color="secondary" size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="500" color="textSecondary">
                                                {log.action}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Tooltip title={log.deviceInfo || 'Unknown'}>
                                                <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {log.deviceInfo || 'Unknown'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={log.details ? JSON.stringify(log.details, null, 2) : 'Không có'}>
                                                <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', color: '#1976d2' }}>
                                                    {log.details ? JSON.stringify(log.details) : 'N/A'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={actionLogs.length}
                            rowsPerPage={rowsPerPageAction}
                            page={pageAction}
                            onPageChange={(e, newPage) => setPageAction(newPage)}
                            onRowsPerPageChange={(e) => { setRowsPerPageAction(parseInt(e.target.value, 10)); setPageAction(0); }}
                            labelRowsPerPage="Số dòng:"
                        />
                    </TableContainer>
                </CustomTabPanel>

                {/* TAB 4: DANH SÁCH IP BỊ CHẶN */}
                <CustomTabPanel value={tabIndex} index={4}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ backgroundColor: '#ffebee' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Địa chỉ IP</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Ngày bị chặn</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Lý do</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {blockedIps.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>Chưa có IP nào bị chặn.</TableCell>
                                    </TableRow>
                                )}
                                {blockedIps.map((b) => (
                                    <TableRow key={b._id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="700" color="error">
                                                {b.ip}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{dayjs(b.blockedAt).format('DD/MM/YYYY HH:mm:ss')}</TableCell>
                                        <TableCell>{b.reason}</TableCell>
                                        <TableCell>
                                            <Button size="small" variant="contained" color="success" onClick={() => handleUnblockIp(b.ip)}>Gỡ chặn</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CustomTabPanel>
            </Paper>

            <style>
                {`
                @keyframes blink {
                    0% { opacity: 0.3; }
                    50% { opacity: 1; box-shadow: 0 0 8px #ef4444; }
                    100% { opacity: 0.3; }
                }
                .custom-map-marker {
                    background: transparent;
                    border: none;
                }
                `}
            </style>
        </Container>
    );
};

export default SystemLogs;
