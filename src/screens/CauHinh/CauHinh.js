import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    IconButton,
    Chip,
    Avatar,
    Stack,
    Divider,
    Card,
    CardContent,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    LinearProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LockResetIcon from '@mui/icons-material/LockReset';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyIcon from '@mui/icons-material/Key';
import SecurityIcon from '@mui/icons-material/Security';
import DialpadIcon from '@mui/icons-material/Dialpad';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { toast } from 'sonner';
import { useAuth } from '../Login/AuthContext/AuthContext';
import otherService from '../../API/services/otherService';
import logo from '../../assets/logo/logo-vang.png';
import { getEmployeeAwards } from '../../utils/awardHelper';
import {
    savePinSession,
    getSavedPinUser,
    clearPinSession,
    verifyPinAndGetSession
} from '../../utils/pinAuthUtils';
import {
    getContractPrintConfig,
    saveContractPrintConfig,
    resetContractPrintConfig,
    getLoanReceiptPrintConfig,
    saveLoanReceiptPrintConfig,
    resetLoanReceiptPrintConfig,
    generateContractPrintHtml,
    generateLoanReceiptPrintHtml
} from '../../utils/printConfigHelper';
import './cauhinh.css';
import ContractTemplateDesigner, { SAMPLE_CONTRACT_DATA } from './ContractTemplateDesigner';

