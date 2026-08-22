import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { useContractTypes } from '../../hooks/useContractTypes';
import { useAuth } from '../Login/AuthContext/AuthContext';
import ThemHopDongKHDialog from './ThemHopDongKHDialog';
import DetailHopDongKhachHangDialog from './DetailHopDongKhachHangDialog';
import { formatDate } from '../utils/convertDate';
import { formatLunarDateShort } from '../../utils/lunarDateUtils';
import './hopdongkhachhang.css';

// Material UI components
import {
    Stack,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Card,
    Typography,
    Fab,
    Box,
    Chip,
    Grid,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    InputAdornment,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CheckIcon from '@mui/icons-material/Check';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const formatShortMoney = (val) => {
    const num = Number(val) || 0;
    if (Math.abs(num) >= 1000000000) {
        return (num / 1000000000).toFixed(2) + ' Tỷ';
    }
    if (Math.abs(num) >= 1000000) {
        return (num / 1000000).toFixed(1) + ' Tr';
    }
    if (Math.abs(num) >= 1000) {
        return (num / 1000).toFixed(0) + ' k';
    }
    return num.toLocaleString('vi-VN');
};

function HopDongKhachHang() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { getDichVuChinhLabel } = useContractTypes();
    const { user } = useAuth();
    const [hopDong, setHopDong] = useState([]);
    const { showLoading, hideLoading } = useLoading();

    // Kiểm tra quyền Quản trị viên / Quản lý
    const isAdmin = user?.permission === 1 || 
                    user?.positon === "Quản lý" || 
                    user?.positon === "Admin" || 
                    user?.positon === "Quản trị viên" || 
                    user?.chucVu === "Quản lý" || 
                    user?.role === "ADMIN" || 
                    user?.username === "along";

    // Hàm kiểm tra hợp đồng do tài khoản tạo hoặc được phân công làm việc
    const isContractOwnedOrAssigned = useCallback((hd, currentUser) => {
        if (!currentUser) return false;
        const targets = [
            currentUser.fullname,
            currentUser.hoTen,
            currentUser.tenNhanVien,
            currentUser.username
        ].filter(Boolean).map(s => s.toLowerCase().trim());

        if (targets.length === 0) return true;

        const checkMatch = (val) => {
            if (!val) return false;
            const v = String(val).toLowerCase().trim();
            return targets.some(t => t === v || v.includes(t) || t.includes(v));
        };

        const npv = hd?.nguoiPhucVu || {};
        return checkMatch(hd?.createBy) ||
               checkMatch(hd?.nguoiTao) ||
               checkMatch(hd?.userTao) ||
               checkMatch(npv.thoChupHinh) ||
               checkMatch(npv.thoMakeUp) ||
               checkMatch(npv.thoChinhAnh) ||
               checkMatch(npv.banHang) ||
               checkMatch(npv.phucVu) ||
               checkMatch(hd?.soanDo?.nguoiKiem);
    }, []);

    // Filters
    const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'hôm nay' | '1 tuần' | '1 tháng' | '4 tháng'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'no_schedule' | 1 | 2 | 3 | 4 | 5
    const [searchInput, setSearchInput] = useState("");
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

    // Dialog state
    const [openDialogHD, setOpenDialogHD] = useState(false);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [selectedValueDialog, setSelectedValueDialog] = useState({ data: "hello" });
    const [sendData, setSendData] = useState({});

    const handleClickOpenDialog = () => {
        setOpenDialogHD(true);
    };

    const loadHopDong = useCallback((timeVal, searchVal) => {
        showLoading("Đang tải hợp đồng ...");
        const params = {};
        if (timeVal && timeVal !== 'all') {
            params.filter = timeVal;
        }
        if (searchVal) {
            params.keyword = searchVal;
        }

        otherService.LIST_HOPDONG(params)
            .then((response) => {
                setHopDong(response.data.hopDong || []);
                hideLoading();
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error("Đã có lỗi xảy ra: " + error.message);
                hideLoading();
            });
    }, [showLoading, hideLoading]);

    const handleCloseDialog = (value) => {
        setOpenDialogHD(false);
        setSelectedValueDialog(value);
        loadHopDong(timeFilter, searchInput);
    };

    const handleClickOpenDetailDialog = () => {
        setOpenDetailDialog(true);
    };

    const handleCloseDetailDialog = (updated) => {
        setOpenDetailDialog(false);
        if (updated === true) {
            loadHopDong(timeFilter, searchInput);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadHopDong(timeFilter, searchInput);
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [timeFilter, searchInput, loadHopDong]);

    useEffect(() => {
        if (sendData && sendData._id) {
            const updatedHD = hopDong.find(hd => hd._id === sendData._id);
            if (updatedHD) {
                setSendData(updatedHD);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hopDong, sendData?._id]);

    const isUnscheduledShooting = (hd) => {
        if (!hd) return false;
        if (hd.giaiDoan === 5) return false; // Hợp đồng đã hoàn thành không tính là chưa xếp lịch
        return !hd.cacNgay?.ngayChup;
    };

    // Filtered hopDong by permission and status filter
    const filteredHopDong = useMemo(() => {
        const rawList = hopDong || [];
        const baseList = isAdmin ? rawList : rawList.filter(hd => isContractOwnedOrAssigned(hd, user));

        return baseList.filter(hd => {
            if (statusFilter !== 'all') {
                const giaiDoanVal = isUnscheduledShooting(hd) ? 'no_schedule' : hd.giaiDoan;
                if (String(giaiDoanVal) !== String(statusFilter)) {
                    return false;
                }
            }
            return true;
        });
    }, [hopDong, isAdmin, user, isContractOwnedOrAssigned, statusFilter]);

    // Statistics Calculations
    const totalCount = filteredHopDong.length;
    const totalContractValue = useMemo(() => {
        return filteredHopDong.reduce((sum, hd) => sum + (Number(hd.thanhToan?.tongGiaTriSauGiam || hd.thanhToan?.tongGiaTri) || 0), 0);
    }, [filteredHopDong]);

    const totalPaidValue = useMemo(() => {
        return filteredHopDong.reduce((sum, hd) => sum + (Number(hd.thanhToan?.khachHangDaThanhToan) || 0), 0);
    }, [filteredHopDong]);

    const totalRemainingDebt = useMemo(() => {
        return filteredHopDong.reduce((sum, hd) => sum + (Number(hd.thanhToan?.conLai) || 0), 0);
    }, [filteredHopDong]);

    const totalUnscheduledCount = useMemo(() => {
        return filteredHopDong.filter(hd => isUnscheduledShooting(hd)).length;
    }, [filteredHopDong]);

    const convertTrangThai = (hd) => {
        const giaiDoanVal = typeof hd === 'object' && hd !== null ? (isUnscheduledShooting(hd) ? 'no_schedule' : hd.giaiDoan) : hd;
        if (giaiDoanVal === 'no_schedule') return "Chưa xếp lịch chụp";
        switch (giaiDoanVal) {
            case 1:
                return "Tạo hợp đồng";
            case 2:
                return "Chụp hình";
            case 3:
                return "Hậu kỳ";
            case 4:
                return "In ảnh";
            case 5:
                return "Hoàn thành";
            default:
                return "Giai đoạn " + (giaiDoanVal || "");
        }
    };

    const getTrangThaiColor = (hd) => {
        const giaiDoanVal = typeof hd === 'object' && hd !== null ? (isUnscheduledShooting(hd) ? 'no_schedule' : hd.giaiDoan) : hd;
        if (giaiDoanVal === 'no_schedule') return "#dc2626";
        switch (giaiDoanVal) {
            case 1:
                return "#64748b";
            case 2:
                return "#d97706";
            case 3:
                return "#2563eb";
            case 4:
                return "#7c3aed";
            case 5:
                return "#10b981";
            default:
                return "#64748b";
        }
    };

    const getRowBackgroundColor = (hd) => {
        const giaiDoanVal = typeof hd === 'object' && hd !== null ? (isUnscheduledShooting(hd) ? 'no_schedule' : hd.giaiDoan) : hd;
        if (giaiDoanVal === 'no_schedule') return '#fef2f2';
        switch (giaiDoanVal) {
            case 1:
                return '#f8fafc';
            case 2:
                return '#fffbeb';
            case 3:
                return '#eff6ff';
            case 4:
                return '#faf5ff';
            case 5:
                return '#f0fdf4';
            default:
                return '#ffffff';
        }
    };

    const quickStatusOptions = [
        { id: 'all', label: 'Tất cả trạng thái' },
        { id: 'no_schedule', label: '🔴 Chưa xếp lịch chụp' },
        { id: 1, label: '📝 Tạo hợp đồng' },
        { id: 2, label: '📸 Chụp hình' },
        { id: 3, label: '🎨 Hậu kỳ' },
        { id: 4, label: '🖼️ In ảnh' },
        { id: 5, label: '✅ Hoàn thành' }
    ];

    return (
        <div className="contract-page-container">
            {/* 1. HEADER TITLE & ACTIONS */}
            <div className="contract-header">
                <div className="contract-title-wrap">
                    <div className="contract-badge-top">
                        <i className="fa-solid fa-file-contract"></i> LONG WEDDING CONTRACT & SERVICE OPERATIONS
                    </div>
                    <h2>
                        <i className="fa-solid fa-folder-open" style={{ color: '#0284c7' }}></i> QUẢN LÝ HỢP ĐỒNG KHÁCH HÀNG
                    </h2>
                    <p className="contract-subtitle">
                        {!isAdmin 
                            ? `👤 Đang hiển thị các hợp đồng do bạn tạo hoặc được phân công (${user?.fullname || user?.username || 'Nhân viên'})` 
                            : 'Theo dõi tiến độ dịch vụ, lịch chụp ảnh cưới, tiến độ hậu kỳ, in ảnh và trạng thái thanh toán theo từng hợp đồng'}
                    </p>
                </div>

                <div className="contract-header-actions">
                    <Button
                        variant="contained"
                        className="btn-add-contract"
                        onClick={handleClickOpenDialog}
                        startIcon={<i className="fa-solid fa-plus"></i>}
                    >
                        Thêm Hợp Đồng Mới
                    </Button>
                </div>
            </div>

            {/* 2. TOOLBAR & FILTERS */}
            <div className="contract-toolbar glass-panel">
                <div className="toolbar-left">
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm (Mã HĐ, SĐT, Tên KH)..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="search-input"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <i className="fa-solid fa-magnifying-glass" style={{ color: '#94a3b8' }}></i>
                                </InputAdornment>
                            ),
                            endAdornment: searchInput && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchInput('')}>
                                        <i className="fa-solid fa-xmark" style={{ fontSize: '0.85rem' }}></i>
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 170 }}>
                        <InputLabel>Thời gian</InputLabel>
                        <Select
                            value={timeFilter}
                            label="Thời gian"
                            onChange={(e) => setTimeFilter(e.target.value)}
                        >
                            <MenuItem value="all">Tất cả thời gian</MenuItem>
                            <MenuItem value="hôm nay">Hôm nay</MenuItem>
                            <MenuItem value="1 tuần">1 tuần qua</MenuItem>
                            <MenuItem value="1 tháng">1 tháng qua</MenuItem>
                            <MenuItem value="4 tháng">4 tháng qua</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 190 }}>
                        <InputLabel>Trạng thái hợp đồng</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Trạng thái hợp đồng"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {quickStatusOptions.map(opt => (
                                <MenuItem key={opt.id} value={opt.id}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                <div className="toolbar-right">
                    <ToggleButtonGroup
                        size="small"
                        value={viewMode}
                        exclusive
                        onChange={(e, newMode) => newMode && setViewMode(newMode)}
                        sx={{ bgcolor: '#f8fafc' }}
                    >
                        <ToggleButton value="table" title="Dạng Bảng Chi Tiết">
                            <ViewListIcon fontSize="small" sx={{ mr: 0.5 }} /> Bảng
                        </ToggleButton>
                        <ToggleButton value="grid" title="Dạng Lưới Thẻ">
                            <ViewModuleIcon fontSize="small" sx={{ mr: 0.5 }} /> Lưới
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Tooltip title="Tải lại dữ liệu">
                        <IconButton 
                            onClick={() => loadHopDong(timeFilter, searchInput)}
                            sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}
                        >
                            <i className="fa-solid fa-rotate"></i>
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* Quick-Tick Filter Chips Toolbar */}
            <div className="contract-quick-filters glass-panel">
                <Typography variant="caption" fontWeight="bold" sx={{ mr: 0.5, display: 'flex', alignItems: 'center', fontSize: '0.82rem', color: '#0369a1' }}>
                    <FilterAltIcon fontSize="small" sx={{ mr: 0.3 }} /> Lọc nhanh tiến độ:
                </Typography>
                {quickStatusOptions.map((st) => {
                    const isSelected = String(statusFilter) === String(st.id);
                    return (
                        <Chip
                            key={st.id}
                            label={st.label}
                            size="small"
                            clickable
                            color={isSelected ? "primary" : "default"}
                            variant={isSelected ? "filled" : "outlined"}
                            icon={isSelected ? <CheckIcon fontSize="small" /> : undefined}
                            onClick={() => setStatusFilter(st.id)}
                            sx={{
                                fontWeight: isSelected ? 800 : 600,
                                fontSize: '0.78rem',
                                borderRadius: '8px',
                                transition: 'all 0.15s',
                                bgcolor: isSelected ? undefined : '#ffffff',
                                borderColor: isSelected ? undefined : '#cbd5e1'
                            }}
                        />
                    );
                })}
            </div>

            {/* 4. CONTENT: TABLE OR GRID VIEW */}
            {isMobile ? (
                <Box sx={{ pb: 10 }}>
                    {filteredHopDong && filteredHopDong.length > 0 ? (
                        filteredHopDong.map((hd, index) => (
                            <Card 
                                key={index} 
                                sx={{ 
                                    mb: 2, 
                                    borderRadius: 2, 
                                    border: isUnscheduledShooting(hd) ? '1px solid #fca5a5' : '1px solid #e0e0e0', 
                                    bgcolor: getRowBackgroundColor(hd),
                                    boxShadow: 'none' 
                                }}
                                onClick={() => {
                                    setSendData(hd);
                                    handleClickOpenDetailDialog();
                                }}
                            >
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    p: 1.5, 
                                    bgcolor: isUnscheduledShooting(hd) ? '#fee2e2' : '#f5f5f5', 
                                    borderBottom: '1px solid #e0e0e0' 
                                }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: isUnscheduledShooting(hd) ? '#991b1b' : 'inherit' }}>
                                        {hd.maHopDong}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip 
                                            label={convertTrangThai(hd)} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: getTrangThaiColor(hd), 
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                fontSize: '0.75rem',
                                                height: '24px'
                                            }} 
                                        />
                                        <IconButton size="small" sx={{ padding: 0 }}>
                                            <MoreHorizIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Box sx={{ p: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Khách hàng</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{hd.khachHang1?.tenKhachHang}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Liên hệ</Typography>
                                            <Box display="flex" alignItems="center" gap={0.8}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{hd.khachHang1?.soDienThoai}</Typography>
                                                {hd.khachHang1?.facebookId && (
                                                    <a 
                                                        href={hd.khachHang1.facebookId.startsWith('http') ? hd.khachHang1.facebookId : `https://facebook.com/${hd.khachHang1.facebookId}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        style={{ color: '#1877f2', textDecoration: 'none' }}
                                                        title="Mở Facebook"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <i className="fa-brands fa-facebook" style={{ fontSize: '1.1rem' }}></i>
                                                    </a>
                                                )}
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Dịch vụ</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{getDichVuChinhLabel(hd.dichVuChinh)}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Ngày HĐ</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                                {hd.ngayHopDong ? formatDate(hd.ngayHopDong) : "-"}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Card>
                        ))
                    ) : (
                        <Typography sx={{ textAlign: 'center', mt: 4 }}>Không có dữ liệu hợp đồng khách hàng.</Typography>
                    )}
                </Box>
            ) : viewMode === 'grid' ? (
                /* ===== DẠNG LƯỚI (GRID VIEW) ===== */
                <Box sx={{ pb: 12, pt: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 360px)', flexGrow: 1 }}>
                    {filteredHopDong && filteredHopDong.length > 0 ? (
                        <Grid container spacing={2.5}>
                            {filteredHopDong.map((hd, index) => {
                                return (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={hd._id || index}>
                                        <Card 
                                            sx={{ 
                                                borderRadius: '14px', 
                                                border: isUnscheduledShooting(hd) ? '1px solid #fca5a5' : '1px solid #e2e8f0', 
                                                bgcolor: getRowBackgroundColor(hd),
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                                transition: 'all 0.25s ease-in-out',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
                                                    borderColor: isUnscheduledShooting(hd) ? '#f87171' : '#94a3b8',
                                                    transform: 'translateY(-3px)'
                                                }
                                            }}
                                            onClick={() => {
                                                setSendData(hd);
                                                handleClickOpenDetailDialog();
                                            }}
                                        >
                                            <Box>
                                                {/* Header Card */}
                                                <Box 
                                                    sx={{ 
                                                        p: 1.5, 
                                                        background: isUnscheduledShooting(hd) ? 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)' : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                                                        color: '#ffffff',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        borderTopLeftRadius: '14px',
                                                        borderTopRightRadius: '14px'
                                                    }}
                                                >
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.98rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%' }} title={hd.khachHang1?.tenKhachHang}>
                                                        👤 {hd.khachHang1?.tenKhachHang || 'Chưa cập nhật'}
                                                    </Typography>
                                                    <Chip 
                                                        label={convertTrangThai(hd)} 
                                                        size="small" 
                                                        sx={{ 
                                                            bgcolor: getTrangThaiColor(hd), 
                                                            color: '#ffffff',
                                                            fontWeight: 700,
                                                            fontSize: '0.72rem',
                                                            height: '22px'
                                                        }} 
                                                    />
                                                </Box>

                                                {/* Card Content */}
                                                <Box p={2} display="flex" flexDirection="column" gap={1.5}>
                                                    {/* Mã hợp đồng & Số điện thoại KH1 */}
                                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.82rem' }}>
                                                            📋 Mã HĐ: <span style={{ fontWeight: 700, color: '#0284c7' }}>{hd.maHopDong}</span>
                                                        </Typography>
                                                        {hd.khachHang1?.soDienThoai && (
                                                            <Box display="flex" alignItems="center" gap={0.6}>
                                                                <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>{hd.khachHang1.soDienThoai}</span>
                                                                {hd.khachHang1?.facebookId && (
                                                                    <a 
                                                                        href={hd.khachHang1.facebookId.startsWith('http') ? hd.khachHang1.facebookId : `https://facebook.com/${hd.khachHang1.facebookId}`} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        style={{ color: '#1877f2', textDecoration: 'none' }}
                                                                        title="Mở Facebook Khách 1"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <i className="fa-brands fa-facebook"></i>
                                                                    </a>
                                                                )}
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    {/* Khách hàng 2 */}
                                                    {hd.khachHang2?.tenKhachHang && (
                                                        <Box pt={1} borderTop="1px dashed #e2e8f0">
                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.3 }}>
                                                                👤 KHÁCH HÀNG 2:
                                                            </Typography>
                                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                                <Typography variant="body1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.98rem' }}>
                                                                    {hd.khachHang2.tenKhachHang}
                                                                </Typography>
                                                                {hd.khachHang2?.soDienThoai && (
                                                                    <Box display="flex" alignItems="center" gap={0.6}>
                                                                        <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>{hd.khachHang2.soDienThoai}</span>
                                                                        {hd.khachHang2?.facebookId && (
                                                                            <a 
                                                                                href={hd.khachHang2.facebookId.startsWith('http') ? hd.khachHang2.facebookId : `https://facebook.com/${hd.khachHang2.facebookId}`} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer" 
                                                                                style={{ color: '#1877f2', textDecoration: 'none' }}
                                                                                title="Mở Facebook Khách 2"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <i className="fa-brands fa-facebook"></i>
                                                                            </a>
                                                                        )}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    )}

                                                    {/* Chi tiết dịch vụ & Lịch trình */}
                                                    <Box p={1.2} bgcolor="#f8fafc" borderRadius="10px" border="1px solid #f1f5f9" display="flex" flexDirection="column" gap={0.8}>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Dịch vụ chính:</span>
                                                            <strong style={{ fontSize: '0.82rem', color: '#0284c7' }}>{getDichVuChinhLabel(hd.dichVuChinh)}</strong>
                                                        </Box>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Ngày hợp đồng:</span>
                                                            <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 500 }}>
                                                                {hd.ngayHopDong ? formatDate(hd.ngayHopDong) : '-'}
                                                            </span>
                                                        </Box>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Ngày chụp ảnh:</span>
                                                            {hd.cacNgay?.ngayChup ? (
                                                                <strong style={{ fontSize: '0.78rem', color: '#d97706' }}>
                                                                    {formatDate(hd.cacNgay.ngayChup)}
                                                                </strong>
                                                            ) : (
                                                                <strong style={{ fontSize: '0.78rem', color: '#dc2626' }}>
                                                                    ⚠️ Chưa xếp lịch
                                                                </strong>
                                                            )}
                                                        </Box>

                                                        {/* Thanh Progress Trạng Thái Thanh Toán */}
                                                        {(() => {
                                                            const daThanhToan = Number(hd.thanhToan?.khachHangDaThanhToan) || 0;
                                                            const conLai = hd.thanhToan?.conLai !== undefined ? Number(hd.thanhToan.conLai) : 0;
                                                            const tongTienHD = daThanhToan + conLai;

                                                            let percent = hd.thanhToan?.phanTramDaThanhToan !== undefined
                                                                ? Number(hd.thanhToan.phanTramDaThanhToan)
                                                                : (tongTienHD > 0 ? Math.min(100, Math.round((daThanhToan / tongTienHD) * 100 * 10) / 10) : (daThanhToan > 0 ? 100 : 0));

                                                            const statusText = hd.thanhToan?.trangThaiThanhToan || (percent >= 100 ? 'Đã thanh toán đủ' : percent > 0 ? `Đã thanh toán ${percent}%` : 'Chưa thanh toán');

                                                            return (
                                                                <Box sx={{ mt: 0.5, pt: 0.8, borderTop: '1px dashed #e2e8f0' }}>
                                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.4}>
                                                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Thanh toán:</span>
                                                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: percent >= 100 ? '#15803d' : percent > 0 ? '#b45309' : '#dc2626' }}>
                                                                            {statusText} ({percent}%)
                                                                        </span>
                                                                    </Box>
                                                                    <Box sx={{ width: '100%', height: '8px', bgcolor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                                                        <Box
                                                                            sx={{
                                                                                width: `${percent}%`,
                                                                                height: '100%',
                                                                                borderRadius: '4px',
                                                                                background: percent >= 100 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : percent > 0 ? 'linear-gradient(90deg, #fbbf24 0%, #d97706 100%)' : 'transparent',
                                                                                transition: 'width 0.4s ease-in-out'
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                                                                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Đã thu: <strong>{daThanhToan.toLocaleString('vi-VN')} đ</strong></span>
                                                                        <span style={{ fontSize: '0.72rem', color: conLai <= 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                                                                            {conLai <= 0 ? 'Hết nợ' : `Còn: ${conLai.toLocaleString('vi-VN')} đ`}
                                                                        </span>
                                                                    </Box>
                                                                </Box>
                                                            );
                                                        })()}
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Card Footer Button */}
                                            <Box p={1.5} borderTop="1px solid #f1f5f9" bgcolor="#fafafa" borderBottomLeftRadius="14px" borderBottomRightRadius="14px">
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        borderRadius: '8px',
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        fontSize: '0.82rem',
                                                        borderColor: '#cbd5e1',
                                                        color: '#0284c7',
                                                        '&:hover': {
                                                            borderColor: '#0284c7',
                                                            bgcolor: '#f0f9ff'
                                                        }
                                                    }}
                                                >
                                                    📄 Xem chi tiết hợp đồng
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    ) : (
                        <Typography sx={{ textAlign: 'center', mt: 4, color: '#64748b' }}>Không có dữ liệu hợp đồng khách hàng.</Typography>
                    )}
                </Box>
            ) : (
                /* ===== DẠNG BẢNG (TABLE VIEW) ===== */
                <Paper elevation={0} className="contract-table-container glass-panel">
                    <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto' }}>
                        <Table stickyHeader size="small">
                            <TableHead sx={{ '& th': { bgcolor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.8 } }}>
                                <TableRow>
                                    <TableCell align='center' style={{ minWidth: 50, width: '4%' }}>STT</TableCell>
                                    <TableCell style={{ minWidth: 180, width: '18%' }}>TÊN KHÁCH HÀNG</TableCell>
                                    <TableCell align='center' style={{ minWidth: 110, width: '10%' }}>MÃ SỐ HĐ</TableCell>
                                    <TableCell style={{ minWidth: 140, width: '13%' }}>LIÊN HỆ</TableCell>
                                    <TableCell align='center' style={{ minWidth: 130, width: '13%' }}>DỊCH VỤ</TableCell>
                                    <TableCell align='center' style={{ minWidth: 160, width: '15%' }}>THANH TOÁN</TableCell>
                                    <TableCell align='center' style={{ minWidth: 120, width: '10%' }}>TRẠNG THÁI</TableCell>
                                    <TableCell align='center' style={{ minWidth: 120, width: '9%' }}>NGÀY HỢP ĐỒNG</TableCell>
                                    <TableCell align='center' style={{ minWidth: 130, width: '10%' }}>NGÀY CHỤP</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredHopDong && filteredHopDong.length > 0 ? (
                                    filteredHopDong.map((hd, index) => (
                                        <TableRow 
                                            key={hd._id || index}
                                            className="contract-table-row"
                                            style={{ 
                                                backgroundColor: getRowBackgroundColor(hd)
                                            }}
                                            onClick={() => {
                                                setSendData(hd);
                                                handleClickOpenDetailDialog();
                                            }}
                                        >
                                            <TableCell align='center' style={{ fontWeight: 600, color: '#64748b' }}>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell align='left' style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
                                                {hd.khachHang1?.tenKhachHang}
                                                {hd.khachHang2?.tenKhachHang && (
                                                    <>
                                                        <br />
                                                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>& {hd.khachHang2.tenKhachHang}</span>
                                                    </>
                                                )}
                                            </TableCell>
                                            <TableCell align='center'>
                                                <span className="badge-code">
                                                    {hd.maHopDong}
                                                </span>
                                            </TableCell>
                                            <TableCell align='left'>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontWeight: 600, color: '#2563eb' }}>{hd.khachHang1?.soDienThoai}</span>
                                                    {hd.khachHang1?.facebookId && (
                                                        <Tooltip title="Mở Facebook Khách hàng 1">
                                                            <a 
                                                                href={hd.khachHang1.facebookId.startsWith('http') ? hd.khachHang1.facebookId : `https://facebook.com/${hd.khachHang1.facebookId}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                style={{ color: '#1877f2', textDecoration: 'none' }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <i className="fa-brands fa-facebook"></i>
                                                            </a>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                {hd.khachHang2?.soDienThoai && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 2 }}>
                                                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{hd.khachHang2.soDienThoai}</span>
                                                        {hd.khachHang2?.facebookId && (
                                                            <Tooltip title="Mở Facebook Khách hàng 2">
                                                                <a 
                                                                    href={hd.khachHang2.facebookId.startsWith('http') ? hd.khachHang2.facebookId : `https://facebook.com/${hd.khachHang2.facebookId}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    style={{ color: '#1877f2', textDecoration: 'none' }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <i className="fa-brands fa-facebook"></i>
                                                                </a>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell align='center'>
                                                <span className="badge-service-tag">
                                                    {getDichVuChinhLabel(hd.dichVuChinh)}
                                                </span>
                                            </TableCell>
                                            <TableCell align='center' onClick={(e) => { e.stopPropagation(); setSendData(hd); handleClickOpenDetailDialog(); }}>
                                                {(() => {
                                                    const percent = hd.thanhToan?.phanTramDaThanhToan !== undefined
                                                        ? Number(hd.thanhToan.phanTramDaThanhToan)
                                                        : (Number(hd.thanhToan?.tongGiaTriSauGiam || hd.thanhToan?.tongGiaTri || 0) > 0
                                                            ? Math.min(100, Math.round(((Number(hd.thanhToan?.khachHangDaThanhToan) || 0) / Number(hd.thanhToan?.tongGiaTriSauGiam || hd.thanhToan?.tongGiaTri)) * 100 * 10) / 10)
                                                            : 0);
                                                    const daThanhToan = Number(hd.thanhToan?.khachHangDaThanhToan) || 0;
                                                    const conLai = hd.thanhToan?.conLai !== undefined ? Number(hd.thanhToan.conLai) : 0;
                                                    const statusText = hd.thanhToan?.trangThaiThanhToan || (percent >= 100 ? 'Đã thanh toán đủ' : percent > 0 ? `Đã cọc ${percent}%` : 'Chưa thanh toán');

                                                    return (
                                                        <Box sx={{ minWidth: 140, px: 0.5 }}>
                                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.3}>
                                                                <Chip
                                                                    label={`${percent}%`}
                                                                    size="small"
                                                                    sx={{
                                                                        height: '18px',
                                                                        fontSize: '0.68rem',
                                                                        fontWeight: 800,
                                                                        bgcolor: percent >= 100 ? '#dcfce7' : percent > 0 ? '#fef3c7' : '#fee2e2',
                                                                        color: percent >= 100 ? '#15803d' : percent > 0 ? '#b45309' : '#b91c1c',
                                                                        border: `1px solid ${percent >= 100 ? '#86efac' : percent > 0 ? '#fde047' : '#fca5a5'}`
                                                                    }}
                                                                />
                                                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: percent >= 100 ? '#16a34a' : percent > 0 ? '#d97706' : '#64748b' }}>
                                                                    {statusText}
                                                                </span>
                                                            </Box>
                                                            <Box sx={{ width: '100%', height: '6px', bgcolor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                                <Box
                                                                    sx={{
                                                                        width: `${percent}%`,
                                                                        height: '100%',
                                                                        borderRadius: '3px',
                                                                        background: percent >= 100 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : percent > 0 ? 'linear-gradient(90deg, #fbbf24 0%, #d97706 100%)' : 'transparent'
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.3} sx={{ fontSize: '0.72rem' }}>
                                                                <span style={{ color: '#0284c7', fontWeight: 600 }}>Thu: {daThanhToan.toLocaleString('vi-VN')}đ</span>
                                                                <span style={{ color: conLai <= 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                                                                    {conLai <= 0 ? 'Hết nợ' : `Nợ: ${conLai.toLocaleString('vi-VN')}đ`}
                                                                </span>
                                                            </Box>
                                                        </Box>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell align='center'>
                                                <Chip 
                                                    label={convertTrangThai(hd)} 
                                                    size="small" 
                                                    sx={{ 
                                                        bgcolor: getTrangThaiColor(hd), 
                                                        color: '#fff',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.75rem',
                                                        height: '24px'
                                                    }} 
                                                />
                                            </TableCell>
                                            <TableCell align='center'>
                                                {hd.ngayHopDong ? (
                                                    <>
                                                        <div style={{ fontWeight: 600, color: '#334155' }}>{formatDate(hd.ngayHopDong)}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                                                            (Âm: {formatLunarDateShort(hd.ngayHopDong)})
                                                        </div>
                                                    </>
                                                ) : "-"}
                                            </TableCell>
                                            <TableCell align='center'>
                                                {hd.cacNgay?.ngayChup ? (
                                                    <>
                                                        <div style={{ fontWeight: 700, color: '#d97706' }}>{formatDate(hd.cacNgay.ngayChup)}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                                                            (Âm: {formatLunarDateShort(hd.cacNgay.ngayChup)})
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '0.78rem' }}>⚠️ Chưa xếp lịch</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                            <i className="fa-solid fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: 10, display: 'block', color: '#cbd5e1' }}></i>
                                            Không tìm thấy dữ liệu hợp đồng nào phù hợp.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {isMobile && (
                <Fab 
                    color="primary" 
                    sx={{ 
                        position: 'fixed', 
                        bottom: 70, 
                        right: 16, 
                        zIndex: 1000,
                        opacity: 0.8,
                        boxShadow: '0 6px 16px rgba(2,132,199,0.35)',
                        '&:hover': {
                            opacity: 1
                        }
                    }}
                    onClick={handleClickOpenDialog}
                >
                    <AddIcon />
                </Fab>
            )}

            <DetailHopDongKhachHangDialog
                data={sendData}
                open={openDetailDialog}
                onClose={handleCloseDetailDialog}
            />

            <ThemHopDongKHDialog
                selectedValue={selectedValueDialog}
                open={openDialogHD}
                onClose={handleCloseDialog}
            />
        </div>
    );
}

export default HopDongKhachHang;
