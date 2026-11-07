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
    InputLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import PaymentsIcon from '@mui/icons-material/Payments';
import BoltIcon from '@mui/icons-material/Bolt';
import { toast } from 'sonner';
import appService from '../../API/services/otherService';
import './SePayDialogModern.css';

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
    
    const [sessionCode, setSessionCode] = useState('');
    const [sessionStartTime, setSessionStartTime] = useState(Date.now());

    const [loading, setLoading] = useState(true);
    const [qrData, setQrData] = useState(null);
    const [customAmount, setCustomAmount] = useState(defaultAmount);
    const [paymentReceived, setPaymentReceived] = useState(false);
    const [paymentDetail, setPaymentDetail] = useState(null);
    const [countdown, setCountdown] = useState(3);

    // Tab state & Cash payment
    const [paymentTab, setPaymentTab] = useState(0); // 0 = VietQR, 1 = Tiền mặt
    const [cashNote, setCashNote] = useState("Thanh toán hợp đồng");
    const [savingCash, setSavingCash] = useState(false);

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
                    noiDung: qrData?.transferContent || `Thanh toán ${activeMaHopDong}`
                };

                if (initialPaymentCountRef.current === null) {
                    initialPaymentCountRef.current = currentCount;
                    initialPaidAmountRef.current = currentPaid;
                    if (currentPaid > 0 && conLai === 0) {
                        setPaymentReceived(true);
                        setPaymentDetail(detailObj);
                    }
                } else {
                    if (currentCount > initialPaymentCountRef.current || currentPaid > initialPaidAmountRef.current || (isManualCheck && currentPaid > 0)) {
                        setPaymentReceived(true);
                        setPaymentDetail(detailObj);
                        toast.success(`🎉 Thanh toán thành công: ${(detailObj.amount || currentPaid || 0).toLocaleString('vi-VN')} đ - Nội dung: ${detailObj.noiDung || activeMaHopDong}`, {
                            duration: 5000
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

    // Auto close timer when payment is received
    useEffect(() => {
        let interval = null;
        if (paymentReceived) {
            setCountdown(3);
            interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        if (onClose) onClose();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [paymentReceived, onClose]);

    useEffect(() => {
        const handleSocketPayment = (paymentData) => {
            const cleanSocketMa = (paymentData?.maHopDong || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
            const cleanActiveMa = (activeMaHopDong || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
            
            const isSameHopDong = cleanSocketMa === cleanActiveMa && cleanActiveMa.length > 0;
            const isFreshSession = paymentData?.timestamp >= (sessionStartTime - 5000);
            const isMatchingSessionCode = !paymentData?.sessionId || !sessionCode || paymentData.sessionId === sessionCode;

            if (isSameHopDong && isFreshSession && isMatchingSessionCode) {
                console.log("⚡ [WebSocket Event] Received real-time payment success:", paymentData);
                const finalDetail = paymentData.latestPayment || {
                    amount: paymentData.amount,
                    method: 'Chuyển khoản (VietQR SePay)',
                    noiDung: qrData?.transferContent || `Thanh toán SePay ${paymentData.maHopDong}`
                };
                setPaymentReceived(true);
                setPaymentDetail(finalDetail);
                toast.success(`🎉 Thanh toán thành công: ${(finalDetail.amount || 0).toLocaleString('vi-VN')} đ - Nội dung: ${finalDetail.noiDung || activeMaHopDong}`, {
                    duration: 5000
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
            setPaymentTab(0);
            setCashNote(`Thanh toán hợp đồng ${activeMaHopDong}`);
            setCustomAmount(defaultAmount);
            setCountdown(3);
            initialPaymentCountRef.current = null;
            initialPaidAmountRef.current = null;
            
            fetchQrInfo(defaultAmount);

            // Connect WebSocket when starting payment dialog
            if (!paymentSocket.connected) {
                paymentSocket.connect();
            }
            paymentSocket.emit('join_contract', { maHopDong: activeMaHopDong });
            paymentSocket.on('payment_success', handleSocketPayment);

            pollingTimerRef.current = setInterval(() => {
                checkStatus();
            }, 3000);
        } else {
            if (pollingTimerRef.current) {
                clearInterval(pollingTimerRef.current);
            }
        }

        return () => {
            paymentSocket.emit('leave_contract', { maHopDong: activeMaHopDong });
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

    const handleCopy = (text, label) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`Đã sao chép ${label}: ${text}`);
    };

    const handleAmountChange = (e) => {
        const val = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
        setCustomAmount(val);
    };

    const handleApplyCustomAmount = (newAmount) => {
        const amt = newAmount !== undefined ? newAmount : customAmount;
        setCustomAmount(amt);
        fetchQrInfo(amt);
    };

    const handleQuickPercent = (percent) => {
        const base = defaultAmount || customAmount || 0;
        const calculated = Math.round((base * (percent / 100)) / 1000) * 1000;
        setCustomAmount(calculated);
        fetchQrInfo(calculated);
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

    const handleConfirmCashPayment = async () => {
        if (!activeMaHopDong) return;
        const payAmt = Number(customAmount) || 0;
        if (payAmt <= 0) {
            toast.warning("Vui lòng nhập số tiền thanh toán hợp lệ!");
            return;
        }
        setSavingCash(true);
        try {
            let contract = data;
            if (!contract || !contract._id) {
                const resSearch = await appService.SEARCH_HOPDONG({ maHopDong: activeMaHopDong });
                const list = resSearch.data?.hopDong || [];
                contract = list.find(h => h.maHopDong === activeMaHopDong) || list[0];
            }
            if (!contract) {
                toast.error("Không tìm thấy thông tin hợp đồng để ghi nhận thanh toán!");
                return;
            }

            const existingPayments = contract.thanhToan?.cacLuotThanhToan || [];
            const newPaymentItem = {
                id: `TM_${activeMaHopDong}_${Date.now()}`,
                amount: payAmt,
                method: "Tiền mặt",
                noiDung: cashNote || `Thanh toán tiền mặt ${activeMaHopDong}`,
                date: new Date().toISOString(),
                khachHang: contract.khachHang1?.tenKhachHang || "Khách hàng"
            };

            const updatedPayments = [...existingPayments, newPaymentItem];

            await appService.UPDATE_HOPDONG({
                _id: contract._id,
                maHopDong: activeMaHopDong,
                thanhToan: {
                    ...contract.thanhToan,
                    cacLuotThanhToan: updatedPayments
                }
            });

            const detailObj = {
                amount: payAmt,
                method: 'Tiền mặt',
                noiDung: newPaymentItem.noiDung
            };

            setPaymentReceived(true);
            setPaymentDetail(detailObj);
            toast.success(`🎉 Đã ghi nhận thu tiền mặt thành công: ${payAmt.toLocaleString('vi-VN')} đ`);

            if (onSuccess) {
                onSuccess({
                    latestPayment: newPaymentItem,
                    khachHangDaThanhToan: (contract.thanhToan?.khachHangDaThanhToan || 0) + payAmt
                });
            }
        } catch (err) {
            console.error("Lỗi khi ghi nhận tiền mặt:", err);
            toast.error("Có lỗi xảy ra khi ghi nhận tiền mặt!");
        } finally {
            setSavingCash(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            className="sp-dialog-root"
            PaperProps={{
                className: "sp-dialog-paper"
            }}
        >
            {/* 1. HEADER */}
            <div className="sp-header">
                <div className="sp-header-left">
                    <div className="sp-header-icon">
                        <BoltIcon />
                    </div>
                    <div>
                        <h3 className="sp-header-title">
                            Thanh Toán Hợp Đồng
                            <span className="sp-header-badge">{activeMaHopDong}</span>
                        </h3>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tooltip title="Cấu hình tài khoản ngân hàng SePay">
                        <IconButton
                            size="small"
                            onClick={() => setShowConfigEdit(!showConfigEdit)}
                            style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.08)' }}
                        >
                            <SettingsIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.08)' }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>
            </div>

            <DialogContent style={{ background: '#f8fafc', padding: '18px 22px' }}>
                {/* 2. MODERN SEGMENTED TABS */}
                {!paymentReceived && (
                    <div className="sp-tabs-container">
                        <button
                            type="button"
                            className={`sp-tab-btn ${paymentTab === 0 ? 'active' : ''}`}
                            onClick={() => setPaymentTab(0)}
                        >
                            <AccountBalanceIcon style={{ fontSize: 18 }} />
                            <span>Quét VietQR SePay (Tự Động)</span>
                        </button>
                        <button
                            type="button"
                            className={`sp-tab-btn cash ${paymentTab === 1 ? 'active cash' : ''}`}
                            onClick={() => setPaymentTab(1)}
                        >
                            <PaymentsIcon style={{ fontSize: 18 }} />
                            <span>Thu Tiền Mặt Trực Tiếp</span>
                        </button>
                    </div>
                )}

                {/* Bank Config Edit Drawer */}
                {showConfigEdit && (
                    <Paper elevation={0} style={{ padding: 16, borderRadius: 14, marginBottom: 16, border: '1.5px solid #0284c7', background: '#ffffff' }}>
                        <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0369a1', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            ⚙️ Thiết Lập Tài Khoản Ngân Hàng Nhận Tiền
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
                                    style={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 600, textTransform: 'none' }}
                                >
                                    {savingConfig ? "Đang lưu..." : "Lưu tài khoản"}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                )}

                {/* 3. MAIN CONTENT */}
                {paymentReceived ? (
                    /* SCREEN: THANH TOÁN THÀNH CÔNG */
                    <Box style={{ textAlign: 'center', padding: '28px 16px', background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)', borderRadius: 16 }}>
                        <Box style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 76, height: 76, borderRadius: '50%', background: '#dcfce7', border: '3px solid #86efac', marginBottom: 14, boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.3)' }}>
                            <CheckCircleIcon style={{ fontSize: 50, color: '#16a34a' }} />
                        </Box>

                        <Typography variant="h5" style={{ fontWeight: 800, color: '#15803d', marginBottom: 6, fontSize: '1.45rem' }}>
                            THANH TOÁN THÀNH CÔNG!
                        </Typography>

                        <Chip
                            label="⚡ Đã ghi nhận & gạch nợ hợp đồng thành công"
                            color="success"
                            style={{ fontWeight: 700, marginBottom: 18, padding: '4px 8px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontSize: 13 }}
                        />

                        <Paper elevation={0} style={{ padding: 20, borderRadius: 16, background: '#ffffff', border: '1.5px solid #bbf7d0', maxWidth: 440, margin: '0 auto', textAlign: 'left', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.04)' }}>
                            {/* Số tiền */}
                            <Box style={{ textAlign: 'center', paddingBottom: 12, marginBottom: 12, borderBottom: '1.5px dashed #e2e8f0' }}>
                                <Typography variant="caption" style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, fontSize: '0.74rem' }}>
                                    Số tiền thanh toán
                                </Typography>
                                <Typography variant="h4" style={{ color: '#15803d', fontWeight: 900, fontSize: 28, marginTop: 4 }}>
                                    {(paymentDetail?.amount || customAmount || 0).toLocaleString('vi-VN')} <span style={{ fontSize: 16 }}>đ</span>
                                </Typography>
                            </Box>

                            {/* Thông tin chi tiết */}
                            <Box style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" style={{ color: '#64748b', fontSize: '0.82rem' }}>Mã Hợp Đồng:</Typography>
                                    <Typography variant="subtitle2" style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.86rem' }}>{activeMaHopDong}</Typography>
                                </Box>
                                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" style={{ color: '#64748b', fontSize: '0.82rem' }}>Nội dung:</Typography>
                                    <Typography variant="body2" style={{ color: '#1e40af', fontWeight: 700, fontStyle: 'italic', fontSize: '0.84rem' }}>
                                        {paymentDetail?.noiDung || qrData?.transferContent || `Thanh toán ${activeMaHopDong}`}
                                    </Typography>
                                </Box>
                                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" style={{ color: '#64748b', fontSize: '0.82rem' }}>Phương thức:</Typography>
                                    <Typography variant="subtitle2" style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.84rem' }}>
                                        {paymentDetail?.method || 'Chuyển khoản (VietQR SePay)'}
                                    </Typography>
                                </Box>
                                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
                                    <Typography variant="caption" style={{ color: '#94a3b8' }}>Thời gian ghi nhận:</Typography>
                                    <Typography variant="caption" style={{ color: '#64748b', fontWeight: 600 }}>{new Date().toLocaleString('vi-VN')}</Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Đếm ngược tự động đóng */}
                        <Box style={{ marginTop: 14 }}>
                            <Typography variant="body2" style={{ color: '#059669', fontWeight: 600, fontSize: '0.84rem' }}>
                                ⏱️ Cửa sổ sẽ tự động đóng sau <strong>{countdown}</strong> giây...
                            </Typography>
                        </Box>
                    </Box>
                ) : paymentTab === 1 ? (
                    /* SCREEN: THU TIỀN MẶT */
                    <div className="sp-cash-card">
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                                <PaymentsIcon fontSize="small" />
                            </div>
                            <div>
                                <Typography variant="subtitle1" style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.96rem' }}>
                                    Phiếu Thu Tiền Mặt Trực Tiếp
                                </Typography>
                                <Typography variant="caption" style={{ color: '#64748b' }}>
                                    Hợp đồng: <strong>{activeMaHopDong}</strong> • Khách hàng: <strong>{data?.khachHang1?.tenKhachHang || 'Khách hàng'}</strong>
                                </Typography>
                            </div>
                        </Box>

                        <Box style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                    SỐ TIỀN THU (VNĐ)
                                </label>
                                <TextField
                                    size="small"
                                    fullWidth
                                    variant="outlined"
                                    value={(customAmount || 0).toLocaleString('vi-VN')}
                                    onChange={handleAmountChange}
                                    style={{ background: '#ffffff' }}
                                    inputProps={{ style: { fontSize: '1.2rem', fontWeight: 800, color: '#15803d' } }}
                                />
                                {/* Quick Percentage Chips */}
                                <div className="sp-quick-chips">
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center', marginRight: 4 }}>Chọn nhanh:</span>
                                    <button type="button" className="sp-chip-btn" onClick={() => handleQuickPercent(100)}>100% (Đủ)</button>
                                    <button type="button" className="sp-chip-btn" onClick={() => handleQuickPercent(50)}>50% (Cọc)</button>
                                    <button type="button" className="sp-chip-btn" onClick={() => handleQuickPercent(30)}>30% (Cọc)</button>
                                    <button type="button" className="sp-chip-btn" onClick={() => handleQuickPercent(20)}>20% (Cọc)</button>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                    GHI CHÚ / NỘI DUNG THU
                                </label>
                                <TextField
                                    size="small"
                                    fullWidth
                                    variant="outlined"
                                    value={cashNote}
                                    onChange={(e) => setCashNote(e.target.value)}
                                    placeholder="Thanh toán tiền mặt..."
                                    style={{ background: '#ffffff' }}
                                />
                            </div>

                            <Button
                                variant="contained"
                                color="success"
                                size="large"
                                disabled={savingCash || Number(customAmount) <= 0}
                                onClick={handleConfirmCashPayment}
                                startIcon={<CheckCircleIcon />}
                                style={{
                                    height: 44,
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    fontSize: '0.94rem',
                                    borderRadius: 10,
                                    backgroundColor: '#16a34a',
                                    marginTop: 8,
                                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                                }}
                            >
                                {savingCash ? "Đang ghi nhận..." : `Xác Nhận Đã Thu ${(Number(customAmount) || 0).toLocaleString('vi-VN')} đ (Tiền Mặt)`}
                            </Button>
                        </Box>
                    </div>
                ) : (
                    /* SCREEN: QUÉT MÃ VIETQR (BENTO GRID) */
                    loading ? (
                        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 50 }}>
                            <CircularProgress size={42} style={{ color: '#0284c7', marginBottom: 14 }} />
                            <Typography variant="body2" style={{ color: '#64748b', fontSize: '0.86rem' }}>
                                Đang khởi tạo mã QR thanh toán VietQR SePay...
                            </Typography>
                        </Box>
                    ) : (
                        <div>
                            <div className="sp-bento-grid">
                                {/* CỘT 1 (BÊN TRÁI): KHUNG QUÉT QR */}
                                <div className="sp-qr-card">
                                    <div className="sp-qr-badge-top">
                                        <span>⚡</span>
                                        <span>VietQR 2.0 • NAPAS 247</span>
                                    </div>

                                    {qrData?.accountNumber && (qrData?.vietQrUrl || qrData?.sepayQrUrl) ? (
                                        <div className="sp-qr-wrapper">
                                            <img
                                                src={qrData.vietQrUrl || qrData.sepayQrUrl}
                                                alt="VietQR SePay Payment"
                                                className="sp-qr-img"
                                                onError={(e) => {
                                                    if (qrData.sepayQrUrl && e.target.src !== qrData.sepayQrUrl) {
                                                        e.target.src = qrData.sepayQrUrl;
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <Box style={{ width: 260, height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: 12, margin: '0 auto' }}>
                                            <QrCode2Icon style={{ fontSize: 44, color: '#94a3b8', marginBottom: 6 }} />
                                            <Typography variant="caption" style={{ color: '#64748b', fontWeight: 600 }}>
                                                Chưa cấu hình tài khoản
                                            </Typography>
                                            <Button size="small" onClick={() => setShowConfigEdit(true)} style={{ marginTop: 4, fontSize: 11, color: '#0284c7', textTransform: 'none' }}>
                                                Thêm STK
                                            </Button>
                                        </Box>
                                    )}

                                    {/* Live Pulse Status */}
                                    <div className="sp-pulse-status">
                                        <div className="sp-pulse-dot"></div>
                                        <span>Đang chờ chuyển khoản tự động...</span>
                                    </div>

                                    {/* Action Buttons under QR */}
                                    <div className="sp-qr-actions">
                                        <button
                                            type="button"
                                            className="sp-btn-subtle"
                                            onClick={handleDownloadQr}
                                        >
                                            <DownloadIcon style={{ fontSize: 14 }} />
                                            <span>Tải ảnh QR</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="sp-btn-subtle"
                                            onClick={() => checkStatus(true)}
                                            style={{ color: '#059669', borderColor: '#a7f3d0', background: '#f0fdf4' }}
                                        >
                                            <RefreshIcon style={{ fontSize: 14 }} />
                                            <span>Kiểm tra</span>
                                        </button>
                                    </div>
                                </div>

                                {/* CỘT 2 (BÊN PHẢI): BENTO INFO CARDS */}
                                <div className="sp-info-column">
                                    {/* 1. Số tiền thanh toán */}
                                    <div className="sp-info-card primary">
                                        <div>
                                            <div className="sp-label-sub" style={{ color: '#166534' }}>Số tiền thanh toán</div>
                                            <div className="sp-val-main" style={{ color: '#15803d', fontSize: '1.25rem' }}>
                                                {(customAmount || 0).toLocaleString('vi-VN')} đ
                                            </div>
                                        </div>
                                        <Tooltip title="Sao chép số tiền">
                                            <button
                                                type="button"
                                                className="sp-copy-btn"
                                                onClick={() => handleCopy(customAmount.toString(), 'Số tiền')}
                                                style={{ color: '#16a34a', borderColor: '#bbf7d0', background: '#ffffff' }}
                                            >
                                                <ContentCopyIcon style={{ fontSize: 16 }} />
                                            </button>
                                        </Tooltip>
                                    </div>

                                    {/* 2. Nội dung chuyển khoản */}
                                    <div className="sp-info-card accent">
                                        <div style={{ overflow: 'hidden' }}>
                                            <div className="sp-label-sub" style={{ color: '#1e40af' }}>Nội dung chuyển khoản (Bắt buộc)</div>
                                            <div className="sp-val-main" style={{ color: '#1d4ed8', letterSpacing: '0.5px' }}>
                                                {qrData?.transferContent || activeMaHopDong}
                                            </div>
                                        </div>
                                        <Tooltip title="Sao chép nội dung">
                                            <button
                                                type="button"
                                                className="sp-copy-btn"
                                                onClick={() => handleCopy(qrData?.transferContent || activeMaHopDong, 'Nội dung')}
                                                style={{ color: '#1d4ed8', borderColor: '#bfdbfe', background: '#ffffff' }}
                                            >
                                                <ContentCopyIcon style={{ fontSize: 16 }} />
                                            </button>
                                        </Tooltip>
                                    </div>

                                    {/* 3. Số tài khoản & Chủ TK */}
                                    <div className="sp-info-card">
                                        <div style={{ overflow: 'hidden' }}>
                                            <div className="sp-label-sub">
                                                {qrData?.bankName || 'MBBank'} • Số tài khoản
                                            </div>
                                            <div className="sp-val-main" style={{ color: '#0284c7', fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                                                {qrData?.accountNumber || 'Chưa thiết lập'}
                                            </div>
                                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 1 }}>
                                                Chủ TK: <strong style={{ color: '#334155' }}>{qrData?.accountName || 'LONG WEDDING'}</strong>
                                            </div>
                                        </div>
                                        {qrData?.accountNumber && (
                                            <Tooltip title="Sao chép số tài khoản">
                                                <button
                                                    type="button"
                                                    className="sp-copy-btn"
                                                    onClick={() => handleCopy(qrData?.accountNumber || '', 'Số tài khoản')}
                                                >
                                                    <ContentCopyIcon style={{ fontSize: 16 }} />
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>

                                    {/* 4. Tùy chỉnh số tiền muốn chuyển */}
                                    <Paper elevation={0} style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                                                Chỉnh số tiền cọc / thanh toán:
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <TextField
                                                size="small"
                                                variant="outlined"
                                                value={(customAmount || 0).toLocaleString('vi-VN')}
                                                onChange={handleAmountChange}
                                                style={{ flex: 1, background: '#ffffff' }}
                                                inputProps={{ style: { fontSize: '0.88rem', fontWeight: 700 } }}
                                            />
                                            <Button
                                                variant="contained"
                                                onClick={() => handleApplyCustomAmount(customAmount)}
                                                style={{ height: 38, backgroundColor: '#0284c7', color: '#fff', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', borderRadius: 8, px: 2 }}
                                            >
                                                Cập nhật QR
                                            </Button>
                                        </div>

                                        {/* Quick percentage shortcuts */}
                                        <div className="sp-quick-chips">
                                            <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center' }}>Chọn nhanh:</span>
                                            <button type="button" className="sp-chip-btn" onClick={() => handleQuickPercent(100)}>100% Đủ</button>
                                            <button type="button" className="sp-chip-btn" onClick={() => handleQuickPercent(50)}>50% Cọc</button>
                                            <button type="button" className="sp-chip-btn" onClick={() => handleQuickPercent(30)}>30% Cọc</button>
                                            <button type="button" className="sp-chip-btn" onClick={() => handleQuickPercent(20)}>20% Cọc</button>
                                        </div>
                                    </Paper>
                                </div>
                            </div>

                            {/* Alert footer */}
                            <div className="sp-tip-banner">
                                <span style={{ fontSize: '1rem' }}>💡</span>
                                <span>Khi khách hàng chuyển khoản thành công trên app ngân hàng, hệ thống sẽ tự động xác nhận, hiển thị thông báo và đóng cửa sổ này.</span>
                            </div>
                        </div>
                    )
                )}
            </DialogContent>

            <DialogActions style={{ padding: '12px 22px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                {paymentReceived ? (
                    <Button
                        variant="contained"
                        color="success"
                        onClick={onClose}
                        style={{ borderRadius: 9, fontWeight: 700, padding: '7px 22px', textTransform: 'none', backgroundColor: '#16a34a' }}
                    >
                        Đóng ngay ({countdown}s)
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        style={{ borderRadius: 9, color: '#64748b', borderColor: '#cbd5e1', textTransform: 'none', fontWeight: 600 }}
                    >
                        Đóng
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
