import { getPaymentSocket } from '../../API/socketClient';
import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    CircularProgress,
    IconButton,
    Paper,
    TextField,
    Tooltip,
    Alert,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tabs,
    Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentsIcon from '@mui/icons-material/Payments';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'sonner';
import appService from '../../API/services/otherService';

const POPULAR_BANKS = [
    { code: 'MBBank', name: 'MBBank - Ngân hàng Quân Đội' },
    { code: 'VCB', name: 'Vietcombank - Ngân hàng Ngoại Thương' },
    { code: 'TCB', name: 'Techcombank - Ngân hàng Kỹ Thương' },
    { code: 'ACB', name: 'ACB - Ngân hàng Á Châu' },
    { code: 'TPB', name: 'TPBank - Ngân hàng Tiên Phong' },
    { code: 'VPB', name: 'VPBank - Ngân hàng Việt Nam Thịnh Vượng' },
    { code: 'VTB', name: 'VietinBank - Ngân hàng Công Thương' },
    { code: 'BIDV', name: 'BIDV - Ngân hàng Đầu tư và Phát triển' },
    { code: 'STB', name: 'Sacombank - Ngân hàng Sài Gòn Thương Tín' },
    { code: 'HDB', name: 'HDBank - Ngân hàng Phát triển TP.HCM' }
];

