import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { useContractTypes } from '../../hooks/useContractTypes';
import ThemHopDongKHDialog from './ThemHopDongKHDialog';
import { formatDate } from '../utils/convertDate';
import { formatLunarDateShort } from '../../utils/lunarDateUtils';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import IconButton from '@mui/material/IconButton';
import DetailHopDongKhachHangDialog from './DetailHopDongKhachHangDialog';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

// getDichVuChinhLabel is now retrieved dynamically from useContractTypes hook

function HopDongKhachHang() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { getDichVuChinhLabel } = useContractTypes();
    const [hopDong, setHopDong] = useState([]);
    const { showLoading, hideLoading } = useLoading();

    // Lọc và Tìm kiếm
    const locThoiGian = [
        { label: 'Tất cả thời gian', id: 'all' },
        { label: 'Hôm nay', id: 'hôm nay' },
        { label: '1 tuần', id: '1 tuần' },
        { label: '1 tháng', id: '1 tháng' },
        { label: '4 tháng', id: '4 tháng' }
    ];

    const locTrangThai = [
        { label: 'Tất cả trạng thái', id: 'all' },
        { label: '🔴 Chưa xếp lịch chụp', id: 'no_schedule' },
        { label: 'Tạo hợp đồng', id: 1 },
        { label: 'Chụp hình', id: 2 },
        { label: 'Hậu kỳ', id: 3 },
        { label: 'In ảnh', id: 4 },
        { label: 'Hoàn thành', id: 5 }
    ];

    const [selectedTime, setSelectedTime] = useState(locThoiGian[1]);
    const [selectedStatus, setSelectedStatus] = useState(locTrangThai[0]);
    const [searchInput, setSearchInput] = useState("");
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

    // LOGIC DIALOG KHÁCH HÀNG
    const [openDialogHD, setOpenDialogHD] = React.useState(false);
    const [openDetailDialog, setOpenDetailDialog] = React.useState(false);
    const [selectedValueDialog, setSelectedValueDialog] = React.useState({ data: "hello" });
    const [sendData, setSendData] = useState({});

    const handleClickOpenDialog = () => {
        setOpenDialogHD(true);
    };

    const loadHopDong = useCallback((timeVal, statusVal, searchVal) => {
        showLoading("Đang tải hợp đồng ...");
        const params = {};
        if (timeVal && timeVal !== 'all') {
            params.filter = timeVal;
        }
        if (statusVal && statusVal !== 'all' && statusVal !== 'no_schedule') {
            params.status = statusVal;
        }
        if (searchVal) {
            params.keyword = searchVal;
        }

        otherService.LIST_HOPDONG(params)
            .then((response) => {
                console.log(response.data.hopDong);
                setHopDong(response.data.hopDong);
                hideLoading();
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error("Đã có lỗi rồi hai ơi: " + error.message);
                hideLoading();
            });
    }, [showLoading, hideLoading]);

    const handleCloseDialog = (value) => {
        setOpenDialogHD(false);
        setSelectedValueDialog(value);
        loadHopDong(selectedTime?.id, selectedStatus?.id, searchInput);
    };
    const handleClickOpenDetailDialog = () => {
        setOpenDetailDialog(true);
    };
    const handleCloseDetailDialog = (updated) => {
        setOpenDetailDialog(false);
        if (updated === true) {
            loadHopDong(selectedTime?.id, selectedStatus?.id, searchInput);
        }
    };

    const commonHeight = 56;

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadHopDong(selectedTime?.id, selectedStatus?.id, searchInput);
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [selectedTime?.id, selectedStatus?.id, searchInput, loadHopDong]);

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

    const filteredHopDong = (hopDong || []).filter(hd => {
        if (selectedStatus?.id === 'no_schedule') {
            return isUnscheduledShooting(hd);
        }
        return true;
    });

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
        if (giaiDoanVal === 'no_schedule') return "#dc2626"; // Đỏ nổi bật (Red)
        switch (giaiDoanVal) {
            case 1:
                return "#64748b"; // Ghi Slate
            case 2:
                return "#d97706"; // Cam / Vàng
            case 3:
                return "#2563eb"; // Xanh dương
            case 4:
                return "#7c3aed"; // Tím
            case 5:
                return "#10b981"; // Xanh lá
            default:
                return "#64748b";
        }
    };

    const getRowBackgroundColor = (hd) => {
        const giaiDoanVal = typeof hd === 'object' && hd !== null ? (isUnscheduledShooting(hd) ? 'no_schedule' : hd.giaiDoan) : hd;
        if (giaiDoanVal === 'no_schedule') return '#fef2f2'; // Đỏ nhạt (Light Red)
        switch (giaiDoanVal) {
            case 1:
                return '#f8fafc'; // Ghi xám nhạt
            case 2:
                return '#fffbeb'; // Vàng nhạt
            case 3:
                return '#eff6ff'; // Xanh dương nhạt
            case 4:
                return '#faf5ff'; // Tím nhạt
            case 5:
                return '#f0fdf4'; // Xanh lá nhạt
            default:
                return '#ffffff';
        }
    };

    return (
        <div className="hopdongkhachhang">
            <div className="content-header">
                <h2>QUẢN LÝ HỢP ĐỒNG KHÁCH HÀNG</h2>
                <Stack 
                    spacing={2} 
                    direction={isMobile ? 'column' : 'row'} 
                    sx={{ width: '100%', mb: 2 }}
                >
                    <TextField
                        id="outlined-basic"
                        label="Tìm kiếm (Mã HĐ, SĐT, Tên)"
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        InputProps={{
                            sx: { height: isMobile ? 42 : commonHeight }
                        }}
                        sx={{ width: isMobile ? '100%' : 280, order: isMobile ? 1 : 3 }}
                    />
                    
                    <Stack direction="row" spacing={2} sx={{ width: isMobile ? '100%' : 'auto', order: isMobile ? 2 : 1 }}>
                        <Autocomplete
                            disablePortal
                            options={locThoiGian}
                            value={selectedTime}
                            onChange={(event, newValue) => {
                                setSelectedTime(newValue || locThoiGian[0]);
                            }}
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            size={isMobile ? "small" : "medium"}
                            sx={{ flex: 1, minWidth: isMobile ? 0 : 220 }}
                            renderInput={(params) => <TextField {...params} label="Lọc theo thời gian" sx={{ '& .MuiInputBase-root': { height: isMobile ? 42 : commonHeight } }} />}
                        />

                        <Autocomplete
                            disablePortal
                            options={locTrangThai}
                            value={selectedStatus}
                            onChange={(event, newValue) => {
                                setSelectedStatus(newValue || locTrangThai[0]);
                            }}
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            size={isMobile ? "small" : "medium"}
                            sx={{ flex: 1, minWidth: isMobile ? 0 : 220 }}
                            renderInput={(params) => <TextField {...params} label="Lọc theo trạng thái" sx={{ '& .MuiInputBase-root': { height: isMobile ? 42 : commonHeight } }} />}
                        />
                    </Stack>

                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, newMode) => {
                            if (newMode !== null) setViewMode(newMode);
                        }}
                        size="small"
                        sx={{ height: isMobile ? 38 : commonHeight, bgcolor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', flexShrink: 0 }}
                    >
                        <ToggleButton value="table" title="Dạng Bảng" sx={{ px: 1.5, fontSize: '0.82rem', fontWeight: 600, textTransform: 'none' }}>
                            <ViewListIcon fontSize="small" sx={{ mr: 0.5 }} /> Bảng
                        </ToggleButton>
                        <ToggleButton value="grid" title="Dạng Lưới" sx={{ px: 1.5, fontSize: '0.82rem', fontWeight: 600, textTransform: 'none' }}>
                            <ViewModuleIcon fontSize="small" sx={{ mr: 0.5 }} /> Lưới
                        </ToggleButton>
                    </ToggleButtonGroup>

                    {!isMobile && (
                        <Button
                            onClick={handleClickOpenDialog}
                            variant="contained"
                            sx={{
                                height: commonHeight, // Ép chiều cao bằng với các input trên
                                whiteSpace: 'nowrap',  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                                order: 4
                            }}
                        >Thêm Hợp Đồng</Button>
                    )}
                </Stack>
            </div>

            {/* ===== DANH SÁCH HỢP ĐỒNG ===== */}
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
                <Box sx={{ pb: 10, pt: 1 }}>
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
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.92rem' }}>
                                                        {hd.maHopDong}
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
                                                    {/* Khách hàng 1 */}
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.3 }}>
                                                            👤 KHÁCH HÀNG 1:
                                                        </Typography>
                                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                                {hd.khachHang1?.tenKhachHang || 'Chưa cập nhật'}
                                                            </Typography>
                                                            {hd.khachHang1?.soDienThoai && (
                                                                <Box display="flex" alignItems="center" gap={0.6}>
                                                                    <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>{hd.khachHang1.soDienThoai}</span>
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
                                                    </Box>

                                                    {/* Khách hàng 2 */}
                                                    {hd.khachHang2?.tenKhachHang && (
                                                        <Box pt={1} borderTop="1px dashed #e2e8f0">
                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.3 }}>
                                                                👤 KHÁCH HÀNG 2:
                                                            </Typography>
                                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
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
                                                        fontWeight: 600,
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
                <TableContainer component={Paper} style={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
                <Table stickyHeader aria-label="simple table">

                    <TableHead sx={{ '& th': { backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' } }}>
                        <TableRow>
                            <TableCell align='center' style={{ minWidth: 60, width: '5%' }}>STT</TableCell>
                            <TableCell align='center' style={{ minWidth: 100, width: '10%' }}>MÃ SỐ HĐ</TableCell>
                            <TableCell style={{ minWidth: 200, width: '20%' }}>TÊN KHÁCH HÀNG</TableCell>
                            <TableCell style={{ minWidth: 150, width: '15%' }}>LIÊN HỆ</TableCell>
                            <TableCell align='center' style={{ minWidth: 150, width: '15%' }}>DỊCH VỤ</TableCell>
                            <TableCell align='center' style={{ minWidth: 120, width: '15%' }}>TRẠNG THÁI</TableCell>
                            <TableCell align='center' style={{ minWidth: 150, width: '10%' }}>NGÀY HỢP ĐỒNG</TableCell>
                            <TableCell align='center' style={{ minWidth: 150, width: '10%' }}>NGÀY CHỤP</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredHopDong && filteredHopDong.length > 0 ? (
                            filteredHopDong.map((hd, index) => (
                                <TableRow key={index}
                                    style={{ 
                                        cursor: "pointer",
                                        backgroundColor: getRowBackgroundColor(hd)
                                    }}
                                    sx={{
                                        '&:hover': {
                                            filter: 'brightness(95%)',
                                            transition: 'filter 0.15s ease'
                                        }
                                    }}
                                    onClick={() => {
                                        setSendData(hd);
                                        handleClickOpenDetailDialog();
                                    }}
                                >
                                    <TableCell align='center'>{index + 1}</TableCell>
                                    <TableCell align='center' style={{ fontWeight: 'bold' }}>{hd.maHopDong}</TableCell>
                                    <TableCell align='left'>
                                        {hd.khachHang1?.tenKhachHang}
                                        {hd.khachHang2?.tenKhachHang && (
                                            <>
                                                <br />
                                                <hr style={{ opacity: "40%" }} />
                                                {hd.khachHang2.tenKhachHang}
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell align='left'>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>{hd.khachHang1?.soDienThoai}</span>
                                            {hd.khachHang1?.facebookId && (
                                                <a 
                                                    href={hd.khachHang1.facebookId.startsWith('http') ? hd.khachHang1.facebookId : `https://facebook.com/${hd.khachHang1.facebookId}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    style={{ color: '#1877f2', textDecoration: 'none' }}
                                                    title="Mở Facebook Khách hàng 1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <i className="fa-brands fa-facebook"></i>
                                                </a>
                                            )}
                                        </div>
                                        {hd.khachHang2?.soDienThoai && (
                                            <>
                                                <hr style={{ opacity: "40%", margin: '4px 0' }} />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span>{hd.khachHang2.soDienThoai}</span>
                                                    {hd.khachHang2?.facebookId && (
                                                        <a 
                                                            href={hd.khachHang2.facebookId.startsWith('http') ? hd.khachHang2.facebookId : `https://facebook.com/${hd.khachHang2.facebookId}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            style={{ color: '#1877f2', textDecoration: 'none' }}
                                                            title="Mở Facebook Khách hàng 2"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <i className="fa-brands fa-facebook"></i>
                                                        </a>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell align='center'>{getDichVuChinhLabel(hd.dichVuChinh)}</TableCell>
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
                                                <div>{formatDate(hd.ngayHopDong)}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '3px' }}>
                                                    (Âm: {formatLunarDateShort(hd.ngayHopDong)})
                                                </div>
                                            </>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell align='center'>
                                        {hd.cacNgay?.ngayChup ? (
                                            <>
                                                <div>{formatDate(hd.cacNgay.ngayChup)}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '3px' }}>
                                                    (Âm: {formatLunarDateShort(hd.cacNgay.ngayChup)})
                                                </div>
                                            </>
                                        ) : (
                                            <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '0.82rem' }}>⚠️ Chưa xếp lịch</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="10">Không có dữ liệu hợp đồng khách hàng.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            )}

            {isMobile && (
                <Fab 
                    color="primary" 
                    sx={{ 
                        position: 'fixed', 
                        bottom: 70, 
                        right: 16, 
                        zIndex: 1000,
                        opacity: 0.5,
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
