import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Paper, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    Box, Chip, Tooltip, IconButton, Button,
    Grid, TextField, InputAdornment,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Select, MenuItem, FormControl, InputLabel,
    Stack, Divider, Badge
} from '@mui/material';
import axios from 'axios';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import './systemlogs.css';

const adminApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8386';

// Helper parse User Agent thành thông tin thiết bị & trình duyệt trực quan
const parseUserAgent = (ua = '') => {
    if (!ua || ua === 'Unknown' || ua === 'Unknown Device') {
        return { os: 'N/A', browser: 'N/A', label: 'Thiết bị không rõ', icon: 'fa-solid fa-desktop' };
    }
    let os = 'Thiết bị khác';
    let browser = 'Trình duyệt';
    let icon = 'fa-solid fa-desktop';

    if (/iphone/i.test(ua)) { os = 'iPhone'; icon = 'fa-solid fa-mobile-screen-button'; }
    else if (/ipad/i.test(ua)) { os = 'iPad'; icon = 'fa-solid fa-tablet-screen-button'; }
    else if (/android/i.test(ua)) { os = 'Android'; icon = 'fa-brands fa-android'; }
    else if (/windows/i.test(ua)) { os = 'Windows'; icon = 'fa-brands fa-windows'; }
    else if (/macintosh|mac os/i.test(ua)) { os = 'macOS'; icon = 'fa-brands fa-apple'; }
    else if (/linux/i.test(ua)) { os = 'Linux'; icon = 'fa-brands fa-linux'; }

    if (/coc_coc/i.test(ua)) browser = 'Cốc Cốc';
    else if (/edg/i.test(ua)) browser = 'Edge';
    else if (/opr|opera/i.test(ua)) browser = 'Opera';
    else if (/chrome|crios/i.test(ua) && !/edg|opr/i.test(ua)) browser = 'Chrome';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';

    return { os, browser, label: `${browser} (${os})`, icon };
};

