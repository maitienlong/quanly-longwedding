import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Box,
    Typography,
    Button,
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    IconButton
} from '@mui/material';
import { getFirstAllowedPath } from '../utils/permissionHelper';

function AccessDenied({ 
    featureName = "Chức năng hệ thống", 
    featureIcon = "fa-solid fa-lock", 
    permissionKey = "", 
    currentUser = null 
}) {
    const navigate = useNavigate();
    const [openContactModal, setOpenContactModal] = useState(false);

    // Kích hoạt thông báo toast ngay khi trang bị chặn hiển thị
    useEffect(() => {
        toast.error(`Bạn không có quyền truy cập vào "${featureName}". Vui lòng liên hệ Quản trị viên để được cấp phép!`, {
            id: `access-denied-${permissionKey || 'feature'}`,
            duration: 6000
        });
    }, [featureName, permissionKey]);

    const allowedPath = getFirstAllowedPath(currentUser);
    const userName = currentUser?.fullname || currentUser?.hoTen || currentUser?.username || 'Thành viên';
    const userRole = currentUser?.positon || currentUser?.chucVu || currentUser?.role || 'Nhân viên';
    const userAccount = currentUser?.username || 'chưa xác định';

    const handleCopyAdminContact = (text, label) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            toast.success(`Đã sao chép ${label}: ${text}`);
        }
    };

    return (
        <Box 
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 140px)',
                p: { xs: 2, sm: 3 },
                bgcolor: 'transparent'
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    maxWidth: 620,
                    width: '100%',
                    borderRadius: '24px',
                    p: { xs: 3, sm: 4.5 },
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1.5px solid #fecaca',
                    boxShadow: '0 20px 40px -15px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(239, 68, 68, 0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative glowing background accent */}
                <Box 
                    sx={{
                        position: 'absolute',
                        top: -80,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 220,
                        height: 220,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0) 70%)',
                        pointerEvents: 'none'
                    }}
                />

                {/* 403 Badge & Shield Icon */}
                <Box mb={2.5} sx={{ position: 'relative', display: 'inline-block' }}>
                    <Box
                        sx={{
                            width: 88,
                            height: 88,
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                            border: '2px solid #fca5a5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        <i 
                            className="fa-solid fa-shield-halved" 
                            style={{ fontSize: '2.5rem', color: '#dc2626' }}
                        ></i>
                    </Box>
                    <Box 
                        sx={{
                            position: 'absolute',
                            bottom: -6,
                            right: -6,
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: '#ef4444',
                            border: '3px solid #ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '0.85rem'
                        }}
                    >
                        <i className="fa-solid fa-lock"></i>
                    </Box>
                </Box>

                {/* Status Code */}
                <Box mb={1}>
                    <Chip 
                        label="403 • TRUY CẬP BỊ TỪ CHỐI" 
                        size="small" 
                        sx={{ 
                            bgcolor: '#fee2e2', 
                            color: '#b91c1c', 
                            fontWeight: 800, 
                            fontSize: '0.72rem',
                            letterSpacing: '0.5px'
                        }} 
                    />
                </Box>

                {/* Title */}
                <Typography 
                    variant="h5" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 900, 
                        color: '#0f172a', 
                        letterSpacing: '-0.5px',
                        fontSize: { xs: '1.35rem', sm: '1.65rem' },
                        mb: 1.5
                    }}
                >
                    Không Được Phép Truy Cập
                </Typography>

                {/* Primary Message */}
                <Typography 
                    variant="body1" 
                    sx={{ 
                        color: '#475569', 
                        fontSize: { xs: '0.92rem', sm: '1rem' }, 
                        lineHeight: 1.6,
                        mb: 3
                    }}
                >
                    Tài khoản của bạn <strong>không có quyền truy cập</strong> vào chức năng{' '}
                    <span style={{ color: '#dc2626', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        « {featureName} »
                    </span>.
                    <br />
                    Vui lòng <strong>liên hệ đến Quản trị viên</strong> để được xem xét và cấp phép.
                </Typography>

                {/* Account & Feature Summary Box */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 3.5,
                        borderRadius: '16px',
                        bgcolor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        textAlign: 'left'
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center" pb={1} mb={1} borderBottom="1px dashed #e2e8f0">
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                            Chức năng yêu cầu:
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <i className={featureIcon} style={{ color: '#dc2626', fontSize: '0.85rem' }}></i>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                {featureName}
                            </Typography>
                        </Box>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center" pb={1} mb={1} borderBottom="1px dashed #e2e8f0">
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                            Tài khoản hiện tại:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {userName} <span style={{ color: '#64748b', fontWeight: 500 }}>({userAccount})</span>
                        </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                            Chức vụ / Quyền hạn:
                        </Typography>
                        <Chip 
                            label={userRole} 
                            size="small" 
                            sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.72rem' }} 
                        />
                    </Box>
                </Paper>

                {/* Action Buttons */}
                <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={1.5} 
                    justifyContent="center"
                >
                    <Button
                        variant="contained"
                        onClick={() => navigate(allowedPath, { replace: true })}
                        startIcon={<i className="fa-solid fa-arrow-left"></i>}
                        sx={{
                            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            color: '#ffffff',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: '12px',
                            px: 3,
                            py: 1.2,
                            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)'
                            }
                        }}
                    >
                        Về trang tính năng của bạn
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => setOpenContactModal(true)}
                        startIcon={<i className="fa-solid fa-headset"></i>}
                        sx={{
                            color: '#0f172a',
                            borderColor: '#cbd5e1',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: '12px',
                            px: 2.5,
                            py: 1.2,
                            '&:hover': {
                                borderColor: '#94a3b8',
                                bgcolor: '#f8fafc'
                            }
                        }}
                    >
                        Liên hệ Quản trị viên
                    </Button>
                </Stack>
            </Paper>

            {/* Modal Thông tin liên hệ Quản trị viên */}
            <Dialog
                open={openContactModal}
                onClose={() => setOpenContactModal(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <i className="fa-solid fa-headset" style={{ color: '#0284c7' }}></i>
                        Thông Tin Quản Trị Viên
                    </Box>
                    <IconButton size="small" onClick={() => setOpenContactModal(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                        Để được cấp quyền sử dụng chức năng <strong>«{featureName}»</strong>, vui lòng liên hệ trực tiếp với người quản trị hệ thống:
                    </Typography>

                    <Stack spacing={1.5}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.8,
                                borderRadius: '12px',
                                bgcolor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Box>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>
                                    Quản trị viên Studio:
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                    Mai Tiến Long (@along)
                                </Typography>
                            </Box>
                            <Chip label="Admin" size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800 }} />
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.8,
                                borderRadius: '12px',
                                bgcolor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Box>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>
                                    Hotline / Zalo:
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284c7' }}>
                                    0862 190 802
                                </Typography>
                            </Box>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleCopyAdminContact('0862190802', 'Số điện thoại')}
                                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                            >
                                Sao chép
                            </Button>
                        </Paper>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 1 }}>
                    <Button 
                        fullWidth 
                        variant="contained" 
                        onClick={() => setOpenContactModal(false)}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}
                    >
                        Đã hiểu
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AccessDenied;

