const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/UI/MainV2.js');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Update React import to include useMemo
content = content.replace(
    'import React, { useState, useEffect, Suspense, lazy } from "react";',
    'import React, { useState, useEffect, Suspense, lazy, useMemo } from "react";'
);

// 2. Add salary helper and getDichVuChinhLabel imports
if (!content.includes('calculateUserSalaryBreakdown')) {
    const importSalary = `import { updateContractTypesCache, getDichVuChinhLabel } from "../utils/contractTypesHelper";
import {
    formatMoney,
    formatShortMoney,
    isContractAssignedToUser,
    calculateUserSalaryBreakdown
} from "../utils/salaryHelper";`;
    content = content.replace(
        'import { updateContractTypesCache } from "../utils/contractTypesHelper";',
        importSalary
    );
}

// 3. Update Material UI imports
const oldMuiImport = `import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    Box,
    Stack,
    Avatar,
    Chip,
    Paper,
    Grid,
    Tooltip
} from '@mui/material';`;

const newMuiImport = `import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    Box,
    Stack,
    Avatar,
    Chip,
    Paper,
    Grid,
    Tooltip,
    Tabs,
    Tab,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    CircularProgress
} from '@mui/material';`;

if (content.includes(oldMuiImport)) {
    content = content.replace(oldMuiImport, newMuiImport);
}

// 4. Add states for salary & contracts
const oldStateAnchor = `    const [userStats, setUserStats] = useState(null);
    const [userProfileData, setUserProfileData] = useState(null);`;

const newStateAnchor = `    const [userStats, setUserStats] = useState(null);
    const [userProfileData, setUserProfileData] = useState(null);
    const [profileTab, setProfileTab] = useState(0);
    const [myMonthContracts, setMyMonthContracts] = useState([]);
    const [isLoadingSalaryData, setIsLoadingSalaryData] = useState(false);`;

if (content.includes(oldStateAnchor) && !content.includes('const [profileTab, setProfileTab]')) {
    content = content.replace(oldStateAnchor, newStateAnchor);
}

// 5. Update useEffect for showDialog
const oldDialogEffect = `    useEffect(() => {
        if (showDialog && user) {
            // Lấy chỉ tiêu thi đua & KPI
            otherService.getThiDuaStats({ timeRange: 'month' })
                .then(res => {
                    const allStats = res.data?.data?.stats || res.data?.stats || [];
                    if (Array.isArray(allStats)) {
                        const myStat = allStats.find(s => 
                            (s.username && s.username.toLowerCase() === user?.username?.toLowerCase()) ||
                            (s.fullname && (user?.fullname || user?.hoTen) && s.fullname.toLowerCase() === (user?.fullname || user?.hoTen).toLowerCase())
                        );
                        if (myStat) setUserStats(myStat);
                    }
                })
                .catch(err => console.error("Lỗi lấy chỉ tiêu thi đua cá nhân:", err));
        }
    }, [showDialog, user]);`;

const newDialogEffect = `    useEffect(() => {
        if (showDialog && user) {
            setIsLoadingSalaryData(true);
            // 1. Lấy chỉ tiêu thi đua & KPI tháng
            const p1 = otherService.getThiDuaStats({ timeRange: 'month' })
                .then(res => {
                    const allStats = res.data?.data?.stats || res.data?.stats || [];
                    if (Array.isArray(allStats)) {
                        const myStat = allStats.find(s => 
                            (s.username && s.username.toLowerCase() === user?.username?.toLowerCase()) ||
                            (s.fullname && (user?.fullname || user?.hoTen) && s.fullname.toLowerCase() === (user?.fullname || user?.hoTen).toLowerCase())
                        );
                        if (myStat) setUserStats(myStat);
                    }
                })
                .catch(err => console.error("Lỗi lấy chỉ tiêu thi đua cá nhân:", err));

            // 2. Lấy danh sách hợp đồng tháng này để tính toán chi tiết hợp đồng và hoa hồng
            const p2 = otherService.LIST_HOPDONG({ filter: 'tháng này' })
                .then(res => {
                    const list = res.data?.hopDong || [];
                    if (Array.isArray(list)) {
                        const targetUser = userProfileData || user;
                        const matched = list.filter(hd => isContractAssignedToUser(hd, targetUser));
                        setMyMonthContracts(matched);
                    }
                })
                .catch(err => {
                    console.error("Lỗi lấy hợp đồng tháng:", err);
                    return otherService.LIST_HOPDONG({})
                        .then(res => {
                            const list = res.data?.hopDong || [];
                            const targetUser = userProfileData || user;
                            const matched = list.filter(hd => isContractAssignedToUser(hd, targetUser));
                            setMyMonthContracts(matched);
                        })
                        .catch(() => {});
                });

            Promise.allSettled([p1, p2]).finally(() => {
                setIsLoadingSalaryData(false);
            });
        }
    }, [showDialog, user, userProfileData]);`;