// Google World Map Component
const GoogleWorldMap = ({ locations, onBlockIp }) => {
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
            const map = L.map(mapRef.current, {
                center: [20.0, 15.0],
                zoom: 2,
                minZoom: 2,
                maxZoom: 20
            });

            // Google Maps Tile Layers (Roadmap, Satellite, Hybrid, Terrain)
            const googleRoadmap = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a>'
            });

            const googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a>'
            });

            const googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a>'
            });

            const googleTerrain = L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a>'
            });

            googleRoadmap.addTo(map);

            const baseMaps = {
                "🗺️ Google Bản đồ": googleRoadmap,
                "🛰️ Google Vệ tinh": googleSatellite,
                "🏙️ Google Kết hợp": googleHybrid,
                "🏔️ Google Địa hình": googleTerrain
            };
            L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

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
            const markerBg = isBlocked ? '#ef4444' : '#0284c7';
            const rippleBg = isBlocked ? 'rgba(239, 68, 68, 0.4)' : 'rgba(2, 132, 199, 0.4)';
            
            const iconHtml = `
                <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
                    <div style="
                        position: absolute;
                        width: 22px;
                        height: 22px;
                        border-radius: 50%;
                        background: ${rippleBg};
                        animation: leaflet-pulse 2s infinite ease-out;
                    "></div>
                    <div style="
                        position: relative;
                        background: ${markerBg};
                        width: 14px;
                        height: 14px;
                        border-radius: 50%;
                        border: 2.5px solid #ffffff;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
                    "></div>
                </div>
            `;

            const customIcon = L.divIcon({
                html: iconHtml,
                className: 'google-map-marker',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
            });

            const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

            const popupContent = `
                <div style="font-family: 'Plus Jakarta Sans', Roboto, sans-serif; padding: 4px; min-width: 220px;">
                    <div style="font-weight: 800; color: #0284c7; font-size: 0.95rem; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
                        📍 ${loc.city || 'Unknown'}, ${loc.country || 'Unknown'}
                    </div>
                    <div style="font-size: 0.8rem; color: #334155; margin-bottom: 4px;">
                        👤 <strong>Người dùng:</strong> <span style="font-weight: 700; color: #0f172a;">${loc.username || 'Khách vãng lai'}</span>
                    </div>
                    <div style="font-size: 0.8rem; color: #334155; margin-bottom: 4px;">
                        🌐 <strong>Địa chỉ IP:</strong> <span style="font-family: monospace; font-weight: 700; color: #0284c7; background: #f0f9ff; padding: 2px 6px; border-radius: 4px;">${loc.ip}</span>
                    </div>
                    <div style="font-size: 0.8rem; color: #334155; margin-bottom: 4px;">
                        💻 <strong>Thiết bị:</strong> ${loc.device || 'N/A'}
                    </div>
                    <div style="font-size: 0.8rem; color: #334155; margin-bottom: 4px;">
                        📄 <strong>Trang xem:</strong> <span style="color: #64748b;">${loc.page || '/'}</span>
                    </div>
                    <div style="font-size: 0.8rem; color: #334155; margin-bottom: 4px;">
                        🔢 <strong>Lượt truy cập:</strong> <span style="font-weight: 700; color: #16a34a;">${loc.visitCount || 1} lần</span>
                    </div>
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 6px; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
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
                style={{ width: '100%', height: '520px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} 
            />
            <Box 
                sx={{ 
                    position: 'absolute', 
                    bottom: 16, 
                    left: 16, 
                    zIndex: 1000, 
                    bgcolor: 'rgba(255,255,255,0.95)', 
                    p: 1.8, 
                    borderRadius: 3, 
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid #e2e8f0'
                }}
            >
                <Typography variant="caption" fontWeight="800" display="block" color="#0f172a" mb={0.8} textTransform="uppercase" letterSpacing={0.5}>
                    📍 Chú thích điểm truy cập:
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={0.6}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#0284c7' }} />
                    <Typography variant="caption" fontWeight="600" color="#334155">Vị trí truy cập hợp lệ</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />
                    <Typography variant="caption" fontWeight="600" color="#b91c1c">Địa chỉ IP đang bị chặn</Typography>
                </Box>
            </Box>
        </Box>
    );
};

const SystemLogs = () => {
    const [tabIndex, setTabIndex] = useState(3); // Mặc định mở tab 3: Thao tác hệ thống (Audit Logs)

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
    const [searchActionQuery, setSearchActionQuery] = useState('');
    const [selectedActionType, setSelectedActionType] = useState('all');
    const [selectedLogDetail, setSelectedLogDetail] = useState(null);

    // Blocked IPs
    const [blockedIps, setBlockedIps] = useState([]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchAllData = async () => {
        try {
            const headers = getAuthHeaders();
            // Stats
            const statsRes = await axios.get(`${adminApiUrl}/api/visitors/stats`, { headers });
            if (statsRes.data?.status === 'success') {
                setStats(statsRes.data.data);
            }

            // Map Locations
            const mapRes = await axios.get(`${adminApiUrl}/api/visitors/map-locations`, { headers });
            if (mapRes.data?.status === 'success') {
                setMapLocations(mapRes.data.data);
            }

            // Visitor Logs
            const vLogRes = await axios.get(`${adminApiUrl}/api/visitors/logs`, { headers });
            if (vLogRes.data?.status === 'success') {
                setVisitorLogs(vLogRes.data.data);
            }

            // Action Logs
            setLoadingActionLogs(true);
            const aLogRes = await axios.get(`${adminApiUrl}/api/log`, { headers });
            if (aLogRes.data?.status === 'success') {
                setActionLogs(aLogRes.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching system log data:", error);
        } finally {
            setLoadingActionLogs(false);
        }
    };

    const fetchOnlineVisitors = async () => {
        try {
            const res = await axios.get(`${adminApiUrl}/api/visitors/active`, { headers: getAuthHeaders() });
            if (res.data?.status === 'success') {
                setOnlineVisitors(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching active visitors:", err);
        }
    };

    const fetchBlockedIps = async () => {
        try {
            const res = await axios.get(`${adminApiUrl}/api/visitors/blocked`, { headers: getAuthHeaders() });
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
            await axios.post(`${adminApiUrl}/api/visitors/block`, { ip }, { headers: getAuthHeaders() });
            toast.success(`Đã chặn địa chỉ IP: ${ip}`);
            fetchAllData();
            if (tabIndex === 2) fetchOnlineVisitors();
            if (tabIndex === 4) fetchBlockedIps();
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi chặn IP");
        }
    };

    const handleUnblockIp = async (ip) => {
        try {
            await axios.post(`${adminApiUrl}/api/visitors/unblock`, { ip }, { headers: getAuthHeaders() });
            toast.success(`Đã gỡ chặn địa chỉ IP: ${ip}`);
            fetchAllData();
            if (tabIndex === 2) fetchOnlineVisitors();
            if (tabIndex === 4) fetchBlockedIps();
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi gỡ chặn IP");
        }
    };

    // Filter visitor logs
    const filteredVisitorLogs = useMemo(() => {
        return visitorLogs.filter(log => {
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
    }, [visitorLogs, searchQuery]);

    const getActionBadgeInfo = (action = '') => {
        const act = action.toLowerCase();
        if (act.includes('đăng nhập')) {
            return { color: '#15803d', bg: '#dcfce7', border: '#bbf7d0', icon: 'fa-solid fa-key' };
        }
        if (act.includes('tạo hợp đồng') || act.includes('hợp đồng mới')) {
            return { color: '#0369a1', bg: '#e0f2fe', border: '#bae6fd', icon: 'fa-solid fa-file-circle-plus' };
        }
        if (act.includes('cập nhật hợp đồng') || act.includes('sửa hợp đồng')) {
            return { color: '#6d28d9', bg: '#ede9fe', border: '#ddd6fe', icon: 'fa-solid fa-file-pen' };
        }
        if (act.includes('xóa')) {
            return { color: '#b91c1c', bg: '#fee2e2', border: '#fecaca', icon: 'fa-solid fa-trash-can' };
        }
        if (act.includes('soạn đồ') || act.includes('mượn đồ') || act.includes('trả đồ')) {
            return { color: '#0f766e', bg: '#ccfbf1', border: '#99f6e4', icon: 'fa-solid fa-shirt' };
        }
        if (act.includes('chi tiêu')) {
            return { color: '#b45309', bg: '#fef3c7', border: '#fde68a', icon: 'fa-solid fa-money-bill-wave' };
        }
        if (act.includes('thanh toán')) {
            return { color: '#047857', bg: '#ecfdf5', border: '#a7f3d0', icon: 'fa-solid fa-credit-card' };
        }
        if (act.includes('khách hàng')) {
            return { color: '#3730a3', bg: '#e0e7ff', border: '#c7d2fe', icon: 'fa-solid fa-users' };
        }
        if (act.includes('nhân viên') || act.includes('tài khoản')) {
            return { color: '#86198f', bg: '#fae8ff', border: '#f5d0fe', icon: 'fa-solid fa-user-gear' };
        }
        if (act.includes('dịch vụ') || act.includes('gói')) {
            return { color: '#9d174d', bg: '#fce7f3', border: '#fbcfe8', icon: 'fa-solid fa-box-archive' };
        }
        return { color: '#334155', bg: '#f1f5f9', border: '#e2e8f0', icon: 'fa-solid fa-gear' };
    };

    const renderLogDetailsSummary = (details) => {
        if (!details || typeof details !== 'object') return 'Không có chi tiết';
        const parts = [];
        if (details.maHopDong) parts.push(`HĐ: ${details.maHopDong}`);
        if (details.khachHang || details.tenKhachHang) parts.push(`KH: ${details.khachHang || details.tenKhachHang}`);
        if (details.amount || details.tongTien || details.tongGiaTri) {
            const amt = Number(details.amount || details.tongTien || details.tongGiaTri) || 0;
            parts.push(`Số tiền: ${amt.toLocaleString('vi-VN')} đ`);
        }
        if (details.reason) parts.push(`Lý do: ${details.reason}`);
        if (details.receiver) parts.push(`Người nhận: ${details.receiver}`);
        if (details.username) parts.push(`User: ${details.username}`);
        if (details.positon) parts.push(`Chức vụ: ${details.positon}`);
        if (details.trangThai) parts.push(`Trạng thái: ${details.trangThai}`);
        if (details.soLuongMon) parts.push(`${details.soLuongMon} món đồ`);
        if (details.giaiDoan) parts.push(`Giai đoạn: ${details.giaiDoan}`);

        if (parts.length > 0) return parts.join(' • ');
        return typeof details === 'string' ? details : JSON.stringify(details);
    };

    // Filter action logs
    const filteredActionLogs = useMemo(() => {
        return actionLogs.filter(log => {
            const query = searchActionQuery.toLowerCase().trim();
            const actionText = (log.action || '').toLowerCase();
            const userText = (log.user || '').toLowerCase();
            const ipText = (log.ipAddress || '').toLowerCase();
            const detailsText = log.details ? JSON.stringify(log.details).toLowerCase() : '';

            // Category filter
            if (selectedActionType !== 'all') {
                if (selectedActionType === 'auth' && !actionText.includes('đăng nhập')) return false;
                if (selectedActionType === 'hopDong' && !actionText.includes('hợp đồng')) return false;
                if (selectedActionType === 'chiTieu' && !actionText.includes('chi tiêu')) return false;
                if (selectedActionType === 'soanDo' && !actionText.includes('soạn đồ') && !actionText.includes('mượn đồ') && !actionText.includes('trả đồ')) return false;
                if (selectedActionType === 'nhanVien' && !actionText.includes('nhân viên') && !actionText.includes('tài khoản')) return false;
                if (selectedActionType === 'khachHang' && !actionText.includes('khách hàng')) return false;
                if (selectedActionType === 'dichVu' && !actionText.includes('dịch vụ') && !actionText.includes('gói') && !actionText.includes('kho')) return false;
            }

            if (!query) return true;
            return actionText.includes(query) || userText.includes(query) || ipText.includes(query) || detailsText.includes(query);
        });
    }, [actionLogs, searchActionQuery, selectedActionType]);

    // Quick action category list
    const ACTION_CATEGORIES = [
        { key: 'all', label: 'Tất cả thao tác', icon: 'fa-solid fa-layer-group' },
        { key: 'hopDong', label: 'Hợp đồng', icon: 'fa-solid fa-file-contract' },
        { key: 'soanDo', label: 'Soạn đồ', icon: 'fa-solid fa-shirt' },
        { key: 'chiTieu', label: 'Chi tiêu', icon: 'fa-solid fa-money-bill-wave' },
        { key: 'auth', label: 'Đăng nhập', icon: 'fa-solid fa-key' },
        { key: 'khachHang', label: 'Khách hàng', icon: 'fa-solid fa-users' },
        { key: 'nhanVien', label: 'Nhân sự', icon: 'fa-solid fa-user-tie' },
        { key: 'dichVu', label: 'Dịch vụ & Kho', icon: 'fa-solid fa-boxes-stacked' },
    ];

    return (
        <div className="logs-page-container">
            {/* 1. Header Section */}
            <div className="logs-header">
                <div className="logs-title-wrap">
                    <span className="logs-badge-top">
                        <i className="fa-solid fa-shield-halved"></i> AN NINH & GIÁM SÁT HỆ THỐNG
                    </span>
                    <h2>
                        <i className="fa-solid fa-globe" style={{ color: '#0284c7' }}></i>
                        NHẬT KÝ HOẠT ĐỘNG & BẢN ĐỒ TRUY CẬP
                    </h2>
                    <p className="logs-subtitle">
                        Giám sát thời gian thực mọi thao tác hệ thống, bản đồ địa lý IP khách hàng và kiểm soát bảo mật studio
                    </p>
                </div>

                <div className="logs-header-actions">
                    <Button
                        variant="outlined"
                        className="btn-refresh-logs"
                        onClick={fetchAllData}
                        startIcon={<i className="fa-solid fa-rotate"></i>}
                    >
                        Làm mới dữ liệu
                    </Button>
                </div>
            </div>

            {/* 2. KPI Metrics Grid */}
            <div className="logs-stats-grid">
                <div className="logs-stat-card glass-panel blue">
                    <div className="stat-content">
                        <span className="stat-label">Tổng lượt truy cập</span>
                        <div className="stat-value" style={{ color: '#0284c7' }}>
                            {stats.totalVisits.toLocaleString('vi-VN')}
                        </div>
                        <span className="stat-desc">Toàn bộ phiên xem trên website</span>
                    </div>
                    <div className="stat-icon-wrap icon-blue">
                        <i className="fa-solid fa-eye"></i>
                    </div>
                </div>

                <div className="logs-stat-card glass-panel green">
                    <div className="stat-content">
                        <span className="stat-label">Số IP truy cập</span>
                        <div className="stat-value" style={{ color: '#16a34a' }}>
                            {stats.uniqueIpsCount.toLocaleString('vi-VN')}
                        </div>
                        <span className="stat-desc">Địa chỉ IP duy nhất ghi nhận</span>
                    </div>
                    <div className="stat-icon-wrap icon-green">
                        <i className="fa-solid fa-network-wired"></i>
                    </div>
                </div>

                <div className="logs-stat-card glass-panel orange">
                    <div className="stat-content">
                        <span className="stat-label">Truy cập hôm nay</span>
                        <div className="stat-value" style={{ color: '#ea580c' }}>
                            {stats.todayVisits.toLocaleString('vi-VN')}
                        </div>
                        <span className="stat-desc">Phiên truy cập trong ngày</span>
                    </div>
                    <div className="stat-icon-wrap icon-orange">
                        <i className="fa-solid fa-users"></i>
                    </div>
                </div>

                <div className="logs-stat-card glass-panel red">
                    <div className="stat-content">
                        <span className="stat-label">Đang online realtime</span>
                        <div className="stat-value" style={{ color: '#dc2626' }}>
                            {stats.activeOnline}
                            <span className="pulse-indicator" title="Thời gian thực"></span>
                        </div>
                        <span className="stat-desc">Khách hàng & nhân viên đang mở web</span>
                    </div>
                    <div className="stat-icon-wrap icon-red">
                        <i className="fa-solid fa-shield-virus"></i>
                    </div>
                </div>
            </div>

            {/* 3. Navigation Tabs Bar */}
            <div className="logs-tabs-container glass-panel">
                <button
                    className={`logs-nav-btn ${tabIndex === 3 ? 'active' : ''}`}
                    onClick={() => setTabIndex(3)}
                >
                    <i className="fa-solid fa-list-check" style={{ color: tabIndex === 3 ? '#fff' : '#0284c7' }}></i>
                    Thao Tác Hệ Thống
                    <span className="logs-nav-count">{actionLogs.length}</span>
                </button>

                <button
                    className={`logs-nav-btn ${tabIndex === 0 ? 'active' : ''}`}
                    onClick={() => setTabIndex(0)}
                >
                    <i className="fa-solid fa-map-location-dot" style={{ color: tabIndex === 0 ? '#fff' : '#0ea5e9' }}></i>
                    Bản Đồ Địa Lý
                    <span className="logs-nav-count">{mapLocations.length}</span>
                </button>

                <button
                    className={`logs-nav-btn ${tabIndex === 1 ? 'active' : ''}`}
                    onClick={() => setTabIndex(1)}
                >
                    <i className="fa-solid fa-globe" style={{ color: tabIndex === 1 ? '#fff' : '#10b981' }}></i>
                    Nhật Ký IP Website
                    <span className="logs-nav-count">{visitorLogs.length}</span>
                </button>

                <button
                    className={`logs-nav-btn ${tabIndex === 2 ? 'active' : ''}`}
                    onClick={() => setTabIndex(2)}
                >
                    <i className="fa-solid fa-signal" style={{ color: tabIndex === 2 ? '#fff' : '#22c55e' }}></i>
                    Khách Đang Online
                    <span className="logs-nav-count">{onlineVisitors.length}</span>
                </button>

                <button
                    className={`logs-nav-btn ${tabIndex === 4 ? 'active' : ''}`}
                    onClick={() => setTabIndex(4)}
                >
                    <i className="fa-solid fa-ban" style={{ color: tabIndex === 4 ? '#fff' : '#ef4444' }}></i>
                    IP Bị Chặn
                    <span className="logs-nav-count">{blockedIps.length}</span>
                </button>
            </div>

            {/* TAB 3: NHẬT KÝ THAO TÁC HỆ THỐNG (AUDIT LOGS) */}
            {tabIndex === 3 && (
                <div className="logs-tab-content">
                    {/* Toolbar */}
                    <div className="logs-toolbar glass-panel">
                        <div className="toolbar-search-wrap">
                            <TextField
                                size="small"
                                placeholder="Tìm theo Người thực hiện, Hành động, Mã HĐ, IP..."
                                value={searchActionQuery}
                                onChange={(e) => setSearchActionQuery(e.target.value)}
                                className="search-input-logs"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <i className="fa-solid fa-magnifying-glass" style={{ color: '#94a3b8' }}></i>
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchActionQuery && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setSearchActionQuery('')}>
                                                <i className="fa-solid fa-xmark" style={{ fontSize: '0.85rem' }}></i>
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <div className="quick-category-pills">
                                {ACTION_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.key}
                                        className={`cat-pill ${selectedActionType === cat.key ? 'active' : ''}`}
                                        onClick={() => setSelectedActionType(cat.key)}
                                    >
                                        <i className={cat.icon} style={{ marginRight: 5 }}></i>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                            Tổng cộng: <strong style={{ color: '#0284c7' }}>{filteredActionLogs.length}</strong> nhật ký
                        </Typography>
                    </div>

                    {/* Action Logs Table */}
                    <Paper elevation={0} className="logs-table-container glass-panel">
                        <TableContainer sx={{ maxHeight: 'calc(100vh - 360px)' }}>
                            <Table stickyHeader size="small">
                                <TableHead sx={{ '& th': { bgcolor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.8 } }}>
                                    <TableRow>
                                        <TableCell style={{ width: '175px' }}>THỜI GIAN</TableCell>
                                        <TableCell style={{ width: '170px' }}>NGƯỜI THỰC HIỆN</TableCell>
                                        <TableCell style={{ width: '250px' }}>HÀNH ĐỘNG</TableCell>
                                        <TableCell style={{ width: '140px' }}>ĐỊA CHỈ IP</TableCell>
                                        <TableCell style={{ width: '170px' }}>THIẾT BỊ</TableCell>
                                        <TableCell>NỘI DUNG CHI TIẾT</TableCell>
                                        <TableCell align="center" style={{ width: '100px' }}>XEM</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredActionLogs.length === 0 && !loadingActionLogs ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                                <i className="fa-solid fa-clipboard-list" style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12, color: '#cbd5e1' }}></i>
                                                Không tìm thấy nhật ký thao tác nào phù hợp.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (rowsPerPageAction > 0
                                            ? filteredActionLogs.slice(pageAction * rowsPerPageAction, pageAction * rowsPerPageAction + rowsPerPageAction)
                                            : filteredActionLogs
                                        ).map((log) => {
                                            const badge = getActionBadgeInfo(log.action);
                                            const summary = renderLogDetailsSummary(log.details);
                                            const dev = parseUserAgent(log.deviceInfo);

                                            return (
                                                <TableRow key={log._id || log.id} className="logs-table-row">
                                                    <TableCell>
                                                        <span className="time-cell-text">
                                                            <i className="fa-regular fa-clock" style={{ color: '#94a3b8' }}></i>
                                                            {dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={log.user || 'Hệ thống'} 
                                                            size="small" 
                                                            sx={{ 
                                                                fontWeight: 700, 
                                                                bgcolor: '#eff6ff', 
                                                                color: '#1d4ed8', 
                                                                border: '1px solid #bfdbfe' 
                                                            }} 
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <span 
                                                            className="action-pill-tag" 
                                                            style={{ 
                                                                backgroundColor: badge.bg, 
                                                                color: badge.color, 
                                                                border: `1px solid ${badge.border}` 
                                                            }}
                                                        >
                                                            <i className={badge.icon}></i>
                                                            {log.action}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="ip-badge">
                                                            {log.ipAddress || '127.0.0.1'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={log.deviceInfo || 'Unknown'}>
                                                            <span className="device-chip">
                                                                <i className={dev.icon} style={{ color: '#0284c7' }}></i>
                                                                {dev.label}
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="payload-preview-text" title={summary}>
                                                            {summary}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Button 
                                                            size="small" 
                                                            variant="outlined" 
                                                            onClick={() => setSelectedLogDetail(log)}
                                                            sx={{ 
                                                                minWidth: 'auto', 
                                                                px: 1.5, 
                                                                py: 0.4, 
                                                                fontSize: '0.78rem',
                                                                textTransform: 'none',
                                                                fontWeight: 700,
                                                                borderRadius: 2,
                                                                borderColor: '#cbd5e1',
                                                                color: '#0f172a',
                                                                '&:hover': { bgcolor: '#0f172a', color: '#fff', borderColor: '#0f172a' }
                                                            }}
                                                        >
                                                            Chi tiết
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={filteredActionLogs.length}
                            rowsPerPage={rowsPerPageAction}
                            page={pageAction}
                            onPageChange={(e, newPage) => setPageAction(newPage)}
                            onRowsPerPageChange={(e) => { setRowsPerPageAction(parseInt(e.target.value, 10)); setPageAction(0); }}
                            labelRowsPerPage="Số dòng:"
                        />
                    </Paper>
                </div>
            )}

            {/* TAB 0: BẢN ĐỒ THẾ GIỚI GEOLOCATION */}
            {tabIndex === 0 && (
                <div className="logs-tab-content">
                    <div className="map-layout-grid">
                        {/* Map View */}
                        <div className="glass-panel" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className="fa-solid fa-earth-asia" style={{ color: '#0284c7' }}></i>
                                    Bản Đồ Phân Bố Vị Trí Truy Cập Realtime
                                </Typography>
                                <Chip label={`${mapLocations.length} Vị trí ghi nhận`} color="primary" size="small" sx={{ fontWeight: 700 }} />
                            </div>
                            <GoogleWorldMap locations={mapLocations} onBlockIp={handleBlockIp} />
                        </div>

                        {/* Top Countries Ranking */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="glass-panel" style={{ padding: 20 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className="fa-solid fa-trophy" style={{ color: '#d97706' }}></i>
                                    Top Quốc Gia Truy Cập
                                </Typography>

                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {stats.topCountries.length === 0 ? (
                                        <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 3 }}>
                                            Chưa có dữ liệu quốc gia.
                                        </Typography>
                                    ) : (
                                        stats.topCountries.map((item, index) => {
                                            const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other';
                                            return (
                                                <div key={index} className="country-ranking-item">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div className={`rank-badge ${rankClass}`}>
                                                            {index + 1}
                                                        </div>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                            {item.country}
                                                        </Typography>
                                                    </div>
                                                    <Chip label={`${item.count} lượt`} size="small" sx={{ fontWeight: 800, bgcolor: '#eff6ff', color: '#1d4ed8' }} />
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: 20, bgcolor: '#f8fafc' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className="fa-solid fa-circle-info" style={{ color: '#0284c7' }}></i>
                                    Cơ chế định vị Geolocation:
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1, lineHeight: 1.5 }}>
                                    • Hệ thống tự động giải mã tọa độ địa lý (Quốc gia, Tỉnh/Thành phố, Tọa độ Lat/Lng) của từng IP truy cập website Studio.
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.5 }}>
                                    • Bấm vào từng ghim trên bản đồ để xem chi tiết danh tính người truy cập và xử lý chặn IP độc hại.
                                </Typography>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 1: NHẬT KÝ TRUY CẬP IP */}
            {tabIndex === 1 && (
                <div className="logs-tab-content">
                    <div className="logs-toolbar glass-panel">
                        <TextField
                            size="small"
                            placeholder="Tìm theo IP, Người dùng, Thành phố, Quốc gia, Thiết bị..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input-logs"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <i className="fa-solid fa-magnifying-glass" style={{ color: '#94a3b8' }}></i>
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                                            <i className="fa-solid fa-xmark" style={{ fontSize: '0.85rem' }}></i>
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                            Hiển thị: <strong style={{ color: '#0284c7' }}>{filteredVisitorLogs.length}</strong> nhật ký IP
                        </Typography>
                    </div>

                    <Paper elevation={0} className="logs-table-container glass-panel">
                        <TableContainer sx={{ maxHeight: 'calc(100vh - 360px)' }}>
                            <Table stickyHeader size="small">
                                <TableHead sx={{ '& th': { bgcolor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.8 } }}>
                                    <TableRow>
                                        <TableCell style={{ width: '175px' }}>THỜI GIAN GẦN NHẤT</TableCell>
                                        <TableCell style={{ width: '140px' }}>ĐỊA CHỈ IP</TableCell>
                                        <TableCell style={{ width: '190px' }}>VỊ TRÍ ĐỊA LÝ</TableCell>
                                        <TableCell style={{ width: '180px' }}>TÀI KHOẢN / KHÁCH</TableCell>
                                        <TableCell align="center" style={{ width: '110px' }}>LƯỢT XEM</TableCell>
                                        <TableCell style={{ width: '180px' }}>THIẾT BỊ</TableCell>
                                        <TableCell>TRANG XEM</TableCell>
                                        <TableCell align="center" style={{ width: '110px' }}>HÀNH ĐỘNG</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredVisitorLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                                <i className="fa-solid fa-globe" style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12, color: '#cbd5e1' }}></i>
                                                Chưa có nhật ký truy cập IP nào.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (rowsPerPageVisitor > 0
                                            ? filteredVisitorLogs.slice(pageVisitor * rowsPerPageVisitor, pageVisitor * rowsPerPageVisitor + rowsPerPageVisitor)
                                            : filteredVisitorLogs
                                        ).map((log) => {
                                            const dev = parseUserAgent(log.device);
                                            return (
                                                <TableRow key={log._id || log.id} className="logs-table-row">
                                                    <TableCell>
                                                        <span className="time-cell-text">
                                                            <i className="fa-regular fa-clock" style={{ color: '#94a3b8' }}></i>
                                                            {dayjs(log.lastSeen).format('DD/MM/YYYY HH:mm:ss')}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="ip-badge">{log.ip}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={`📍 ${log.city || 'N/A'}, ${log.country || 'N/A'}`} 
                                                            size="small" 
                                                            sx={{ fontSize: '0.75rem', fontWeight: 700, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={log.username || 'Khách vãng lai'} 
                                                            size="small" 
                                                            sx={{ 
                                                                fontWeight: 700, 
                                                                bgcolor: log.username && log.username !== 'Khách vãng lai' ? '#eff6ff' : '#f8fafc',
                                                                color: log.username && log.username !== 'Khách vãng lai' ? '#1d4ed8' : '#64748b',
                                                                border: '1px solid #e2e8f0'
                                                            }} 
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip label={`${log.visitCount || 1} lần`} size="small" sx={{ fontWeight: 800, bgcolor: '#f0fdf4', color: '#16a34a' }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={log.device || 'N/A'}>
                                                            <span className="device-chip">
                                                                <i className={dev.icon} style={{ color: '#0284c7' }}></i>
                                                                {dev.label}
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                                                            {log.page || '/'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {log.isBlocked ? (
                                                            <Button 
                                                                size="small" 
                                                                variant="contained" 
                                                                color="success" 
                                                                onClick={() => handleUnblockIp(log.ip)}
                                                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: '0.75rem', py: 0.3 }}
                                                            >
                                                                Gỡ chặn
                                                            </Button>
                                                        ) : (
                                                            <Button 
                                                                size="small" 
                                                                variant="outlined" 
                                                                color="error" 
                                                                onClick={() => handleBlockIp(log.ip)}
                                                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: '0.75rem', py: 0.3 }}
                                                            >
                                                                Chặn IP
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
                    </Paper>
                </div>
            )}

            {/* TAB 2: KHÁCH ĐANG ONLINE */}
            {tabIndex === 2 && (
                <div className="logs-tab-content">
                    <div className="logs-toolbar glass-panel" style={{ borderLeft: '4px solid #22c55e' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="pulse-indicator"></span>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                Đang Giám Sát Thời Gian Thực (Tự động cập nhật mỗi 5 giây)
                            </Typography>
                        </div>
                        <Chip label={`${onlineVisitors.length} Phiên đang hoạt động`} color="success" sx={{ fontWeight: 800 }} />
                    </div>

                    <Paper elevation={0} className="logs-table-container glass-panel">
                        <TableContainer>
                            <Table size="small">
                                <TableHead sx={{ '& th': { bgcolor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.8 } }}>
                                    <TableRow>
                                        <TableCell style={{ width: '130px' }}>TRẠNG THÁI</TableCell>
                                        <TableCell style={{ width: '200px' }}>NGƯỜI DÙNG</TableCell>
                                        <TableCell style={{ width: '160px' }}>ĐỊA CHỈ IP</TableCell>
                                        <TableCell style={{ width: '220px' }}>VỊ TRÍ</TableCell>
                                        <TableCell style={{ width: '200px' }}>THIẾT BỊ</TableCell>
                                        <TableCell>TRANG ĐANG XEM</TableCell>
                                        <TableCell align="center" style={{ width: '120px' }}>THAO TÁC</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {onlineVisitors.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                                <i className="fa-solid fa-user-clock" style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12, color: '#cbd5e1' }}></i>
                                                Hiện tại không có khách hàng nào đang online.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        onlineVisitors.map((v) => {
                                            const dev = parseUserAgent(v.device);
                                            return (
                                                <TableRow key={v.id || v._id} className="logs-table-row">
                                                    <TableCell>
                                                        <Chip 
                                                            label={v.isBlocked ? "Bị chặn" : "🟢 Online"} 
                                                            size="small"
                                                            sx={{ 
                                                                fontWeight: 800, 
                                                                bgcolor: v.isBlocked ? '#fee2e2' : '#dcfce7',
                                                                color: v.isBlocked ? '#b91c1c' : '#15803d',
                                                                border: `1px solid ${v.isBlocked ? '#fecaca' : '#bbf7d0'}`
                                                            }} 
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                                            {v.username || 'Khách vãng lai'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="ip-badge">{v.ip}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={`📍 ${v.city || 'Hà Nội'}, ${v.country || 'Việt Nam'}`} 
                                                            size="small" 
                                                            sx={{ fontWeight: 700, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="device-chip">
                                                            <i className={dev.icon} style={{ color: '#0284c7' }}></i>
                                                            {dev.label}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0284c7' }}>
                                                            {v.page || '/'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {v.isBlocked ? (
                                                            <Button size="small" variant="contained" color="success" onClick={() => handleUnblockIp(v.ip)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                                                                Gỡ chặn
                                                            </Button>
                                                        ) : (
                                                            <Button size="small" variant="outlined" color="error" onClick={() => handleBlockIp(v.ip)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                                                                Chặn IP
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </div>
            )}

            {/* TAB 4: DANH SÁCH IP BỊ CHẶN */}
            {tabIndex === 4 && (
                <div className="logs-tab-content">
                    <div className="logs-toolbar glass-panel" style={{ borderLeft: '4px solid #ef4444' }}>
                        <div>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                🚫 Danh Sách Các Địa Chỉ IP Bị Khóa Truy Cập
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                Các IP trong danh sách này sẽ bị từ chối truy cập vào website và hệ thống quản trị
                            </Typography>
                        </div>
                        <Chip label={`${blockedIps.length} IP Bị Chặn`} color="error" sx={{ fontWeight: 800 }} />
                    </div>

                    <Paper elevation={0} className="logs-table-container glass-panel">
                        <TableContainer>
                            <Table size="small">
                                <TableHead sx={{ '& th': { bgcolor: '#fef2f2', color: '#991b1b', fontWeight: 800, py: 1.8 } }}>
                                    <TableRow>
                                        <TableCell style={{ width: '180px' }}>ĐỊA CHỈ IP</TableCell>
                                        <TableCell style={{ width: '200px' }}>NGÀY BỊ CHẶN</TableCell>
                                        <TableCell>LÝ DO CHẶN</TableCell>
                                        <TableCell align="center" style={{ width: '140px' }}>HÀNH ĐỘNG</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {blockedIps.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                                <i className="fa-solid fa-shield-check" style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12, color: '#22c55e' }}></i>
                                                Hệ thống an toàn. Hiện chưa có địa chỉ IP nào bị chặn.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        blockedIps.map((b) => (
                                            <TableRow key={b._id || b.id} className="logs-table-row">
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#dc2626' }}>
                                                        {b.ip}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="time-cell-text">
                                                        <i className="fa-regular fa-calendar" style={{ color: '#94a3b8' }}></i>
                                                        {dayjs(b.blockedAt).format('DD/MM/YYYY HH:mm:ss')}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ color: '#475569' }}>
                                                        {b.reason || 'Chặn bởi Quản trị viên do nghi ngờ bất thường'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button 
                                                        size="small" 
                                                        variant="contained" 
                                                        color="success" 
                                                        onClick={() => handleUnblockIp(b.ip)}
                                                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                                                    >
                                                        Gỡ chặn IP
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </div>
            )}

            {/* MODAL CHI TIẾT THAO TÁC HỆ THỐNG */}
            <Dialog 
                open={Boolean(selectedLogDetail)} 
                onClose={() => setSelectedLogDetail(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <i className="fa-solid fa-circle-info" style={{ color: '#38bdf8', fontSize: '1.3rem' }}></i>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            CHI TIẾT THAO TÁC HỆ THỐNG
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 3, pt: '24px !important' }}>
                    {selectedLogDetail && (
                        <Stack spacing={2.5}>
                            {/* Action Header Card */}
                            <Box 
                                p={2} 
                                sx={{ 
                                    bgcolor: '#f8fafc', 
                                    borderRadius: 2.5, 
                                    border: '1px solid #e2e8f0', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center' 
                                }}
                            >
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                                        HÀNH ĐỘNG THỰC HIỆN
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0284c7', mt: 0.3 }}>
                                        {selectedLogDetail.action}
                                    </Typography>
                                </Box>
                                <Chip 
                                    label={selectedLogDetail.user || 'Hệ thống'} 
                                    sx={{ fontWeight: 800, bgcolor: '#0f172a', color: '#fff' }} 
                                />
                            </Box>

                            {/* Details Grid */}
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box p={1.5} sx={{ bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>Thời gian ghi nhận</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', mt: 0.3 }}>
                                            {dayjs(selectedLogDetail.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box p={1.5} sx={{ bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>Địa chỉ IP</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7', mt: 0.3 }}>
                                            {selectedLogDetail.ipAddress || '127.0.0.1'}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Thiết bị / Browser */}
                            <Box p={1.5} sx={{ bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600, mb: 0.5 }}>
                                    Thiết bị & Trình duyệt ghi nhận:
                                </Typography>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#334155', display: 'block', wordBreak: 'break-all', bgcolor: '#ffffff', p: 1, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                                    {selectedLogDetail.deviceInfo || 'Unknown Device'}
                                </Typography>
                            </Box>

                            {/* Payload JSON */}
                            <Box>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Dữ liệu chi tiết (Payload JSON):
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="text"
                                        onClick={() => {
                                            navigator.clipboard.writeText(JSON.stringify(selectedLogDetail.details, null, 2));
                                            toast.success("Đã sao chép nội dung payload!");
                                        }}
                                        sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, p: 0 }}
                                    >
                                        <i className="fa-regular fa-copy" style={{ marginRight: 4 }}></i>
                                        Sao chép
                                    </Button>
                                </div>
                                <Box 
                                    component="pre" 
                                    sx={{ 
                                        m: 0, 
                                        p: 2, 
                                        bgcolor: '#0f172a', 
                                        color: '#38bdf8', 
                                        borderRadius: 2.5, 
                                        fontSize: '0.78rem',
                                        maxHeight: 220, 
                                        overflow: 'auto',
                                        fontFamily: 'JetBrains Mono, Consolas, monospace',
                                        border: '1px solid #1e293b'
                                    }}
                                >
                                    {JSON.stringify(selectedLogDetail.details, null, 2)}
                                </Box>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button 
                        onClick={() => setSelectedLogDetail(null)} 
                        variant="contained" 
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, bgcolor: '#0f172a', px: 3 }}
                    >
                        Đóng cửa sổ
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SystemLogs;
