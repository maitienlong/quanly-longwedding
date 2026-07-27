import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Chip,
    Card,
    CardContent,
    Typography,
    Stack,
    IconButton,
    Alert,
    Tabs,
    Tab
} from '@mui/material';
import { toast } from 'sonner';
import {
    getWeddingDatesInMonth,
    checkKimLau,
    getCanChiByYear,
    generateConsultingText
} from '../utils/weddingDateUtils';

export default function WeddingDateLookupModal({ open, onClose, initialYear = new Date().getFullYear(), initialMonth = new Date().getMonth() + 1 }) {
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [groomYear, setGroomYear] = useState('');
    const [brideYear, setBrideYear] = useState('');
    const [starFilter, setStarFilter] = useState(1); // 1: Tất cả, 4: >= 4 sao, 5: 5 sao
    const [viewTab, setViewTab] = useState(0); // 0: Thẻ ngày đẹp, 1: Bảng tổng quan

    // Tính Can Chi & Kim Lâu
    const groomCanChi = useMemo(() => getCanChiByYear(groomYear), [groomYear]);
    const brideCanChi = useMemo(() => getCanChiByYear(brideYear), [brideYear]);
    const kimLau = useMemo(() => brideYear ? checkKimLau(brideYear, selectedYear) : null, [brideYear, selectedYear]);

    // Lấy danh sách ngày trong tháng
    const allDates = useMemo(() => {
        return getWeddingDatesInMonth(selectedYear, selectedMonth, groomYear ? Number(groomYear) : null, brideYear ? Number(brideYear) : null, 1);
    }, [selectedYear, selectedMonth, groomYear, brideYear]);

    // Lọc theo số sao
    const filteredDates = useMemo(() => {
        return allDates.filter(d => d.stars >= starFilter);
    }, [allDates, starFilter]);

    // Thống kê
    const stats = useMemo(() => {
        const daiCat = allDates.filter(d => d.stars === 5).length;
        const tot = allDates.filter(d => d.stars === 4).length;
        const kha = allDates.filter(d => d.stars === 3).length;
        const avoids = allDates.filter(d => d.stars <= 2).length;
        return { daiCat, tot, kha, avoids, total: allDates.length };
    }, [allDates]);

    // Sao chép văn bản tư vấn của 1 ngày
    const handleCopySingle = (dateInfo) => {
        const text = generateConsultingText(dateInfo);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text);
            toast.success(`Đã sao chép nội dung tư vấn ngày ${dateInfo.solarStr}!`);
        } else {
            toast.error('Trình duyệt không hỗ trợ tự động sao chép.');
        }
    };

    // Sao chép toàn bộ danh sách ngày đẹp tháng
    const handleCopyMonthSummary = () => {
        const goodDates = allDates.filter(d => d.stars >= 4);
        if (goodDates.length === 0) {
            toast.warning('Không có ngày đẹp (>= 4 sao) trong tháng này.');
            return;
        }

        let text = `💍 TỔNG HỢP NGÀY ĐẸP CƯỚI HỎI THÁNG ${selectedMonth}/${selectedYear} 💍\n`;
        if (groomCanChi || brideCanChi) {
            text += `👥 Cặp đôi: ${groomCanChi ? `Chú rể ${groomCanChi.name} (${groomYear})` : ''} ${brideCanChi ? `- Cô dâu ${brideCanChi.name} (${brideYear})` : ''}\n`;
        }
        text += `--------------------------------------------------\n\n`;

        goodDates.forEach((d, idx) => {
            text += `${idx + 1}. ${d.solarStr} (${d.fullLunarStr})\n`;
            text += `   ⭐ Đánh giá: ${'⭐'.repeat(d.stars)} [${d.ratingLabel}]\n`;
            text += `   🔮 Trực: ${d.truc.name} | ${d.hoangDao.name}\n`;
            if (d.positivePoints.length > 0) {
                text += `   ✅ Lý do: ${d.positivePoints.join(', ')}\n`;
            }
            text += `   ⏰ Giờ Hoàng Đạo: ${d.luckyHoursStr}\n\n`;
        });

        text += `--------------------------------------------------\n`;
        text += `Studio LONG WEDDING kính chúc hai bạn lựa chọn được ngày cưới ngập tràn may mắn!`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text);
            toast.success(`Đã sao chép danh sách ${goodDates.length} ngày đẹp Tháng ${selectedMonth}/${selectedYear}!`);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                style: {
                    borderRadius: '16px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
            }}
        >
            {/* Tiêu đề Modal */}
            <DialogTitle style={{
                background: 'linear-gradient(135deg, #e91e63 0%, #ff4081 100%)',
                color: '#fff',
                padding: '20px 24px',
                textAlign: 'center'
            }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <i className="fa-solid fa-heart" style={{ fontSize: '1.4rem' }}></i>
                    <Typography variant="h6" style={{ fontWeight: 'bold', letterSpacing: '0.5px' }}>
                        TỔNG HỢP NGÀY ĐẸP CƯỚI HỎI
                    </Typography>
                </Box>
                <Typography variant="caption" style={{ opacity: 0.9, display: 'block', marginTop: '4px' }}>
                    Tra cứu & Đánh giá phong thủy ngày lành cho Lễ Cưới, Ăn Hỏi, Rước Dâu
                </Typography>
            </DialogTitle>

            <DialogContent style={{ padding: '20px 24px', backgroundColor: '#fcfcfc' }}>
                {/* Thanh Bộ Lọc */}
                <Box 
                    p={2} 
                    mb={2.5}
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #eee',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={6} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Tháng Dương</InputLabel>
                                <Select
                                    value={selectedMonth}
                                    label="Tháng Dương"
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                        <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Năm Dương</InputLabel>
                                <Select
                                    value={selectedYear}
                                    label="Năm Dương"
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                >
                                    {[2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                                        <MenuItem key={y} value={y}>Năm {y}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <TextField
                                label="Năm sinh Chú Rể"
                                placeholder="VD: 1996"
                                type="number"
                                size="small"
                                fullWidth
                                value={groomYear}
                                onChange={(e) => setGroomYear(e.target.value)}
                                helperText={groomCanChi ? `Can Chi: ${groomCanChi.name}` : ''}
                            />
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <TextField
                                label="Năm sinh Cô Dâu"
                                placeholder="VD: 1998"
                                type="number"
                                size="small"
                                fullWidth
                                value={brideYear}
                                onChange={(e) => setBrideYear(e.target.value)}
                                helperText={brideCanChi ? `Can Chi: ${brideCanChi.name}` : ''}
                            />
                        </Grid>
                    </Grid>

                    {/* Dòng lọc thứ 2 */}
                    <Box display="flex" flexWrap="wrap" gap={1.5} mt={2} alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" style={{ fontWeight: 600, color: '#555' }}>
                                Tiêu chí:
                            </Typography>
                            <Chip 
                                label="Tất cả ngày" 
                                color={starFilter === 1 ? "primary" : "default"} 
                                onClick={() => setStarFilter(1)}
                                clickable
                                size="small"
                            />
                            <Chip 
                                label="⭐ Ngày Đẹp & Đại Cát (>= 4 sao)" 
                                color={starFilter === 4 ? "secondary" : "default"} 
                                onClick={() => setStarFilter(4)}
                                clickable
                                size="small"
                            />
                            <Chip 
                                label="🌟 Chỉ ngày Đại Cát (5 sao)" 
                                color={starFilter === 5 ? "success" : "default"} 
                                onClick={() => setStarFilter(5)}
                                clickable
                                size="small"
                            />
                        </Stack>

                        <Button 
                            variant="outlined" 
                            color="secondary" 
                            size="small"
                            onClick={handleCopyMonthSummary}
                            startIcon={<i className="fa-solid fa-copy"></i>}
                            style={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Sao chép danh sách ngày đẹp
                        </Button>
                    </Box>
                </Box>

                {/* Thông báo Kim Lâu nếu cô dâu bị phạm */}
                {kimLau && (
                    <Box mb={2}>
                        {kimLau.isKimLau ? (
                            <Alert severity="warning" style={{ borderRadius: '8px' }}>
                                <strong>Cảnh báo Kim Lâu:</strong> Cô dâu sinh năm {brideYear} ({brideCanChi?.name}) năm {selectedYear} được {kimLau.lunarAge} tuổi Âm ➔ <strong>{kimLau.typeName}</strong>. {kimLau.advice}
                            </Alert>
                        ) : (
                            <Alert severity="success" style={{ borderRadius: '8px' }}>
                                <strong>Tuổi Cô Dâu:</strong> Cô dâu sinh năm {brideYear} ({brideCanChi?.name}) năm {selectedYear} được {kimLau.lunarAge} tuổi Âm ➔ Không phạm Kim Lâu, rất đẹp để làm lễ cưới hỏi!
                            </Alert>
                        )}
                    </Box>
                )}

                {/* Khối Thống kê nhanh */}
                <Box 
                    display="flex" 
                    gap={2} 
                    mb={2} 
                    p={1.5} 
                    style={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                >
                    <Box flex={1} textAlign="center">
                        <Typography variant="caption" color="textSecondary">Tổng số ngày</Typography>
                        <Typography variant="h6" fontWeight="bold">{stats.total}</Typography>
                    </Box>
                    <Box flex={1} textAlign="center" style={{ borderLeft: '1px solid #eee' }}>
                        <Typography variant="caption" style={{ color: '#e91e63', fontWeight: 'bold' }}>🌟 Đại Cát (5★)</Typography>
                        <Typography variant="h6" fontWeight="bold" style={{ color: '#e91e63' }}>{stats.daiCat}</Typography>
                    </Box>
                    <Box flex={1} textAlign="center" style={{ borderLeft: '1px solid #eee' }}>
                        <Typography variant="caption" style={{ color: '#4caf50', fontWeight: 'bold' }}>⭐ Ngày Tốt (4★)</Typography>
                        <Typography variant="h6" fontWeight="bold" style={{ color: '#4caf50' }}>{stats.tot}</Typography>
                    </Box>
                    <Box flex={1} textAlign="center" style={{ borderLeft: '1px solid #eee' }}>
                        <Typography variant="caption" color="textSecondary">Khá (3★)</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">{stats.kha}</Typography>
                    </Box>
                    <Box flex={1} textAlign="center" style={{ borderLeft: '1px solid #eee' }}>
                        <Typography variant="caption" color="error">Kỵ / Tránh</Typography>
                        <Typography variant="h6" fontWeight="bold" color="error">{stats.avoids}</Typography>
                    </Box>
                </Box>

                {/* Tabs xem dạng thẻ / dạng danh sách */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: '#1e293b' }}>
                        Danh sách Ngày Đẹp Tháng {selectedMonth}/{selectedYear} ({filteredDates.length} ngày)
                    </Typography>
                    <Tabs value={viewTab} onChange={(_, v) => setViewTab(v)} size="small">
                        <Tab label="Dạng Thẻ" style={{ textTransform: 'none', fontWeight: 'bold' }} />
                        <Tab label="Dạng Bảng" style={{ textTransform: 'none', fontWeight: 'bold' }} />
                    </Tabs>
                </Box>

                {/* NỘI DUNG HIỂN THỊ */}
                {filteredDates.length === 0 ? (
                    <Box textAlign="center" py={4} color="#888">
                        Không có ngày phù hợp với tiêu chí lọc đã chọn.
                    </Box>
                ) : viewTab === 0 ? (
                    /* DẠNG THẺ (CARDS) */
                    <Grid container spacing={2}>
                        {filteredDates.map((item, idx) => (
                            <Grid item xs={12} sm={6} key={idx}>
                                <Card style={{
                                    borderRadius: '12px',
                                    border: item.stars >= 4 ? `2px solid ${item.badgeColor}` : '1px solid #e2e8f0',
                                    boxShadow: item.stars >= 4 ? '0 4px 12px rgba(233,30,99,0.08)' : '0 2px 4px rgba(0,0,0,0.03)',
                                    position: 'relative'
                                }}>
                                    <CardContent style={{ padding: '16px' }}>
                                        {/* Header Thẻ */}
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                            <Box>
                                                <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                    {item.solarStr}
                                                </Typography>
                                                <Typography variant="caption" style={{ color: '#e67e22', fontWeight: 'bold', display: 'block' }}>
                                                    🌙 {item.fullLunarStr}
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={`${'★'.repeat(item.stars)} ${item.ratingLabel}`}
                                                size="small"
                                                style={{
                                                    backgroundColor: item.badgeColor,
                                                    color: '#fff',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </Box>

                                        {/* Can Chi & Trực */}
                                        <Box display="flex" gap={1} flexWrap="wrap" my={1}>
                                            <Chip label={`Trực ${item.truc.name}`} variant="outlined" size="small" color={item.truc.isGood ? "success" : "default"} />
                                            <Chip label={item.hoangDao.name} variant="outlined" size="small" color={item.hoangDao.isHoangDao ? "secondary" : "default"} />
                                            <Chip label={`Ngày ${item.dayName}`} variant="outlined" size="small" />
                                        </Box>

                                        {/* Tương thích Tuổi Cô dâu / Chú rể */}
                                        {(item.groomRelation || item.brideRelation) && (
                                            <Box display="flex" gap={1} my={1} flexWrap="wrap">
                                                {item.groomRelation && (
                                                    <Chip 
                                                        label={`Chú rể: ${item.groomRelation.text}`} 
                                                        size="small"
                                                        color={item.groomRelation.type === 'hop' ? 'success' : item.groomRelation.type === 'xung' ? 'error' : 'default'}
                                                    />
                                                )}
                                                {item.brideRelation && (
                                                    <Chip 
                                                        label={`Cô dâu: ${item.brideRelation.text}`} 
                                                        size="small"
                                                        color={item.brideRelation.type === 'hop' ? 'success' : item.brideRelation.type === 'xung' ? 'error' : 'default'}
                                                    />
                                                )}
                                            </Box>
                                        )}

                                        {/* Lý do tốt & Cảnh báo */}
                                        {item.positivePoints.length > 0 && (
                                            <Box mt={1} style={{ fontSize: '0.82rem', color: '#16a34a' }}>
                                                <strong>Tốt:</strong> {item.positivePoints.join(', ')}
                                            </Box>
                                        )}
                                        {item.warningPoints.length > 0 && (
                                            <Box mt={0.5} style={{ fontSize: '0.82rem', color: '#dc2626' }}>
                                                <strong>Lưu ý:</strong> {item.warningPoints.join(', ')}
                                            </Box>
                                        )}

                                        {/* Giờ Hoàng Đạo */}
                                        <Box mt={1} pt={1} style={{ borderTop: '1px stroke #eee', fontSize: '0.8rem', color: '#475569' }}>
                                            ⏰ <strong>Giờ đẹp:</strong> {item.luckyHoursStr}
                                        </Box>

                                        {/* Nút Sao Chép */}
                                        <Box display="flex" justifyContent="flex-end" mt={1.5}>
                                            <Button 
                                                size="small" 
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleCopySingle(item)}
                                                startIcon={<i className="fa-solid fa-copy"></i>}
                                                style={{ textTransform: 'none', borderRadius: '8px', fontWeight: 'bold' }}
                                            >
                                                Sao chép tư vấn
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    /* DẠNG BẢNG (TABLE) */
                    <Box style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                    <th style={{ padding: '12px 16px' }}>Ngày Dương</th>
                                    <th style={{ padding: '12px 16px' }}>Ngày Âm</th>
                                    <th style={{ padding: '12px 16px' }}>Đánh giá</th>
                                    <th style={{ padding: '12px 16px' }}>Trực & Hoàng đạo</th>
                                    <th style={{ padding: '12px 16px' }}>Giờ Hoàng Đạo</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDates.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                                            {item.solarStr}
                                            {item.isWeekend && <span style={{ color: '#e91e63', marginLeft: '6px' }}>(Cuối tuần)</span>}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#e67e22', fontWeight: 600 }}>
                                            {item.lunarStr}
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ngày {item.dayName}</div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Chip 
                                                label={`${'★'.repeat(item.stars)} ${item.ratingLabel}`}
                                                size="small"
                                                style={{ backgroundColor: item.badgeColor, color: '#fff', fontWeight: 'bold' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div>Trực {item.truc.name} - {item.hoangDao.name}</div>
                                            {item.warningPoints.length > 0 && (
                                                <div style={{ color: '#dc2626', fontSize: '0.75rem' }}>{item.warningPoints[0]}</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#475569' }}>
                                            {item.luckyHoursStr}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <IconButton 
                                                color="primary" 
                                                size="small"
                                                onClick={() => handleCopySingle(item)}
                                                title="Sao chép văn bản tư vấn"
                                            >
                                                <i className="fa-solid fa-copy"></i>
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                )}
            </DialogContent>

            <DialogActions style={{ padding: '16px 24px', backgroundColor: '#fcfcfc', borderTop: '1px solid #eee' }}>
                <Button onClick={onClose} color="inherit" style={{ fontWeight: 'bold' }}>
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
}