export default function SePayDialog({ open, onClose, data, maHopDong, defaultAmount = 0, onSuccess }) {
    const activeMaHopDong = maHopDong || data?.maHopDong || '';
    
    // Tab state: 0 = VietQR SePay Webhook, 1 = Tiền mặt
    const [tabIndex, setTabIndex] = useState(0);
    const [sessionCode, setSessionCode] = useState('');
    const [sessionStartTime, setSessionStartTime] = useState(Date.now());

    const [loading, setLoading] = useState(true);
    const [qrData, setQrData] = useState(null);
    const [customAmount, setCustomAmount] = useState(defaultAmount);
    const [isPolling, setIsPolling] = useState(false);
    const [paymentReceived, setPaymentReceived] = useState(false);
    const [paymentDetail, setPaymentDetail] = useState(null);

    // Cash Payment Form States
    const [cashAmount, setCashAmount] = useState(defaultAmount);
    const [cashMethod, setCashMethod] = useState('Tiền mặt');
    const [cashNote, setCashNote] = useState('Thanh toán hợp đồng');
    const [isSubmittingCash, setIsSubmittingCash] = useState(false);

    // Bank Config State
    const [showConfigEdit, setShowConfigEdit] = useState(false);
    const [editBankName, setEditBankName] = useState('MBBank');
    const [editAccountNumber, setEditAccountNumber] = useState('9990187764519');
    const [editAccountName, setEditAccountName] = useState('MAI TIEN LONG');
    const [savingConfig, setSavingConfig] = useState(false);

    const initialPaymentCountRef = useRef(null);
    const initialPaidAmountRef = useRef(null);
    const pollingTimerRef = useRef(null);

    const fetchQrInfo = async (amountToUse) => {
        if (!activeMaHopDong) return;
        setLoading(true);
        try {
            const amountParam = amountToUse !== undefined ? amountToUse : customAmount;
            const res = await appService.getSepayQrInfo(activeMaHopDong, amountParam, sessionCode);
            const resData = res.data?.data || res.data;
            if (resData) {
                setQrData(resData);
                if (resData.amount !== undefined) {
                    setCustomAmount(resData.amount);
                    if (!cashAmount) setCashAmount(resData.amount);
                }
                setEditBankName(resData.bankName || 'MBBank');
                setEditAccountNumber(resData.accountNumber || '9990187764519');
                setEditAccountName(resData.accountName || 'LONG WEDDING');

                if (!resData.accountNumber) {
                    setShowConfigEdit(true);
                }
            }
        } catch (err) {
            console.error("Lỗi khi lấy thông tin mã QR SePay:", err);
        } finally {
            setLoading(false);
        }
    };

    // Check payment status (Polling for Webhook confirmation)
    const checkStatus = async (isManualCheck = false) => {
        if (!activeMaHopDong) return;
        try {
            const res = await appService.checkSepayStatus(activeMaHopDong);
            const statusData = res.data?.data || res.data;

            if (statusData) {
                const currentCount = statusData.paymentCount || 0;
                const currentPaid = statusData.khachHangDaThanhToan || 0;
                const conLai = statusData.conLai || 0;

                const detailObj = statusData.latestPayment || {
                    amount: currentPaid,
                    method: 'Chuyển khoản (VietQR SePay)',
                    noiDung: `Thanh toán ${activeMaHopDong}`
                };

                if (initialPaymentCountRef.current === null) {
                    initialPaymentCountRef.current = currentCount;
                    initialPaidAmountRef.current = currentPaid;
                    // If contract is fully paid or has paid amount, show success screen immediately!
                    if (currentPaid > 0 && conLai === 0) {
                        setPaymentReceived(true);
                        setPaymentDetail(detailObj);
                    }
                } else {
                    if (currentCount > initialPaymentCountRef.current || currentPaid > initialPaidAmountRef.current || (isManualCheck && currentPaid > 0)) {
                        setPaymentReceived(true);
                        setPaymentDetail(detailObj);
                        toast.success(`🎉 Đã nhận thanh toán SePay Webhook thành công: ${(detailObj.amount || currentPaid || 0).toLocaleString('vi-VN')} đ!`, {
                            duration: 6000
                        });
                        if (onSuccess) {
                            onSuccess(statusData);
                        }
                    } else if (isManualCheck) {
                        toast.info(`Chưa phát hiện biến động số dư mới cho ${activeMaHopDong}`);
                    }
                }
            }
        } catch (err) {
            console.error("Lỗi khi kiểm tra trạng thái SePay:", err);
            if (isManualCheck) {
                toast.error("Không thể kết nối đến máy chủ kiểm tra thanh toán");
            }
        }
    };

    useEffect(() => {
        const handleSocketPayment = (paymentData) => {
            const cleanSocketMa = (paymentData?.maHopDong || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
            const cleanActiveMa = (activeMaHopDong || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
            
            const isSameHopDong = cleanSocketMa === cleanActiveMa && cleanActiveMa.length > 0;
            const isFreshSession = paymentData?.timestamp >= (sessionStartTime - 5000);
            const isMatchingSessionCode = !paymentData?.sessionId || !sessionCode || paymentData.sessionId === sessionCode;

            if (isSameHopDong && isFreshSession && isMatchingSessionCode) {
                console.log("⚡ [WebSocket Event] Received real-time payment success:", paymentData);
                setPaymentReceived(true);
                setPaymentDetail(paymentData.latestPayment || {
                    amount: paymentData.amount,
                    method: 'Chuyển khoản (VietQR SePay)',
                    noiDung: `Thanh toán SePay ${paymentData.maHopDong}`
                });
                toast.success(`⚡ [WebSocket Real-time] Đã nhận thanh toán SePay thành công: ${(paymentData.amount || 0).toLocaleString('vi-VN')} đ!`, {
                    duration: 6000
                });
                if (onSuccess) {
                    onSuccess(paymentData);
                }
            }
        };

        const paymentSocket = getPaymentSocket();

        if (open && activeMaHopDong) {
            const newSessionCode = 'S' + Math.floor(1000 + Math.random() * 9000);
            setSessionCode(newSessionCode);
            setSessionStartTime(Date.now());
            setPaymentReceived(false);
            setPaymentDetail(null);
            setShowConfigEdit(false);
            setTabIndex(0);
            setCustomAmount(defaultAmount);
            setCashAmount(defaultAmount);
            setCashNote('Thanh toán hợp đồng');
            initialPaymentCountRef.current = null;
            initialPaidAmountRef.current = null;
            
            fetchQrInfo(defaultAmount);
            setIsPolling(true);

            // Connect WebSocket when starting payment dialog
            if (!paymentSocket.connected) {
                paymentSocket.connect();
            }
            paymentSocket.on('payment_success', handleSocketPayment);

            pollingTimerRef.current = setInterval(() => {
                checkStatus();
            }, 4000);
        } else {
            if (pollingTimerRef.current) {
                clearInterval(pollingTimerRef.current);
            }
            setIsPolling(false);
        }

        return () => {
            paymentSocket.off('payment_success', handleSocketPayment);
            if (paymentSocket.connected) {
                paymentSocket.disconnect();
            }
            if (pollingTimerRef.current) {
                clearInterval(pollingTimerRef.current);
            }
        };
    }, [open, activeMaHopDong, defaultAmount]);

    const handleSaveBankConfig = async () => {
        if (!editAccountNumber.trim()) {
            toast.warning("Vui lòng nhập số tài khoản ngân hàng!");
            return;
        }
        setSavingConfig(true);
        try {
            await appService.updateSepayConfig({
                bankName: editBankName,
                accountNumber: editAccountNumber.trim(),
                accountName: editAccountName.trim()
            });
            toast.success("Đã lưu thông tin tài khoản ngân hàng SePay thành công!");
            setShowConfigEdit(false);
            await fetchQrInfo(customAmount);
        } catch (err) {
            console.error("Lỗi khi lưu cấu hình ngân hàng:", err);
            toast.error("Không thể lưu cấu hình ngân hàng");
        } finally {
            setSavingConfig(false);
        }
    };

    // Submit Cash Payment
    const handleSubmitCashPayment = async () => {
        const amountNum = Number(cashAmount) || 0;
        if (amountNum <= 0) {
            toast.warning("Số tiền thanh toán phải lớn hơn 0!");
            return;
        }

        if (!data || !data._id) {
            toast.warning("Chưa có ID hợp đồng để ghi nhận thanh toán!");
            return;
        }

        setIsSubmittingCash(true);
        try {
            const cacLuotThanhToan = [...(data?.thanhToan?.cacLuotThanhToan || [])];
            const newPaymentObj = {
                id: `TT-${activeMaHopDong}-${Date.now()}`,
                khachHang: data?.khachHang1?.tenKhachHang || "Khách hàng",
                amount: amountNum,
                date: new Date().toISOString(),
                method: cashMethod || "Tiền mặt",
                noiDung: cashNote || "Thanh toán tiền mặt"
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

            toast.success(`Đã thu tiền mặt ${amountNum.toLocaleString('vi-VN')} đ thành công!`);
            setPaymentReceived(true);
            setPaymentDetail(newPaymentObj);

            if (onSuccess) {
                onSuccess({ latestPayment: newPaymentObj });
            }
        } catch (err) {
            console.error("Lỗi khi ghi nhận thanh toán tiền mặt:", err);
            toast.error("Có lỗi xảy ra khi ghi nhận thanh toán tiền mặt");
        } finally {
            setIsSubmittingCash(false);
        }
    };

    const handleCopy = (text, label) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`Đã sao chép ${label}: ${text}`);
    };

    const handleAmountChange = (e) => {
        const val = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
        setCustomAmount(val);
    };

    const handleApplyCustomAmount = () => {
        fetchQrInfo(customAmount);
    };

    const handleDownloadQr = () => {
        if (!qrData?.vietQrUrl && !qrData?.sepayQrUrl) return;
        const link = document.createElement('a');
        link.href = qrData.vietQrUrl || qrData.sepayQrUrl;
        link.download = `VietQR_${activeMaHopDong}.png`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
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
                    <AccountBalanceIcon style={{ color: '#0284c7', fontSize: 28 }} />
                    <Typography variant="h6" style={{ fontWeight: 700, color: '#0f172a' }}>
                        Thanh Toán Hợp Đồng ({activeMaHopDong})
                    </Typography>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Tooltip title="Cấu hình tài khoản ngân hàng SePay">
                        <IconButton size="small" onClick={() => setShowConfigEdit(!showConfigEdit)} style={{ color: '#0284c7' }}>
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers style={{ background: '#f8fafc', padding: 20 }}>
                {/* Method Tabs */}
                {!paymentReceived && (
                    <Box style={{ borderBottom: '1px solid #e2e8f0', marginBottom: 16 }}>
                        <Tabs
                            value={tabIndex}
                            onChange={(e, val) => setTabIndex(val)}
                            variant="fullWidth"
                            textColor="primary"
                            indicatorColor="primary"
                        >
                            <Tab
                                icon={<QrCode2Icon />}
                                iconPosition="start"
                                label="VietQR (SePay Webhook)"
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
                )}

                {/* Bank Config Edit Drawer */}
                {showConfigEdit && (
                    <Paper elevation={3} style={{ padding: 16, borderRadius: 12, marginBottom: 16, border: '1.5px solid #0284c7', background: '#ffffff' }}>
                        <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0369a1', marginBottom: 12 }}>
                            ⚙️ Thiết Lập Tài Khoản Ngân Hàng SePay
                        </Typography>
                        <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Ngân hàng</InputLabel>
                                <Select
                                    value={editBankName}
                                    label="Ngân hàng"
                                    onChange={(e) => setEditBankName(e.target.value)}
                                >
                                    {POPULAR_BANKS.map((b) => (
                                        <MenuItem key={b.code} value={b.code}>
                                            {b.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                label="Số tài khoản ngân hàng"
                                size="small"
                                fullWidth
                                variant="outlined"
                                value={editAccountNumber}
                                onChange={(e) => setEditAccountNumber(e.target.value)}
                                placeholder="Nhập số tài khoản"
                            />

                            <TextField
                                label="Tên chủ tài khoản"
                                size="small"
                                fullWidth
                                variant="outlined"
                                value={editAccountName}
                                onChange={(e) => setEditAccountName(e.target.value)}
                                placeholder="LONG WEDDING"
                            />

                            <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                                <Button size="small" variant="outlined" onClick={() => setShowConfigEdit(false)}>
                                    Hủy
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveBankConfig}
                                    disabled={savingConfig}
                                    style={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 600 }}
                                >
                                    {savingConfig ? "Đang lưu..." : "Lưu tài khoản"}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                )}

                {paymentReceived ? (
                    <Box style={{ textAlign: 'center', padding: '32px 16px', background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)', borderRadius: 16 }}>
                        <Box style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 90, height: 90, borderRadius: '50%', background: '#dcfce7', border: '4px solid #86efac', marginBottom: 20, boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.3)' }}>
                            <CheckCircleIcon style={{ fontSize: 64, color: '#16a34a' }} />
                        </Box>

                        <Typography variant="h4" style={{ fontWeight: 800, color: '#15803d', marginBottom: 8, letterSpacing: '-0.5px' }}>
                            THANH TOÁN THÀNH CÔNG!
                        </Typography>

                        <Chip
                            label="⚡ Đã nhận SePay Webhook & Gạch nợ thành công"
                            color="success"
                            style={{ fontWeight: 700, marginBottom: 24, padding: '4px 8px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontSize: 13 }}
                        />

                        {paymentDetail && (
                            <Paper elevation={3} style={{ padding: 24, borderRadius: 20, background: '#ffffff', border: '2px solid #bbf7d0', maxWidth: 440, margin: '0 auto', textAlign: 'left', boxShadow: '0 12px 30px -10px rgba(0,0,0,0.06)' }}>
                                <Box style={{ textAlign: 'center', paddingBottom: 16, marginBottom: 16, borderBottom: '2px dashed #e2e8f0' }}>
                                    <Typography variant="caption" style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                                        Số tiền đã gạch nợ
                                    </Typography>
                                    <Typography variant="h3" style={{ color: '#15803d', fontWeight: 900, fontSize: 32, marginTop: 4 }}>
                                        {(paymentDetail.amount || 0).toLocaleString('vi-VN')} <span style={{ fontSize: 20 }}>đ</span>
                                    </Typography>
                                </Box>

                                <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" style={{ color: '#64748b', fontWeight: 500 }}>Mã Hợp Đồng:</Typography>
                                        <Typography variant="subtitle2" style={{ color: '#0f172a', fontWeight: 800 }}>{activeMaHopDong}</Typography>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" style={{ color: '#64748b', fontWeight: 500 }}>Phương thức:</Typography>
                                        <Typography variant="subtitle2" style={{ color: '#0284c7', fontWeight: 700 }}>{paymentDetail.method || 'Chuyển khoản (VietQR SePay)'}</Typography>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" style={{ color: '#64748b', fontWeight: 500 }}>Nội dung:</Typography>
                                        <Typography variant="body2" style={{ color: '#334155', fontWeight: 600, fontStyle: 'italic' }}>{paymentDetail.noiDung || '-'}</Typography>
                                    </Box>
                                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                                        <Typography variant="caption" style={{ color: '#94a3b8' }}>Thời gian ghi nhận:</Typography>
                                        <Typography variant="caption" style={{ color: '#64748b', fontWeight: 600 }}>{new Date().toLocaleString('vi-VN')}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        )}
                    </Box>
                ) : tabIndex === 0 ? (
                    /* TAB 0: VIETQR SEPAY WEBHOOK */
                    loading ? (
                        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40 }}>
                            <CircularProgress size={44} style={{ color: '#0284c7', marginBottom: 16 }} />
                            <Typography variant="body2" style={{ color: '#64748b' }}>
                                Đang khởi tạo mã QR thanh toán VietQR SePay...
                            </Typography>
                        </Box>
                    ) : (
                        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Status bar */}
                            <Box style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="success"
                                        startIcon={<RefreshIcon />}
                                        onClick={() => checkStatus(true)}
                                        style={{ textTransform: 'none', fontWeight: 600, borderRadius: 8, fontSize: 12 }}
                                    >
                                        Kiểm tra ngay
                                    </Button>
                                    <Typography variant="caption" style={{ color: '#64748b' }}>
                                        Mã HĐ: <strong>{activeMaHopDong}</strong>
                                    </Typography>
                                </Box>
                            </Box>

                            <Box style={{ display: 'flex', flexDirection: 'row', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>
                                {/* CỘT 1 (BÊN TRÁI): Ảnh mã QR Thuần phóng to */}
                                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 320 }}>
                                    {qrData?.accountNumber && (qrData?.vietQrUrl || qrData?.sepayQrUrl) ? (
                                        <Paper elevation={2} style={{ padding: 12, borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center' }}>
                                            <img
                                                src={qrData.vietQrUrl || qrData.sepayQrUrl}
                                                alt="VietQR SePay Payment"
                                                style={{ width: 320, height: 320, objectFit: 'contain', borderRadius: 8 }}
                                                onError={(e) => {
                                                    if (qrData.sepayQrUrl && e.target.src !== qrData.sepayQrUrl) {
                                                        e.target.src = qrData.sepayQrUrl;
                                                    }
                                                }}
                                            />
                                            <Button
                                                size="small"
                                                startIcon={<DownloadIcon style={{ fontSize: 16 }} />}
                                                onClick={handleDownloadQr}
                                                style={{ marginTop: 8, fontSize: 12, color: '#0284c7', fontWeight: 600, textTransform: 'none' }}
                                            >
                                                Tải ảnh QR
                                            </Button>
                                        </Paper>
                                    ) : (
                                        <Box style={{ width: 320, height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: 16, padding: 12, textAlign: 'center' }}>
                                            <QrCode2Icon style={{ fontSize: 48, color: '#94a3b8', marginBottom: 8 }} />
                                            <Typography variant="caption" style={{ color: '#64748b', fontWeight: 600 }}>
                                                Chưa cài đặt số tài khoản
                                            </Typography>
                                            <Button size="small" variant="text" onClick={() => setShowConfigEdit(true)} style={{ marginTop: 4, fontSize: 11, color: '#0284c7' }}>
                                                Thêm số tài khoản
                                            </Button>
                                        </Box>
                                    )}
                                </Box>

                                {/* CỘT 2 (BÊN PHẢI): 5 mục thông tin thanh toán nằm hoàn toàn ở cột phải */}
                                <Box style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {/* 1. Ngân hàng */}
                                    <Paper style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        <Typography variant="caption" style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Ngân hàng nhận</Typography>
                                        <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                                            {qrData?.bankName || 'MBBank'}
                                        </Typography>
                                    </Paper>

                                    {/* 2. Số tài khoản & Chủ TK */}
                                    <Paper style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #bae6fd', background: '#f0f9ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box style={{ overflow: 'hidden' }}>
                                            <Typography variant="caption" style={{ color: '#0369a1', fontSize: 11, display: 'block' }}>Số tài khoản nhận</Typography>
                                            <Typography variant="subtitle2" style={{ fontWeight: 800, color: '#0284c7', fontSize: 16, letterSpacing: '0.5px' }}>
                                                {qrData?.accountNumber || 'Chưa thiết lập'}
                                            </Typography>
                                            <Typography variant="caption" style={{ color: '#475569', display: 'block', fontSize: 11 }}>
                                                Chủ TK: <strong>{qrData?.accountName || 'LONG WEDDING'}</strong>
                                            </Typography>
                                        </Box>
                                        {qrData?.accountNumber ? (
                                            <Tooltip title="Sao chép số tài khoản">
                                                <IconButton size="small" onClick={() => handleCopy(qrData?.accountNumber || '', 'Số tài khoản')} style={{ background: '#e0f2fe' }}>
                                                    <ContentCopyIcon style={{ fontSize: 18, color: '#0284c7' }} />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            <Button size="small" onClick={() => setShowConfigEdit(true)} style={{ fontSize: 11, color: '#0284c7' }}>
                                                Sửa
                                            </Button>
                                        )}
                                    </Paper>

                                    {/* 3. Nội dung chuyển khoản */}
                                    <Paper style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box style={{ overflow: 'hidden' }}>
                                            <Typography variant="caption" style={{ color: '#475569', fontSize: 11, display: 'block' }}>Nội dung chuyển khoản (Bắt buộc)</Typography>
                                            <Typography variant="subtitle2" style={{ fontWeight: 800, color: '#1d4ed8', fontSize: 15 }}>
                                                {qrData?.transferContent || activeMaHopDong}
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Sao chép nội dung">
                                            <IconButton size="small" onClick={() => handleCopy(qrData?.transferContent || activeMaHopDong, 'Nội dung')} style={{ background: '#eff6ff' }}>
                                                <ContentCopyIcon style={{ fontSize: 18, color: '#1d4ed8' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Paper>

                                    {/* 4. Số tiền thanh toán */}
                                    <Paper style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #bbf7d0', background: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="caption" style={{ color: '#166534', fontSize: 11, display: 'block' }}>Số tiền thanh toán</Typography>
                                            <Typography variant="subtitle1" style={{ fontWeight: 800, color: '#15803d', fontSize: 17 }}>
                                                {(customAmount || 0).toLocaleString('vi-VN')} đ
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Sao chép số tiền">
                                            <IconButton size="small" onClick={() => handleCopy(customAmount.toString(), 'Số tiền')} style={{ background: '#dcfce7' }}>
                                                <ContentCopyIcon style={{ fontSize: 18, color: '#15803d' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Paper>

                                    {/* 5. Khung nhập Số tiền muốn chuyển & Nút Cập nhật QR */}
                                    <Box style={{ marginTop: 2, display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <TextField
                                            label="Số tiền muốn chuyển (VND)"
                                            size="small"
                                            variant="outlined"
                                            value={(customAmount || 0).toLocaleString('vi-VN')}
                                            onChange={handleAmountChange}
                                            style={{ flex: 1, background: '#ffffff' }}
                                        />
                                        <Button
                                            variant="outlined"
                                            onClick={handleApplyCustomAmount}
                                            style={{ height: 40, borderColor: '#0284c7', color: '#0284c7', textTransform: 'none', fontWeight: 600, px: 2 }}
                                        >
                                            Cập nhật QR
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>

                            <Alert severity="info" style={{ borderRadius: 8, fontSize: 12, marginTop: 4 }}>
                                Khi quý khách hoàn tất chuyển khoản trên ứng dụng Ngân hàng, hệ thống sẽ tự động nhận SePay Webhook và gạch nợ thành công ngay lập tức!
                            </Alert>
                        </Box>
                    )
                ) : (
                    /* TAB 1: TIỀN MẶT */
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '10px 0' }}>
                        <Paper style={{ padding: 16, borderRadius: 12, background: '#ffffff', border: '1px solid #e2e8f0' }}>
                            <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
                                💵 Thu Tiền Mặt Trực Tiếp
                            </Typography>
                            <Box style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Hình thức thanh toán</InputLabel>
                                    <Select
                                        value={cashMethod}
                                        label="Hình thức thanh toán"
                                        onChange={(e) => setCashMethod(e.target.value)}
                                    >
                                        <MenuItem value="Tiền mặt">Tiền mặt</MenuItem>
                                        <MenuItem value="Chuyển khoản">Chuyển khoản (Thủ công)</MenuItem>
                                        <MenuItem value="Cà thẻ">Cà thẻ / Thẻ ngân hàng</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Số tiền thanh toán (VND)"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={(cashAmount || 0).toLocaleString('vi-VN')}
                                    onChange={(e) => {
                                        const raw = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
                                        setCashAmount(raw);
                                    }}
                                />

                                <TextField
                                    label="Ghi chú thanh toán"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={cashNote}
                                    onChange={(e) => setCashNote(e.target.value)}
                                    placeholder="Thanh toán tiền mặt"
                                />

                                <Button
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    disabled={isSubmittingCash || Number(cashAmount) <= 0}
                                    onClick={handleSubmitCashPayment}
                                    style={{ marginTop: 8, borderRadius: 8, fontWeight: 700, height: 44 }}
                                >
                                    {isSubmittingCash ? "Đang xử lý..." : `Xác Nhận Thu ${(Number(cashAmount) || 0).toLocaleString('vi-VN')} đ (Tiền Mặt)`}
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                )}
            </DialogContent>

            <DialogActions style={{ padding: '12px 20px' }}>
                {paymentReceived ? (
                    <Button
                        variant="contained"
                        color="success"
                        onClick={onClose}
                        style={{ borderRadius: 8, fontWeight: 700, px: 3 }}
                    >
                        Hoàn tất & Đóng
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        style={{ borderRadius: 8, color: '#64748b', borderColor: '#cbd5e1' }}
                    >
                        Đóng
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
