import React, { useState, useEffect, useMemo } from 'react';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { useContractTypes } from "../../hooks/useContractTypes";
import { toast } from 'sonner';
import { PRESET_AWARDS, getEmployeeAwards, saveEmployeeAwards } from '../../utils/awardHelper';
import './quanlynhanvien.css';

// Material UI components
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    Stack,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Grid,
    Card,
    Typography,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    InputAdornment,
    ToggleButton,
    ToggleButtonGroup,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import logoDefault from '../../assets/logo/logo-vang.png';

// Number Formatting Helpers
const formatMoney = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
};

const formatShortMoney = (val) => {
    const num = Number(val) || 0;
    if (Math.abs(num) >= 1000000000) {
        return (num / 1000000000).toFixed(2) + ' Tỷ';
    }
    if (Math.abs(num) >= 1000000) {
        return (num / 1000000).toFixed(1) + ' Tr';
    }
    if (Math.abs(num) >= 1000) {
        return (num / 1000).toFixed(0) + ' k';
    }
    return num.toLocaleString('vi-VN');
};

const formatInputNumber = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const numStr = String(val).replace(/\D/g, '');
    if (!numStr) return '';
    return Number(numStr).toLocaleString('vi-VN');
};

const parseInputNumber = (str) => {
    if (!str) return 0;
    const clean = String(str).replace(/\D/g, '');
    return clean ? Number(clean) : 0;
};

// Role Styling Helper
const getRoleBadgeStyle = (pos) => {
    switch (pos) {
        case 'Quản lý':
            return { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff', icon: 'fa-solid fa-crown' };
        case 'Nhân viên Sale':
            return { bg: '#fffbeb', color: '#b45309', border: '#fde68a', icon: 'fa-solid fa-user-tie' };
        case 'Thợ chụp hình':
            return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: 'fa-solid fa-camera' };
        case 'Thợ trang điểm':
            return { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8', icon: 'fa-solid fa-wand-magic-sparkles' };
        case 'Thợ chỉnh ảnh':
            return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: 'fa-solid fa-palette' };
        case 'Nhân viên phục vụ':
            return { bg: '#f8fafc', color: '#475569', border: '#cbd5e1', icon: 'fa-solid fa-bell-concierge' };
        default:
            return { bg: '#f8fafc', color: '#334155', border: '#e2e8f0', icon: 'fa-solid fa-user' };
    }
};

