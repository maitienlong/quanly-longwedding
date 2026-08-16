import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    Paper,
    TextField,
    Alert,
    Tabs,
    Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { toast } from 'sonner';
import appService from '../../API/services/otherService';

export default function PaymentDialog({ open, onClose, data, maHopDong, defaultAmount = 0, onSuccess }) {
    const activeMaHopDong = maHopDong || data?.maHopDong || '';
    
    // Tab State: 0 = Chuyển khoản, 1 = Tiền mặt
    const [tabIndex, setTabIndex] = useState(0);
    const [amount, setAmount] = useState(defaultAmount);
    const [note, setNote] = useState("Thanh toán hợp đồng");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setAmount(defaultAmount);
            setTabIndex(0);
            setNote("Thanh toán hợp đồng");
        }
    }, [open, defaultAmount]);

    const handleSubmitPayment = async () => {
        const amountNum = Number(amount) || 0;
        if (amountNum <= 0) {
            toast.warning("Số tiền thanh toán phải lớn hơn 0!");
            return;
        }

        if (!data || !data._id) {
            toast.warning("Chưa có thông tin hợp đồng để ghi nhận thanh toán!");
            return;
        }

        const currentMethod = tabIndex === 0 ? "Chuyển khoản" : "Tiền mặt";

        setIsSubmitting(true);
        try {
            const cacLuotThanhToan = [...(data?.thanhToan?.cacLuotThanhToan || [])];
            const newPaymentObj = {
                id: `TT-${activeMaHopDong}-${Date.now()}`,
                khachHang: data?.khachHang1?.tenKhachHang || "Khách hàng",
                amount: amountNum,
                date: new Date().toISOString(),
                method: currentMethod,
                noiDung: note || `Thanh toán ${currentMethod}`
            };
            cacLuotThanhToan.push(newPaymentObj);

            await appService.UPDATE_HOPDONG({
                _id: data._id,
                maHopDong: activeMaHopDong,
                thanhToan: {
                    giamGia: data?.thanhToan?.giamGia || 0,
                    loaiGiamGia: data?.thanhToan?.loaiGiamGia || 0,
                    cacLuotThanhToan: cacLuotThanhToan
                }
            });

            toast.success(`Đã ghi nhận thanh toán ${currentMethod} ${amountNum.toLocaleString('vi-VN')} đ thành công!`);

            if (onSuccess) {
                onSuccess({ latestPayment: newPaymentObj });
            }
            onClose();
        } catch (err) {
            console.error("Lỗi khi ghi nhận thanh toán:", err);
            toast.error("Có lỗi xảy ra khi ghi nhận thanh toán!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentMethodLabel = tabIndex === 0 ? "Chuyển khoản" : "Tiền mặt";

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                style: {
                    borderRadius: 16,
                    padding: '8px'
                }
            }}
        >
            <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AccountBalanceWalletIcon style={{ color: '#ed6c02', fontSize: 28 }} />
                    <Typography variant="h6" style={{ fontWeight: 700, color: '#0f172a' }}>
                        Thanh Toán Hợp Đồng
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers style={{ background: '#f8fafc', padding: 20 }}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Alert severity="info" style={{ borderRadius: 8, fontSize: 13 }}>
                        Mã Hợp Đồng: <strong>{activeMaHopDong}</strong>
                    </Alert>

                    {/* 2 Tabs: Chuyển khoản & Tiền mặt */}
                    <Box style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff', borderRadius: 8 }}>
                        <Tabs
                            value={tabIndex}
                            onChange={(e, val) => setTabIndex(val)}
                            variant="fullWidth"
                            textColor="primary"
                            indicatorColor="primary"
                        >
                            <Tab
                                icon={<AccountBalanceIcon />}
                                iconPosition="start"
                                label="Chuyển khoản"
                                style={{ fontWeight: 700, textTransform: 'none', fontSize: '0.9rem' }}
                            />
                            <Tab
                                icon={<PaymentsIcon />}
                                iconPosition="start"
                                label="Tiền mặt"
                                style={{ fontWeight: 700, textTransform: 'none', fontSize: '0.9rem' }}
                            />
                        </Tabs>
                    </Box>

                    <Paper style={{ padding: 16, borderRadius: 12, background: '#ffffff', border: '1px solid #e2e8f0' }}>
                        <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
                            {tabIndex === 0 ? "🏦 Thanh toán qua Chuyển khoản" : "💵 Thanh toán bằng Tiền mặt"}
                        </Typography>

                        <Box style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <TextField
                                label={`Số tiền ${currentMethodLabel.toLowerCase()} (VND)`}
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={(amount || 0).toLocaleString('vi-VN')}
                                onChange={(e) => {
                                    const raw = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
                                    setAmount(raw);
                                }}
                            />

                            <TextField
                                label="Ghi chú thanh toán"
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Thanh toán đợt..."
                            />
                        </Box>
                    </Paper>
                </Box>
            </DialogContent>

            <DialogActions style={{ padding: '12px 20px', justifyContent: 'space-between' }}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    style={{ borderRadius: 8, color: '#64748b', borderColor: '#cbd5e1' }}
                >
                    Hủy bỏ
                </Button>
                <Button
                    variant="contained"
                    color={tabIndex === 0 ? "primary" : "warning"}
                    disabled={isSubmitting || Number(amount) <= 0}
                    onClick={handleSubmitPayment}
                    style={{ borderRadius: 8, fontWeight: 700, px: 3 }}
                >
                    {isSubmitting ? "Đang lưu..." : `Xác Nhận Thu ${(Number(amount) || 0).toLocaleString('vi-VN')} đ (${currentMethodLabel})`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