function CauHinh() {
    const { user } = useAuth();

    // Thông tin user & KPI
    const [userProfileData, setUserProfileData] = useState(null);
    const [userStats, setUserStats] = useState(null);

    // Kiểm tra quyền Quản trị viên / Quản lý
    const isAdmin = user?.permission === 1 || 
                    userProfileData?.permission === 1 || 
                    user?.positon === "Quản lý" || 
                    userProfileData?.positon === "Quản lý" || 
                    user?.chucVu === "Quản lý" || 
                    user?.role === "ADMIN" || 
                    user?.username === "along";

    const [activeTab, setActiveTab] = useState(() => {
        const isAdm = user?.permission === 1 || 
                      user?.positon === "Quản lý" || 
                      user?.chucVu === "Quản lý" || 
                      user?.role === "ADMIN" || 
                      user?.username === "along";
        return isAdm ? 'contract_print' : 'account'; // 'general' | 'contract_print' | 'loan_receipt_print' | 'account'
    });

    // Tự động chuyển về tab 'account' nếu nhân viên không có quyền truy cập các tab cấu hình hệ thống
    useEffect(() => {
        if (!isAdmin && (activeTab === 'contract_print' || activeTab === 'loan_receipt_print' || activeTab === 'general')) {
            setActiveTab('account');
        }
    }, [isAdmin, activeTab]);

    // Dữ liệu cấu hình in Hợp đồng
    const [contractConfig, setContractConfig] = useState(getContractPrintConfig());

    // Dữ liệu cấu hình in Phiếu mượn / trả đồ
    const [loanConfig, setLoanConfig] = useState(getLoanReceiptPrintConfig());

    // Preset Avatars
    const PRESET_AVATARS = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80"
    ];

    // Avatar Dialog State
    const [openAvatarDialog, setOpenAvatarDialog] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarUrlInput, setAvatarUrlInput] = useState('');
    const [activePresetIndex, setActivePresetIndex] = useState(null);

    // Edit Profile State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        fullname: '',
        phone: '',
        birthday: ''
    });

    // Password State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPass, setShowPass] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isSavingPass, setIsSavingPass] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingAvatar, setIsSavingAvatar] = useState(false);

    // Term input tạm
    const [newLoanTerm, setNewLoanTerm] = useState('');
    const [newReturnTerm, setNewReturnTerm] = useState('');

    // PIN State & Handlers
    const [savedPinUser, setSavedPinUser] = useState(() => getSavedPinUser());
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [pinModalStep, setPinModalStep] = useState(1); // 1: Old PIN verify (if exists), 2: Enter new PIN, 3: Confirm new PIN
    const [oldPinInput, setOldPinInput] = useState('');
    const [newPinInput, setNewPinInput] = useState('');
    const [confirmPinInput, setConfirmPinInput] = useState('');
    const [pinModalError, setPinModalError] = useState('');

    // Thời gian tự động khóa màn hình (phút, 0 = tắt)
    const [autoLockTimeout, setAutoLockTimeout] = useState(() => {
        return localStorage.getItem('lw_autolock_timeout') || '0';
    });

    const handleAutoLockTimeoutChange = (val) => {
        setAutoLockTimeout(val);
        localStorage.setItem('lw_autolock_timeout', val);
        if (val === '0') {
            toast.info("Đã tắt tự động khóa màn hình.");
        } else {
            toast.success(`Đã lưu: Tự động khóa màn hình sau ${val} phút không hoạt động!`);
        }
    };

    const handleOpenPinModal = () => {
        const currentSaved = getSavedPinUser();
        setSavedPinUser(currentSaved);
        setOldPinInput('');
        setNewPinInput('');
        setConfirmPinInput('');
        setPinModalError('');
        setPinModalStep(currentSaved ? 1 : 2);
        setPinModalOpen(true);
    };

    const handleVerifyOldPin = async () => {
        setPinModalError('');
        if (oldPinInput.length !== 6) {
            setPinModalError("Vui lòng nhập đủ 6 số mã PIN hiện tại!");
            return;
        }
        try {
            await verifyPinAndGetSession(oldPinInput);
            setPinModalStep(2);
        } catch (err) {
            setPinModalError(err.message || "Mã PIN cũ không chính xác!");
        }
    };

    const handleSaveNewPin = async () => {
        setPinModalError('');
        if (newPinInput.length !== 6) {
            setPinModalError("Mã PIN mới phải có đúng 6 chữ số!");
            return;
        }
        if (newPinInput !== confirmPinInput) {
            setPinModalError("Mã PIN xác nhận không khớp. Vui lòng nhập lại!");
            return;
        }

        const token = localStorage.getItem('access_token');
        const sessionData = {
            token,
            user: userProfileData || user
        };

        const username = user?.username || userProfileData?.username || 'user';
        const ok = await savePinSession(username, newPinInput, sessionData);
        if (ok) {
            toast.success("Cài đặt mã PIN đăng nhập nhanh thành công!");
            setSavedPinUser(getSavedPinUser());
            setPinModalOpen(false);
        } else {
            setPinModalError("Có lỗi xảy ra khi lưu mã PIN. Vui lòng thử lại!");
        }
    };

    const handleDisablePin = () => {
        if (window.confirm("Bạn có chắc chắn muốn tắt và xóa mã PIN đăng nhập nhanh trên thiết bị này?")) {
            clearPinSession();
            setSavedPinUser(null);
            toast.info("Đã tắt và xóa mã PIN đăng nhập nhanh trên thiết bị này.");
        }
    };

    useEffect(() => {
        if (user) {
            otherService.findUsers({})
                .then(res => {
                    const list = res.data?.users || res.data || [];
                    if (Array.isArray(list)) {
                        const found = list.find(u =>
                            (u.username && u.username.toLowerCase() === user?.username?.toLowerCase()) ||
                            (u._id && user._id && u._id.toString() === user._id.toString())
                        );
                        if (found) setUserProfileData(found);
                    }
                })
                .catch(err => console.error("Lỗi lấy thông tin user:", err));

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
                .catch(err => console.error("Lỗi lấy thống kê thi đua:", err));
        }
    }, [user]);

    // Mở Dialog Avatar
    const handleOpenAvatarModal = () => {
        setAvatarPreview(userProfileData?.avatar || user?.avatar || '');
        setAvatarUrlInput('');
        setActivePresetIndex(null);
        setOpenAvatarDialog(true);
    };

    // Upload file ảnh đại diện từ máy tính
    const handleAvatarFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error("Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP)");
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 260;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = Math.round(height * (MAX_SIZE / width));
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width = Math.round(width * (MAX_SIZE / height));
                        height = MAX_SIZE;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.88);
                setAvatarPreview(compressedBase64);
                setActivePresetIndex(null);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Lưu ảnh đại diện
    const handleSaveAvatar = () => {
        const targetAvatar = avatarUrlInput.trim() || avatarPreview;
        if (!targetAvatar) {
            toast.warning("Vui lòng chọn ảnh đại diện!");
            return;
        }

        setIsSavingAvatar(true);
        otherService.updateUser({
            username: user.username,
            avatar: targetAvatar
        })
        .then(() => {
            toast.success("Cập nhật ảnh đại diện thành công!");
            setUserProfileData(prev => ({ ...prev, avatar: targetAvatar }));
            const stored = localStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.avatar = targetAvatar;
                localStorage.setItem('user', JSON.stringify(parsed));
            }
            setOpenAvatarDialog(false);
        })
        .catch(err => {
            console.error(err);
            toast.error("Không thể cập nhật ảnh: " + (err.response?.data?.message || err.message));
        })
        .finally(() => setIsSavingAvatar(false));
    };

    // Mở Form chỉnh sửa thông tin cá nhân
    const handleStartEditProfile = () => {
        setProfileForm({
            fullname: userProfileData?.fullname || user?.fullname || '',
            phone: userProfileData?.phone || userProfileData?.soDienThoai || '',
            birthday: userProfileData?.birthday || ''
        });
        setIsEditingProfile(true);
    };

    // Lưu thông tin cá nhân
    const handleSaveProfile = () => {
        if (!profileForm.fullname.trim()) {
            toast.warning("Họ và tên không được để trống!");
            return;
        }

        setIsSavingProfile(true);
        otherService.updateUser({
            username: user.username,
            fullname: profileForm.fullname.trim(),
            birthday: profileForm.birthday.trim(),
            phone: profileForm.phone.trim()
        })
        .then(() => {
            toast.success("Cập nhật thông tin tài khoản thành công!");
            setUserProfileData(prev => ({
                ...prev,
                fullname: profileForm.fullname.trim(),
                birthday: profileForm.birthday.trim(),
                phone: profileForm.phone.trim()
            }));
            const stored = localStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.fullname = profileForm.fullname.trim();
                parsed.birthday = profileForm.birthday.trim();
                parsed.phone = profileForm.phone.trim();
                localStorage.setItem('user', JSON.stringify(parsed));
            }
            setIsEditingProfile(false);
        })
        .catch(err => {
            console.error(err);
            toast.error("Cập nhật thất bại: " + (err.response?.data?.message || err.message));
        })
        .finally(() => setIsSavingProfile(false));
    };

    // Đổi mật khẩu
    const handleChangePassword = () => {
        if (!passwordForm.newPassword) {
            toast.warning("Vui lòng nhập mật khẩu mới!");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Xác nhận mật khẩu mới không trùng khớp!");
            return;
        }

        setIsSavingPass(true);
        otherService.updateUser({
            username: user.username,
            password: passwordForm.newPassword
        })
        .then(() => {
            toast.success("Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.");
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        })
        .catch(err => {
            console.error(err);
            toast.error("Đổi mật khẩu thất bại: " + (err.response?.data?.message || err.message));
        })
        .finally(() => setIsSavingPass(false));
    };

    // ==== Xử lý lưu cấu hình Hợp đồng ====
    const handleSaveContractConfig = () => {
        const ok = saveContractPrintConfig(contractConfig);
        if (ok) {
            toast.success("Đã lưu cấu hình mẫu in hợp đồng thành công!");
        } else {
            toast.error("Lỗi khi lưu cấu hình!");
        }
    };

    const handleResetContractConfig = () => {
        const def = resetContractPrintConfig();
        setContractConfig(def);
        toast.info("Đã khôi phục mẫu in hợp đồng về mặc định.");
    };

    // ==== Xử lý lưu cấu hình Phiếu mượn / trả đồ ====
    const handleSaveLoanConfig = () => {
        const ok = saveLoanReceiptPrintConfig(loanConfig);
        if (ok) {
            toast.success("Đã lưu cấu hình mẫu in phiếu mượn/trả đồ thành công!");
        } else {
            toast.error("Lỗi khi lưu cấu hình!");
        }
    };

    const handleResetLoanConfig = () => {
        const def = resetLoanReceiptPrintConfig();
        setLoanConfig(def);
        toast.info("Đã khôi phục mẫu in phiếu mượn/trả về mặc định.");
    };

    const handleAddLoanTerm = () => {
        if (!newLoanTerm.trim()) return;
        setLoanConfig(prev => ({
            ...prev,
            loanTerms: [...prev.loanTerms, newLoanTerm.trim()]
        }));
        setNewLoanTerm('');
    };

    const handleDeleteLoanTerm = (index) => {
        setLoanConfig(prev => ({
            ...prev,
            loanTerms: prev.loanTerms.filter((_, i) => i !== index)
        }));
    };

    const handleAddReturnTerm = () => {
        if (!newReturnTerm.trim()) return;
        setLoanConfig(prev => ({
            ...prev,
            returnTerms: [...prev.returnTerms, newReturnTerm.trim()]
        }));
        setNewReturnTerm('');
    };

    const handleDeleteReturnTerm = (index) => {
        setLoanConfig(prev => ({
            ...prev,
            returnTerms: prev.returnTerms.filter((_, i) => i !== index)
        }));
    };

    // ==== IN THỬ NGHIỆM MẪU HỢP ĐỒNG ====
    const handleTestPrintContract = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Trình duyệt đang chặn cửa sổ pop-up. Vui lòng cho phép để in.");
            return;
        }

        const html = generateContractPrintHtml(SAMPLE_CONTRACT_DATA, contractConfig);
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
    };

    // ==== IN THỬ NGHIỆM MẪU PHIẾU MƯỢN ĐỒ ====
    const handleTestPrintLoanReceipt = (isReturn = false) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Trình duyệt đang chặn cửa sổ pop-up. Vui lòng cho phép để in.");
            return;
        }

        const sampleData = {
            maHopDong: 'HD-2025-DEMO',
            ngayLapFormatted: '18/08/2025',
            tenKhachHang1: 'Nguyễn Thị Hoa',
            tenKhachHang2: 'Trần Văn Long',
            soDienThoai1: '0988.123.456',
            soDienThoai2: '0977.654.321',
            ngayMuonFormatted: '20/09/2025 09:00',
            ngayTraFormatted: isReturn ? '25/09/2025 15:30' : '25/09/2025 17:00',
            nguoiKiem: 'Nhân viên Long Wedding',
            datCoc: 2000000,
            noiDung: isReturn ? 'Khách đã hoàn tất trả đồ và nhận lại cọc' : 'Đồ bàn giao kèm vali, móc treo, lúp cài đầu',
            items: [
                { maDichVu: 'VC-LUX-01', tenDichVu: 'Váy cưới Luxury Hoàng Gia Xòe Bồng Kim Tuyến', isThueThem: false, tienNangCap: 0, soLuong: 1, ghiChu: 'Kèm vali + lúp + găng tay + vương miện' },
                { maDichVu: 'VE-HAN-02', tenDichVu: 'Vest chú rể phong cách Hàn Quốc Đen Cao Cấp', isThueThem: false, tienNangCap: 0, soLuong: 1, ghiChu: 'Kèm nơ cổ + sơ mi trắng' },
                { maDichVu: 'AD-DO-05', tenDichVu: 'Áo dài cưới đôi Long Phụng Sum Vầy', isThueThem: true, donGiaThue: 500000, tienNangCap: 500000, soLuong: 1, ghiChu: 'Đầy đủ mấn đội đầu cô dâu & chú rể' }
            ]
        };

        const html = generateLoanReceiptPrintHtml(sampleData, isReturn, loanConfig);
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    };

    return (
        <div className="cauhinh-page-container">
            {/* Header chung của trang Cấu hình */}
            <div className="cauhinh-page-header">
                <div className="cauhinh-header-left">
                    <h1 className="cauhinh-main-title">
                        <i className="fa-solid fa-sliders" style={{ marginRight: 10, color: '#0284c7' }}></i>
                        HỆ THỐNG CẤU HÌNH & THIẾT LẬP
                    </h1>
                    <p className="cauhinh-subtitle">
                        {isAdmin 
                            ? "Tùy biến mẫu in hợp đồng, phiếu mượn/trả đồ và quản lý tài khoản studio" 
                            : "Quản lý thông tin tài khoản cá nhân, mật khẩu & chỉ tiêu KPI"}
                    </p>
                </div>
            </div>

            {/* Layout 2 cột: Menu dọc bên trái + Nội dung cấu hình bên phải */}
            <div className="cauhinh-layout-body">
                {/* 1. Thanh menu dọc (Vertical Sub-menu) */}
                <aside className="cauhinh-vertical-menu">
                    <div className="cauhinh-menu-header">
                        <i className="fa-solid fa-list-check"></i>
                        <span>DANH MỤC CẤU HÌNH</span>
                    </div>
                    <ul className="cauhinh-menu-list">
                        {/* Các tab chỉ dành riêng cho Quản lý / Admin */}
                        {isAdmin && (
                            <>
                                <li
                                    className={`cauhinh-menu-item ${activeTab === 'contract_print' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('contract_print')}
                                >
                                    <span className="cauhinh-menu-icon" style={{ color: '#38bdf8' }}>
                                        <i className="fa-solid fa-file-contract"></i>
                                    </span>
                                    <div className="cauhinh-menu-text">
                                        <div className="cauhinh-menu-title">Mẫu in Hợp đồng</div>
                                        <div className="cauhinh-menu-desc">Tùy biến tiêu đề, điều khoản & cam kết</div>
                                    </div>
                                </li>

                                <li
                                    className={`cauhinh-menu-item ${activeTab === 'loan_receipt_print' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('loan_receipt_print')}
                                >
                                    <span className="cauhinh-menu-icon" style={{ color: '#fb923c' }}>
                                        <i className="fa-solid fa-receipt"></i>
                                    </span>
                                    <div className="cauhinh-menu-text">
                                        <div className="cauhinh-menu-title">Mẫu in Mượn/Trả đồ</div>
                                        <div className="cauhinh-menu-desc">Phiếu bàn giao & tiếp nhận trang phục</div>
                                    </div>
                                </li>

                                <li
                                    className={`cauhinh-menu-item ${activeTab === 'general' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('general')}
                                >
                                    <span className="cauhinh-menu-icon" style={{ color: '#10b981' }}>
                                        <i className="fa-solid fa-store"></i>
                                    </span>
                                    <div className="cauhinh-menu-text">
                                        <div className="cauhinh-menu-title">Thông tin Studio</div>
                                        <div className="cauhinh-menu-desc">Tên thương hiệu, hotline, địa chỉ</div>
                                    </div>
                                </li>
                            </>
                        )}

                        {/* Tab Tài khoản & KPI: Cho phép cả Nhân viên và Quản lý */}
                        <li
                            className={`cauhinh-menu-item ${activeTab === 'account' ? 'active' : ''}`}
                            onClick={() => setActiveTab('account')}
                        >
                            <span className="cauhinh-menu-icon" style={{ color: '#a855f7' }}>
                                <i className="fa-solid fa-id-badge"></i>
                            </span>
                            <div className="cauhinh-menu-text">
                                <div className="cauhinh-menu-title">Tài khoản & KPI</div>
                                <div className="cauhinh-menu-desc">Chỉ tiêu cá nhân & thành tích</div>
                            </div>
                        </li>

                        {/* Tab Mã PIN & Khóa Màn Hình: Cho phép cả Nhân viên và Quản lý */}
                        <li
                            className={`cauhinh-menu-item ${activeTab === 'security_pin' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security_pin')}
                        >
                            <span className="cauhinh-menu-icon" style={{ color: '#0284c7' }}>
                                <i className="fa-solid fa-shield-halved"></i>
                            </span>
                            <div className="cauhinh-menu-text">
                                <div className="cauhinh-menu-title">Mã PIN & Khóa Màn Hình</div>
                                <div className="cauhinh-menu-desc">Đổi mã PIN & Thời gian tự khóa</div>
                            </div>
                        </li>
                    </ul>
                </aside>

                {/* 2. Khung nội dung chi tiết bên phải */}
                <main className="cauhinh-content-area">
                    {/* TAB 1: CẤU HÌNH MẪU IN HỢP ĐỒNG (Chỉ Quản lý) */}
                    {isAdmin && activeTab === 'contract_print' && (
                        <div className="cauhinh-panel" style={{ padding: '16px' }}>
                            <ContractTemplateDesigner
                                config={contractConfig}
                                onChange={setContractConfig}
                                onSave={handleSaveContractConfig}
                                onReset={handleResetContractConfig}
                                onTestPrint={handleTestPrintContract}
                            />
                        </div>
                    )}

                    {/* TAB 2: CẤU HÌNH MẪU IN PHIẾU MƯỢN / TRẢ ĐỒ (Chỉ Quản lý) */}
                    {isAdmin && activeTab === 'loan_receipt_print' && (
                        <div className="cauhinh-panel">
                            <div className="cauhinh-panel-header">
                                <div>
                                    <h2 className="cauhinh-panel-title">
                                        <i className="fa-solid fa-receipt" style={{ color: '#fb923c', marginRight: 8 }}></i>
                                        Cấu Hình Mẫu In Phiếu Mượn / Trả Đồ Cưới
                                    </h2>
                                    <p className="cauhinh-panel-desc">Tùy biến tiêu đề, nội dung quy định bàn giao, cam kết đền bù và bảng kê trang phục</p>
                                </div>
                                <div className="cauhinh-actions-row">
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        startIcon={<RestartAltIcon />}
                                        onClick={handleResetLoanConfig}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Mặc định
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<PrintIcon />}
                                        onClick={() => handleTestPrintLoanReceipt(false)}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                    >
                                        In thử phiếu mượn
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        startIcon={<PrintIcon />}
                                        onClick={() => handleTestPrintLoanReceipt(true)}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                    >
                                        In thử phiếu trả
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SaveIcon />}
                                        onClick={handleSaveLoanConfig}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#0284c7' }}
                                    >
                                        Lưu cấu hình
                                    </Button>
                                </div>
                            </div>

                            <Grid container spacing={3}>
                                {/* Tiêu đề & Cột hiển thị */}
                                <Grid item xs={12} md={6}>
                                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#ffffff' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            🏷️ TIÊU ĐỀ PHIẾU BÀN GIAO & TIẾP NHẬN
                                        </Typography>
                                        <Stack spacing={2}>
                                            <TextField
                                                label="Tiêu đề Phiếu Mượn / Bàn Giao đồ"
                                                size="small"
                                                fullWidth
                                                value={loanConfig.loanTitle}
                                                onChange={e => setLoanConfig({ ...loanConfig, loanTitle: e.target.value })}
                                            />
                                            <TextField
                                                label="Tiêu đề Phiếu Tiếp Nhận & Trả đồ"
                                                size="small"
                                                fullWidth
                                                value={loanConfig.returnTitle}
                                                onChange={e => setLoanConfig({ ...loanConfig, returnTitle: e.target.value })}
                                            />
                                            <TextField
                                                label="Tên Studio in trên phiếu"
                                                size="small"
                                                fullWidth
                                                value={loanConfig.studioName}
                                                onChange={e => setLoanConfig({ ...loanConfig, studioName: e.target.value })}
                                            />
                                            <TextField
                                                label="Hotline studio"
                                                size="small"
                                                fullWidth
                                                value={loanConfig.studioHotline}
                                                onChange={e => setLoanConfig({ ...loanConfig, studioHotline: e.target.value })}
                                            />
                                            <TextField
                                                label="Lời cảm ơn ở chân trang phiếu"
                                                size="small"
                                                fullWidth
                                                multiline
                                                rows={2}
                                                value={loanConfig.footerNote}
                                                onChange={e => setLoanConfig({ ...loanConfig, footerNote: e.target.value })}
                                            />
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Chữ ký & Cột bảng trang phục */}
                                <Grid item xs={12} md={6}>
                                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#ffffff' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            ⚙️ TÙY CHỌN CỘT BẢNG & CHỮ KÝ
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={loanConfig.showItemCode}
                                                        onChange={e => setLoanConfig({ ...loanConfig, showItemCode: e.target.checked })}
                                                        color="primary"
                                                    />
                                                }
                                                label="Hiển thị cột Mã sản phẩm (Mã đồ cưới)"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={loanConfig.showUpgradePrice}
                                                        onChange={e => setLoanConfig({ ...loanConfig, showUpgradePrice: e.target.checked })}
                                                        color="primary"
                                                    />
                                                }
                                                label="Hiển thị cột Tiền nâng cấp / Thuê thêm"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={loanConfig.showNoteColumn}
                                                        onChange={e => setLoanConfig({ ...loanConfig, showNoteColumn: e.target.checked })}
                                                        color="primary"
                                                    />
                                                }
                                                label="Hiển thị cột Tình trạng & Ghi chú phụ kiện"
                                            />
                                            <Divider sx={{ my: 1 }} />
                                            <TextField
                                                label="Người ký Phiếu Mượn (Khách hàng)"
                                                size="small"
                                                fullWidth
                                                value={loanConfig.loanClientSignTitle}
                                                onChange={e => setLoanConfig({ ...loanConfig, loanClientSignTitle: e.target.value })}
                                            />
                                            <TextField
                                                label="Người ký Phiếu Mượn (Nhân viên)"
                                                size="small"
                                                fullWidth
                                                value={loanConfig.loanStaffSignTitle}
                                                onChange={e => setLoanConfig({ ...loanConfig, loanStaffSignTitle: e.target.value })}
                                            />
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Quy định mượn đồ */}
                                <Grid item xs={12} md={6}>
                                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#ffffff', height: '100%' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            📋 QUY ĐỊNH KHI MƯỢN ĐỒ CƯỚI
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                            <TextField
                                                placeholder="Thêm quy định mượn đồ..."
                                                size="small"
                                                fullWidth
                                                value={newLoanTerm}
                                                onChange={e => setNewLoanTerm(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && handleAddLoanTerm()}
                                            />
                                            <Button
                                                variant="contained"
                                                onClick={handleAddLoanTerm}
                                                sx={{ minWidth: 90, textTransform: 'none', fontWeight: 700, bgcolor: '#0284c7' }}
                                            >
                                                Thêm
                                            </Button>
                                        </Box>

                                        <Stack spacing={1}>
                                            {loanConfig.loanTerms.map((term, index) => (
                                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                    <Typography variant="body2" sx={{ flex: 1, fontSize: '0.85rem' }}>
                                                        {index + 1}. {term}
                                                    </Typography>
                                                    <IconButton color="error" size="small" onClick={() => handleDeleteLoanTerm(index)}>
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Quy định trả đồ */}
                                <Grid item xs={12} md={6}>
                                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#ffffff', height: '100%' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            ✅ QUY ĐỊNH KHI TIẾP NHẬN & TRẢ ĐỒ
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                            <TextField
                                                placeholder="Thêm quy định trả đồ..."
                                                size="small"
                                                fullWidth
                                                value={newReturnTerm}
                                                onChange={e => setNewReturnTerm(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && handleAddReturnTerm()}
                                            />
                                            <Button
                                                variant="contained"
                                                onClick={handleAddReturnTerm}
                                                sx={{ minWidth: 90, textTransform: 'none', fontWeight: 700, bgcolor: '#0284c7' }}
                                            >
                                                Thêm
                                            </Button>
                                        </Box>

                                        <Stack spacing={1}>
                                            {loanConfig.returnTerms.map((term, index) => (
                                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                    <Typography variant="body2" sx={{ flex: 1, fontSize: '0.85rem' }}>
                                                        {index + 1}. {term}
                                                    </Typography>
                                                    <IconButton color="error" size="small" onClick={() => handleDeleteReturnTerm(index)}>
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </div>
                    )}

                    {/* TAB 3: THÔNG TIN STUDIO (Chỉ Quản lý) */}
                    {isAdmin && activeTab === 'general' && (
                        <div className="cauhinh-panel">
                            <div className="cauhinh-panel-header">
                                <div>
                                    <h2 className="cauhinh-panel-title">
                                        <i className="fa-solid fa-store" style={{ color: '#10b981', marginRight: 8 }}></i>
                                        Thông Tin Thương Hiệu & Studio
                                    </h2>
                                    <p className="cauhinh-panel-desc">Thông tin chung hiển thị trên hệ thống và các tài liệu in ấn</p>
                                </div>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveContractConfig}
                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#0284c7' }}
                                >
                                    Lưu thông tin
                                </Button>
                            </div>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4} style={{ textAlign: 'center' }}>
                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={logo} alt="Logo" style={{ maxHeight: 110, maxWidth: '100%', marginBottom: 16, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>LONG WEDDING STUDIO</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5 }}>Hệ thống quản trị studio cưới chuyên nghiệp</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#ffffff' }}>
                                        <Stack spacing={2.5}>
                                            <TextField
                                                label="Tên doanh nghiệp / Studio"
                                                fullWidth
                                                size="small"
                                                value={contractConfig.studioName}
                                                onChange={e => setContractConfig({ ...contractConfig, studioName: e.target.value })}
                                            />
                                            <TextField
                                                label="Khẩu hiệu / Slogan"
                                                fullWidth
                                                size="small"
                                                value={contractConfig.studioSlogan}
                                                onChange={e => setContractConfig({ ...contractConfig, studioSlogan: e.target.value })}
                                            />
                                            <TextField
                                                label="Hotline liên hệ"
                                                fullWidth
                                                size="small"
                                                value={contractConfig.studioHotline}
                                                onChange={e => setContractConfig({ ...contractConfig, studioHotline: e.target.value })}
                                            />
                                            <TextField
                                                label="Địa chỉ trụ sở chính"
                                                fullWidth
                                                size="small"
                                                value={contractConfig.studioAddress}
                                                onChange={e => setContractConfig({ ...contractConfig, studioAddress: e.target.value })}
                                            />
                                            <TextField
                                                label="Website"
                                                fullWidth
                                                size="small"
                                                value={contractConfig.studioWebsite}
                                                onChange={e => setContractConfig({ ...contractConfig, studioWebsite: e.target.value })}
                                            />
                                        </Stack>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </div>
                    )}

                    {/* TAB 4: TÀI KHOẢN & KPI CÁ NHÂN */}
                    {activeTab === 'account' && (
                        <div className="cauhinh-panel">
                            <div className="cauhinh-panel-header">
                                <div>
                                    <h2 className="cauhinh-panel-title">
                                        <i className="fa-solid fa-id-badge" style={{ color: '#a855f7', marginRight: 8 }}></i>
                                        Tài Khoản, Bảo Mật & Chỉ Tiêu Cá Nhân
                                    </h2>
                                    <p className="cauhinh-panel-desc">Xem thông tin cá nhân, cập nhật ảnh đại diện, đổi mật khẩu và theo dõi chỉ tiêu KPI</p>
                                </div>
                            </div>

                            <Grid container spacing={3}>
                                {/* CỘT TRÁI: THÔNG TIN TÀI KHOẢN & ĐỔI MẬT KHẨU */}
                                <Grid item xs={12} md={5}>
                                    <Stack spacing={3}>
                                        {/* 1. Thẻ thông tin cá nhân */}
                                        <Paper variant="outlined" className="account-info-card">
                                            <div style={{ textAlign: 'center', position: 'relative' }}>
                                                <div className="account-avatar-wrapper">
                                                    <Avatar
                                                        src={userProfileData?.avatar || user?.avatar || ''}
                                                        sx={{
                                                            width: 96,
                                                            height: 96,
                                                            bgcolor: '#0284c7',
                                                            fontSize: '2.2rem',
                                                            fontWeight: 800,
                                                            margin: '0 auto',
                                                            boxShadow: '0 6px 18px rgba(2,132,199,0.25)',
                                                            border: '3px solid #ffffff'
                                                        }}
                                                    >
                                                        {(userProfileData?.fullname || user?.username || 'U').charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Tooltip title="Đổi ảnh đại diện">
                                                        <IconButton 
                                                            size="small" 
                                                            className="account-avatar-btn-edit"
                                                            onClick={handleOpenAvatarModal}
                                                        >
                                                            <CameraAltIcon sx={{ fontSize: '1rem' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>

                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                                    {userProfileData?.fullname || user?.fullname || user?.username}
                                                </Typography>
                                                <Chip
                                                    label={userProfileData?.positon || user?.positon || (user?.permission === 1 ? 'Quản lý' : 'Nhân viên')}
                                                    size="small"
                                                    sx={{ mt: 0.8, bgcolor: '#e0f2fe', color: '#0284c7', fontWeight: 800, border: '1px solid #bae6fd' }}
                                                />
                                            </div>

                                            <Divider sx={{ my: 2.5 }} />

                                            {/* Form sửa hoặc xem thông tin */}
                                            {isEditingProfile ? (
                                                <Stack spacing={2}>
                                                    <TextField
                                                        label="Họ và tên"
                                                        size="small"
                                                        fullWidth
                                                        value={profileForm.fullname}
                                                        onChange={(e) => setProfileForm({ ...profileForm, fullname: e.target.value })}
                                                    />
                                                    <TextField
                                                        label="Số điện thoại"
                                                        size="small"
                                                        fullWidth
                                                        value={profileForm.phone}
                                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                    />
                                                    <TextField
                                                        label="Ngày sinh"
                                                        size="small"
                                                        fullWidth
                                                        placeholder="VD: 15/08/1998"
                                                        value={profileForm.birthday}
                                                        onChange={(e) => setProfileForm({ ...profileForm, birthday: e.target.value })}
                                                    />
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end" pt={1}>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => setIsEditingProfile(false)}
                                                            sx={{ textTransform: 'none', borderRadius: 2 }}
                                                        >
                                                            Hủy
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            disabled={isSavingProfile}
                                                            onClick={handleSaveProfile}
                                                            sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#0284c7', fontWeight: 700 }}
                                                        >
                                                            {isSavingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            ) : (
                                                <Box>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                            Chi tiết tài khoản
                                                        </Typography>
                                                        <Button
                                                            size="small"
                                                            variant="text"
                                                            startIcon={<EditIcon sx={{ fontSize: '0.9rem' }} />}
                                                            onClick={handleStartEditProfile}
                                                            sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 700, p: 0 }}
                                                        >
                                                            Chỉnh sửa
                                                        </Button>
                                                    </div>

                                                    <Stack spacing={1.5}>
                                                        <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                                                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Tên đăng nhập</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>@{user?.username || '-'}</Typography>
                                                        </Box>
                                                        <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                                                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Số điện thoại</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: userProfileData?.phone || userProfileData?.soDienThoai ? '#0f172a' : '#94a3b8' }}>
                                                                {userProfileData?.phone || userProfileData?.soDienThoai || 'Chưa cập nhật'}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                                                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Ngày sinh</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: userProfileData?.birthday ? '#0f172a' : '#94a3b8' }}>
                                                                {userProfileData?.birthday || 'Chưa cập nhật'}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            )}
                                        </Paper>

                                        {/* 2. Thẻ Đổi Mật Khẩu */}
                                        <Paper variant="outlined" className="account-info-card">
                                            <div className="account-card-header">
                                                <h3 className="account-card-title">
                                                    <LockResetIcon sx={{ color: '#ef4444' }} />
                                                    Đổi Mật Khẩu Bảo Mật
                                                </h3>
                                            </div>
                                            <Stack spacing={2}>
                                                <TextField
                                                    label="Mật khẩu mới"
                                                    size="small"
                                                    fullWidth
                                                    type={showPass.new ? 'text' : 'password'}
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                    placeholder="Tối thiểu 6 ký tự..."
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                                                                >
                                                                    {showPass.new ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />

                                                <TextField
                                                    label="Xác nhận mật khẩu mới"
                                                    size="small"
                                                    fullWidth
                                                    type={showPass.confirm ? 'text' : 'password'}
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                    placeholder="Nhập lại mật khẩu mới..."
                                                    error={Boolean(passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword)}
                                                    helperText={
                                                        passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                                                            ? 'Mật khẩu xác nhận không khớp!'
                                                            : ''
                                                    }
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                                                                >
                                                                    {showPass.confirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />

                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    fullWidth
                                                    startIcon={<KeyIcon />}
                                                    disabled={isSavingPass || !passwordForm.newPassword}
                                                    onClick={handleChangePassword}
                                                    sx={{
                                                        bgcolor: '#0f172a',
                                                        borderRadius: 2,
                                                        fontWeight: 700,
                                                        textTransform: 'none',
                                                        py: 1,
                                                        '&:hover': { bgcolor: '#1e293b' }
                                                    }}
                                                >
                                                    {isSavingPass ? 'Đang cập nhật...' : 'Cập nhật mật khẩu mới'}
                                                </Button>
                                            </Stack>
                                        </Paper>

                                        {/* 3. Thẻ Cấu Hình Mã PIN Đăng Nhập Nhanh */}
                                        <Paper variant="outlined" className="account-info-card">
                                            <div className="account-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                <h3 className="account-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                                                    <SecurityIcon sx={{ color: '#0284c7' }} />
                                                    Mã PIN Đăng Nhập Nhanh
                                                </h3>
                                                <Chip
                                                    label={savedPinUser ? "Đang bật (6 số)" : "Chưa bật"}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: savedPinUser ? '#dcfce7' : '#f1f5f9',
                                                        color: savedPinUser ? '#15803d' : '#64748b',
                                                        fontWeight: 800,
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                            </div>

                                            <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: '0.85rem' }}>
                                                {savedPinUser 
                                                    ? "Mã PIN 6 số đã được kích hoạt trên trình duyệt này. Bạn có thể đăng nhập tức thì chỉ trong 1 giây."
                                                    : "Kích hoạt mã PIN 6 số giúp bạn đăng nhập nhanh vào hệ thống mà không cần gõ mật khẩu dài mỗi lần."
                                                }
                                            </Typography>

                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<DialpadIcon />}
                                                    onClick={handleOpenPinModal}
                                                    sx={{
                                                        bgcolor: '#0284c7',
                                                        borderRadius: 2,
                                                        fontWeight: 750,
                                                        textTransform: 'none',
                                                        flex: 1,
                                                        '&:hover': { bgcolor: '#0369a1' }
                                                    }}
                                                >
                                                    {savedPinUser ? "Đổi mã PIN mới" : "Thiết lập mã PIN"}
                                                </Button>

                                                {savedPinUser && (
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        onClick={handleDisablePin}
                                                        sx={{ borderRadius: 2, fontWeight: 750, textTransform: 'none' }}
                                                    >
                                                        Tắt mã PIN
                                                    </Button>
                                                )}
                                            </Stack>

                                            {savedPinUser && (
                                                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                        ⏱️ Tự khóa: {autoLockTimeout === '0' ? 'Đang tắt' : `Sau ${autoLockTimeout} phút`}
                                                    </Typography>
                                                    <Button 
                                                        size="small" 
                                                        onClick={() => setActiveTab('security_pin')}
                                                        sx={{ fontSize: '0.75rem', p: 0, textTransform: 'none', fontWeight: 700 }}
                                                    >
                                                        Cài đặt thời gian →
                                                    </Button>
                                                </Box>
                                            )}
                                        </Paper>
                                    </Stack>
                                </Grid>

                                {/* CỘT PHẢI: TIẾN ĐỘ KPI & CHẾ ĐỘ THƯỞNG / HOA HỒNG */}
                                <Grid item xs={12} md={7}>
                                    <Stack spacing={3}>
                                        {/* 1. Tiến độ KPI tháng */}
                                        <Paper variant="outlined" className="account-info-card">
                                            <div className="account-card-header">
                                                <h3 className="account-card-title">
                                                    <span style={{ fontSize: '1.2rem' }}>🎯</span>
                                                    Tiến Độ Chỉ Tiêu KPI Tháng
                                                </h3>
                                            </div>
                                            {(() => {
                                                const chiTieuThang = userStats?.chiTieuThang || userProfileData?.chiTieuThang || user?.chiTieuThang || 20;
                                                const workCount = userStats?.countWork ?? userStats?.workCount ?? 0;
                                                const percent = chiTieuThang > 0 ? Math.min(100, Math.round((workCount / chiTieuThang) * 100)) : 0;
                                                const hoaHong = userStats?.totalRewardEst ?? userStats?.hoaHongEst ?? userStats?.hoaHong ?? 0;

                                                return (
                                                    <Stack spacing={2.5}>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                                                                Đã hoàn thành: <strong style={{ color: '#0284c7', fontSize: '1.2rem' }}>{workCount}</strong> / {chiTieuThang} hợp đồng
                                                            </Typography>
                                                            <Chip
                                                                label={`${percent}% KPI`}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: percent >= 100 ? '#dcfce7' : '#fef3c7',
                                                                    color: percent >= 100 ? '#15803d' : '#b45309',
                                                                    fontWeight: 800,
                                                                    fontSize: '0.8rem',
                                                                    px: 0.5
                                                                }}
                                                            />
                                                        </Box>

                                                        <Box sx={{ width: '100%', height: 12, bgcolor: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                                                            <Box
                                                                sx={{
                                                                    width: `${percent}%`,
                                                                    height: '100%',
                                                                    borderRadius: 6,
                                                                    background: percent >= 100 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                                                                    transition: 'width 0.5s ease-in-out'
                                                                }}
                                                            />
                                                        </Box>

                                                        <Grid container spacing={2}>
                                                            <Grid item xs={6}>
                                                                <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2.5, border: '1px solid #bbf7d0', textAlign: 'center' }}>
                                                                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, display: 'block' }}>🔥 VƯỢT CHỈ TIÊU</Typography>
                                                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>
                                                                        +{Math.max(0, workCount - chiTieuThang)} HĐ
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Box sx={{ p: 2, bgcolor: '#fffbeb', borderRadius: 2.5, border: '1px solid #fde68a', textAlign: 'center' }}>
                                                                    <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 700, display: 'block' }}>💰 HOA HỒNG TẠM TÍNH</Typography>
                                                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#b45309', mt: 0.5 }}>
                                                                        {hoaHong.toLocaleString('vi-VN')} đ
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                    </Stack>
                                                );
                                            })()}
                                        </Paper>

                                        {/* 2. Chỉ tiêu KPI thiết lập */}
                                        <Paper variant="outlined" className="account-info-card">
                                            <div className="account-card-header">
                                                <h3 className="account-card-title">
                                                    <span style={{ fontSize: '1.2rem' }}>📊</span>
                                                    Hạn Mức Chỉ Tiêu Đặt Ra
                                                </h3>
                                            </div>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4}>
                                                    <Box sx={{ p: 1.8, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Chỉ tiêu tuần</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                                                            {userProfileData?.chiTieuTuan || 5} HĐ
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Box sx={{ p: 1.8, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe', textAlign: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 700, display: 'block' }}>Chỉ tiêu tháng</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e40af', mt: 0.5 }}>
                                                            {userProfileData?.chiTieuThang || 20} HĐ
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Box sx={{ p: 1.8, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Chỉ tiêu năm</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                                                            {userProfileData?.chiTieuNam || 200} HĐ
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Paper>

                                        {/* 3. Huy hiệu & Thành tích thi đua */}
                                        <Paper variant="outlined" className="account-info-card">
                                            <div className="account-card-header">
                                                <h3 className="account-card-title">
                                                    <span style={{ fontSize: '1.2rem' }}>🏆</span>
                                                    Thành Tích & Danh Hiệu Được Trao Tặng
                                                </h3>
                                            </div>
                                            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                                                {getEmployeeAwards(user?.username, userProfileData || user).map((badge, idx) => (
                                                    <Chip 
                                                        key={idx} 
                                                        label={badge} 
                                                        sx={{ 
                                                            fontWeight: 700, 
                                                            bgcolor: '#fffbeb', 
                                                            color: '#b45309', 
                                                            border: '1px solid #fde68a',
                                                            fontSize: '0.85rem',
                                                            py: 0.5
                                                        }} 
                                                    />
                                                ))}
                                                {userStats?.completionPercent >= 100 && (
                                                    <Chip label="⭐ Đạt Chỉ Tiêu KPI" variant="outlined" color="success" sx={{ fontWeight: 700, bgcolor: '#f0fdf4' }} />
                                                )}
                                                {userStats?.isExceeded && (
                                                    <Chip label="🔥 Chiến Binh Bứt Phá" variant="outlined" color="error" sx={{ fontWeight: 700, bgcolor: '#fef2f2' }} />
                                                )}
                                                {userStats?.rank === 1 && (
                                                    <Chip label="👑 Quán Quân Tháng" variant="outlined" sx={{ fontWeight: 800, bgcolor: '#fef3c7', color: '#d97706', borderColor: '#fbbf24' }} />
                                                )}
                                            </Stack>
                                        </Paper>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </div>
                    )}

                    {/* TAB 5: CẤU HÌNH & QUẢN LÝ MÃ PIN ĐĂNG NHẬP NHANH (Tất cả người dùng) */}
                    {activeTab === 'security_pin' && (
                        <div className="cauhinh-panel">
                            <div className="cauhinh-panel-header">
                                <div>
                                    <h2 className="cauhinh-panel-title">
                                        <SecurityIcon sx={{ color: '#0284c7', mr: 1 }} />
                                        Cấu Hình Mã PIN Đăng Nhập Nhanh
                                    </h2>
                                    <p className="cauhinh-panel-desc">
                                        Quản lý bật/tắt và thay đổi mã PIN 6 chữ số để đăng nhập an toàn, tức thì trên thiết bị này.
                                    </p>
                                </div>
                            </div>

                            <Grid container spacing={3} sx={{ mt: 0.5 }}>
                                <Grid item xs={12} md={7}>
                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={3}>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        bgcolor: savedPinUser ? '#0284c7' : '#94a3b8',
                                                        color: '#fff',
                                                        fontWeight: 800,
                                                        fontSize: '1.4rem'
                                                    }}
                                                >
                                                    {(userProfileData?.fullname || user?.username || 'U').charAt(0).toUpperCase()}
                                                </Avatar>
                                                <div>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                                        {userProfileData?.fullname || user?.username || 'Tài khoản của bạn'}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                        @{user?.username} • {user?.vaiTro || user?.chucVu || user?.role || 'Nhân viên'}
                                                    </Typography>
                                                </div>
                                            </Box>

                                            <Chip
                                                label={savedPinUser ? "🟢 ĐANG KÍCH HOẠT" : "⚪ CHƯA BẬT MÃ PIN"}
                                                sx={{
                                                    bgcolor: savedPinUser ? '#dcfce7' : '#f1f5f9',
                                                    color: savedPinUser ? '#15803d' : '#64748b',
                                                    fontWeight: 800,
                                                    fontSize: '0.8rem',
                                                    px: 1
                                                }}
                                            />
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Stack spacing={2.5}>
                                            <Box sx={{ p: 2, bgcolor: savedPinUser ? '#f0fdf4' : '#f8fafc', borderRadius: 2.5, border: `1px solid ${savedPinUser ? '#bbf7d0' : '#e2e8f0'}` }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: savedPinUser ? '#166534' : '#334155', mb: 0.5 }}>
                                                    {savedPinUser ? "✓ Mã PIN đang hoạt động trên thiết bị này" : "Chưa bật mã PIN"}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: savedPinUser ? '#15803d' : '#64748b', display: 'block' }}>
                                                    {savedPinUser 
                                                        ? `Mã PIN 6 số đã được thiết lập. Khi truy cập trang đăng nhập, bạn chỉ cần gõ 6 chữ số để vào hệ thống ngay lập tức.`
                                                        : `Khi bật mã PIN, bạn có thể đăng nhập nhanh chóng mà không cần nhập lại tên tài khoản và mật khẩu dài.`
                                                    }
                                                </Typography>
                                            </Box>

                                            <Box display="flex" gap={2} flexWrap="wrap">
                                                <Button
                                                    variant="contained"
                                                    startIcon={<DialpadIcon />}
                                                    onClick={handleOpenPinModal}
                                                    sx={{
                                                        bgcolor: '#0284c7',
                                                        borderRadius: 2.5,
                                                        fontWeight: 750,
                                                        textTransform: 'none',
                                                        px: 3,
                                                        py: 1.2,
                                                        '&:hover': { bgcolor: '#0369a1' }
                                                    }}
                                                >
                                                    {savedPinUser ? "Đổi Mã PIN Mới" : "Bật & Cài Đặt Mã PIN (6 số)"}
                                                </Button>

                                                {savedPinUser && (
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={handleDisablePin}
                                                        sx={{
                                                            borderRadius: 2.5,
                                                            fontWeight: 750,
                                                            textTransform: 'none',
                                                            px: 2.5,
                                                            py: 1.2
                                                        }}
                                                    >
                                                        Tắt & Xóa Mã PIN
                                                    </Button>
                                                )}
                                            </Box>

                                            <Divider sx={{ my: 1.5 }} />

                                            {/* Cài đặt thời gian tự động khóa màn hình */}
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    ⏱️ Thời Gian Tự Động Khóa Màn Hình
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
                                                    Khi không có thao tác chuột hoặc bàn phím trong khoảng thời gian đã chọn, màn hình sẽ tự động khóa để bảo mật dữ liệu.
                                                </Typography>

                                                <FormControl size="small" fullWidth sx={{ maxWidth: 340 }}>
                                                    <InputLabel id="autolock-select-label">Thời gian tự động khóa</InputLabel>
                                                    <Select
                                                        labelId="autolock-select-label"
                                                        value={autoLockTimeout}
                                                        label="Thời gian tự động khóa"
                                                        onChange={(e) => handleAutoLockTimeoutChange(e.target.value)}
                                                        disabled={!savedPinUser}
                                                    >
                                                        <MenuItem value="0">Không bao giờ (Tắt tự động khóa)</MenuItem>
                                                        <MenuItem value="1">Sau 1 phút không thao tác</MenuItem>
                                                        <MenuItem value="3">Sau 3 phút không thao tác</MenuItem>
                                                        <MenuItem value="5">Sau 5 phút không thao tác (Khuyên dùng)</MenuItem>
                                                        <MenuItem value="10">Sau 10 phút không thao tác</MenuItem>
                                                        <MenuItem value="15">Sau 15 phút không thao tác</MenuItem>
                                                        <MenuItem value="30">Sau 30 phút không thao tác</MenuItem>
                                                        <MenuItem value="60">Sau 1 giờ không thao tác</MenuItem>
                                                    </Select>
                                                </FormControl>

                                                {!savedPinUser && (
                                                    <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 1, fontWeight: 600 }}>
                                                        ⚠️ Cần cài đặt mã PIN trước để kích hoạt tính năng tự động khóa.
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={5}>
                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <VpnKeyIcon sx={{ color: '#0284c7' }} />
                                            Tiêu Chuẩn Bảo Mật Mã PIN
                                        </Typography>

                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                                                <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5 }}>
                                                    <strong>Mã hóa chuẩn SHA-256 + Salt</strong>: Mã PIN được băm mật mã an toàn trên trình duyệt, không ai có thể giải ngược.
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                                                <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5 }}>
                                                    <strong>Tự động khóa chống dò mã</strong>: Tạm khóa 60 giây nếu nhập sai 5 lần liên tiếp.
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                                                <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5 }}>
                                                    <strong>Độc lập trên từng thiết bị</strong>: Chỉ áp dụng trên trình duyệt hiện tại. Bạn có thể tắt bất cứ lúc nào.
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </div>
                    )}
                </main>
            </div>

            {/* DIALOG THAY ĐỔI ẢNH ĐẠI DIỆN */}
            <Dialog
                open={openAvatarDialog}
                onClose={() => setOpenAvatarDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9' }}>
                    📸 Thay Đổi Ảnh Đại Diện
                </DialogTitle>
                <DialogContent sx={{ p: 3, pt: '20px !important' }}>
                    <Stack spacing={2.5} alignItems="center">
                        {/* Preview */}
                        <Avatar
                            src={avatarUrlInput.trim() || avatarPreview}
                            sx={{
                                width: 100,
                                height: 100,
                                bgcolor: '#0284c7',
                                fontSize: '2.5rem',
                                fontWeight: 800,
                                border: '3px solid #e2e8f0',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                            }}
                        >
                            {(userProfileData?.fullname || user?.username || 'U').charAt(0).toUpperCase()}
                        </Avatar>

                        {/* Upload từ máy */}
                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={<CameraAltIcon />}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                        >
                            Chọn ảnh từ thiết bị
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleAvatarFileUpload}
                            />
                        </Button>

                        <Divider sx={{ width: '100%' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>HOẶC</Typography>
                        </Divider>

                        {/* Hoặc nhập link */}
                        <TextField
                            label="Nhập liên kết ảnh (URL)"
                            size="small"
                            fullWidth
                            placeholder="https://example.com/avatar.jpg"
                            value={avatarUrlInput}
                            onChange={(e) => {
                                setAvatarUrlInput(e.target.value);
                                setActivePresetIndex(null);
                            }}
                        />

                        {/* Bộ avatar mẫu */}
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 1 }}>
                                Hoặc chọn Avatar mẫu có sẵn:
                            </Typography>
                            <div className="preset-avatar-grid">
                                {PRESET_AVATARS.map((url, idx) => (
                                    <div
                                        key={idx}
                                        className={`preset-avatar-item ${activePresetIndex === idx ? 'active' : ''}`}
                                        onClick={() => {
                                            setActivePresetIndex(idx);
                                            setAvatarPreview(url);
                                            setAvatarUrlInput('');
                                        }}
                                    >
                                        <img src={url} alt={`Preset ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button
                        variant="outlined"
                        onClick={() => setOpenAvatarDialog(false)}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#64748b' }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        disabled={isSavingAvatar || (!avatarPreview && !avatarUrlInput.trim())}
                        onClick={handleSaveAvatar}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#0284c7' }}
                    >
                        {isSavingAvatar ? 'Đang lưu...' : 'Lưu Ảnh Đại Diện'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DIALOG THIẾT LẬP / ĐỔI MÃ PIN */}
            <Dialog
                open={pinModalOpen}
                onClose={() => setPinModalOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon sx={{ color: '#0284c7' }} />
                    {savedPinUser ? (pinModalStep === 1 ? "Xác Thực Mã PIN Cũ" : "Đổi Mã PIN Đăng Nhập Mới") : (pinModalStep === 2 ? "Thiết Lập Mã PIN 6 Số" : "Xác Nhận Lại Mã PIN")}
                </DialogTitle>

                <DialogContent sx={{ p: 3, pt: '20px !important' }}>
                    {pinModalError && (
                        <Box sx={{ p: 1.5, mb: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2, color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
                            {pinModalError}
                        </Box>
                    )}

                    {pinModalStep === 1 ? (
                        <Stack spacing={2}>
                            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                                Nhập mã PIN hiện tại (6 số) để xác thực:
                            </Typography>
                            <TextField
                                label="Mã PIN hiện tại"
                                type="password"
                                fullWidth
                                size="small"
                                inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
                                value={oldPinInput}
                                onChange={(e) => {
                                    setOldPinInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                                    if (pinModalError) setPinModalError('');
                                }}
                                autoFocus
                            />
                        </Stack>
                    ) : pinModalStep === 2 ? (
                        <Stack spacing={2}>
                            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                                Nhập mã PIN mới (6 chữ số):
                            </Typography>
                            <TextField
                                label="Mã PIN mới (6 số)"
                                type="password"
                                fullWidth
                                size="small"
                                inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
                                value={newPinInput}
                                onChange={(e) => {
                                    setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                                    if (pinModalError) setPinModalError('');
                                }}
                                autoFocus
                            />
                        </Stack>
                    ) : (
                        <Stack spacing={2}>
                            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                                Nhập lại mã PIN mới để xác nhận:
                            </Typography>
                            <TextField
                                label="Xác nhận mã PIN mới"
                                type="password"
                                fullWidth
                                size="small"
                                inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
                                value={confirmPinInput}
                                onChange={(e) => {
                                    setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                                    if (pinModalError) setPinModalError('');
                                }}
                                autoFocus
                            />
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setPinModalOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
                        Hủy
                    </Button>
                    {pinModalStep === 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleVerifyOldPin}
                            disabled={oldPinInput.length !== 6}
                            sx={{ bgcolor: '#0284c7', textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                        >
                            Tiếp tục →
                        </Button>
                    ) : pinModalStep === 2 ? (
                        <Button
                            variant="contained"
                            onClick={() => {
                                if (newPinInput.length !== 6) {
                                    setPinModalError("Mã PIN mới phải có đúng 6 chữ số!");
                                    return;
                                }
                                setPinModalError('');
                                setPinModalStep(3);
                            }}
                            disabled={newPinInput.length !== 6}
                            sx={{ bgcolor: '#0284c7', textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                        >
                            Xác nhận PIN →
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleSaveNewPin}
                            disabled={confirmPinInput.length !== 6}
                            sx={{ bgcolor: '#16a34a', textTransform: 'none', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#15803d' } }}
                        >
                            Lưu Mã PIN
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default CauHinh;
