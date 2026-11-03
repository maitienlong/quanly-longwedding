import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Chip,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
    Stack,
    Tabs,
    Tab,
    Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import './quanlytrangphuc.css';

const CATEGORIES = [
    'ALL',
    'Váy Luxury',
    'Váy VIP',
    'Váy Đi Bàn',
    'Áo Dài Cô Dâu',
    'Áo Dài Chú Rể',
    'Áo Dài Bê Tráp',
    'Vest Chú Rể',
    'Phụ Kiện',
    'Khác'
];

const STATUS_CONFIG = {
    SAN_SANG: { label: 'Sẵn sàng', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircleOutlineIcon fontSize="small" /> },
    DANG_GIU: { label: 'Đang giữ lịch', color: '#2563eb', bg: '#dbeafe', icon: <EventAvailableIcon fontSize="small" /> },
    DANG_CHO_THUE: { label: 'Đang cho thuê', color: '#d97706', bg: '#fef3c7', icon: <EventAvailableIcon fontSize="small" /> },
    DANG_GIAT_HAP: { label: 'Đang giặt hấp', color: '#0891b2', bg: '#cffafe', icon: <LocalLaundryServiceIcon fontSize="small" /> },
    DANG_SUA_CHUA: { label: 'Đang sửa chữa', color: '#9333ea', bg: '#f3e8ff', icon: <ContentCutIcon fontSize="small" /> },
    NGUNG_SU_DUNG: { label: 'Ngừng sử dụng', color: '#dc2626', bg: '#fee2e2', icon: <WarningAmberIcon fontSize="small" /> }
};