function QuanLyNhanVien() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { showLoading, hideLoading } = useLoading();
    const { contractTypes, getDichVuChinhLabel } = useContractTypes();
    
    // Data state
    const [users, setUsers] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [filterPosition, setFilterPosition] = useState('Tất cả');
    const [filterPermission, setFilterPermission] = useState('Tất cả');
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'

    // Form Modal state
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [formTab, setFormTab] = useState(0); // 0: Thông tin chung, 1: Lương & KPI, 2: Hoa hồng theo loại HĐ

    // Form fields state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [birthday, setBirthday] = useState('');
    const [positon, setPositon] = useState('Nhân viên Sale');
    const [permission, setPermission] = useState(2); // 1: Admin, 2: Staff
    const [avatar, setAvatar] = useState('');
    const [luongCoBan, setLuongCoBan] = useState(0);
    const [luongHoaHong, setLuongHoaHong] = useState(0);
    const [loaiHoaHong, setLoaiHoaHong] = useState(0); // 0: VNĐ/công việc, 1: % doanh số
    const [chiTieuTuan, setChiTieuTuan] = useState(5);
    const [chiTieuThang, setChiTieuThang] = useState(20);
    const [chiTieuNam, setChiTieuNam] = useState(200);
    const [hoaHongTheoLoaiHD, setHoaHongTheoLoaiHD] = useState([]); // [{ loaiHopDongId, loaiHoaHong, mucHoaHong }]

    // Salary, Revenue Report & Settings State for Detail Modal
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [openSalaryDialog, setOpenSalaryDialog] = useState(false);
    const [modalTab, setModalTab] = useState(0); // 0: Báo cáo doanh thu & lương, 1: Thiết lập lương & chỉ tiêu
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [allContractsList, setAllContractsList] = useState([]);

    // Editable Salary & KPI settings state inside the detail modal
    const [empSalaryEdit, setEmpSalaryEdit] = useState({
        luongCoBan: 0,
        loaiHoaHong: 0,
        luongHoaHong: 0,
        chiTieuTuan: 5,
        chiTieuThang: 20,
        chiTieuNam: 200,
        hoaHongTheoLoaiHD: []
    });

    // Award / Danh Hiệu Dialog State
    const [openAwardDialog, setOpenAwardDialog] = useState(false);
    const [selectedAwardEmp, setSelectedAwardEmp] = useState(null);
    const [currentEmpAwards, setCurrentEmpAwards] = useState([]);
    const [customAwardInput, setCustomAwardInput] = useState('');

    const handleOpenAwardDialog = (emp) => {
        setSelectedAwardEmp(emp);
        const awards = getEmployeeAwards(emp.username, emp);
        setCurrentEmpAwards([...awards]);
        setCustomAwardInput('');
        setOpenAwardDialog(true);
    };

    const handleAddAwardToEmp = (title) => {
        if (!title.trim()) return;
        if (currentEmpAwards.includes(title.trim())) {
            toast.info("Nhân viên đã có danh hiệu này!");
            return;
        }
        setCurrentEmpAwards(prev => [...prev, title.trim()]);
    };

    const handleRemoveAwardFromEmp = (title) => {
        setCurrentEmpAwards(prev => prev.filter(t => t !== title));
    };

    const handleCreateCustomAward = () => {
        if (!customAwardInput.trim()) return;
        handleAddAwardToEmp(customAwardInput.trim());
        setCustomAwardInput('');
    };

    const handleSaveEmpAwards = () => {
        if (!selectedAwardEmp) return;
        showLoading("Đang cập nhật danh hiệu...");
        saveEmployeeAwards(selectedAwardEmp.username, currentEmpAwards);
        
        otherService.updateUser({
            username: selectedAwardEmp.username,
            danhHieu: currentEmpAwards
        })
        .then(() => {
            toast.success(`Đã trao tặng danh hiệu cho nhân viên "${selectedAwardEmp.fullname || selectedAwardEmp.username}" thành công!`);
            setOpenAwardDialog(false);
            loadData();
        })
        .catch(err => {
            console.error(err);
            toast.success(`Đã lưu danh hiệu cho nhân viên "${selectedAwardEmp.fullname || selectedAwardEmp.username}"!`);
            setOpenAwardDialog(false);
            loadData();
        })
        .finally(() => hideLoading());
    };

    const fetchAllContracts = () => {
        otherService.LIST_HOPDONG({})
            .then(res => {
                const list = res.data?.hopDong || res.data?.data?.hopDong || (Array.isArray(res.data) ? res.data : []);
                if (Array.isArray(list)) {
                    setAllContractsList(list);
                }
            })
            .catch(err => console.error("Lỗi lấy danh sách hợp đồng:", err));
    };

    // Calculate commission for a specific contract based on staff's settings
    const calculateContractCommission = (contract, emp) => {
        if (!emp || !contract) return { amount: 0, ruleLabel: 'Chưa cài đặt', type: 0, rate: 0 };
        const val = Number(contract.thanhToan?.tongGiaTriSauGiam || contract.thanhToan?.tongGiaTri || 0);
        const typeId = Number(contract.dichVuChinh || 0);

        // Check if there is a custom commission for this contract type
        const customList = Array.isArray(emp.hoaHongTheoLoaiHD) ? emp.hoaHongTheoLoaiHD : [];
        const customRule = customList.find(c => Number(c.loaiHopDongId) === typeId);

        if (customRule && customRule.mucHoaHong !== undefined && customRule.mucHoaHong !== null && customRule.mucHoaHong !== '') {
            const ruleRate = Number(customRule.mucHoaHong) || 0;
            if (Number(customRule.loaiHoaHong) === 1) { // % Doanh số
                return {
                    amount: Math.round((val * ruleRate) / 100),
                    ruleLabel: `${ruleRate}% Doanh số (${getDichVuChinhLabel(typeId)})`,
                    type: 1,
                    rate: ruleRate
                };
            } else { // VNĐ / CV
                return {
                    amount: ruleRate,
                    ruleLabel: `${formatMoney(ruleRate)} / CV (${getDichVuChinhLabel(typeId)})`,
                    type: 0,
                    rate: ruleRate
                };
            }
        }

        // Fallback to general default commission
        const defRate = Number(emp.luongHoaHong) || 0;
        if (Number(emp.loaiHoaHong) === 1) {
            return {
                amount: Math.round((val * defRate) / 100),
                ruleLabel: `${defRate}% Doanh số (Mặc định)`,
                type: 1,
                rate: defRate
            };
        } else {
            return {
                amount: defRate,
                ruleLabel: `${formatMoney(defRate)} / CV (Mặc định)`,
                type: 0,
                rate: defRate
            };
        }
    };

    const handleOpenSalaryDetail = (emp) => {
        setSelectedEmployee(emp);
        setSelectedMonth(new Date().getMonth() + 1);
        setSelectedYear(new Date().getFullYear());
        setModalTab(0);
        setEmpSalaryEdit({
            luongCoBan: emp.luongCoBan || 0,
            loaiHoaHong: emp.loaiHoaHong || 0,
            luongHoaHong: emp.luongHoaHong || 0,
            chiTieuTuan: emp.chiTieuTuan !== undefined ? emp.chiTieuTuan : 5,
            chiTieuThang: emp.chiTieuThang !== undefined ? emp.chiTieuThang : 20,
            chiTieuNam: emp.chiTieuNam !== undefined ? emp.chiTieuNam : 200,
            hoaHongTheoLoaiHD: Array.isArray(emp.hoaHongTheoLoaiHD) ? JSON.parse(JSON.stringify(emp.hoaHongTheoLoaiHD)) : []
        });
        fetchAllContracts();
        setOpenSalaryDialog(true);
    };

    const handleSaveEmpSalarySettings = () => {
        if (!selectedEmployee) return;
        showLoading("Đang lưu thiết lập lương & chỉ tiêu...");
        const payload = {
            username: selectedEmployee.username,
            fullname: selectedEmployee.fullname,
            birthday: selectedEmployee.birthday,
            positon: selectedEmployee.positon,
            permission: selectedEmployee.permission,
            avatar: selectedEmployee.avatar,
            luongCoBan: Number(empSalaryEdit.luongCoBan) || 0,
            loaiHoaHong: Number(empSalaryEdit.loaiHoaHong) || 0,
            luongHoaHong: Number(empSalaryEdit.luongHoaHong) || 0,
            chiTieuTuan: Number(empSalaryEdit.chiTieuTuan) || 0,
            chiTieuThang: Number(empSalaryEdit.chiTieuThang) || 0,
            chiTieuNam: Number(empSalaryEdit.chiTieuNam) || 0,
            hoaHongTheoLoaiHD: empSalaryEdit.hoaHongTheoLoaiHD || []
        };

        otherService.updateUser(payload)
            .then(() => {
                toast.success(`Cập nhật lương, hoa hồng & chỉ tiêu cho nhân viên "${selectedEmployee.fullname || selectedEmployee.username}" thành công!`);
                const updatedEmp = {
                    ...selectedEmployee,
                    luongCoBan: payload.luongCoBan,
                    loaiHoaHong: payload.loaiHoaHong,
                    luongHoaHong: payload.luongHoaHong,
                    chiTieuTuan: payload.chiTieuTuan,
                    chiTieuThang: payload.chiTieuThang,
                    chiTieuNam: payload.chiTieuNam,
                    hoaHongTheoLoaiHD: payload.hoaHongTheoLoaiHD
                };
                setSelectedEmployee(updatedEmp);
                loadData();
                setModalTab(0);
            })
            .catch(err => {
                toast.error("Lỗi cập nhật: " + err.message);
            })
            .finally(() => hideLoading());
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.warning("Dung lượng ảnh vượt quá 5MB!");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const loadData = () => {
        showLoading("Đang tải danh sách nhân viên...");
        otherService.findUsers({ keyword })
            .then(res => {
                if (res.data && res.data.status === 'success') {
                    setUsers(res.data.data.users || []);
                } else if (res.status === 'success') {
                    setUsers(res.data.users || []);
                } else {
                    setUsers(res.data?.users || []);
                }
            })
            .catch(err => {
                console.error(err);
                toast.error("Lỗi khi tải danh sách nhân viên: " + err.message);
            })
            .finally(() => hideLoading());
    };

    useEffect(() => {
        loadData();
        fetchAllContracts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setFullname('');
        setBirthday('');
        setPositon('Nhân viên Sale');
        setPermission(2);
        setAvatar('');
        setLuongCoBan(0);
        setLuongHoaHong(0);
        setLoaiHoaHong(0);
        setChiTieuTuan(5);
        setChiTieuThang(20);
        setChiTieuNam(200);
        setHoaHongTheoLoaiHD([]);
        setFormTab(0);
    };

    const handleCreateUser = () => {
        if (!username.trim()) {
            toast.warning("Vui lòng nhập tài khoản đăng nhập!");
            return;
        }
        if (!password.trim()) {
            toast.warning("Vui lòng nhập mật khẩu!");
            return;
        }
        if (!fullname.trim()) {
            toast.warning("Vui lòng nhập họ và tên!");
            return;
        }

        const payload = {
            username: username.trim().toLowerCase(),
            password: password,
            fullname: fullname.trim(),
            birthday: birthday.trim(),
            positon: positon,
            permission: Number(permission),
            avatar: avatar,
            luongCoBan: Number(luongCoBan) || 0,
            luongHoaHong: Number(luongHoaHong) || 0,
            loaiHoaHong: Number(loaiHoaHong) || 0,
            chiTieuTuan: Number(chiTieuTuan) || 0,
            chiTieuThang: Number(chiTieuThang) || 0,
            chiTieuNam: Number(chiTieuNam) || 0,
            hoaHongTheoLoaiHD: hoaHongTheoLoaiHD || []
        };

        showLoading("Đang tạo tài khoản nhân viên...");
        otherService.createUser(payload)
            .then(() => {
                toast.success("Tạo tài khoản nhân viên thành công!");
                setOpenAddDialog(false);
                resetForm();
                loadData();
            })
            .catch(err => {
                toast.error("Lỗi tạo nhân viên: " + err.message);
                hideLoading();
            });
    };

    const handleOpenEdit = (user) => {
        setUsername(user.username);
        setPassword('');
        setFullname(user.fullname || '');
        setBirthday(user.birthday || '');
        setPositon(user.positon || 'Nhân viên Sale');
        setPermission(user.permission || 2);
        setAvatar(user.avatar || '');
        setLuongCoBan(user.luongCoBan || 0);
        setLuongHoaHong(user.luongHoaHong || 0);
        setLoaiHoaHong(user.loaiHoaHong || 0);
        setChiTieuTuan(user.chiTieuTuan !== undefined ? user.chiTieuTuan : 5);
        setChiTieuThang(user.chiTieuThang !== undefined ? user.chiTieuThang : 20);
        setChiTieuNam(user.chiTieuNam !== undefined ? user.chiTieuNam : 200);
        setHoaHongTheoLoaiHD(Array.isArray(user.hoaHongTheoLoaiHD) ? JSON.parse(JSON.stringify(user.hoaHongTheoLoaiHD)) : []);
        setFormTab(0);
        setOpenEditDialog(true);
    };

    const handleUpdateUser = () => {
        if (!fullname.trim()) {
            toast.warning("Vui lòng nhập họ và tên!");
            return;
        }

        const payload = {
            username: username,
            fullname: fullname.trim(),
            birthday: birthday.trim(),
            positon: positon,
            permission: Number(permission),
            avatar: avatar,
            luongCoBan: Number(luongCoBan) || 0,
            luongHoaHong: Number(luongHoaHong) || 0,
            loaiHoaHong: Number(loaiHoaHong) || 0,
            chiTieuTuan: Number(chiTieuTuan) || 0,
            chiTieuThang: Number(chiTieuThang) || 0,
            chiTieuNam: Number(chiTieuNam) || 0,
            hoaHongTheoLoaiHD: hoaHongTheoLoaiHD || []
        };

        if (password.trim()) {
            payload.password = password;
        }

        showLoading("Đang cập nhật tài khoản nhân viên...");
        otherService.updateUser(payload)
            .then(() => {
                toast.success("Cập nhật tài khoản nhân viên thành công!");
                setOpenEditDialog(false);
                resetForm();
                loadData();
            })
            .catch(err => {
                toast.error("Lỗi cập nhật nhân viên: " + err.message);
                hideLoading();
            });
    };

    const handleDeleteUser = (user) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản nhân viên "${user.fullname || user.username}" không?`)) {
            return;
        }

        showLoading("Đang xóa tài khoản nhân viên...");
        otherService.removeUser({ username: user.username })
            .then(() => {
                toast.success("Xóa tài khoản nhân viên thành công!");
                loadData();
            })
            .catch(err => {
                toast.error("Lỗi khi xóa nhân viên: " + err.message);
                hideLoading();
            });
    };

    // Helper to update specific contract type commission in state
    const handleUpdateTypeCommission = (typeId, field, value, stateSetter, stateGetter) => {
        const currentList = Array.isArray(stateGetter) ? [...stateGetter] : [];
        const index = currentList.findIndex(item => Number(item.loaiHopDongId) === Number(typeId));
        
        if (index > -1) {
            const updatedItem = { ...currentList[index], [field]: value };
            currentList[index] = updatedItem;
        } else {
            const newItem = {
                loaiHopDongId: Number(typeId),
                loaiHoaHong: 0,
                mucHoaHong: 0,
                [field]: value
            };
            currentList.push(newItem);
        }
        stateSetter(currentList);
    };

    // Filtered Users
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesKey = !keyword.trim() || 
                (u.fullname && u.fullname.toLowerCase().includes(keyword.toLowerCase())) ||
                (u.username && u.username.toLowerCase().includes(keyword.toLowerCase())) ||
                (u.positon && u.positon.toLowerCase().includes(keyword.toLowerCase()));

            const matchesPos = filterPosition === 'Tất cả' || u.positon === filterPosition;
            const matchesPerm = filterPermission === 'Tất cả' || 
                (filterPermission === 'Admin' && u.permission === 1) ||
                (filterPermission === 'Staff' && u.permission !== 1);

            return matchesKey && matchesPos && matchesPerm;
        });
    }, [users, keyword, filterPosition, filterPermission]);

    // Statistics Calculations
    const totalStaffCount = users.length;
    const adminCount = users.filter(u => u.permission === 1).length;
    const totalBaseSalaryFund = users.reduce((sum, u) => sum + Number(u.luongCoBan || 0), 0);
    const avgTargetMonth = totalStaffCount > 0 ? Math.round(users.reduce((sum, u) => sum + Number(u.chiTieuThang || 20), 0) / totalStaffCount) : 20;

    // Component: Render the Commission by Contract Type Configuration Table
    const renderCommissionByContractTypeTable = (configList, setConfigList) => {
        return (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                <Table size="small">
                    <TableHead sx={{ '& th': { bgcolor: '#f1f5f9', fontWeight: 800, color: '#334155', py: 1.2 } }}>
                        <TableRow>
                            <TableCell style={{ width: '40px' }} align="center">STT</TableCell>
                            <TableCell style={{ width: '220px' }}>LOẠI HỢP ĐỒNG / GÓI DỊCH VỤ</TableCell>
                            <TableCell style={{ width: '200px' }}>CƠ CHẾ TÍNH</TableCell>
                            <TableCell style={{ width: '220px' }}>MỨC HOA HỒNG</TableCell>
                            <TableCell style={{ width: '180px' }}>XEM TRƯỚC</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contractTypes.map((type, idx) => {
                            const customConfig = (configList || []).find(c => Number(c.loaiHopDongId) === Number(type.id));
                            const ruleType = customConfig !== undefined ? customConfig.loaiHoaHong : 0;
                            const ruleValue = customConfig !== undefined ? customConfig.mucHoaHong : 0;
                            const isConfigured = customConfig !== undefined && customConfig.mucHoaHong !== '' && customConfig.mucHoaHong !== null && Number(customConfig.mucHoaHong) > 0;

                            return (
                                <TableRow key={type.id} hover sx={{ bgcolor: isConfigured ? '#f0fdf4' : 'inherit' }}>
                                    <TableCell align="center" sx={{ color: '#64748b', fontWeight: 600 }}>
                                        {idx + 1}
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <span className="contract-type-tag">
                                                💎 {type.name}
                                            </span>
                                            {isConfigured && (
                                                <span className="custom-rate-badge">Đã set riêng</span>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <FormControl size="small" fullWidth>
                                            <Select
                                                value={ruleType}
                                                onChange={(e) => handleUpdateTypeCommission(type.id, 'loaiHoaHong', Number(e.target.value), setConfigList, configList)}
                                                sx={{ height: 38, fontSize: '0.85rem', bgcolor: '#fff' }}
                                            >
                                                <MenuItem value={0}>🪙 VNĐ / mỗi công việc</MenuItem>
                                                <MenuItem value={1}>📈 % Doanh số hợp đồng</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            value={ruleType === 1 ? ruleValue : formatInputNumber(ruleValue)}
                                            onChange={(e) => {
                                                const val = ruleType === 1 ? Number(e.target.value) || 0 : parseInputNumber(e.target.value);
                                                handleUpdateTypeCommission(type.id, 'mucHoaHong', val, setConfigList, configList);
                                            }}
                                            placeholder={ruleType === 1 ? "Ví dụ: 5" : "Ví dụ: 200.000"}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ruleType === 1 ? '#b45309' : '#15803d' }}>
                                                            {ruleType === 1 ? '%' : 'đ'}
                                                        </span>
                                                    </InputAdornment>
                                                ),
                                                sx: { height: 38, fontWeight: 700, bgcolor: '#fff' }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {ruleType === 1 ? (
                                            <span className="preview-pill preview-percent">
                                                {ruleValue || 0}% (HĐ 10Tr → {formatMoney(((10000000 * (Number(ruleValue) || 0)) / 100))})
                                            </span>
                                        ) : (
                                            <span className="preview-pill preview-fixed">
                                                +{formatMoney(ruleValue || 0)} / CV
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <div className="emp-page-container">
            {/* 1. HEADER TITLE & STATS DASHBOARD */}
            <div className="emp-header">
                <div className="emp-title-wrap">
                    <div className="emp-badge-top">
                        <i className="fa-solid fa-users-gear"></i> LONG WEDDING HUMAN RESOURCES
                    </div>
                    <h2>
                        <i className="fa-solid fa-users" style={{ color: '#0284c7' }}></i> QUẢN LÝ NHÂN SỰ & ĐỘI NGŨ
                    </h2>
                    <p className="emp-subtitle">
                        Quản lý hồ sơ nhân viên, phân quyền truy cập, định mức chỉ tiêu KPI và cơ chế hoa hồng theo từng loại hợp đồng
                    </p>
                </div>

                <div className="emp-header-actions">
                    <Button
                        variant="contained"
                        className="btn-add-employee"
                        onClick={() => {
                            resetForm();
                            setOpenAddDialog(true);
                        }}
                        startIcon={<i className="fa-solid fa-user-plus"></i>}
                    >
                        Thêm Nhân Viên Mới
                    </Button>
                </div>
            </div>

            {/* STATS OVERVIEW CARDS */}
            <div className="emp-stats-grid">
                <div className="emp-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Tổng số nhân sự</span>
                        <h3>{totalStaffCount} <span className="stat-unit">thành viên</span></h3>
                        <span className="stat-sub">{adminCount} Quản trị viên • {totalStaffCount - adminCount} Nhân viên</span>
                    </div>
                    <div className="stat-icon icon-blue">
                        <i className="fa-solid fa-id-card-clip"></i>
                    </div>
                </div>

                <div className="emp-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Tổng quỹ lương cứng</span>
                        <h3 style={{ color: '#16a34a' }}>{formatShortMoney(totalBaseSalaryFund)}</h3>
                        <span className="stat-sub">Định mức chi trả cố định / tháng</span>
                    </div>
                    <div className="stat-icon icon-green">
                        <i className="fa-solid fa-money-bill-wave"></i>
                    </div>
                </div>

                <div className="emp-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Chỉ tiêu TB / Nhân sự</span>
                        <h3 style={{ color: '#d97706' }}>{avgTargetMonth} <span className="stat-unit">CV / tháng</span></h3>
                        <span className="stat-sub">Định mức công việc tiêu chuẩn</span>
                    </div>
                    <div className="stat-icon icon-gold">
                        <i className="fa-solid fa-bullseye"></i>
                    </div>
                </div>

                <div className="emp-stat-card glass-panel">
                    <div className="stat-info">
                        <span className="stat-label">Đội ngũ đang hoạt động</span>
                        <h3 style={{ color: '#9333ea' }}>100% <span className="stat-unit">Sẵn sàng</span></h3>
                        <span className="stat-sub">Ekip chụp, make-up & tư vấn</span>
                    </div>
                    <div className="stat-icon icon-purple">
                        <i className="fa-solid fa-user-check"></i>
                    </div>
                </div>
            </div>

            {/* 2. FILTER & CONTROLS TOOLBAR */}
            <div className="emp-toolbar glass-panel">
                <div className="toolbar-left">
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm theo tên, username, chức vụ..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="search-input"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <i className="fa-solid fa-magnifying-glass" style={{ color: '#94a3b8' }}></i>
                                </InputAdornment>
                            ),
                            endAdornment: keyword && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setKeyword('')}>
                                        <i className="fa-solid fa-xmark" style={{ fontSize: '0.85rem' }}></i>
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Chức vụ</InputLabel>
                        <Select
                            value={filterPosition}
                            label="Chức vụ"
                            onChange={(e) => setFilterPosition(e.target.value)}
                        >
                            <MenuItem value="Tất cả">Tất cả chức vụ</MenuItem>
                            <MenuItem value="Quản lý">Quản lý</MenuItem>
                            <MenuItem value="Nhân viên Sale">Nhân viên Sale</MenuItem>
                            <MenuItem value="Thợ chụp hình">Thợ chụp hình</MenuItem>
                            <MenuItem value="Thợ trang điểm">Thợ trang điểm</MenuItem>
                            <MenuItem value="Thợ chỉnh ảnh">Thợ chỉnh ảnh</MenuItem>
                            <MenuItem value="Nhân viên phục vụ">Nhân viên phục vụ</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Quyền hạn</InputLabel>
                        <Select
                            value={filterPermission}
                            label="Quyền hạn"
                            onChange={(e) => setFilterPermission(e.target.value)}
                        >
                            <MenuItem value="Tất cả">Tất cả quyền</MenuItem>
                            <MenuItem value="Admin">Quản trị viên</MenuItem>
                            <MenuItem value="Staff">Nhân viên</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <div className="toolbar-right">
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        size="small"
                        onChange={(e, next) => next && setViewMode(next)}
                        className="view-toggle"
                    >
                        <ToggleButton value="table" title="Xem dạng bảng">
                            <i className="fa-solid fa-list"></i>
                        </ToggleButton>
                        <ToggleButton value="card" title="Xem dạng thẻ">
                            <i className="fa-solid fa-grip"></i>
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Tooltip title="Làm mới dữ liệu">
                        <IconButton onClick={loadData} className="btn-refresh">
                            <i className="fa-solid fa-rotate"></i>
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* 3. CONTENT: TABLE VIEW OR CARD GRID VIEW */}
            {viewMode === 'table' ? (
                <Paper elevation={0} className="emp-table-container glass-panel">
                    <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
                        <Table stickyHeader size="small">
                            <TableHead sx={{ '& th': { bgcolor: '#f8fafc', color: '#334155', fontWeight: 800, py: 1.8 } }}>
                                <TableRow>
                                    <TableCell align="center" style={{ width: '60px' }}>STT</TableCell>
                                    <TableCell style={{ width: '240px' }}>THÀNH VIÊN</TableCell>
                                    <TableCell style={{ width: '150px' }}>CHỨC VỤ</TableCell>
                                    <TableCell align="right" style={{ width: '140px' }}>LƯƠNG CƠ BẢN</TableCell>
                                    <TableCell align="right" style={{ width: '180px' }}>CƠ CHẾ HOA HỒNG</TableCell>
                                    <TableCell align="center" style={{ width: '150px' }}>CHỈ TIÊU (T/TH/N)</TableCell>
                                    <TableCell align="center" style={{ width: '120px' }}>QUYỀN HẠN</TableCell>
                                    <TableCell align="center" style={{ width: '220px' }}>HÀNH ĐỘNG</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                            <i className="fa-solid fa-user-slash" style={{ fontSize: '2.5rem', marginBottom: 10, display: 'block', color: '#cbd5e1' }}></i>
                                            Không tìm thấy nhân viên nào phù hợp với bộ lọc.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user, idx) => {
                                        const roleStyle = getRoleBadgeStyle(user.positon);
                                        const customCount = Array.isArray(user.hoaHongTheoLoaiHD) ? user.hoaHongTheoLoaiHD.filter(c => Number(c.mucHoaHong) > 0).length : 0;

                                        return (
                                            <TableRow 
                                                key={user.username || idx} 
                                                className="emp-table-row"
                                                onClick={() => handleOpenSalaryDetail(user)}
                                            >
                                                <TableCell align="center" style={{ fontWeight: 700, color: '#64748b' }}>
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1.8}>
                                                        <Avatar 
                                                            src={user.avatar || logoDefault} 
                                                            sx={{ 
                                                                width: 44, 
                                                                height: 44, 
                                                                border: `2px solid ${roleStyle.border}`,
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                                            }} 
                                                        />
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                                                {user.fullname || user.username}
                                                            </Typography>
                                                            <Stack direction="row" spacing={0.8} alignItems="center" mt={0.3} flexWrap="wrap" useFlexGap>
                                                                <span className="username-pill">@{user.username}</span>
                                                                {user.birthday && (
                                                                    <span className="birthday-pill">
                                                                        🎂 {user.birthday}
                                                                    </span>
                                                                )}
                                                                {getEmployeeAwards(user.username, user).map((badge, bIdx) => (
                                                                    <Chip 
                                                                        key={bIdx} 
                                                                        label={badge} 
                                                                        className="emp-award-chip-mini"
                                                                        size="small"
                                                                    />
                                                                ))}
                                                            </Stack>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <span 
                                                        className="role-pill" 
                                                        style={{ 
                                                            backgroundColor: roleStyle.bg, 
                                                            color: roleStyle.color, 
                                                            borderColor: roleStyle.border 
                                                        }}
                                                    >
                                                        <i className={roleStyle.icon} style={{ marginRight: 5 }}></i>
                                                        {user.positon || 'Nhân viên'}
                                                    </span>
                                                </TableCell>
                                                <TableCell align="right" style={{ fontWeight: 800, color: '#16a34a' }}>
                                                    {formatMoney(user.luongCoBan || 0)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <div>
                                                        {user.loaiHoaHong === 1 ? (
                                                            <span className="commission-badge commission-percent">
                                                                📈 {user.luongHoaHong || 0}% Doanh số
                                                            </span>
                                                        ) : (
                                                            <span className="commission-badge commission-fixed">
                                                                🪙 {formatMoney(user.luongHoaHong || 0)} / CV
                                                            </span>
                                                        )}
                                                        {customCount > 0 && (
                                                            <span className="custom-type-count-badge">
                                                                +{customCount} loại HĐ riêng
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <div className="target-pill">
                                                        <span><b>{user.chiTieuTuan || 5}</b> T</span>
                                                        <span>•</span>
                                                        <span><b>{user.chiTieuThang || 20}</b> Th</span>
                                                        <span>•</span>
                                                        <span><b>{user.chiTieuNam || 200}</b> N</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {user.permission === 1 ? (
                                                        <span className="perm-badge perm-admin">
                                                            <i className="fa-solid fa-shield-halved"></i> Quản trị
                                                        </span>
                                                    ) : (
                                                        <span className="perm-badge perm-staff">
                                                            <i className="fa-solid fa-user"></i> Nhân viên
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                                    <Stack direction="row" spacing={1} justifyContent="center">
                                                        <Tooltip title="Tặng danh hiệu & Vinh danh nhân viên">
                                                            <IconButton 
                                                                size="small" 
                                                                className="btn-action-award"
                                                                onClick={() => handleOpenAwardDialog(user)}
                                                            >
                                                                <i className="fa-solid fa-award"></i>
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Xem Báo Cáo Doanh Thu, Lương & Đặt Hoa Hồng Từng Loại HĐ">
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                className="btn-action-salary"
                                                                onClick={() => handleOpenSalaryDetail(user)}
                                                                startIcon={<i className="fa-solid fa-chart-pie"></i>}
                                                            >
                                                                Báo Cáo & Lương
                                                            </Button>
                                                        </Tooltip>
                                                        <Tooltip title="Sửa thông tin tài khoản">
                                                            <IconButton 
                                                                size="small" 
                                                                className="btn-action-edit"
                                                                onClick={() => handleOpenEdit(user)}
                                                            >
                                                                <i className="fa-solid fa-pen"></i>
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Xóa nhân viên">
                                                            <IconButton 
                                                                size="small" 
                                                                className="btn-action-delete"
                                                                onClick={() => handleDeleteUser(user)}
                                                            >
                                                                <i className="fa-solid fa-trash"></i>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            ) : (
                /* CARD GRID VIEW */
                <div className="emp-cards-grid">
                    {filteredUsers.length === 0 ? (
                        <div className="no-data-card glass-panel">
                            <i className="fa-solid fa-user-slash"></i>
                            <p>Không tìm thấy nhân viên nào phù hợp.</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                            const roleStyle = getRoleBadgeStyle(user.positon);
                            const customCount = Array.isArray(user.hoaHongTheoLoaiHD) ? user.hoaHongTheoLoaiHD.filter(c => Number(c.mucHoaHong) > 0).length : 0;

                            return (
                                <div key={user.username} className="emp-profile-card glass-panel">
                                    <div className="card-top-bar" style={{ background: roleStyle.color }}></div>
                                    <div className="card-body">
                                        <div className="card-avatar-wrap">
                                            <Avatar 
                                                src={user.avatar || logoDefault} 
                                                sx={{ 
                                                    width: 72, 
                                                    height: 72, 
                                                    border: `3px solid ${roleStyle.border}`,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                                                }} 
                                            />
                                            {user.permission === 1 && (
                                                <span className="card-admin-star" title="Quản trị viên">👑</span>
                                            )}
                                        </div>

                                        <h4 className="card-name">{user.fullname || user.username}</h4>
                                        <span className="card-username">@{user.username}</span>

                                        <div className="card-role-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                            <span 
                                                className="role-pill" 
                                                style={{ 
                                                    backgroundColor: roleStyle.bg, 
                                                    color: roleStyle.color, 
                                                    borderColor: roleStyle.border 
                                                }}
                                            >
                                                <i className={roleStyle.icon} style={{ marginRight: 4 }}></i>
                                                {user.positon || 'Nhân viên'}
                                            </span>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                                                {getEmployeeAwards(user.username, user).map((badge, bIdx) => (
                                                    <Chip 
                                                        key={bIdx} 
                                                        label={badge} 
                                                        className="emp-award-chip-mini" 
                                                        size="small" 
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="card-metrics-box">
                                            <div className="card-metric-row">
                                                <span className="metric-lbl">Lương cơ bản:</span>
                                                <strong className="metric-val" style={{ color: '#16a34a' }}>
                                                    {formatMoney(user.luongCoBan || 0)}
                                                </strong>
                                            </div>
                                            <div className="card-metric-row">
                                                <span className="metric-lbl">Hoa hồng:</span>
                                                <strong className="metric-val" style={{ color: '#d97706' }}>
                                                    {user.loaiHoaHong === 1 ? `${user.luongHoaHong || 0}% Doanh số` : `${formatMoney(user.luongHoaHong || 0)} / CV`}
                                                </strong>
                                            </div>
                                            {customCount > 0 && (
                                                <div className="card-metric-row">
                                                    <span className="metric-lbl">Cấu hình riêng:</span>
                                                    <strong className="metric-val" style={{ color: '#0284c7' }}>
                                                        {customCount} loại hợp đồng
                                                    </strong>
                                                </div>
                                            )}
                                            <div className="card-metric-row">
                                                <span className="metric-lbl">Chỉ tiêu tháng:</span>
                                                <strong className="metric-val">
                                                    {user.chiTieuThang || 20} CV / tháng
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="card-footer-actions">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                className="btn-action-salary"
                                                fullWidth
                                                onClick={() => handleOpenSalaryDetail(user)}
                                                startIcon={<i className="fa-solid fa-chart-pie"></i>}
                                            >
                                                Báo Cáo & Lương
                                            </Button>
                                            <IconButton 
                                                size="small" 
                                                className="btn-action-award"
                                                onClick={() => handleOpenAwardDialog(user)}
                                                title="Tặng danh hiệu & Vinh danh"
                                            >
                                                <i className="fa-solid fa-award"></i>
                                            </IconButton>
                                            <IconButton 
                                                size="small" 
                                                className="btn-action-edit"
                                                onClick={() => handleOpenEdit(user)}
                                                title="Chỉnh sửa"
                                            >
                                                <i className="fa-solid fa-pen"></i>
                                            </IconButton>
                                            <IconButton 
                                                size="small" 
                                                className="btn-action-delete"
                                                onClick={() => handleDeleteUser(user)}
                                                title="Xóa"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </IconButton>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* 4. MODAL ADD / CREATE EMPLOYEE */}
            <Dialog 
                open={openAddDialog} 
                onClose={() => setOpenAddDialog(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <i className="fa-solid fa-user-plus" style={{ color: '#38bdf8' }}></i>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            THÊM MỚI NHÂN VIÊN VÀO HỆ THỐNG
                        </Typography>
                    </Box>
                </DialogTitle>

                <Tabs
                    value={formTab}
                    onChange={(e, val) => setFormTab(val)}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2, bgcolor: '#f8fafc' }}
                >
                    <Tab label="👤 1. Thông Tin Tài Khoản" sx={{ fontWeight: 700, textTransform: 'none' }} />
                    <Tab label="💰 2. Lương Cơ Bản & Chỉ Tiêu" sx={{ fontWeight: 700, textTransform: 'none' }} />
                    <Tab label="💎 3. Hoa Hồng Theo Loại Hợp Đồng" sx={{ fontWeight: 700, textTransform: 'none' }} />
                </Tabs>

                <DialogContent dividers sx={{ p: 3 }}>
                    {formTab === 0 && (
                        <Box display="flex" flexDirection="column" gap={2.5}>
                            {/* Avatar Upload */}
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                <Box position="relative">
                                    <Avatar
                                        src={avatar || logoDefault}
                                        alt="avatar"
                                        sx={{ 
                                            width: 96, 
                                            height: 96, 
                                            border: '3px solid #0284c7', 
                                            boxShadow: '0 6px 16px rgba(2,132,199,0.3)' 
                                        }}
                                    />
                                    <label htmlFor="add-user-avatar" style={{ position: 'absolute', bottom: -4, right: -4 }}>
                                        <input
                                            accept="image/*"
                                            id="add-user-avatar"
                                            type="file"
                                            style={{ display: 'none' }}
                                            onChange={handleAvatarChange}
                                        />
                                        <IconButton color="primary" component="span" sx={{ bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', '&:hover': { bgcolor: '#f0f0f0' } }}>
                                            <PhotoCamera fontSize="small" />
                                        </IconButton>
                                    </label>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                    Bấm vào icon máy ảnh để tải ảnh đại diện nhân viên
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Tài khoản đăng nhập (Username)"
                                        required
                                        fullWidth
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                        placeholder="Ví dụ: nva_photo, sale_chithao..."
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Mật khẩu khởi tạo"
                                        required
                                        type="password"
                                        fullWidth
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu ban đầu..."
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Họ và tên nhân viên"
                                        required
                                        fullWidth
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                        placeholder="Ví dụ: Nguyễn Văn An"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Ngày sinh nhật (DD/MM/YYYY)"
                                        fullWidth
                                        value={birthday}
                                        onChange={(e) => setBirthday(e.target.value)}
                                        placeholder="Ví dụ: 15/08/1998"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Chức vụ (Phòng ban)</InputLabel>
                                        <Select
                                            value={positon}
                                            label="Chức vụ (Phòng ban)"
                                            onChange={(e) => setPositon(e.target.value)}
                                        >
                                            <MenuItem value="Quản lý">👑 Quản lý</MenuItem>
                                            <MenuItem value="Nhân viên Sale">💼 Nhân viên Sale</MenuItem>
                                            <MenuItem value="Thợ chụp hình">📸 Thợ chụp hình</MenuItem>
                                            <MenuItem value="Thợ trang điểm">💄 Thợ trang điểm</MenuItem>
                                            <MenuItem value="Thợ chỉnh ảnh">🎨 Thợ chỉnh ảnh</MenuItem>
                                            <MenuItem value="Nhân viên phục vụ">👥 Nhân viên phục vụ</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Quyền hạn trên hệ thống</InputLabel>
                                        <Select
                                            value={permission}
                                            label="Quyền hạn trên hệ thống"
                                            onChange={(e) => setPermission(e.target.value)}
                                        >
                                            <MenuItem value={1}>🛡️ Quản trị viên (Admin - Toàn quyền)</MenuItem>
                                            <MenuItem value={2}>👤 Nhân viên (Staff - Bán hàng & Xem lịch)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {formTab === 1 && (
                        /* TAB 1: LƯƠNG CƠ BẢN & CHỈ TIÊU */
                        <Box display="flex" flexDirection="column" gap={2.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className="fa-solid fa-wallet" style={{ color: '#16a34a' }}></i> LƯƠNG CƠ BẢN & HOA HỒNG MẶC ĐỊNH
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Lương cơ bản (VNĐ/tháng)"
                                        type="text"
                                        fullWidth
                                        value={formatInputNumber(luongCoBan)}
                                        onChange={(e) => setLuongCoBan(parseInputNumber(e.target.value))}
                                        placeholder="Ví dụ: 7.000.000"
                                        helperText={`Bằng chữ: ${formatMoney(luongCoBan)}`}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Loại hoa hồng mặc định</InputLabel>
                                        <Select
                                            value={loaiHoaHong}
                                            label="Loại hoa hồng mặc định"
                                            onChange={(e) => setLoaiHoaHong(Number(e.target.value))}
                                        >
                                            <MenuItem value={0}>🪙 VNĐ / mỗi công việc</MenuItem>
                                            <MenuItem value={1}>📈 % Doanh số hợp đồng</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label={loaiHoaHong === 1 ? "Mức hoa hồng mặc định (%)" : "Mức hoa hồng mặc định (VNĐ/CV)"}
                                        type="text"
                                        fullWidth
                                        value={loaiHoaHong === 1 ? luongHoaHong : formatInputNumber(luongHoaHong)}
                                        onChange={(e) => setLuongHoaHong(loaiHoaHong === 1 ? Number(e.target.value) || 0 : parseInputNumber(e.target.value))}
                                        placeholder={loaiHoaHong === 1 ? "Ví dụ: 5" : "Ví dụ: 100.000"}
                                        helperText={loaiHoaHong === 1 ? "Ví dụ: 5% doanh số" : `Bằng chữ: ${formatMoney(luongHoaHong)} / CV`}
                                    />
                                </Grid>
                            </Grid>

                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className="fa-solid fa-bullseye" style={{ color: '#d97706' }}></i> ĐỊNH MỨC CHỈ TIÊU KPI
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Chỉ tiêu Tuần (Số CV)"
                                        type="number"
                                        fullWidth
                                        value={chiTieuTuan}
                                        onChange={(e) => setChiTieuTuan(Number(e.target.value) || 0)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Chỉ tiêu Tháng (Số CV)"
                                        type="number"
                                        fullWidth
                                        value={chiTieuThang}
                                        onChange={(e) => setChiTieuThang(Number(e.target.value) || 0)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Chỉ tiêu Năm (Số CV)"
                                        type="number"
                                        fullWidth
                                        value={chiTieuNam}
                                        onChange={(e) => setChiTieuNam(Number(e.target.value) || 0)}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {formTab === 2 && (
                        /* TAB 2: HOA HỒNG CHI TIẾT THEO LOẠI HỢP ĐỒNG */
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box p={1.8} bgcolor="#eff6ff" borderRadius="10px" border="1px solid #bfdbfe">
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className="fa-solid fa-tags"></i> CÀI ĐẶT MỨC HOA HỒNG CHO TỪNG LOẠI HỢP ĐỒNG
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.4 }}>
                                    Hệ thống sẽ tự động tính đúng mức hoa hồng tương ứng khi nhân viên thực hiện loại hợp đồng đó. Nếu để 0 hoặc trống, hệ thống sẽ tự động lấy mức hoa hồng mặc định.
                                </Typography>
                            </Box>

                            {renderCommissionByContractTypeTable(hoaHongTheoLoaiHD, setHoaHongTheoLoaiHD)}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
                    <Button onClick={() => setOpenAddDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleCreateUser} 
                        variant="contained" 
                        color="primary"
                        startIcon={<i className="fa-solid fa-check"></i>}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                        Tạo Tài Khoản
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 5. MODAL EDIT EMPLOYEE */}
            <Dialog 
                open={openEditDialog} 
                onClose={() => setOpenEditDialog(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <i className="fa-solid fa-user-pen" style={{ color: '#fbbf24' }}></i>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            CẬP NHẬT HỒ SƠ NHÂN VIÊN
                        </Typography>
                    </Box>
                    <Chip label={`@${username}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600 }} />
                </DialogTitle>

                <Tabs
                    value={formTab}
                    onChange={(e, val) => setFormTab(val)}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2, bgcolor: '#f8fafc' }}
                >
                    <Tab label="👤 1. Thông Tin Tài Khoản" sx={{ fontWeight: 700, textTransform: 'none' }} />
                    <Tab label="💰 2. Lương Cơ Bản & Chỉ Tiêu" sx={{ fontWeight: 700, textTransform: 'none' }} />
                    <Tab label="💎 3. Hoa Hồng Theo Loại HĐ" sx={{ fontWeight: 700, textTransform: 'none' }} />
                </Tabs>

                <DialogContent dividers sx={{ p: 3 }}>
                    {formTab === 0 && (
                        <Box display="flex" flexDirection="column" gap={2.5}>
                            {/* Avatar Upload */}
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                <Box position="relative">
                                    <Avatar
                                        src={avatar || logoDefault}
                                        alt="avatar"
                                        sx={{ 
                                            width: 96, 
                                            height: 96, 
                                            border: '3px solid #f59e0b', 
                                            boxShadow: '0 6px 16px rgba(245,158,11,0.3)' 
                                        }}
                                    />
                                    <label htmlFor="edit-user-avatar" style={{ position: 'absolute', bottom: -4, right: -4 }}>
                                        <input
                                            accept="image/*"
                                            id="edit-user-avatar"
                                            type="file"
                                            style={{ display: 'none' }}
                                            onChange={handleAvatarChange}
                                        />
                                        <IconButton color="primary" component="span" sx={{ bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', '&:hover': { bgcolor: '#f0f0f0' } }}>
                                            <PhotoCamera fontSize="small" />
                                        </IconButton>
                                    </label>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                    Bấm vào icon máy ảnh để đổi ảnh đại diện
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Tài khoản đăng nhập (Username)"
                                        disabled
                                        fullWidth
                                        value={username}
                                        helperText="Tên đăng nhập không thể thay đổi"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Mật khẩu mới (Bỏ trống nếu giữ nguyên)"
                                        type="password"
                                        fullWidth
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu mới..."
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Họ và tên nhân viên"
                                        required
                                        fullWidth
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Ngày sinh nhật (DD/MM/YYYY)"
                                        fullWidth
                                        value={birthday}
                                        onChange={(e) => setBirthday(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Chức vụ (Phòng ban)</InputLabel>
                                        <Select
                                            value={positon}
                                            label="Chức vụ (Phòng ban)"
                                            onChange={(e) => setPositon(e.target.value)}
                                        >
                                            <MenuItem value="Quản lý">👑 Quản lý</MenuItem>
                                            <MenuItem value="Nhân viên Sale">💼 Nhân viên Sale</MenuItem>
                                            <MenuItem value="Thợ chụp hình">📸 Thợ chụp hình</MenuItem>
                                            <MenuItem value="Thợ trang điểm">💄 Thợ trang điểm</MenuItem>
                                            <MenuItem value="Thợ chỉnh ảnh">🎨 Thợ chỉnh ảnh</MenuItem>
                                            <MenuItem value="Nhân viên phục vụ">👥 Nhân viên phục vụ</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Quyền hạn trên hệ thống</InputLabel>
                                        <Select
                                            value={permission}
                                            label="Quyền hạn trên hệ thống"
                                            onChange={(e) => setPermission(e.target.value)}
                                        >
                                            <MenuItem value={1}>🛡️ Quản trị viên (Admin - Toàn quyền)</MenuItem>
                                            <MenuItem value={2}>👤 Nhân viên (Staff - Bán hàng & Xem lịch)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {formTab === 1 && (
                        /* TAB 1: LƯƠNG & KPI */
                        <Box display="flex" flexDirection="column" gap={2.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className="fa-solid fa-wallet" style={{ color: '#16a34a' }}></i> LƯƠNG CƠ BẢN & HOA HỒNG MẶC ĐỊNH
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Lương cơ bản (VNĐ/tháng)"
                                        type="text"
                                        fullWidth
                                        value={formatInputNumber(luongCoBan)}
                                        onChange={(e) => setLuongCoBan(parseInputNumber(e.target.value))}
                                        helperText={`Bằng chữ: ${formatMoney(luongCoBan)}`}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Loại hoa hồng mặc định</InputLabel>
                                        <Select
                                            value={loaiHoaHong}
                                            label="Loại hoa hồng mặc định"
                                            onChange={(e) => setLoaiHoaHong(Number(e.target.value))}
                                        >
                                            <MenuItem value={0}>🪙 VNĐ / mỗi công việc</MenuItem>
                                            <MenuItem value={1}>📈 % Doanh số hợp đồng</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label={loaiHoaHong === 1 ? "Mức hoa hồng mặc định (%)" : "Mức hoa hồng mặc định (VNĐ/CV)"}
                                        type="text"
                                        fullWidth
                                        value={loaiHoaHong === 1 ? luongHoaHong : formatInputNumber(luongHoaHong)}
                                        onChange={(e) => setLuongHoaHong(loaiHoaHong === 1 ? Number(e.target.value) || 0 : parseInputNumber(e.target.value))}
                                        helperText={loaiHoaHong === 1 ? "Ví dụ 5% doanh số hợp đồng" : `Bằng chữ: ${formatMoney(luongHoaHong)} / CV`}
                                    />
                                </Grid>
                            </Grid>

                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className="fa-solid fa-bullseye" style={{ color: '#d97706' }}></i> ĐỊNH MỨC CHỈ TIÊU KPI
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Chỉ tiêu Tuần (Số CV)"
                                        type="number"
                                        fullWidth
                                        value={chiTieuTuan}
                                        onChange={(e) => setChiTieuTuan(Number(e.target.value) || 0)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Chỉ tiêu Tháng (Số CV)"
                                        type="number"
                                        fullWidth
                                        value={chiTieuThang}
                                        onChange={(e) => setChiTieuThang(Number(e.target.value) || 0)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Chỉ tiêu Năm (Số CV)"
                                        type="number"
                                        fullWidth
                                        value={chiTieuNam}
                                        onChange={(e) => setChiTieuNam(Number(e.target.value) || 0)}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {formTab === 2 && (
                        /* TAB 2: HOA HỒNG THEO LOẠI HỢP ĐỒNG */
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box p={1.8} bgcolor="#eff6ff" borderRadius="10px" border="1px solid #bfdbfe">
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className="fa-solid fa-tags"></i> CÀI ĐẶT MỨC HOA HỒNG CHO TỪNG LOẠI HỢP ĐỒNG
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.4 }}>
                                    Thiết lập mức hoa hồng riêng cho từng loại hợp đồng (Pre-wedding, Phóng sự cưới, Makeup, Thuê đồ...). Loại nào không điền sẽ áp dụng mức hoa hồng mặc định.
                                </Typography>
                            </Box>

                            {renderCommissionByContractTypeTable(hoaHongTheoLoaiHD, setHoaHongTheoLoaiHD)}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
                    <Button onClick={() => setOpenEditDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleUpdateUser} 
                        variant="contained" 
                        color="warning"
                        startIcon={<i className="fa-solid fa-floppy-disk"></i>}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                        Lưu Cập Nhật
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 6. MODAL BÁO CÁO DOANH THU & THIẾT LẬP LƯƠNG, THƯỞNG, HOA HỒNG LOẠI HĐ */}
            <Dialog
                open={openSalaryDialog}
                onClose={() => setOpenSalaryDialog(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                {selectedEmployee && (
                    <>
                        {/* Modal Header */}
                        <Box sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', p: 2.5, position: 'relative' }}>
                            <IconButton
                                size="small"
                                onClick={() => setOpenSalaryDialog(false)}
                                sx={{ position: 'absolute', top: 14, right: 14, color: '#94a3b8', '&:hover': { color: '#fff' } }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </IconButton>

                            <Stack direction="row" spacing={2.5} alignItems="center">
                                <Avatar 
                                    src={selectedEmployee.avatar || logoDefault} 
                                    sx={{ 
                                        width: 64, 
                                        height: 64, 
                                        border: '3px solid #38bdf8',
                                        boxShadow: '0 4px 14px rgba(56,189,248,0.4)' 
                                    }} 
                                />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>
                                        {selectedEmployee.fullname || selectedEmployee.username}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                                        <Chip 
                                            label={selectedEmployee.positon || 'Nhân viên'} 
                                            size="small" 
                                            sx={{ bgcolor: '#0284c7', color: '#fff', fontWeight: 700, height: 24, fontSize: '0.75rem' }} 
                                        />
                                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                            @{selectedEmployee.username}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Box>

                        {/* Modal Tabs Navigation */}
                        <Tabs
                            value={modalTab}
                            onChange={(e, val) => setModalTab(val)}
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{ borderBottom: 1, borderColor: 'divider', px: 2, bgcolor: '#f8fafc' }}
                        >
                            <Tab 
                                icon={<i className="fa-solid fa-chart-pie" style={{ marginRight: 6, color: '#0284c7' }}></i>}
                                iconPosition="start"
                                label="📊 Báo Cáo Doanh Thu & Bảng Lương" 
                                sx={{ fontWeight: 700, textTransform: 'none' }} 
                            />
                            <Tab 
                                icon={<i className="fa-solid fa-sliders" style={{ marginRight: 6, color: '#f59e0b' }}></i>}
                                iconPosition="start"
                                label="⚙️ Thiết Lập Lương & Hoa Hồng Theo Loại HĐ" 
                                sx={{ fontWeight: 700, textTransform: 'none' }} 
                            />
                        </Tabs>

                        <DialogContent sx={{ p: 3 }}>
                            {/* TAB 0: BÁO CÁO DOANH THU & BẢNG LƯƠNG */}
                            {modalTab === 0 && (() => {
                                const fn = (selectedEmployee.fullname || '').trim().toLowerCase();
                                const un = (selectedEmployee.username || '').trim().toLowerCase();

                                const myMonthContracts = allContractsList.filter(contract => {
                                    if (selectedMonth !== 0) {
                                        const rawDate = contract.ngayHopDong || contract.createdAt || contract.ngayTao || contract.cacNgay?.ngayChup;
                                        if (!rawDate) return false;
                                        const d = new Date(rawDate);
                                        if (isNaN(d.getTime())) return false;
                                        if (d.getMonth() + 1 !== selectedMonth || d.getFullYear() !== selectedYear) return false;
                                    } else {
                                        const rawDate = contract.ngayHopDong || contract.createdAt || contract.ngayTao || contract.cacNgay?.ngayChup;
                                        if (rawDate) {
                                            const d = new Date(rawDate);
                                            if (!isNaN(d.getTime()) && d.getFullYear() !== selectedYear) return false;
                                        }
                                    }

                                    const npv = contract.nguoiPhucVu || {};
                                    const staffList = [
                                        npv.thoChupHinh,
                                        npv.thoChinhAnh,
                                        npv.thoMakeUp,
                                        npv.banHang,
                                        npv.phucVu,
                                        contract.createBy,
                                        contract.nguoiTao,
                                        contract.nhanVien,
                                        contract.nhanVienTuVan
                                    ].filter(Boolean).map(s => String(s).trim().toLowerCase());

                                    return staffList.some(s => 
                                        s === fn || 
                                        s === un || 
                                        (fn && (s.includes(fn) || fn.includes(s))) ||
                                        (un && (s.includes(un) || un.includes(s)))
                                    );
                                });

                                const workCount = myMonthContracts.length;
                                const chiTieuThang = Number(selectedEmployee.chiTieuThang || 20);
                                const luongCoBan = Number(selectedEmployee.luongCoBan || 0);

                                // Calculate total revenue & sum of all individual contract commissions
                                let tongDoanhSo = 0;
                                let hoaHongTotal = 0;

                                myMonthContracts.forEach(contract => {
                                    const val = Number(contract.thanhToan?.tongGiaTriSauGiam || contract.thanhToan?.tongGiaTri || 0);
                                    tongDoanhSo += val;
                                    const calc = calculateContractCommission(contract, selectedEmployee);
                                    hoaHongTotal += calc.amount;
                                });

                                const avgOrderVal = workCount > 0 ? Math.round(tongDoanhSo / workCount) : 0;
                                const targetCompletionPct = chiTieuThang > 0 ? Math.round((workCount / chiTieuThang) * 100) : 0;

                                const exceededCount = Math.max(0, workCount - chiTieuThang);
                                const thuongVuot = exceededCount * 200000;
                                const tongLuongThang = luongCoBan + hoaHongTotal + thuongVuot;

                                const getAssignedRoles = (c) => {
                                    const npv = c.nguoiPhucVu || {};
                                    const roles = [];
                                    const check = (val) => {
                                        if (!val) return false;
                                        const clean = String(val).trim().toLowerCase();
                                        return clean === fn || clean === un || (fn && clean.includes(fn)) || (un && clean.includes(un));
                                    };

                                    if (check(npv.thoChupHinh)) roles.push('📸 Chụp hình');
                                    if (check(npv.thoMakeUp)) roles.push('💄 Make-up');
                                    if (check(npv.thoChinhAnh)) roles.push('🎨 Chỉnh ảnh');
                                    if (check(npv.banHang)) roles.push('💼 Tư vấn');
                                    if (check(npv.phucVu)) roles.push('👥 Phục vụ');
                                    if (check(c.createBy) || check(c.nguoiTao)) roles.push('📝 Tạo HĐ');
                                    
                                    return roles.length > 0 ? roles.join(', ') : 'Thành viên ekip';
                                };

                                return (
                                    <Stack spacing={2.5}>
                                        {/* Filter Month / Year */}
                                        <Box display="flex" justifyContent="space-between" alignItems="center" p={1.8} bgcolor="#f8fafc" borderRadius="14px" border="1px solid #e2e8f0" flexWrap="wrap" gap={1.5}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <i className="fa-solid fa-calendar-check" style={{ color: '#0284c7' }}></i> KỲ THỐNG KÊ: {selectedMonth === 0 ? `CẢ NĂM ${selectedYear}` : `THÁNG ${selectedMonth}/${selectedYear}`}
                                            </Typography>
                                            
                                            <Stack direction="row" spacing={1.5}>
                                                <FormControl size="small" sx={{ minWidth: 140, bgcolor: '#fff' }}>
                                                    <InputLabel>Tháng</InputLabel>
                                                    <Select
                                                        value={selectedMonth}
                                                        label="Tháng"
                                                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                                    >
                                                        <MenuItem value={0}>Tất cả các tháng</MenuItem>
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                                            <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>

                                                <FormControl size="small" sx={{ minWidth: 100, bgcolor: '#fff' }}>
                                                    <InputLabel>Năm</InputLabel>
                                                    <Select
                                                        value={selectedYear}
                                                        label="Năm"
                                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                                    >
                                                        {[2024, 2025, 2026, 2027].map(y => (
                                                            <MenuItem key={y} value={y}>Năm {y}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Stack>
                                        </Box>

                                        {/* 5 Cards Summary */}
                                        <Grid container spacing={2}>
                                            {/* 1. Doanh số phục vụ */}
                                            <Grid item xs={12} sm={6} md={2.4}>
                                                <div className="salary-card card-cyan">
                                                    <span className="salary-card-lbl">DOANH SỐ TẠO RA</span>
                                                    <h4>{formatShortMoney(tongDoanhSo)}</h4>
                                                    <span className="salary-card-sub">TB: {formatShortMoney(avgOrderVal)} / HĐ</span>
                                                </div>
                                            </Grid>

                                            {/* 2. Hợp đồng phục vụ */}
                                            <Grid item xs={12} sm={6} md={2.4}>
                                                <div className="salary-card card-blue">
                                                    <span className="salary-card-lbl">HỢP ĐỒNG PHỤC VỤ</span>
                                                    <h4>{workCount} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ {chiTieuThang} HĐ</span></h4>
                                                    <span className="salary-card-sub">Đạt {targetCompletionPct}% chỉ tiêu</span>
                                                </div>
                                            </Grid>

                                            {/* 3. Lương cơ bản */}
                                            <Grid item xs={12} sm={6} md={2.4}>
                                                <div className="salary-card card-green">
                                                    <span className="salary-card-lbl">LƯƠNG CƠ BẢN</span>
                                                    <h4>{formatShortMoney(luongCoBan)}</h4>
                                                    <span className="salary-card-sub">Lương cứng cố định</span>
                                                </div>
                                            </Grid>

                                            {/* 4. Hoa hồng & Thưởng */}
                                            <Grid item xs={12} sm={6} md={2.4}>
                                                <div className="salary-card card-gold">
                                                    <span className="salary-card-lbl">HOA HỒNG & THƯỞNG</span>
                                                    <h4>{formatShortMoney(hoaHongTotal + thuongVuot)}</h4>
                                                    <span className="salary-card-sub">
                                                        {exceededCount > 0 ? `🔥 Vượt ${exceededCount} HĐ (+${formatShortMoney(thuongVuot)})` : 'Theo từng loại HĐ'}
                                                    </span>
                                                </div>
                                            </Grid>

                                            {/* 5. Tổng lương thực lĩnh */}
                                            <Grid item xs={12} sm={12} md={2.4}>
                                                <div className="salary-card card-royal">
                                                    <span className="salary-card-lbl">TỔNG THU NHẬP</span>
                                                    <h4>{formatShortMoney(tongLuongThang)}</h4>
                                                    <span className="salary-card-sub">Lương + Hoa hồng + Thưởng</span>
                                                </div>
                                            </Grid>
                                        </Grid>

                                        {/* Contract Table */}
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <i className="fa-solid fa-list-check" style={{ color: '#0284c7' }}></i> DANH SÁCH HỢP ĐỒNG THỰC HIỆN ({myMonthContracts.length} hợp đồng)
                                                </span>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                                                    Tổng hoa hồng: <b style={{ color: '#16a34a' }}>{formatMoney(hoaHongTotal)}</b>
                                                </span>
                                            </Typography>

                                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px', maxHeight: 340, overflowY: 'auto' }}>
                                                <Table size="small" stickyHeader>
                                                    <TableHead sx={{ '& th': { bgcolor: '#f1f5f9', fontWeight: 800, color: '#334155' } }}>
                                                        <TableRow>
                                                            <TableCell align="center" style={{ width: '50px' }}>STT</TableCell>
                                                            <TableCell style={{ width: '120px' }}>MÃ HĐ</TableCell>
                                                            <TableCell style={{ width: '160px' }}>KHÁCH HÀNG</TableCell>
                                                            <TableCell style={{ width: '150px' }}>LOẠI HỢP ĐỒNG</TableCell>
                                                            <TableCell style={{ width: '150px' }}>VAI TRÒ EKIP</TableCell>
                                                            <TableCell align="right" style={{ width: '130px' }}>GIÁ TRỊ HĐ</TableCell>
                                                            <TableCell style={{ width: '170px' }}>CƠ CHẾ HOA HỒNG</TableCell>
                                                            <TableCell align="right" style={{ width: '140px' }}>HOA HỒNG NHẬN</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {myMonthContracts.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                                                                    Không có hợp đồng nào được thực hiện trong thời gian đã chọn.
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            myMonthContracts.map((c, idx) => {
                                                                const giaTri = c.thanhToan?.tongGiaTriSauGiam || c.thanhToan?.tongGiaTri || 0;
                                                                const calc = calculateContractCommission(c, selectedEmployee);
                                                                const rolesAssigned = getAssignedRoles(c);
                                                                const typeName = getDichVuChinhLabel(c.dichVuChinh);

                                                                return (
                                                                    <TableRow key={c._id || idx} hover>
                                                                        <TableCell align="center" style={{ fontWeight: 600, color: '#64748b' }}>{idx + 1}</TableCell>
                                                                        <TableCell sx={{ fontWeight: 800, color: '#0284c7' }}>{c.maHopDong}</TableCell>
                                                                        <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{c.khachHang1?.tenKhachHang || 'Chưa cập nhật'}</TableCell>
                                                                        <TableCell>
                                                                            <span className="contract-type-tag">
                                                                                💎 {typeName}
                                                                            </span>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Chip label={rolesAssigned} size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: '0.72rem' }} />
                                                                        </TableCell>
                                                                        <TableCell align="right" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                            {formatMoney(giaTri)}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <span className="rule-applied-badge">
                                                                                {calc.ruleLabel}
                                                                            </span>
                                                                        </TableCell>
                                                                        <TableCell align="right" sx={{ fontWeight: 800, color: '#16a34a' }}>
                                                                            +{formatMoney(calc.amount)}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    </Stack>
                                );
                            })()}

                            {/* TAB 1: THIẾT LẬP LƯƠNG, HOA HỒNG TỪNG LOẠI HỢP ĐỒNG & CHỈ TIÊU */}
                            {modalTab === 1 && (
                                <Box display="flex" flexDirection="column" gap={3}>
                                    <Box p={2} bgcolor="#fffbeb" borderRadius="12px" border="1px solid #fde68a">
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <i className="fa-solid fa-sliders"></i> THIẾT LẬP LƯƠNG, HOA HỒNG CHI TIẾT THEO LOẠI HỢP ĐỒNG & CHỈ TIÊU
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                            Bạn có thể đặt lương cứng, cơ chế hoa hồng mặc định và mức hoa hồng riêng biệt cho từng gói dịch vụ / loại hợp đồng (Pre-wedding, Phóng sự cưới, Makeup, Thuê váy...).
                                        </Typography>
                                    </Box>

                                    {/* 1. Lương Cơ Bản & Hoa Hồng Mặc Định */}
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <i className="fa-solid fa-money-bill-wave" style={{ color: '#16a34a' }}></i> 1. LƯƠNG CƠ BẢN & HOA HỒNG MẶC ĐỊNH
                                        </Typography>
                                        
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={4}>
                                                <TextField
                                                    label="Lương cơ bản (VNĐ/tháng)"
                                                    type="text"
                                                    fullWidth
                                                    value={formatInputNumber(empSalaryEdit.luongCoBan)}
                                                    onChange={(e) => setEmpSalaryEdit({ ...empSalaryEdit, luongCoBan: parseInputNumber(e.target.value) })}
                                                    helperText={`Bằng chữ: ${formatMoney(empSalaryEdit.luongCoBan)}`}
                                                    inputProps={{ style: { fontWeight: 700, color: '#16a34a' } }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Loại hoa hồng mặc định</InputLabel>
                                                    <Select
                                                        value={empSalaryEdit.loaiHoaHong}
                                                        label="Loại hoa hồng mặc định"
                                                        onChange={(e) => setEmpSalaryEdit({ ...empSalaryEdit, loaiHoaHong: Number(e.target.value) })}
                                                    >
                                                        <MenuItem value={0}>🪙 VNĐ / mỗi công việc</MenuItem>
                                                        <MenuItem value={1}>📈 % Doanh số hợp đồng</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <TextField
                                                    label={empSalaryEdit.loaiHoaHong === 1 ? "Mức hoa hồng mặc định (%)" : "Mức hoa hồng mặc định (VNĐ/CV)"}
                                                    type="text"
                                                    fullWidth
                                                    value={empSalaryEdit.loaiHoaHong === 1 ? empSalaryEdit.luongHoaHong : formatInputNumber(empSalaryEdit.luongHoaHong)}
                                                    onChange={(e) => setEmpSalaryEdit({ 
                                                        ...empSalaryEdit, 
                                                        luongHoaHong: empSalaryEdit.loaiHoaHong === 1 ? Number(e.target.value) || 0 : parseInputNumber(e.target.value) 
                                                    })}
                                                    helperText={empSalaryEdit.loaiHoaHong === 1 ? "Ví dụ: 5% doanh số" : `Bằng chữ: ${formatMoney(empSalaryEdit.luongHoaHong)} / CV`}
                                                    inputProps={{ style: { fontWeight: 700, color: '#d97706' } }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* 2. Hoa Hồng Chi Tiết Theo Từng Loại Hợp Đồng */}
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <i className="fa-solid fa-tags" style={{ color: '#0284c7' }}></i> 2. CƠ CHẾ HOA HỒNG CHO TỪNG LOẠI HỢP ĐỒNG
                                        </Typography>
                                        
                                        {renderCommissionByContractTypeTable(
                                            empSalaryEdit.hoaHongTheoLoaiHD,
                                            (newList) => setEmpSalaryEdit({ ...empSalaryEdit, hoaHongTheoLoaiHD: newList })
                                        )}
                                    </Box>

                                    {/* 3. Chỉ Tiêu KPI */}
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <i className="fa-solid fa-bullseye" style={{ color: '#d97706' }}></i> 3. ĐỊNH MỨC CHỈ TIÊU KPI (SỐ HỢP ĐỒNG / CÔNG VIỆC)
                                        </Typography>
                                        
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={4}>
                                                <TextField
                                                    label="Chỉ tiêu Tuần (Số CV)"
                                                    type="number"
                                                    fullWidth
                                                    value={empSalaryEdit.chiTieuTuan}
                                                    onChange={(e) => setEmpSalaryEdit({ ...empSalaryEdit, chiTieuTuan: Number(e.target.value) || 0 })}
                                                    helperText="Định mức công việc tối thiểu / tuần"
                                                    inputProps={{ style: { fontWeight: 700 } }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <TextField
                                                    label="Chỉ tiêu Tháng (Số CV)"
                                                    type="number"
                                                    fullWidth
                                                    value={empSalaryEdit.chiTieuThang}
                                                    onChange={(e) => setEmpSalaryEdit({ ...empSalaryEdit, chiTieuThang: Number(e.target.value) || 0 })}
                                                    helperText="Định mức công việc chuẩn / tháng"
                                                    inputProps={{ style: { fontWeight: 700 } }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <TextField
                                                    label="Chỉ tiêu Năm (Số CV)"
                                                    type="number"
                                                    fullWidth
                                                    value={empSalaryEdit.chiTieuNam}
                                                    onChange={(e) => setEmpSalaryEdit({ ...empSalaryEdit, chiTieuNam: Number(e.target.value) || 0 })}
                                                    helperText="Định mức công việc cả năm"
                                                    inputProps={{ style: { fontWeight: 700 } }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            )}
                        </DialogContent>

                        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                            <Button 
                                variant="outlined" 
                                color="inherit" 
                                onClick={() => setOpenSalaryDialog(false)} 
                                sx={{ borderRadius: 2, fontWeight: 600 }}
                            >
                                Đóng cửa sổ
                            </Button>
                            {modalTab === 1 && (
                                <Button 
                                    variant="contained" 
                                    color="warning" 
                                    onClick={handleSaveEmpSalarySettings}
                                    startIcon={<i className="fa-solid fa-floppy-disk"></i>}
                                    sx={{ borderRadius: 2, fontWeight: 700 }}
                                >
                                    Lưu Thiết Lập
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* 6. MODAL TẶNG DANH HIỆU & VINH DANH NHÂN VIÊN */}
            <Dialog
                open={openAwardDialog}
                onClose={() => setOpenAwardDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <i className="fa-solid fa-award" style={{ color: '#fbbf24', fontSize: '1.4rem' }}></i>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            TẶNG DANH HIỆU & VINH DANH NHÂN VIÊN
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 3, pt: '24px !important' }}>
                    {selectedAwardEmp && (
                        <Stack spacing={3}>
                            {/* Employee Header */}
                            <Box display="flex" alignItems="center" gap={2} p={2} sx={{ bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                                <Avatar 
                                    src={selectedAwardEmp.avatar || logoDefault} 
                                    sx={{ width: 56, height: 56, border: '2px solid #0284c7' }} 
                                />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                                        {selectedAwardEmp.fullname || selectedAwardEmp.username}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                        @{selectedAwardEmp.username} • {selectedAwardEmp.positon || 'Nhân viên'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Danh hiệu hiện có */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    🎖️ Danh hiệu hiện có ({currentEmpAwards.length}):
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ minHeight: 44, p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px dashed #cbd5e1', alignItems: 'center' }}>
                                    {currentEmpAwards.length === 0 ? (
                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                            Chưa có danh hiệu nào. Hãy chọn hoặc tự tạo danh hiệu bên dưới để tặng cho nhân viên!
                                        </Typography>
                                    ) : (
                                        currentEmpAwards.map((title, idx) => (
                                            <Chip
                                                key={idx}
                                                label={title}
                                                onDelete={() => handleRemoveAwardFromEmp(title)}
                                                sx={{ 
                                                    fontWeight: 700, 
                                                    bgcolor: '#fffbeb', 
                                                    color: '#b45309', 
                                                    borderColor: '#fde68a',
                                                    borderWidth: 1,
                                                    borderStyle: 'solid'
                                                }}
                                            />
                                        ))
                                    )}
                                </Stack>
                            </Box>

                            {/* Chọn nhanh từ danh sách mẫu */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                                    ✨ Chọn nhanh danh hiệu vinh danh mẫu:
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {PRESET_AWARDS.map((item, idx) => {
                                        const isAdded = currentEmpAwards.includes(item.title);
                                        return (
                                            <Chip
                                                key={idx}
                                                label={item.title}
                                                clickable={!isAdded}
                                                onClick={() => !isAdded && handleAddAwardToEmp(item.title)}
                                                sx={{
                                                    fontWeight: 700,
                                                    bgcolor: isAdded ? '#f1f5f9' : item.bg,
                                                    color: isAdded ? '#94a3b8' : item.color,
                                                    borderColor: isAdded ? '#e2e8f0' : item.border,
                                                    borderWidth: 1,
                                                    borderStyle: 'solid',
                                                    opacity: isAdded ? 0.6 : 1,
                                                    cursor: isAdded ? 'default' : 'pointer'
                                                }}
                                            />
                                        );
                                    })}
                                </Stack>
                            </Box>

                            {/* Nhập danh hiệu tự do */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                                    ✍️ Hoặc tự tạo danh hiệu mới:
                                </Typography>
                                <Box display="flex" gap={1}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="VD: 🌟 Ngôi Sao Sáng Tạo, 🚀 Best Seller 2026..."
                                        value={customAwardInput}
                                        onChange={(e) => setCustomAwardInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleCreateCustomAward();
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleCreateCustomAward}
                                        disabled={!customAwardInput.trim()}
                                        sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#0f172a', whiteSpace: 'nowrap', px: 2.5 }}
                                    >
                                        + Thêm
                                    </Button>
                                </Box>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                    <Button
                        variant="outlined"
                        onClick={() => setOpenAwardDialog(false)}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#64748b' }}
                    >
                        Đóng
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveEmpAwards}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } }}
                    >
                        💾 Lưu & Vinh Danh
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default QuanLyNhanVien;