if (content.includes(oldDialogEffect)) {
    content = content.replace(oldDialogEffect, newDialogEffect);
}

// 6. Add salaryBreakdown useMemo before effectiveUser / isAdmin
const oldEffectiveUserAnchor = `    const effectiveUser = {
        ...(user || {}),
        ...(userProfileData || {})
    };`;

const newEffectiveUserAnchor = `    const salaryBreakdown = useMemo(() => {
        return calculateUserSalaryBreakdown(userProfileData || user, userStats, myMonthContracts);
    }, [userProfileData, user, userStats, myMonthContracts]);

    const effectiveUser = {
        ...(user || {}),
        ...(userProfileData || {})
    };`;

if (content.includes(oldEffectiveUserAnchor) && !content.includes('const salaryBreakdown = useMemo(')) {
    content = content.replace(oldEffectiveUserAnchor, newEffectiveUserAnchor);
}

// 7. Replace the entire Profile Dialog
const startMarker = '{/* Dialog Thông Tin Tài Khoản, Chỉ Tiêu & Thành Tích Cá Nhân */}';
const endMarker = '{/* Dialog Tiện ích Lịch, Ngày đẹp & Giờ Server */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newDialogCode = `{/* Dialog Thông Tin Tài Khoản, Lương Thưởng, Bảng Lương & Chỉ Tiêu KPI */}
            <Dialog
                open={showDialog}
                onClose={() => setShowDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: 20,
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }
                }}
            >
                {/* Header Banner */}
                <Box sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', p: { xs: 2, sm: 2.5 }, color: '#fff', position: 'relative' }}>
                    <IconButton
                        size="small"
                        onClick={() => setShowDialog(false)}
                        sx={{ position: 'absolute', top: 12, right: 12, color: '#94a3b8', '&:hover': { color: '#fff' } }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                                src={user?.avatar || ''}
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: '#0284c7',
                                    fontSize: '1.6rem',
                                    fontWeight: 800,
                                    boxShadow: '0 4px 14px rgba(2,132,199,0.4)',
                                    border: '3px solid #38bdf8'
                                }}
                            >
                                {(userNameDisplay || 'U').charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                                    {userNameDisplay}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" mt={0.6} flexWrap="wrap">
                                    <Chip
                                        label={userRoleDisplay}
                                        size="small"
                                        sx={{ bgcolor: '#0284c7', color: '#fff', fontWeight: 700, height: 22, fontSize: '0.75rem' }}
                                    />
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                        @{user?.username || 'user'}
                                    </Typography>
                                    {userStats?.rank && (
                                        <Chip
                                            label={\`\${userStats.medal || '🏅'} Hạng \${userStats.rank}\`}
                                            size="small"
                                            sx={{ bgcolor: 'rgba(234,179,8,0.2)', color: '#fde047', fontWeight: 800, height: 22, fontSize: '0.72rem', border: '1px solid rgba(234,179,8,0.4)' }}
                                        />
                                    )}
                                </Stack>
                            </Box>
                        </Stack>

                        {/* Tổng thu nhập tháng tóm tắt góc phải header */}
                        <Box sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '12px',
                            px: 2,
                            py: 1,
                            textAlign: 'right',
                            display: { xs: 'none', sm: 'block' }
                        }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 600 }}>
                                THU NHẬP THÁNG {new Date().getMonth() + 1}/{new Date().getFullYear()}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#38bdf8', fontWeight: 800, letterSpacing: '-0.3px' }}>
                                {formatMoney(salaryBreakdown.tongThuNhap)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Navigation Tabs */}
                    <Box sx={{ mt: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <Tabs
                            value={profileTab}
                            onChange={(e, val) => setProfileTab(val)}
                            textColor="inherit"
                            indicatorColor="primary"
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                minHeight: 40,
                                '& .MuiTab-root': {
                                    minHeight: 40,
                                    py: 1,
                                    px: 2,
                                    color: '#94a3b8',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    textTransform: 'none',
                                    '&.Mui-selected': {
                                        color: '#38bdf8'
                                    }
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#38bdf8',
                                    height: 3,
                                    borderRadius: '3px 3px 0 0'
                                }
                            }}
                        >
                            <Tab label={<span>💵 Bảng Lương & Thu Nhập</span>} />
                            <Tab label={<span>🎯 Chỉ Tiêu & Tiến Độ KPI</span>} />
                            <Tab label={<span>📋 Hợp Đồng Trong Tháng ({salaryBreakdown.contractDetails.length})</span>} />
                            <Tab label={<span>👤 Thông Tin & Danh Hiệu</span>} />
                        </Tabs>
                    </Box>
                </Box>

                <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f8fafc', minHeight: 420 }}>
                    {isLoadingSalaryData ? (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} gap={2}>
                            <CircularProgress size={36} sx={{ color: '#0284c7' }} />
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                                Đang đồng bộ bảng lương, hoa hồng & chỉ tiêu KPI...
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* TAB 0: BẢNG LƯƠNG & THU NHẬP */}
                            {profileTab === 0 && (
                                <Stack spacing={2.5}>
                                    {/* Card Tổng Thu Nhập Nổi Bật */}
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                        color: '#fff',
                                        p: 2.5,
                                        borderRadius: '16px',
                                        border: '1px solid #334155',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#fde047', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    💰 Tổng thu nhập ước tính tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffffff', my: 0.5 }}>
                                                    {formatMoney(salaryBreakdown.tongThuNhap)}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                                    = Lương cứng ({formatShortMoney(salaryBreakdown.luongCoBan)}) + Hoa hồng ({formatShortMoney(salaryBreakdown.hoaHongTotal)}) + Thưởng ({formatShortMoney(salaryBreakdown.bonusEst)})
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={\`\${salaryBreakdown.workCount} Hợp đồng\`}
                                                sx={{ bgcolor: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontWeight: 800, border: '1px solid rgba(56,189,248,0.3)', px: 1 }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* 3 Cards Nguồn Thu Nhập */}
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#f0fdf4', borderColor: '#bbf7d0', height: '100%' }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                    <span style={{ fontSize: '1.2rem' }}>🏢</span>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>Lương cơ bản</Typography>
                                                </Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
                                                    {formatMoney(salaryBreakdown.luongCoBan)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#166534', display: 'block', mt: 0.5 }}>
                                                    Lương cứng cố định hàng tháng
                                                </Typography>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#eff6ff', borderColor: '#bfdbfe', height: '100%' }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                    <span style={{ fontSize: '1.2rem' }}>💎</span>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af' }}>Hoa hồng thực nhận</Typography>
                                                </Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
                                                    {formatMoney(salaryBreakdown.hoaHongTotal)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#1e40af', display: 'block', mt: 0.5 }}>
                                                    Từ {salaryBreakdown.workCount} hợp đồng đã phục vụ
                                                </Typography>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#fffbeb', borderColor: '#fde68a', height: '100%' }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                    <span style={{ fontSize: '1.2rem' }}>🎁</span>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e' }}>Thưởng KPI / Vượt mốc</Typography>
                                                </Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#b45309' }}>
                                                    {formatMoney(salaryBreakdown.bonusEst)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#92400e', display: 'block', mt: 0.5 }}>
                                                    {salaryBreakdown.isExceeded ? \`Vượt \${salaryBreakdown.exceededCount} hợp đồng\` : (salaryBreakdown.percentCompletion >= 100 ? 'Đạt chuẩn 100% KPI' : 'Theo mốc thi đua studio')}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    {/* Bảng kê chi tiết cơ cấu BẢNG LƯƠNG */}
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <span>📊</span> BẢNG KÊ THỰC LĨNH LƯƠNG THÁNG {new Date().getMonth() + 1}/{new Date().getFullYear()}
                                        </Typography>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ '& th': { fontWeight: 800, bgcolor: '#f1f5f9', color: '#475569', py: 1 } }}>
                                                    <TableCell>Khoản mục thu nhập</TableCell>
                                                    <TableCell>Diễn giải / Cơ sở tính</TableCell>
                                                    <TableCell align="right">Mức hưởng (VNĐ)</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow hover>
                                                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                        🏢 1. Lương cơ bản (Lương cứng)
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#64748b' }}>
                                                        Mức lương cố định được ký kết theo chức danh {userRoleDisplay}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#15803d' }}>
                                                        {formatMoney(salaryBreakdown.luongCoBan)}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow hover>
                                                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                        💎 2. Hoa hồng hợp đồng
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#64748b' }}>
                                                        Tích lũy từ doanh số {formatMoney(salaryBreakdown.tongDoanhSo)} qua {salaryBreakdown.workCount} hợp đồng
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
                                                        {formatMoney(salaryBreakdown.hoaHongTotal)}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow hover>
                                                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                        🎁 3. Thưởng KPI & Thi đua
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#64748b' }}>
                                                        Thưởng mốc thi đua studio & vượt chỉ tiêu tháng ({salaryBreakdown.percentCompletion}%)
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#b45309' }}>
                                                        {formatMoney(salaryBreakdown.bonusEst)}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow sx={{ bgcolor: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
                                                    <TableCell sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                                                        🎯 TỔNG THỰC LĨNH DỰ KIẾN
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>
                                                        Lương cứng + Hoa hồng + Thưởng mốc
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#0284c7', fontSize: '1.1rem' }}>
                                                        {formatMoney(salaryBreakdown.tongThuNhap)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </Paper>

                                    {/* Chính sách hoa hồng cá nhân nếu có */}
                                    {Array.isArray(userProfileData?.hoaHongTheoLoaiHD) && userProfileData.hoaHongTheoLoaiHD.length > 0 && (
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc' }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.2}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <span>📜</span> CHÍNH SÁCH HOA HỒNG ÁP DỤNG RIÊNG CHO BẠN
                                                </Typography>
                                                <Button size="small" onClick={() => setProfileTab(2)} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}>
                                                    Xem hợp đồng tháng ➔
                                                </Button>
                                            </Box>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#e2e8f0', py: 0.8 } }}>
                                                        <TableCell>Loại hợp đồng</TableCell>
                                                        <TableCell align="right">Mức hoa hồng được hưởng</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {userProfileData.hoaHongTheoLoaiHD.map((r, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell sx={{ py: 0.8 }}>{getDichVuChinhLabel(r.loaiHopDongId)}</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#0284c7', py: 0.8 }}>
                                                                {Number(r.loaiHoaHong) === 1 ? \`\${r.mucHoaHong}% Doanh số\` : \`\${formatMoney(r.mucHoaHong)} / HĐ\`}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Paper>
                                    )}
                                </Stack>
                            )}

                            {/* TAB 1: CHỈ TIÊU & TIẾN ĐỘ KPI */}
                            {profileTab === 1 && (
                                <Stack spacing={2.5}>
                                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                🎯 CHỈ TIÊU HỢP ĐỒNG THÁNG {new Date().getMonth() + 1}/{new Date().getFullYear()}
                                            </Typography>
                                            {userStats?.rank && (
                                                <Chip 
                                                    label={\`\${userStats.medal || '🏅'} Hạng \${userStats.rank} toàn Studio\`} 
                                                    size="small" 
                                                    sx={{ bgcolor: userStats.rank === 1 ? '#fef3c7' : userStats.rank === 2 ? '#f1f5f9' : '#fef9c3', color: userStats.rank === 1 ? '#d97706' : '#334155', fontWeight: 800 }} 
                                                />
                                            )}
                                        </Box>
                                        
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600 }}>
                                                Tiến độ thực hiện: <strong style={{ color: '#0284c7', fontSize: '1.2rem' }}>{salaryBreakdown.workCount}</strong> / {salaryBreakdown.chiTieuThang} hợp đồng
                                            </Typography>
                                            <Chip 
                                                label={\`\${salaryBreakdown.percentCompletion}% Target\`} 
                                                size="medium" 
                                                sx={{ 
                                                    bgcolor: salaryBreakdown.percentCompletion >= 100 ? '#dcfce7' : salaryBreakdown.percentCompletion >= 50 ? '#fef3c7' : '#fee2e2', 
                                                    color: salaryBreakdown.percentCompletion >= 100 ? '#15803d' : salaryBreakdown.percentCompletion >= 50 ? '#b45309' : '#b91c1c', 
                                                    fontWeight: 800,
                                                    fontSize: '0.85rem'
                                                }} 
                                            />
                                        </Box>

                                        {/* Progress bar */}
                                        <Box sx={{ width: '100%', height: 14, bgcolor: '#e2e8f0', borderRadius: 7, overflow: 'hidden', mb: 2.5 }}>
                                            <Box
                                                sx={{
                                                    width: \`\${Math.min(100, salaryBreakdown.percentCompletion)}%\`,
                                                    height: '100%',
                                                    borderRadius: 7,
                                                    background: salaryBreakdown.percentCompletion >= 100 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                                                    transition: 'width 0.4s ease-in-out'
                                                }}
                                            />
                                        </Box>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                                                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600, display: 'block' }}>🔥 Vượt chỉ tiêu</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
                                                        {salaryBreakdown.isExceeded ? \`+\${salaryBreakdown.exceededCount} HĐ\` : '0 HĐ'}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                                                    <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 600, display: 'block' }}>💼 Doanh số phụ trách</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
                                                        {formatMoney(salaryBreakdown.tongDoanhSo)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ p: 1.5, bgcolor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', textAlign: 'center' }}>
                                                    <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 600, display: 'block' }}>💰 Thưởng & Hoa hồng</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#b45309' }}>
                                                        {formatMoney(salaryBreakdown.hoaHongTotal + salaryBreakdown.bonusEst)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>

                                    {/* Khối cơ chế thi đua & thưởng mốc */}
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <span>🏆</span> QUY CHUẨN THƯỞNG THI ĐUA & KPI STUDIO
                                        </Typography>
                                        <Grid container spacing={1.5}>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ p: 1.2, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#16a34a', display: 'block' }}>⭐ Đạt 100% KPI</Typography>
                                                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>Đạt chỉ tiêu tháng được thưởng nóng và ghi nhận danh hiệu</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ p: 1.2, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#2563eb', display: 'block' }}>🚀 Đạt 120% KPI</Typography>
                                                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>Thưởng thêm 10% hoa hồng tích lũy</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ p: 1.2, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#d97706', display: 'block' }}>🔥 Đạt 150% KPI</Typography>
                                                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>Thưởng thêm 15% hoa hồng + Danh hiệu Chiến Binh Bứt Phá</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Stack>
                            )}

                            {/* TAB 2: HỢP ĐỒNG TRONG THÁNG */}
                            {profileTab === 2 && (
                                <Stack spacing={2}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                            📋 DANH SÁCH HỢP ĐỒNG BẠN PHỤ TRÁCH ({salaryBreakdown.contractDetails.length})
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                            Tổng doanh số: <strong>{formatMoney(salaryBreakdown.tongDoanhSo)}</strong> | Hoa hồng: <strong style={{ color: '#0284c7' }}>{formatMoney(salaryBreakdown.hoaHongTotal)}</strong>
                                        </Typography>
                                    </Box>

                                    {salaryBreakdown.contractDetails.length === 0 ? (
                                        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#ffffff', borderRadius: '12px' }}>
                                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                                Chưa có dữ liệu hợp đồng phân công cho bạn trong tháng này.
                                            </Typography>
                                        </Paper>
                                    ) : (
                                        <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden', bgcolor: '#ffffff' }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ '& th': { fontWeight: 800, bgcolor: '#f1f5f9', color: '#475569', py: 1 } }}>
                                                        <TableCell align="center" style={{ width: 45 }}>STT</TableCell>
                                                        <TableCell>Mã HĐ</TableCell>
                                                        <TableCell>Khách hàng</TableCell>
                                                        <TableCell>Vai trò</TableCell>
                                                        <TableCell align="right">Giá trị HĐ</TableCell>
                                                        <TableCell align="right">Hoa hồng</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {salaryBreakdown.contractDetails.map((item, idx) => (
                                                        <TableRow key={item.contract?._id || idx} hover>
                                                            <TableCell align="center" sx={{ color: '#64748b', fontWeight: 600 }}>{idx + 1}</TableCell>
                                                            <TableCell sx={{ fontWeight: 700, color: '#0284c7' }}>
                                                                {item.contract?.maHopDong}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                                                    {item.contract?.khachHang1?.tenKhachHang || item.contract?.hoTen || 'Khách hàng'}
                                                                </div>
                                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                                    {item.contract?.khachHang1?.soDienThoai || ''}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                                    {item.roles.map((r, rIdx) => (
                                                                        <Chip key={rIdx} label={r} size="small" sx={{ fontSize: '0.7rem', height: 20, bgcolor: '#f1f5f9', color: '#334155' }} />
                                                                    ))}
                                                                </Stack>
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                {formatMoney(item.value)}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <div style={{ fontWeight: 800, color: item.commission > 0 ? '#15803d' : '#64748b' }}>
                                                                    {formatMoney(item.commission)}
                                                                </div>
                                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                                    {item.ruleLabel}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow sx={{ bgcolor: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                                                        <TableCell colSpan={4} sx={{ fontWeight: 800, color: '#0f172a' }}>
                                                            TỔNG CỘNG ({salaryBreakdown.contractDetails.length} hợp đồng)
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 800, color: '#334155' }}>
                                                            {formatMoney(salaryBreakdown.tongDoanhSo)}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 800, color: '#15803d', fontSize: '0.95rem' }}>
                                                            {formatMoney(salaryBreakdown.hoaHongTotal)}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </Paper>
                                    )}
                                </Stack>
                            )}

                            {/* TAB 3: THÔNG TIN & DANH HIỆU */}
                            {profileTab === 3 && (
                                <Stack spacing={2.5}>
                                    {/* Thông tin tài khoản */}
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#ffffff' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            👤 THÔNG TIN TÀI KHOẢN
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Họ và tên</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{userNameDisplay}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Chức vụ</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0284c7' }}>{userRoleDisplay}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Tên đăng nhập</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>{user?.username || '-'}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Số điện thoại</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>{userPhoneDisplay}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>

                                    {/* Thành tích & Danh hiệu được Admin trao tặng */}
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#ffffff' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            🏆 THÀNH TÍCH & DANH HIỆU
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                            {getEmployeeAwards(user?.username, user).map((badge, idx) => (
                                                <Chip 
                                                    key={idx} 
                                                    label={badge} 
                                                    sx={{ 
                                                        fontWeight: 700, 
                                                        bgcolor: '#fffbeb', 
                                                        color: '#b45309', 
                                                        border: '1px solid #fde68a' 
                                                    }} 
                                                />
                                            ))}
                                            {salaryBreakdown.percentCompletion >= 100 && (
                                                <Chip label="⭐ Đạt Chỉ Tiêu KPI" variant="outlined" color="success" sx={{ fontWeight: 700, bgcolor: '#fff' }} />
                                            )}
                                            {salaryBreakdown.isExceeded && (
                                                <Chip label="🔥 Chiến Binh Bứt Phá" variant="outlined" color="error" sx={{ fontWeight: 700, bgcolor: '#fff' }} />
                                            )}
                                            {userStats?.rank === 1 && (
                                                <Chip label="👑 Quán Quân Tháng" variant="outlined" sx={{ fontWeight: 800, bgcolor: '#fef3c7', color: '#d97706', borderColor: '#fbbf24' }} />
                                            )}
                                        </Stack>
                                    </Paper>
                                </Stack>
                            )}
                        </>
                    )}
                </DialogContent>

                <DialogActions style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => setShowDialog(false)}
                        style={{ borderRadius: 10, color: '#64748b', borderColor: '#cbd5e1', fontWeight: 600 }}
                    >
                        Đóng cửa sổ
                    </Button>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setShowDialog(false);
                                handleTriggerLock();
                            }}
                            style={{ borderRadius: 10, fontWeight: 700, padding: '8px 16px', backgroundColor: '#f59e0b', color: '#fff' }}
                        >
                            <i className="fa-solid fa-lock" style={{ marginRight: 6 }}></i> Khóa PIN
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleLogout}
                            style={{ borderRadius: 10, fontWeight: 700, padding: '8px 20px', backgroundColor: '#ef4444' }}
                        >
                            Đăng xuất
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>

            `;

    content = content.slice(0, startIndex) + newDialogCode + content.slice(endIndex);
} else {
    console.error('Could not find start or end markers for Dialog');
    process.exit(1);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully updated MainV2.js with full salary, commission, and KPI dialog!');