export default function QuanLyTrangPhuc() {
    const [activeTab, setActiveTab] = useState(0); // 0: Danh sách kho, 1: Lịch giữ váy/vest, 2: Kiểm tra trùng lịch
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');

    // Dialog Thêm/Sửa
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        maTrangPhuc: '',
        tenTrangPhuc: '',
        phanLoai: 'Váy Luxury',
        size: 'Freesize',
        mauSac: 'Trắng',
        giaChoThue: 0,
        giaCoc: 0,
        anhDaiDien: '',
        tinhTrang: 'SAN_SANG',
        viTriKe: '',
        ghiChu: ''
    });

    // Dialog Kiểm tra xung đột (Conflict Guard)
    const [conflictCheck, setConflictCheck] = useState({
        maTrangPhuc: '',
        ngayHenLay: '',
        ngayHenTra: '',
        checking: false,
        result: null
    });

    // Lịch đặt đồ (Calendar bookings)
    const [calendarBookings, setCalendarBookings] = useState([]);
    const [calendarLoading, setCalendarLoading] = useState(false);

    const loadItems = useCallback(async () => {
        setLoading(true);
        try {
            const res = await otherService.listTrangPhuc({
                phanLoai: selectedCategory,
                tinhTrang: selectedStatus,
                keyword: searchKeyword
            });
            if (res.data?.success && res.data?.data) {
                setItems(res.data.data);
            } else if (Array.isArray(res.data)) {
                setItems(res.data);
            }
        } catch (err) {
            console.error("Lỗi tải trang phục:", err);
            toast.error("Không thể tải danh sách trang phục");
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, selectedStatus, searchKeyword]);

    const loadCalendar = useCallback(async () => {
        setCalendarLoading(true);
        try {
            const res = await otherService.getCostumeCalendar();
            if (res.data?.success && res.data?.data) {
                setCalendarBookings(res.data.data);
            }
        } catch (err) {
            console.error("Lỗi tải lịch giữ đồ:", err);
        } finally {
            setCalendarLoading(false);
        }
    }, []);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    useEffect(() => {
        if (activeTab === 1) {
            loadCalendar();
        }
    }, [activeTab, loadCalendar]);

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({
            maTrangPhuc: '',
            tenTrangPhuc: '',
            phanLoai: 'Váy Luxury',
            size: 'Freesize',
            mauSac: 'Trắng',
            giaChoThue: 0,
            giaCoc: 0,
            anhDaiDien: '',
            tinhTrang: 'SAN_SANG',
            viTriKe: '',
            ghiChu: ''
        });
        setOpenDialog(true);
    };

    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setFormData({
            maTrangPhuc: item.maTrangPhuc || '',
            tenTrangPhuc: item.tenTrangPhuc || '',
            phanLoai: item.phanLoai || 'Váy Luxury',
            size: item.size || 'Freesize',
            mauSac: item.mauSac || 'Trắng',
            giaChoThue: item.giaChoThue || 0,
            giaCoc: item.giaCoc || 0,
            anhDaiDien: item.anhDaiDien || '',
            tinhTrang: item.tinhTrang || 'SAN_SANG',
            viTriKe: item.viTriKe || '',
            ghiChu: item.ghiChu || ''
        });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!formData.maTrangPhuc || !formData.tenTrangPhuc) {
            toast.warning("Vui lòng nhập mã và tên trang phục");
            return;
        }

        try {
            if (editingItem) {
                await otherService.updateTrangPhuc({ ...formData, id: editingItem._id });
                toast.success("Cập nhật trang phục thành công!");
            } else {
                await otherService.createTrangPhuc(formData);
                toast.success("Thêm mới trang phục thành công!");
            }
            setOpenDialog(false);
            loadItems();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Lỗi lưu trang phục");
        }
    };

    const handleDelete = async (id, ma) => {
        if (!window.confirm(`Bạn có chắc muốn xóa trang phục [${ma}]?`)) return;
        try {
            await otherService.removeTrangPhuc({ id });
            toast.success(`Đã xóa trang phục ${ma}`);
            loadItems();
        } catch (err) {
            toast.error("Không thể xóa: " + err.message);
        }
    };

    const handleRunConflictCheck = async () => {
        if (!conflictCheck.maTrangPhuc || !conflictCheck.ngayHenLay || !conflictCheck.ngayHenTra) {
            toast.warning("Vui lòng chọn mã trang phục, ngày lấy và ngày trả");
            return;
        }

        setConflictCheck(prev => ({ ...prev, checking: true, result: null }));
        try {
            const res = await otherService.checkCostumeConflict({
                maTrangPhuc: conflictCheck.maTrangPhuc,
                ngayHenLay: conflictCheck.ngayHenLay,
                ngayHenTra: conflictCheck.ngayHenTra
            });
            if (res.data?.success) {
                setConflictCheck(prev => ({ ...prev, result: res.data.data }));
            }
        } catch (err) {
            toast.error("Lỗi kiểm tra xung đột: " + err.message);
        } finally {
            setConflictCheck(prev => ({ ...prev, checking: false }));
        }
    };

    return (
        <Box className="quanly-trangphuc-container" sx={{ p: 3 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                        👗 Quản Lý Trang Phục & Lịch Giữ Váy / Vest
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Kiểm soát tồn kho, lịch hẹn mượn đồ cưới và chống trùng lịch váy Luxury giữa các cô dâu
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                    <Button 
                        variant="outlined" 
                        color="secondary"
                        startIcon={<WarningAmberIcon />}
                        onClick={() => setActiveTab(2)}
                    >
                        Kiểm tra trùng lịch
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAdd}
                        sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
                    >
                        Thêm trang phục
                    </Button>
                </Stack>
            </Stack>

            {/* Tabs */}
            <Paper sx={{ mb: 3, borderRadius: 2 }}>
                <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} indicatorColor="primary" textColor="primary">
                    <Tab label={`Kho Trang Phục (${items.length})`} />
                    <Tab label={`Lịch Giữ & Mượn Đồ (${calendarBookings.length})`} />
                    <Tab label="Kiểm Tra Xung Đột (Conflict Guard)" />
                </Tabs>
            </Paper>

            {/* TAB 0: Danh Sách Kho Trang Phục */}
            {activeTab === 0 && (
                <>
                    {/* Filters */}
                    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Tìm theo mã hoặc tên trang phục..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Phân loại</InputLabel>
                                    <Select
                                        value={selectedCategory}
                                        label="Phân loại"
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <MenuItem key={cat} value={cat}>
                                                {cat === 'ALL' ? 'Tất cả phân loại' : cat}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Tình trạng</InputLabel>
                                    <Select
                                        value={selectedStatus}
                                        label="Tình trạng"
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                    >
                                        <MenuItem value="ALL">Tất cả tình trạng</MenuItem>
                                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                            <MenuItem key={k} value={k}>{v.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button 
                                    fullWidth 
                                    variant="outlined" 
                                    onClick={() => { setSearchKeyword(''); setSelectedCategory('ALL'); setSelectedStatus('ALL'); }}
                                >
                                    Đặt lại
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Costume Grid */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : items.length === 0 ? (
                        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
                            <Typography sx={{ color: '#64748b', fontSize: 16 }}>
                                Chưa có trang phục nào phù hợp với bộ lọc tìm kiếm.
                            </Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={2.5}>
                            {items.map(item => {
                                const st = STATUS_CONFIG[item.tinhTrang] || STATUS_CONFIG.SAN_SANG;
                                return (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                                        <Card sx={{ 
                                            borderRadius: 3, 
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 24px rgba(0,0,0,0.1)' }
                                        }}>
                                            <Box sx={{ position: 'relative', height: 220, bgcolor: '#f8fafc' }}>
                                                {item.anhDaiDien ? (
                                                    <CardMedia
                                                        component="img"
                                                        height="220"
                                                        image={item.anhDaiDien}
                                                        alt={item.tenTrangPhuc}
                                                        sx={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                                        <Typography variant="h4">👗</Typography>
                                                    </Box>
                                                )}
                                                <Chip
                                                    label={item.maTrangPhuc}
                                                    size="small"
                                                    sx={{ 
                                                        position: 'absolute', 
                                                        top: 10, 
                                                        left: 10, 
                                                        fontWeight: 700, 
                                                        bgcolor: 'rgba(15, 23, 42, 0.8)', 
                                                        color: '#ffffff' 
                                                    }}
                                                />
                                                <Chip
                                                    label={st.label}
                                                    size="small"
                                                    sx={{ 
                                                        position: 'absolute', 
                                                        top: 10, 
                                                        right: 10, 
                                                        fontWeight: 600, 
                                                        bgcolor: st.bg, 
                                                        color: st.color 
                                                    }}
                                                />
                                            </Box>
                                            <CardContent sx={{ pb: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {item.tenTrangPhuc}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#0284c7', fontWeight: 600, mb: 1 }}>
                                                    {item.phanLoai} • {item.size} • {item.mauSac}
                                                </Typography>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                        Giá thuê:
                                                    </Typography>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e11d48' }}>
                                                        {(item.giaChoThue || 0).toLocaleString('vi-VN')} đ
                                                    </Typography>
                                                </Stack>
                                                {item.viTriKe && (
                                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                                                        📍 Vị trí: {item.viTriKe}
                                                    </Typography>
                                                )}
                                            </CardContent>
                                            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pt: 0, pb: 1.5 }}>
                                                <Tooltip title="Chỉnh sửa">
                                                    <IconButton size="small" onClick={() => handleOpenEdit(item)} sx={{ color: '#2563eb' }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Xóa">
                                                    <IconButton size="small" onClick={() => handleDelete(item._id, item.maTrangPhuc)} sx={{ color: '#dc2626' }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </>
            )}

            {/* TAB 1: Lịch Giữ & Mượn Đồ */}
            {activeTab === 1 && (
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        📅 Danh Sách Lịch Giữ Váy & Mượn Đồ Cưới Theo Hợp Đồng
                    </Typography>
                    {calendarLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : calendarBookings.length === 0 ? (
                        <Typography sx={{ color: '#64748b', py: 4, textAlign: 'center' }}>
                            Chưa có hợp đồng nào đặt lịch giữ trang phục.
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {calendarBookings.map((b, idx) => (
                                <Box key={idx} sx={{ 
                                    p: 2, 
                                    borderRadius: 2, 
                                    border: '1px solid #e2e8f0', 
                                    bgcolor: b.color === '#dc2626' ? '#fff5f5' : '#f0f9ff',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                            {b.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#475569' }}>
                                            Khách: <strong>{b.tenKhach}</strong> ({b.sdt}) • Hợp đồng: <strong>{b.maHopDong}</strong>
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                            Thời gian giữ: Từ {new Date(b.start).toLocaleDateString('vi-VN')} đến {new Date(b.end).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </Box>
                                    <Chip 
                                        label={b.trangThai === 'DANG_MUON' ? 'Khách đang giữ đồ' : 'Đã đặt cọc giữ lịch'} 
                                        sx={{ 
                                            bgcolor: b.trangThai === 'DANG_MUON' ? '#fee2e2' : '#e0f2fe',
                                            color: b.trangThai === 'DANG_MUON' ? '#b91c1c' : '#0369a1',
                                            fontWeight: 600
                                        }}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Paper>
            )}

            {/* TAB 2: Kiểm Tra Xung Đột Lịch (Conflict Guard) */}
            {activeTab === 2 && (
                <Paper sx={{ p: 4, borderRadius: 2, maxWidth: 800, mx: 'auto' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberIcon color="warning" /> Kiểm Tra Trùng Lịch Váy / Vest Trước Khi Chốt
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                        Hệ thống tự động cộng thêm buffer 1 ngày trước và sau để đảm bảo kịp thời gian giặt hấp, sửa phom dáng.
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Mã trang phục cần kiểm tra (VD: VAY-LUX-01)"
                                value={conflictCheck.maTrangPhuc}
                                onChange={(e) => setConflictCheck(prev => ({ ...prev, maTrangPhuc: e.target.value.toUpperCase() }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Ngày hẹn lấy đồ"
                                InputLabelProps={{ shrink: true }}
                                value={conflictCheck.ngayHenLay}
                                onChange={(e) => setConflictCheck(prev => ({ ...prev, ngayHenLay: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Ngày hẹn trả đồ"
                                InputLabelProps={{ shrink: true }}
                                value={conflictCheck.ngayHenTra}
                                onChange={(e) => setConflictCheck(prev => ({ ...prev, ngayHenTra: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleRunConflictCheck}
                                disabled={conflictCheck.checking}
                                sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
                            >
                                {conflictCheck.checking ? 'Đang kiểm tra...' : 'Kiểm Tra Ngay'}
                            </Button>
                        </Grid>
                    </Grid>

                    {conflictCheck.result && (
                        <Box sx={{ mt: 3 }}>
                            {conflictCheck.result.isConflict ? (
                                <Alert severity="error" sx={{ borderRadius: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        ⚠️ XUNG ĐỘT LỊCH! Mẫu váy này đã có khách khác đặt trước trong khoảng thời gian này:
                                    </Typography>
                                    <Stack spacing={1} sx={{ mt: 1 }}>
                                        {conflictCheck.result.conflicts.map((c, i) => (
                                            <Typography key={i} variant="body2">
                                                • <strong>HĐ {c.maHopDong}</strong> - Khách <strong>{c.tenKhachHang}</strong> ({c.soDienThoai}) hẹn từ {new Date(c.ngayHenLay).toLocaleDateString('vi-VN')} đến {new Date(c.ngayHenTra).toLocaleDateString('vi-VN')}.
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Alert>
                            ) : (
                                <Alert severity="success" sx={{ borderRadius: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        ✅ LỊCH TRỐNG! Mẫu váy này hoàn toàn sẵn sàng cho cô dâu trong khoảng ngày đã chọn.
                                    </Typography>
                                </Alert>
                            )}
                        </Box>
                    )}
                </Paper>
            )}

            {/* Modal Thêm / Chỉnh Sửa Trang Phục */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {editingItem ? 'Chỉnh Sửa Trang Phục' : 'Thêm Mới Trang Phục Vào Kho'}
                    </Typography>
                    <IconButton onClick={() => setOpenDialog(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Mã trang phục (VD: VAY-LUX-01, AO-DAI-02)"
                            value={formData.maTrangPhuc}
                            onChange={(e) => setFormData(prev => ({ ...prev, maTrangPhuc: e.target.value.toUpperCase() }))}
                            disabled={Boolean(editingItem)}
                        />
                        <TextField
                            fullWidth
                            label="Tên trang phục"
                            value={formData.tenTrangPhuc}
                            onChange={(e) => setFormData(prev => ({ ...prev, tenTrangPhuc: e.target.value }))}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Phân loại</InputLabel>
                                    <Select
                                        value={formData.phanLoai}
                                        label="Phân loại"
                                        onChange={(e) => setFormData(prev => ({ ...prev, phanLoai: e.target.value }))}
                                    >
                                        {CATEGORIES.filter(c => c !== 'ALL').map(cat => (
                                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Tình trạng</InputLabel>
                                    <Select
                                        value={formData.tinhTrang}
                                        label="Tình trạng"
                                        onChange={(e) => setFormData(prev => ({ ...prev, tinhTrang: e.target.value }))}
                                    >
                                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                            <MenuItem key={k} value={k}>{v.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Size (VD: S, M, L, Freesize)"
                                    value={formData.size}
                                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Màu sắc"
                                    value={formData.mauSac}
                                    onChange={(e) => setFormData(prev => ({ ...prev, mauSac: e.target.value }))}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Đơn giá cho thuê (VNĐ)"
                                    value={formData.giaChoThue}
                                    onChange={(e) => setFormData(prev => ({ ...prev, giaChoThue: Number(e.target.value) }))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Tiền đặt cọc (VNĐ)"
                                    value={formData.giaCoc}
                                    onChange={(e) => setFormData(prev => ({ ...prev, giaCoc: Number(e.target.value) }))}
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            fullWidth
                            label="Link ảnh đại diện (URL / Cloudflare R2 / Drive)"
                            value={formData.anhDaiDien}
                            onChange={(e) => setFormData(prev => ({ ...prev, anhDaiDien: e.target.value }))}
                        />
                        <TextField
                            fullWidth
                            label="Vị trí kệ trong kho (VD: Kệ A1, Tủ váy cưới 2)"
                            value={formData.viTriKe}
                            onChange={(e) => setFormData(prev => ({ ...prev, viTriKe: e.target.value }))}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Ghi chú"
                            value={formData.ghiChu}
                            onChange={(e) => setFormData(prev => ({ ...prev, ghiChu: e.target.value }))}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#0284c7' }}>
                        Lưu Thay Đổi
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
