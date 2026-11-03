import React, { useState, useEffect, useCallback } from 'react';
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
    Stack,
    CircularProgress,
    Divider,
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PhoneIcon from '@mui/icons-material/Phone';
import CloseIcon from '@mui/icons-material/Close';
import FacebookIcon from '@mui/icons-material/Facebook';
import SendIcon from '@mui/icons-material/Send';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useNavigate } from 'react-router-dom';

const LEAD_STATUS = {
    MOI: { label: 'Mới nhận', color: '#0284c7', bg: '#e0f2fe' },
    DANG_TU_VAN: { label: 'Đang tư vấn', color: '#d97706', bg: '#fef3c7' },
    HEN_LICH_TEST: { label: 'Hẹn thử váy / Test', color: '#7c3aed', bg: '#ede9fe' },
    DA_CHOT: { label: 'Đã chốt HĐ', color: '#059669', bg: '#d1fae5' },
    HUY: { label: 'Đã hủy / Bỏ qua', color: '#dc2626', bg: '#fee2e2' }
};

export default function QuanLyLead() {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Dialog Chi tiết & Thêm nhật ký tư vấn
    const [selectedLead, setSelectedLead] = useState(null);
    const [consultationText, setConsultationText] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState('');

    // Dialog Thêm Lead thủ công
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newLeadData, setNewLeadData] = useState({
        hoTen: '',
        soDienThoai: '',
        facebookName: '',
        nguonLead: 'MESSENGER',
        goiQuanTam: '',
        nganSachDuKien: 0,
        ghiChu: ''
    });

    const loadLeads = useCallback(async () => {
        setLoading(true);
        try {
            const res = await otherService.listLeads({
                trangThai: filterStatus,
                keyword: searchKeyword
            });
            if (res.data?.success && res.data?.data) {
                setLeads(res.data.data);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách Lead:", err);
            toast.error("Không thể tải danh sách Lead");
        } finally {
            setLoading(false);
        }
    }, [filterStatus, searchKeyword]);

    useEffect(() => {
        loadLeads();
    }, [loadLeads]);

    const handleCreateLead = async () => {
        if (!newLeadData.hoTen) {
            toast.warning("Vui lòng nhập họ tên khách hàng");
            return;
        }

        try {
            await otherService.createLead(newLeadData);
            toast.success("Thêm Lead mới thành công!");
            setOpenAddDialog(false);
            setNewLeadData({
                hoTen: '',
                soDienThoai: '',
                facebookName: '',
                nguonLead: 'MESSENGER',
                goiQuanTam: '',
                nganSachDuKien: 0,
                ghiChu: ''
            });
            loadLeads();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Lỗi tạo Lead");
        }
    };

    const handleAddConsultationNote = async () => {
        if (!consultationText.trim() && !updatingStatus) {
            toast.warning("Vui lòng nhập nội dung tư vấn hoặc chọn trạng thái mới");
            return;
        }

        try {
            const payload = {
                id: selectedLead._id,
                consultationNote: consultationText.trim() || undefined
            };
            if (updatingStatus) payload.trangThai = updatingStatus;

            const res = await otherService.updateLead(payload);
            if (res.data?.success) {
                toast.success("Đã cập nhật nhật ký tư vấn!");
                setSelectedLead(res.data.data);
                setConsultationText('');
                loadLeads();
            }
        } catch (err) {
            toast.error("Lỗi cập nhật: " + err.message);
        }
    };

    const handleConvertToContract = async (lead) => {
        if (!window.confirm(`Chuyển đổi Lead [${lead.hoTen}] thành Hợp đồng chính thức?`)) return;

        try {
            const res = await otherService.convertLeadToContract({
                leadId: lead._id,
                contractType: 'FULL_WEDDING',
                khachHangData: {
                    tenKhachHang: lead.hoTen,
                    soDienThoai: lead.soDienThoai || '',
                    facebookId: lead.facebookId || ''
                }
            });

            if (res.data?.success) {
                toast.success(`Chuyển đổi thành công sang Hợp đồng ${res.data.data.hopDong?.maHopDong}!`);
                loadLeads();
                setSelectedLead(null);
                // Điều hướng sang trang Hợp đồng
                navigate('/hopdong');
            }
        } catch (err) {
            toast.error("Lỗi chuyển đổi: " + err.message);
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: 'calc(100vh - 80px)' }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                        💬 Phân Hệ Lead & Chăm Sóc Khách Hàng Tiềm Năng
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Thu thập tự động từ n8n / Facebook Messenger / Website. Tách riêng bảng Lead khỏi Hợp đồng để tránh làm lệch thống kê tài chính.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddDialog(true)}
                    sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
                >
                    Nhập Lead Mới
                </Button>
            </Stack>

            {/* Filter */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Tìm kiếm theo Tên, Số điện thoại, Facebook..."
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
                    <Grid item xs={6} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Trạng thái"
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                                {Object.entries(LEAD_STATUS).map(([k, v]) => (
                                    <MenuItem key={k} value={k}>{v.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Button 
                            fullWidth 
                            variant="outlined"
                            onClick={() => { setSearchKeyword(''); setFilterStatus('ALL'); }}
                        >
                            Làm Mới
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Content List */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : leads.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
                    <Typography sx={{ color: '#64748b' }}>
                        Chưa có dữ liệu Lead nào phù hợp.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {leads.map(lead => {
                        const st = LEAD_STATUS[lead.trangThai] || LEAD_STATUS.MOI;
                        return (
                            <Grid item xs={12} md={6} lg={4} key={lead._id}>
                                <Card sx={{ 
                                    borderRadius: 3, 
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                    border: '1px solid #e2e8f0',
                                    transition: 'all 0.2s',
                                    '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.1)' }
                                }}>
                                    <CardContent>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                    {lead.hoTen}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    Mã: <strong>{lead.maLead}</strong> • Nguồn: <Chip label={lead.nguonLead} size="small" sx={{ height: 20, fontSize: 10 }} />
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={st.label} 
                                                size="small"
                                                sx={{ bgcolor: st.bg, color: st.color, fontWeight: 600 }}
                                            />
                                        </Stack>

                                        <Stack spacing={0.7} sx={{ my: 1.5 }}>
                                            {lead.soDienThoai && (
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#334155' }}>
                                                    <PhoneIcon fontSize="small" sx={{ color: '#0284c7' }} />
                                                    <strong>{lead.soDienThoai}</strong>
                                                </Typography>
                                            )}
                                            {lead.facebookName && (
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#334155' }}>
                                                    <FacebookIcon fontSize="small" sx={{ color: '#1877f2' }} />
                                                    {lead.facebookName}
                                                </Typography>
                                            )}
                                            {lead.goiQuanTam && (
                                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                    Gói hỏi: <strong>{lead.goiQuanTam}</strong>
                                                </Typography>
                                            )}
                                            {lead.nganSachDuKien > 0 && (
                                                <Typography variant="body2" sx={{ color: '#e11d48', fontWeight: 600 }}>
                                                    Ngân sách: {lead.nganSachDuKien.toLocaleString('vi-VN')} đ
                                                </Typography>
                                            )}
                                        </Stack>

                                        <Divider sx={{ my: 1.5 }} />

                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Button 
                                                size="small" 
                                                startIcon={<ChatIcon />}
                                                onClick={() => { setSelectedLead(lead); setUpdatingStatus(lead.trangThai); }}
                                                sx={{ color: '#2563eb' }}
                                            >
                                                Tư Vấn ({lead.lichSuTuVan?.length || 0})
                                            </Button>

                                            {lead.trangThai !== 'DA_CHOT' ? (
                                                <Button 
                                                    size="small" 
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<HowToRegIcon />}
                                                    onClick={() => handleConvertToContract(lead)}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Chốt Cọc HĐ
                                                </Button>
                                            ) : (
                                                <Chip 
                                                    label={`HĐ: ${lead.maHopDongChuyenDoi || 'Đã tạo'}`} 
                                                    color="success" 
                                                    size="small" 
                                                    variant="outlined" 
                                                />
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Dialog Chi Tiết Tư Vấn Lead */}
            <Dialog open={Boolean(selectedLead)} onClose={() => setSelectedLead(null)} maxWidth="sm" fullWidth>
                {selectedLead && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Lịch Sử Tư Vấn: {selectedLead.hoTen}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    {selectedLead.soDienThoai} • Mã: {selectedLead.maLead}
                                </Typography>
                            </Box>
                            <IconButton onClick={() => setSelectedLead(null)} size="small">
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                            {/* Trạng thái hiện tại */}
                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Cập nhật trạng thái</InputLabel>
                                    <Select
                                        value={updatingStatus}
                                        label="Cập nhật trạng thái"
                                        onChange={(e) => setUpdatingStatus(e.target.value)}
                                    >
                                        {Object.entries(LEAD_STATUS).map(([k, v]) => (
                                            <MenuItem key={k} value={k}>{v.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            {/* Timeline Lịch sử tư vấn */}
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                Tiến trình trao đổi:
                            </Typography>
                            <Box sx={{ maxHeight: 260, overflowY: 'auto', p: 1, bgcolor: '#f8fafc', borderRadius: 2, mb: 2 }}>
                                {(selectedLead.lichSuTuVan || []).length === 0 ? (
                                    <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 2 }}>
                                        Chưa có nhật ký trao đổi nào.
                                    </Typography>
                                ) : (
                                    (selectedLead.lichSuTuVan || []).map((log, idx) => (
                                        <Box key={idx} sx={{ p: 1.5, mb: 1, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                            <Typography variant="body2" sx={{ color: '#1e293b' }}>
                                                {log.noiDung}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                                                Bởi <strong>{log.nguoiGhi}</strong> • {new Date(log.thoiGian).toLocaleString('vi-VN')}
                                            </Typography>
                                        </Box>
                                    ))
                                )}
                            </Box>

                            {/* Input thêm nhật ký mới */}
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Nhập nội dung trao đổi, lịch hẹn thử váy, yêu cầu báo giá..."
                                value={consultationText}
                                onChange={(e) => setConsultationText(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                            {selectedLead.trangThai !== 'DA_CHOT' && (
                                <Button 
                                    color="success" 
                                    variant="outlined"
                                    startIcon={<HowToRegIcon />}
                                    onClick={() => handleConvertToContract(selectedLead)}
                                >
                                    Chốt Thành Hợp Đồng
                                </Button>
                            )}
                            <Button 
                                variant="contained" 
                                endIcon={<SendIcon />}
                                onClick={handleAddConsultationNote}
                                sx={{ bgcolor: '#0284c7' }}
                            >
                                Lưu Ghi Chú
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Dialog Thêm Lead Thủ Công */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Thêm Lead Khách Hàng Tiềm Năng</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Họ tên khách hàng *"
                            value={newLeadData.hoTen}
                            onChange={(e) => setNewLeadData(prev => ({ ...prev, hoTen: e.target.value }))}
                        />
                        <TextField
                            fullWidth
                            label="Số điện thoại"
                            value={newLeadData.soDienThoai}
                            onChange={(e) => setNewLeadData(prev => ({ ...prev, soDienThoai: e.target.value }))}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Tên Facebook / Link Zalo"
                                    value={newLeadData.facebookName}
                                    onChange={(e) => setNewLeadData(prev => ({ ...prev, facebookName: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Nguồn Lead</InputLabel>
                                    <Select
                                        value={newLeadData.nguonLead}
                                        label="Nguồn Lead"
                                        onChange={(e) => setNewLeadData(prev => ({ ...prev, nguonLead: e.target.value }))}
                                    >
                                        <MenuItem value="MESSENGER">Facebook Messenger</MenuItem>
                                        <MenuItem value="ZALO">Zalo</MenuItem>
                                        <MenuItem value="WEBSITE">Website</MenuItem>
                                        <MenuItem value="TRUC_TIEP">Khách ghé trực tiếp</MenuItem>
                                        <MenuItem value="GIOI_THIEU">Khách cũ giới thiệu</MenuItem>
                                        <MenuItem value="TIKTOK">TikTok</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <TextField
                            fullWidth
                            label="Gói dịch vụ quan tâm (VD: Trọn gói cưới Luxury, Pre-wedding Đà Lạt...)"
                            value={newLeadData.goiQuanTam}
                            onChange={(e) => setNewLeadData(prev => ({ ...prev, goiQuanTam: e.target.value }))}
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label="Ngân sách dự kiến (VNĐ)"
                            value={newLeadData.nganSachDuKien}
                            onChange={(e) => setNewLeadData(prev => ({ ...prev, nganSachDuKien: Number(e.target.value) }))}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Ghi chú thêm"
                            value={newLeadData.ghiChu}
                            onChange={(e) => setNewLeadData(prev => ({ ...prev, ghiChu: e.target.value }))}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setOpenAddDialog(false)}>Hủy</Button>
                    <Button variant="contained" onClick={handleCreateLead} sx={{ bgcolor: '#0284c7' }}>
                        Lưu Lead
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
