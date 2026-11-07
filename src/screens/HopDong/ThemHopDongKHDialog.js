import { useState, useEffect, useRef, Fragment, useCallback, useMemo } from "react";
import "./DetailHopDongModern.css";
import "./ThemHopDongDialog.css";
import AppSearchInput from "../../components/AppSearchInput";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import otherService from '../../API/services/otherService';
import TextField from '@mui/material/TextField';
import { toast } from 'sonner';
import { useLoading } from "../../context/LoadingContext";
import { useContractTypes } from "../../hooks/useContractTypes";
import { useAuth } from '../Login/AuthContext/AuthContext';
import { hasPermission } from '../../utils/permissionHelper';
import { NumericFormat } from 'react-number-format';
import Autocomplete from '@mui/material/Autocomplete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LunarDateTimePicker from '../../components/LunarDateTimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { formatLunarDateFull } from '../../utils/lunarDateUtils';
import { isMakeupItem, formatTimestampToDateTimeInput } from '../../utils/makeupHelper';
import {
    isMakeupService,
    isPhotoShootService,
    isClothingService,
    isWeddingCardService,
    syncSchedulesWithCart,
    getTimeStringFromDateTime
} from '../../utils/contractScheduleHelper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faCircleCheck, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import SePayDialog from './SePayDialog';
import { getContractPrintConfig, generateContractPrintHtml, extractContractPrintData } from '../../utils/printConfigHelper';

function ThemHopDongKHDialog(props) {
    const { onClose, selectedValue, open } = props;
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

    const generateMaHopDong = () => {
        const year = new Date().getFullYear();
        return `HD-${year}-${Math.floor(100 + Math.random() * 900)}`;
    };

    const getToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getTodayDateTime = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T09:00`;
    };

    const convertDateToISOString = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date.toISOString();
    };

    const { loaiHopDongOptions } = useContractTypes();
    const { showLoading, hideLoading } = useLoading();

    const [listDichVu, setListDichVu] = useState([]);
    const [listStaff, setListStaff] = useState([]);
    const [listHopDong, setListHopDong] = useState([]);
    const [isSuccess, setIsSuccess] = useState(false);

    // Customer 1 States
    const [idKH1, setIDKH1] = useState("");
    const [phoneKH1, setPhoneKH1] = useState("");
    const [nameKH1, setNameKH1] = useState("");
    const [addressKH1, setAddressKH1] = useState("");
    const [facebookKH1, setFacebookKH1] = useState("");

    // Customer 2 States
    const [idKH2, setIDKH2] = useState("");
    const [phoneKH2, setPhoneKH2] = useState("");
    const [nameKH2, setNameKH2] = useState("");
    const [addressKH2, setAddressKH2] = useState("");
    const [facebookKH2, setFacebookKH2] = useState("");

    // Contract Info States
    const [maHopDong, setMaHopDong] = useState(generateMaHopDong());
    const [ngayHopDong, setNgayHopDong] = useState(getToday());
    const [gioHang, setGioHang] = useState([]);
    const [tongTien, setTongTien] = useState(0);
    const [ngayChup, setNgayChup] = useState("");
    const [ngayAnHoi, setNgayAnHoi] = useState("");
    const [ngayCuoi, setNgayCuoi] = useState("");
    const [ngayChinhAnh, setNgayChinhAnh] = useState(getToday());
    const [ngayTraAnh, setNgayTraAnh] = useState("");
    const [dichVuChinh, setDichVuChinh] = useState(0);
    const isPreWContract = useMemo(() => {
        if (Number(dichVuChinh) === 1) return true;
        const opt = loaiHopDongOptions.find(o => o.id === Number(dichVuChinh));
        const label = (opt?.label || '').toLowerCase();
        return label.includes('pre-wedding') || label.includes('pre wedding') || Boolean(ngayAnHoi) || Boolean(ngayCuoi);
    }, [dichVuChinh, loaiHopDongOptions, ngayAnHoi, ngayCuoi]);
    const [khachThanhToan, setKhachThanhToan] = useState(0);
    const [methodPayment, setMethodPayment] = useState(0);
    const [nhanVienSale, setNhanVienSale] = useState("0");
    const { user: currentUser } = useAuth();
    const canAssignCrew = useMemo(() => {
        const effectiveUser = currentUser || (() => {
            try { return JSON.parse(localStorage.getItem('user')) || {}; } catch (e) { return {}; }
        })();
        return hasPermission(effectiveUser, 'phan-cong-tho');
    }, [currentUser]);

    const [diaDiemChup, setDiaDiemChup] = useState("");
    const [thoChupHinh, setThoChupHinh] = useState("");
    const [thoMakeUp, setThoMakeUp] = useState("");
    const [thoChinhAnh, setThoChinhAnh] = useState("");
    const [chotLich, setChotLich] = useState("Chưa gọi điện");
    const [serviceSchedules, setServiceSchedules] = useState([]);

    // Context menu cho dòng dịch vụ & Highlight lịch
    const [serviceContextMenu, setServiceContextMenu] = useState(null);
    const [highlightedScheduleId, setHighlightedScheduleId] = useState(null);

    // Discount States
    const [giamGia, setGiamGia] = useState(0);
    const [loaiGiamGia, setLoaiGiamGia] = useState(0); // 0 = "VND", 1 = "%"

    // Voucher States
    const [voucherCodeInput, setVoucherCodeInput] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [openVoucherModal, setOpenVoucherModal] = useState(false);
    const [activeVouchersList, setActiveVouchersList] = useState([]);

    // Search suggestions
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showSuggestionPhone1, setShowSuggestionPhone1] = useState(false);
    const [showSuggestionPhone2, setShowSuggestionPhone2] = useState(false);
    const [showSuggestionName1, setShowSuggestionName1] = useState(false);
    const [showSuggestionName2, setShowSuggestionName2] = useState(false);
    const [suggestionPhone1, setSuggestionPhone1] = useState([]);
    const [suggestionPhone2, setSuggestionPhone2] = useState([]);
    const [suggestionName1, setSuggestionName1] = useState([]);
    const [suggestionName2, setSuggestionName2] = useState([]);
    const [btnAddKHShow1, setBtnAddKHShow1] = useState(true);
    const [btnAddKHShow2, setBtnAddKHShow2] = useState(true);

    const customer1Ref = useRef(null);
    const customer2Ref = useRef(null);
    const searchRef = useRef(null);

    // Chiều cao giỏ hàng có thể điều chỉnh
    const [cartHeight, setCartHeight] = useState(() => {
        const saved = localStorage.getItem('hd_cart_table_height');
        return saved ? Math.max(140, Math.min(900, parseInt(saved, 10))) : 260;
    });
    const [isDraggingCart, setIsDraggingCart] = useState(false);

    const handleStartResizeCart = (e) => {
        e.preventDefault();
        setIsDraggingCart(true);
        const startY = e.clientY;
        const startH = cartHeight;

        const onMouseMove = (moveEvent) => {
            const delta = moveEvent.clientY - startY;
            const newH = Math.min(900, Math.max(140, startH + delta));
            setCartHeight(newH);
        };

        const onMouseUp = (upEvent) => {
            setIsDraggingCart(false);
            const delta = upEvent.clientY - startY;
            const finalH = Math.min(900, Math.max(140, startH + delta));
            setCartHeight(finalH);
            try {
                localStorage.setItem('hd_cart_table_height', finalH.toString());
            } catch (err) {}
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const handleClose = () => {
        if (isSuccess) {
            handleCloseAndReset();
        } else {
            onClose(selectedValue);
        }
    };

    const handleCloseAndReset = () => {
        setIsSuccess(false);
        resetForm();
        onClose(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (customer1Ref.current && !customer1Ref.current.contains(event.target)) {
                setShowSuggestionPhone1(false);
                setShowSuggestionName1(false);
            }
            if (customer2Ref.current && !customer2Ref.current.contains(event.target)) {
                setShowSuggestionPhone2(false);
                setShowSuggestionName2(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const removeVietnameseTones = (str) => {
        if (!str) return "";
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .trim();
    };

    const loadDichVu = useCallback(() => {
        otherService.findDichVu()
            .then((response) => {
                const list = response?.data?.dichVu || 
                             response?.data?.data?.dichVu || 
                             response?.dichVu || 
                             (Array.isArray(response?.data) ? response.data : []) || 
                             (Array.isArray(response) ? response : []) || 
                             [];
                setListDichVu(Array.isArray(list) ? list : []);
            })
            .catch((error) => {
                console.error('Error fetching services:', error);
            });
    }, []);

    const loadStaff = useCallback(() => {
        otherService.findUsers({})
            .then((res) => {
                const users = res?.data?.data?.users || res?.data?.users || res?.users || [];
                setListStaff(Array.isArray(users) ? users : []);
            })
            .catch((err) => {
                console.error("Lỗi khi tải danh sách nhân viên:", err);
            });
    }, []);

    useEffect(() => {
        loadDichVu();
        loadStaff();
    }, [loadDichVu, loadStaff]);

    useEffect(() => {
        if (open) {
            resetForm();
            loadDichVu();
            loadStaff();
            otherService.LIST_HOPDONG({})
                .then(response => {
                    setListHopDong(response.data?.hopDong || response.data || []);
                })
                .catch(error => {
                    console.error("Lỗi khi tải danh sách hợp đồng:", error);
                });
        }
    }, [open, loadDichVu, loadStaff]);

    useEffect(() => {
        setTongTien(tinhTongThanhToan());
    }, [gioHang, giamGia, loaiGiamGia, appliedVoucher]);

    const suggestions = useMemo(() => {
        const term = searchTerm?.trim();
        if (!term) return [];
        const cleanTerm = term.toLowerCase();
        const cleanTermNoTone = removeVietnameseTones(term);

        return (listDichVu || []).filter(p => {
            const name = (p.tenDichVu || '').toLowerCase();
            const code = (p.maDichVu || '').toLowerCase();
            const nameNoTone = removeVietnameseTones(p.tenDichVu);
            const codeNoTone = removeVietnameseTones(p.maDichVu);
            const thiepName = (p.tenLoaiThiep || '').toLowerCase();
            const thiepNameNoTone = removeVietnameseTones(p.tenLoaiThiep);

            const isThiepSearch = cleanTermNoTone.includes('thiep') || cleanTermNoTone.includes('mau thiep');
            const isThiepService = isWeddingCardService(p);

            if (isThiepSearch && isThiepService) return true;

            return name.includes(cleanTerm) || 
                   code.includes(cleanTerm) ||
                   thiepName.includes(cleanTerm) ||
                   nameNoTone.includes(cleanTermNoTone) ||
                   codeNoTone.includes(cleanTermNoTone) ||
                   thiepNameNoTone.includes(cleanTermNoTone);
        });
    }, [listDichVu, searchTerm]);

    const handleSelectProduct = (product) => {
        const isNewPreW = product.maDichVu?.toUpperCase().startsWith("PRE-W");
        const existingPreW = isNewPreW ? gioHang.find(sp => sp.maDichVu?.toUpperCase().startsWith("PRE-W")) : null;

        let updatedGioHang;

        if (existingPreW) {
            updatedGioHang = gioHang.map(sp => {
                if (sp.maDichVu === existingPreW.maDichVu) {
                    const shootTurns = product.soLuongLichChup !== undefined ? Number(product.soLuongLichChup) : (isPhotoShootService(product) ? 1 : 0);
                    const makeTurns = product.soLuongLichMake !== undefined ? Number(product.soLuongLichMake) : (isMakeupService(product) ? 1 : 0);
                    return {
                        ...product,
                        soLuong: 1,
                        soLuot: 1,
                        soLuongLichChup: shootTurns,
                        soLuongLichMake: makeTurns,
                        dichVu: product._id,
                        soLuongAnhChinhSua: Number(product.soLuongAnhChinhSua) || 0,
                        soLuongAnh16x21: Number(product.soLuongAnh16x21) || 0,
                        soLuongAnh20x30: Number(product.soLuongAnh20x30) || 0,
                        soLuongAnh60x90: Number(product.soLuongAnh60x90) || 0,
                        trangDiemNgayAnHoi: product.trangDiemNgayAnHoi || "",
                        trangDiemNgayCuoi: product.trangDiemNgayCuoi || "",
                        trangPhucChoDoiBeLe: product.trangPhucChoDoiBeLe || "",
                        trangPhucCoDauNgayAnHoi: product.trangPhucCoDauNgayAnHoi || "",
                        trangPhucChuReNgayAnHoi: product.trangPhucChuReNgayAnHoi || "",
                        trangPhucVayCuoiNgayCuoi: product.trangPhucVayCuoiNgayCuoi || "",
                        trangPhucVestChuReNgayCuoi: product.trangPhucVestChuReNgayCuoi || "",
                        hoaCamTay: product.hoaCamTay || "",
                    detailsSnapshot: product.details ? JSON.parse(JSON.stringify(product.details)) : null,
                        detailsSnapshot: product.details ? JSON.parse(JSON.stringify(product.details)) : null
                    };
                }
                return sp;
            });
        } else {
            const isExisting = gioHang.find(sp => sp.maDichVu === product.maDichVu);
            if (isExisting) {
                const nextQty = (isExisting.soLuong || 0) + 1;
                updatedGioHang = gioHang.map(sp =>
                    sp.maDichVu === product.maDichVu
                        ? { 
                            ...sp, 
                            soLuong: nextQty, 
                            dichVu: product._id 
                          }
                        : sp
                );
            } else {
                const isThiep = isWeddingCardService(product);
                const shootTurns = product.soLuongLichChup !== undefined ? Number(product.soLuongLichChup) : (isPhotoShootService(product) ? 1 : 0);
                const makeTurns = product.soLuongLichMake !== undefined ? Number(product.soLuongLichMake) : (isMakeupService(product) ? 1 : 0);
                const newCartItem = {
                    ...product,
                    soLuong: 1,
                    soLuot: 1,
                    soLuongLichChup: shootTurns,
                    soLuongLichMake: makeTurns,
                    giamGiaDichVu: 0,
                    dichVu: product._id,
                    loaiDichVu: product.loaiDichVu || (isThiep ? 5 : 2),
                    ...(isThiep ? {
                        maLoaiThiep: product.maLoaiThiep || product.templateId || product.maDichVu,
                        tenLoaiThiep: product.tenLoaiThiep || product.tenDichVu,
                        isThiep: true
                    } : {}),
                    soLuongAnhChinhSua: Number(product.soLuongAnhChinhSua) || 0,
                    soLuongAnh16x21: Number(product.soLuongAnh16x21) || 0,
                    soLuongAnh20x30: Number(product.soLuongAnh20x30) || 0,
                    soLuongAnh60x90: Number(product.soLuongAnh60x90) || 0,
                    trangDiemNgayAnHoi: product.trangDiemNgayAnHoi || "",
                    trangDiemNgayCuoi: product.trangDiemNgayCuoi || "",
                    trangPhucChoDoiBeLe: product.trangPhucChoDoiBeLe || "",
                    trangPhucCoDauNgayAnHoi: product.trangPhucCoDauNgayAnHoi || "",
                    trangPhucChuReNgayAnHoi: product.trangPhucChuReNgayAnHoi || "",
                    trangPhucVayCuoiNgayCuoi: product.trangPhucVayCuoiNgayCuoi || "",
                    trangPhucVestChuReNgayCuoi: product.trangPhucVestChuReNgayCuoi || "",
                    hoaCamTay: product.hoaCamTay || "",
                    detailsSnapshot: product.details ? JSON.parse(JSON.stringify(product.details)) : null
                };
                if (!isThiep) {
                    delete newCartItem.maLoaiThiep;
                    delete newCartItem.tenLoaiThiep;
                    delete newCartItem.isThiep;
                }
                updatedGioHang = [...gioHang, newCartItem];
            }
        }

        updateCartAndTotal(updatedGioHang);
        setSearchTerm("");
        setShowSuggestions(false);
    };

    const handleThiepTemplateChange = (maDichVu, templateCode, templateName) => {
        const updatedCart = gioHang.map(sp => {
            if (sp.maDichVu === maDichVu) {
                return { ...sp, maLoaiThiep: templateCode, tenLoaiThiep: templateName };
            }
            return sp;
        });
        setGioHang(updatedCart);
    };

    const handleDiscountItemChange = (maDichVu, value) => {
        const discountVal = Math.max(0, parseFloat(value) || 0);
        const updatedCart = gioHang.map(sp => {
            if (sp.maDichVu === maDichVu) {
                return { ...sp, giamGiaDichVu: discountVal };
            }
            return sp;
        });
        updateCartAndTotal(updatedCart);
    };

    const updateCartAndTotal = (newCart) => {
        setGioHang(newCart);
        const newTotal = newCart.reduce((sum, item) => {
            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            const discountItem = parseFloat(item.giamGiaDichVu || 0);
            return sum + Math.max(0, (price * (item.soLuong || 0)) - discountItem);
        }, 0);
        setTongTien(newTotal);
        // Bỏ tự động thêm lịch từ giỏ hàng - Quản trị viên chủ động thêm thủ công theo yêu cầu
    };

    const handleAddSchedule = (type = 'photo') => {
        let defaultName = 'Chụp ảnh';
        let defaultLocation = 'Tại Studio';
        if (type === 'makeup') {
            defaultName = 'Trang điểm';
            defaultLocation = 'Tại Studio';
        } else if (type === 'video') {
            defaultName = 'Quay phim';
            defaultLocation = 'Tại Studio';
        } else if (type === 'bts') {
            defaultName = 'Quay / Chụp hậu trường';
            defaultLocation = 'Tại Studio';
        } else if (type === 'cskh') {
            defaultName = 'Chăm sóc khách hàng';
            defaultLocation = 'Tại Studio';
        } else if (type === 'support') {
            defaultName = 'Hỗ trợ ekip';
            defaultLocation = 'Tại Studio';
        }

        const existingSameType = serviceSchedules.filter(s => s.serviceType === type);
        const newTurn = existingSameType.length + 1;

        const newSchedule = {
            id: `sch-${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            serviceId: `MANUAL_${type.toUpperCase()}_${Date.now()}`,
            serviceName: `${defaultName} ${newTurn > 1 ? `(Lượt ${newTurn})` : ''}`.trim(),
            serviceType: type,
            luot: newTurn,
            totalLuot: newTurn,
            ngayGio: '',
            diaDiem: defaultLocation,
            nhanVien: '',
            ghiChu: ''
        };

        setServiceSchedules(prev => [...prev, newSchedule]);
        toast.success(`Đã thêm nhiệm vụ: ${defaultName}`);
    };

    // Chuột phải vào dòng giỏ hàng dịch vụ
    const handleCartRowContextMenu = (e, item) => {
        e.preventDefault();
        setServiceContextMenu({
            mouseX: e.clientX,
            mouseY: e.clientY,
            item: item
        });
    };

    // Thêm lịch phân công nhiệm vụ gắn với gói dịch vụ cụ thể
    const handleAddScheduleFromItem = (item, type = 'photo') => {
        setServiceContextMenu(null);
        if (!item) return;

        const typeLabels = {
            photo: 'Chụp ảnh',
            makeup: 'Trang điểm',
            video: 'Quay phim',
            bts: 'Hậu trường',
            cskh: 'Chăm sóc KH',
            support: 'Hỗ trợ'
        };

        const defaultLocations = {
            photo: 'Tại Studio',
            makeup: 'Tại Studio',
            video: 'Tại Studio',
            bts: 'Tại Studio',
            cskh: 'Tại Studio',
            support: 'Tại Studio'
        };

        const existingSameType = (serviceSchedules || []).filter(s => s.serviceType === type);
        const newTurn = existingSameType.length + 1;
        const itemName = item.tenDichVu || 'Dịch vụ';
        const sId = item.dichVu?._id || item.dichVu || item._id || item.maDichVu || `ITEM_${Date.now()}`;
        const newScheduleId = `sch-${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const newSchedule = {
            id: newScheduleId,
            serviceId: sId,
            serviceName: `${itemName} - ${typeLabels[type] || type}${newTurn > 1 ? ` (Lượt ${newTurn})` : ''}`,
            serviceType: type,
            luot: newTurn,
            totalLuot: newTurn,
            ngayGio: '',
            diaDiem: defaultLocations[type] || 'Tại Studio',
            nhanVien: '',
            ghiChu: `Gắn với: ${itemName}`
        };

        setServiceSchedules(prev => [...(prev || []), newSchedule]);
        setHighlightedScheduleId(newScheduleId);
        toast.success(`Đã thêm lịch phân công "${typeLabels[type]}" cho gói "${itemName}"!`);

        setTimeout(() => {
            const cardEl = document.getElementById('them-hd-card-schedules');
            if (cardEl) {
                cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            const itemEl = document.getElementById(`them-schedule-card-${newScheduleId}`);
            if (itemEl) {
                itemEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 150);

        setTimeout(() => {
            setHighlightedScheduleId(null);
        }, 3600);
    };

    // Đóng context menu khi click ra ngoài hoặc phím Escape
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (serviceContextMenu && !e.target.closest('.hd-context-menu')) {
                setServiceContextMenu(null);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && serviceContextMenu) {
                setServiceContextMenu(null);
            }
        };
        window.addEventListener('click', handleOutsideClick);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('click', handleOutsideClick);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [serviceContextMenu]);

    const handleScheduleFieldChange = (scheduleId, fieldName, value) => {
        if (fieldName === 'nhanVien' && !canAssignCrew) {
            toast.error("Bạn chưa được cấp quyền phân công hoặc thay đổi thợ!");
            return;
        }
        setServiceSchedules(prev => prev.map(sch => {
            if (sch.id === scheduleId) {
                const updated = { ...sch, [fieldName]: value };
                if (fieldName === 'serviceType') {
                    const isAutoName = !sch.serviceName || 
                        sch.serviceName.includes('Chụp ảnh') || 
                        sch.serviceName.includes('Trang điểm') || 
                        sch.serviceName.includes('Quay phim') || 
                        sch.serviceName.includes('hậu trường') || 
                        sch.serviceName.includes('Chăm sóc') || 
                        sch.serviceName.includes('Hỗ trợ');
                    if (isAutoName) {
                        if (value === 'photo') updated.serviceName = 'Chụp ảnh';
                        else if (value === 'makeup') updated.serviceName = 'Trang điểm';
                        else if (value === 'video') updated.serviceName = 'Quay phim';
                        else if (value === 'bts') updated.serviceName = 'Quay / Chụp hậu trường';
                        else if (value === 'cskh') updated.serviceName = 'Chăm sóc khách hàng';
                        else if (value === 'support') updated.serviceName = 'Hỗ trợ';
                    }
                }
                return updated;
            }
            return sch;
        }));
    };

    const handleRemoveManualSchedule = (scheduleId) => {
        setServiceSchedules(prev => prev.filter(s => s.id !== scheduleId));
    };

    const handleDeleteProduct = (maDichVu) => {
        const updatedCart = gioHang.filter(sp => sp.maDichVu !== maDichVu);
        updateCartAndTotal(updatedCart);
        toast.info("Đã xóa sản phẩm khỏi giỏ hàng");
    };

    const handleDecreaseQuantity = (maDichVu) => {
        const existingProduct = gioHang.find(sp => sp.maDichVu === maDichVu);
        if (existingProduct.soLuong > 1) {
            const nextVal = existingProduct.soLuong - 1;
            const updatedCart = gioHang.map(sp =>
                sp.maDichVu === maDichVu ? { 
                    ...sp, 
                    soLuong: nextVal,
                    soLuot: !isClothingService(sp) ? nextVal : (sp.soLuot || 1)
                } : sp
            );
            updateCartAndTotal(updatedCart);
        } else {
            handleDeleteProduct(maDichVu);
        }
    };

    const handleQuantityChange = (maDichVu, newQty) => {
        const val = Math.max(1, parseInt(newQty, 10) || 1);
        const updatedCart = gioHang.map(sp =>
            sp.maDichVu === maDichVu ? { 
                ...sp, 
                soLuong: val,
                soLuot: !isClothingService(sp) ? val : (sp.soLuot || 1)
            } : sp
        );
        updateCartAndTotal(updatedCart);
    };

    const handleMakeupScheduleChange = (maDichVu, field, value) => {
        setGioHang(prev => prev.map(sp => {
            if (sp.maDichVu === maDichVu) {
                return { ...sp, [field]: value };
            }
            return sp;
        }));
    };

    const tinhTongThanhToan = () => {
        const tongGoc = gioHang.reduce((sum, item) => {
            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            const discountItem = parseFloat(item.giamGiaDichVu || 0);
            return sum + Math.max(0, (price * (item.soLuong || 0)) - discountItem);
        }, 0);

        let tongSauGiam = tongGoc;
        if (loaiGiamGia === 1) {
            tongSauGiam = tongGoc - (tongGoc * (giamGia / 100));
        } else {
            tongSauGiam = tongGoc - giamGia;
        }

        if (appliedVoucher?.calculatedDiscount) {
            tongSauGiam -= appliedVoucher.calculatedDiscount;
        }

        return tongSauGiam < 0 ? 0 : tongSauGiam;
    };

    const handleApplyVoucher = (codeToApply) => {
        const code = (codeToApply || voucherCodeInput).trim().toUpperCase();
        if (!code) {
            toast.warning("Vui lòng nhập mã Voucher!");
            return;
        }

        const tongGocSauGiamMon = gioHang.reduce((sum, item) => {
            const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            const discountItem = parseFloat(item.giamGiaDichVu || 0);
            return sum + Math.max(0, (price * (item.soLuong || 0)) - discountItem);
        }, 0);

        let baseTotal = tongGocSauGiamMon;
        if (loaiGiamGia === 1) {
            baseTotal = tongGocSauGiamMon - (tongGocSauGiamMon * (giamGia / 100));
        } else {
            baseTotal = tongGocSauGiamMon - giamGia;
        }
        baseTotal = Math.max(0, baseTotal);

        otherService.validateVoucher({
            code,
            orderTotal: baseTotal,
            khachHangId: idKH1 || undefined,
            soDienThoai: phoneKH1 || undefined,
            dichVuChinh
        }).then(res => {
            const voucherData = res.data?.data || res.data;
            if (voucherData && voucherData.voucher) {
                const { voucher, discountAmount } = voucherData;
                setAppliedVoucher({
                    ...voucher,
                    calculatedDiscount: discountAmount
                });
                setVoucherCodeInput(voucher.code);
                setOpenVoucherModal(false);
                toast.success(`Đã áp dụng Voucher "${voucher.code}" (-${discountAmount.toLocaleString('vi-VN')} đ)`);
            }
        }).catch(err => {
            toast.error(err?.response?.data?.message || "Mã Voucher không hợp lệ!");
        });
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCodeInput("");
        toast.info("Đã gỡ mã Voucher");
    };

    const handleOpenSelectVoucherModal = () => {
        otherService.findAllVouchers({ status: 'active' })
            .then(res => {
                const list = res.data?.vouchers || res.vouchers || (Array.isArray(res.data) ? res.data : []);
                setActiveVouchersList(list);
                setOpenVoucherModal(true);
            })
            .catch(() => {
                toast.error("Không thể tải danh sách voucher");
            });
    };

    const resetForm = () => {
        setMaHopDong(generateMaHopDong());
        setNgayHopDong(getToday());
        setDichVuChinh(0);
        setNgayChup("");
        setNgayAnHoi("");
        setNgayCuoi("");
        setDiaDiemChup("");
        setThoChupHinh("");
        setThoMakeUp("");
        setThoChinhAnh("");
        setChotLich("Chưa gọi điện");
        setServiceSchedules([]);

        setIDKH1("");
        setPhoneKH1("");
        setNameKH1("");
        setAddressKH1("");
        setFacebookKH1("");
        setBtnAddKHShow1(true);
        setShowSuggestionPhone1(false);
        setShowSuggestionName1(false);
        setSuggestionPhone1([]);
        setSuggestionName1([]);

        setIDKH2("");
        setPhoneKH2("");
        setNameKH2("");
        setAddressKH2("");
        setFacebookKH2("");
        setBtnAddKHShow2(true);
        setShowSuggestionPhone2(false);
        setShowSuggestionName2(false);
        setSuggestionPhone2([]);
        setSuggestionName2([]);

        setGioHang([]);
        setTongTien(0);
        setSearchTerm("");
        setShowSuggestions(false);
        setGiamGia(0);
        setLoaiGiamGia(0);
        setVoucherCodeInput("");
        setAppliedVoucher(null);
        setKhachThanhToan(0);
    };

    const onChangePhoneKH1 = (e) => {
        const val = e.target.value;
        if (val.length > 10) return;
        setPhoneKH1(val);
        if (val.length === 0) {
            clearPhoneKH1();
            return;
        }
        otherService.findKhachHang({ soDienThoai: val })
            .then((response) => {
                const list = response.data || [];
                setShowSuggestionPhone1(list.length > 0);
                setShowSuggestionName1(false);
                setSuggestionPhone1(list);
                setBtnAddKHShow1(list.length === 0);
            })
            .catch(() => {
                clearPhoneKH1();
                setBtnAddKHShow1(true);
            });
    };

    const onChangeNameKH1 = (e) => {
        const val = e.target.value;
        setNameKH1(val);
        if (!val.trim()) {
            setShowSuggestionName1(false);
            setSuggestionName1([]);
            return;
        }
        otherService.findKhachHang({ tenKhachHang: val.trim() })
            .then((response) => {
                const list = response.data || [];
                setShowSuggestionName1(list.length > 0);
                setShowSuggestionPhone1(false);
                setSuggestionName1(list);
                setBtnAddKHShow1(list.length === 0);
            })
            .catch(() => {
                setShowSuggestionName1(false);
                setBtnAddKHShow1(true);
            });
    };

    const handleSelectProductPhone1 = (product) => {
        setIDKH1(product._id);
        setPhoneKH1(product.soDienThoai || "");
        setNameKH1(product.tenKhachHang || "");
        setAddressKH1(product.diaChi || "");
        setFacebookKH1(product.facebookId || "");
        setShowSuggestionPhone1(false);
        setShowSuggestionName1(false);
        setBtnAddKHShow1(false);
    };

    const clearPhoneKH1 = () => {
        setNameKH1("");
        setAddressKH1("");
        setFacebookKH1("");
        setIDKH1("");
        setShowSuggestionPhone1(false);
        setShowSuggestionName1(false);
        setBtnAddKHShow1(false);
    };

    const handleSelectProductPhone2 = (product) => {
        setIDKH2(product._id);
        setPhoneKH2(product.soDienThoai || "");
        setNameKH2(product.tenKhachHang || "");
        setAddressKH2(product.diaChi || "");
        setFacebookKH2(product.facebookId || "");
        setShowSuggestionPhone2(false);
        setShowSuggestionName2(false);
        setBtnAddKHShow2(false);
    };

    const clearPhoneKH2 = () => {
        setNameKH2("");
        setAddressKH2("");
        setFacebookKH2("");
        setIDKH2("");
        setShowSuggestionPhone2(false);
        setShowSuggestionName2(false);
        setBtnAddKHShow2(false);
    };

    const onChangePhoneKH2 = (e) => {
        const val = e.target.value;
        if (val.length > 10) return;
        setPhoneKH2(val);
        if (val.length === 0) {
            clearPhoneKH2();
            return;
        }
        otherService.findKhachHang({ soDienThoai: val })
            .then((response) => {
                const list = response.data || [];
                setShowSuggestionPhone2(list.length > 0);
                setShowSuggestionName2(false);
                setSuggestionPhone2(list);
                setBtnAddKHShow2(list.length === 0);
            })
            .catch(() => {
                clearPhoneKH2();
                setBtnAddKHShow2(true);
            });
    };

    const onChangeNameKH2 = (e) => {
        const val = e.target.value;
        setNameKH2(val);
        if (!val.trim()) {
            setShowSuggestionName2(false);
            setSuggestionName2([]);
            return;
        }
        otherService.findKhachHang({ tenKhachHang: val.trim() })
            .then((response) => {
                const list = response.data || [];
                setShowSuggestionName2(list.length > 0);
                setShowSuggestionPhone2(false);
                setSuggestionName2(list);
                setBtnAddKHShow2(list.length === 0);
            })
            .catch(() => {
                setShowSuggestionName2(false);
                setBtnAddKHShow2(true);
            });
    };

    const onCreateNewCustomer = (index, soDienThoai, ten, diaChi, facebookId) => {
        if (!ten || !ten.trim()) {
            toast.warning("Vui lòng nhập tên khách hàng!");
            return;
        }
        if ((!soDienThoai || !soDienThoai.trim()) && (!facebookId || !facebookId.trim())) {
            toast.warning("Vui lòng nhập Số điện thoại hoặc ID Facebook!");
            return;
        }
        if (!diaChi || !diaChi.trim()) {
            toast.warning("Vui lòng nhập địa chỉ khách hàng!");
            return;
        }

        otherService.createKhachHang({
            soDienThoai: soDienThoai,
            tenKhachHang: ten,
            diaChi: diaChi,
            facebookId: facebookId || undefined
        })
            .then((response) => {
                toast.success("Tạo khách hàng mới thành công!");
                if (index === 1) {
                    setIDKH1(response.data._id);
                    setPhoneKH1(response.data.soDienThoai);
                    setNameKH1(response.data.tenKhachHang);
                    setAddressKH1(response.data.diaChi);
                    setFacebookKH1(response.data.facebookId || "");
                    setShowSuggestionPhone1(false);
                    setShowSuggestionName1(false);
                    setBtnAddKHShow1(false);
                } else {
                    setIDKH2(response.data._id);
                    setPhoneKH2(response.data.soDienThoai);
                    setNameKH2(response.data.tenKhachHang);
                    setAddressKH2(response.data.diaChi);
                    setFacebookKH2(response.data.facebookId || "");
                    setShowSuggestionPhone2(false);
                    setShowSuggestionName2(false);
                    setBtnAddKHShow2(false);
                }
            })
            .catch((error) => {
                toast.error("Có lỗi xảy ra khi tạo khách hàng: " + (error?.message || error));
            });
    };

    const onChangeFacebookKH1 = (e) => {
        let originalUrl = e.target.value;
        let val = originalUrl;
        if (val.includes('facebook.com') || val.includes('fb.com')) {
            try {
                const url = new URL(val.startsWith('http') ? val : `https://${val}`);
                if (url.searchParams.has('id')) {
                    val = url.searchParams.get('id');
                } else {
                    const pathParts = url.pathname.split('/').filter(Boolean);
                    if (pathParts.length > 0) {
                        val = pathParts[0];
                    }
                }
            } catch (err) {
                const match = val.match(/(?:facebook\.com|fb\.com)\/(?:profile\.php\?id=)?([^\/?&#]+)/i);
                if (match && match[1]) {
                    val = match[1];
                }
            }
        }
        setFacebookKH1(val);
        if (val.length === 0) {
            clearPhoneKH1();
            return;
        }

        const checkCustomerExists1 = (searchId) => {
            otherService.findKhachHang({ facebookId: searchId })
                .then((response) => {
                    const list = response.data || [];
                    setShowSuggestionPhone1(list.length > 0);
                    setShowSuggestionName1(false);
                    setSuggestionPhone1(list);
                    setBtnAddKHShow1(list.length === 0);
                })
                .catch(() => {
                    clearPhoneKH1();
                    setBtnAddKHShow1(true);
                });
        };

        if (originalUrl.includes('facebook.com') || originalUrl.includes('fb.com')) {
            let fullUrl = originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`;
            otherService.getFacebookInfo({ url: fullUrl })
                .then(res => {
                    let finalId = val;
                    if (res.data) {
                        if (res.data.uid) {
                            finalId = res.data.uid;
                            setFacebookKH1(finalId);
                        }
                        if (res.data.name) {
                            setNameKH1(res.data.name);
                        }
                    }
                    checkCustomerExists1(finalId);
                })
                .catch(err => {
                    console.log("Lỗi lấy thông tin FB:", err);
                    checkCustomerExists1(val);
                });
        } else {
            checkCustomerExists1(val);
        }
    };

    const onChangeFacebookKH2 = (e) => {
        let originalUrl = e.target.value;
        let val = originalUrl;
        if (val.includes('facebook.com') || val.includes('fb.com')) {
            try {
                const url = new URL(val.startsWith('http') ? val : `https://${val}`);
                if (url.searchParams.has('id')) {
                    val = url.searchParams.get('id');
                } else {
                    const pathParts = url.pathname.split('/').filter(Boolean);
                    if (pathParts.length > 0) {
                        val = pathParts[0];
                    }
                }
            } catch (err) {
                const match = val.match(/(?:facebook\.com|fb\.com)\/(?:profile\.php\?id=)?([^\/?&#]+)/i);
                if (match && match[1]) {
                    val = match[1];
                }
            }
        }
        setFacebookKH2(val);
        if (val.length === 0) {
            clearPhoneKH2();
            return;
        }

        const checkCustomerExists2 = (searchId) => {
            otherService.findKhachHang({ facebookId: searchId })
                .then((response) => {
                    const list = response.data || [];
                    setShowSuggestionPhone2(list.length > 0);
                    setShowSuggestionName2(false);
                    setSuggestionPhone2(list);
                    setBtnAddKHShow2(list.length === 0);
                })
                .catch(() => {
                    clearPhoneKH2();
                    setBtnAddKHShow2(true);
                });
        };

        if (originalUrl.includes('facebook.com') || originalUrl.includes('fb.com')) {
            let fullUrl = originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`;
            otherService.getFacebookInfo({ url: fullUrl })
                .then(res => {
                    let finalId = val;
                    if (res.data) {
                        if (res.data.uid) {
                            finalId = res.data.uid;
                            setFacebookKH2(finalId);
                        }
                        if (res.data.name) {
                            setNameKH2(res.data.name);
                        }
                    }
                    checkCustomerExists2(finalId);
                })
                .catch(err => {
                    console.log("Lỗi lấy thông tin FB:", err);
                    checkCustomerExists2(val);
                });
        } else {
            checkCustomerExists2(val);
        }
    };

    const checkNgayChupConflict = (selectedDateTimeStr, currentContractId = null) => {
        if (!selectedDateTimeStr) return null;
        const selectedTime = new Date(selectedDateTimeStr).getTime();
        if (isNaN(selectedTime)) return null;

        const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

        for (const hd of listHopDong) {
            if (currentContractId && hd._id === currentContractId) continue;
            if (Number(hd.giaiDoan) !== 1) continue;
            if (!hd.cacNgay?.ngayChup) continue;

            const existingTime = new Date(hd.cacNgay.ngayChup).getTime();
            if (isNaN(existingTime)) continue;

            const diff = Math.abs(selectedTime - existingTime);
            if (diff <= THREE_HOURS_MS) {
                return hd;
            }
        }
        return null;
    };

    const onSaveHopDong = (goToPayment = false) => {
        if (!nameKH1.trim() && !nameKH2.trim()) {
            toast.warning("Vui lòng nhập tên khách hàng!");
            return;
        }

        if (!dichVuChinh || Number(dichVuChinh) === 0) {
            toast.warning("Vui lòng chọn loại hợp đồng!");
            return;
        }

        if (ngayChup) {
            const conflict = checkNgayChupConflict(ngayChup);
            if (conflict) {
                const conflictTime = new Date(conflict.cacNgay.ngayChup);
                const timeStr = `${String(conflictTime.getHours()).padStart(2, '0')}:${String(conflictTime.getMinutes()).padStart(2, '0')} ngày ${conflictTime.getDate()}/${conflictTime.getMonth() + 1}/${conflictTime.getFullYear()}`;
                toast.error(`Không thể lưu hợp đồng! Lịch chụp hình bị trùng hoặc quá gần (dưới 3 tiếng) với HĐ ${conflict.maHopDong} (${conflict.khachHang1?.tenKhachHang || ''}) vào lúc ${timeStr}.`);
                return;
            }
        }

        const makeupSchedules = serviceSchedules.filter(s => s.serviceType === 'makeup').map((s, idx) => ({
            id: s.id || `mk-${s.serviceId || idx}-${Date.now()}`,
            dichVuId: s.serviceId,
            tenDichVu: s.totalLuot > 1 ? `${s.serviceName} (Lượt ${s.luot})` : s.serviceName,
            ngayTrangDiem: s.ngayGio ? convertDateToISOString(s.ngayGio) : null,
            gioTrangDiem: getTimeStringFromDateTime(s.ngayGio),
            diaDiem: s.diaDiem || '',
            thoMakeUp: canAssignCrew ? (s.nhanVien || '') : '',
            ghiChu: s.ghiChu || ''
        }));

        const photoSchedules = serviceSchedules.filter(s => s.serviceType === 'photo').map((s, idx) => ({
            id: s.id || `ph-${s.serviceId || idx}-${Date.now()}`,
            dichVuId: s.serviceId,
            tenDichVu: s.totalLuot > 1 ? `${s.serviceName} (Lượt ${s.luot})` : s.serviceName,
            ngayGio: s.ngayGio ? convertDateToISOString(s.ngayGio) : null,
            ngayChup: s.ngayGio ? convertDateToISOString(s.ngayGio) : null,
            gioChup: getTimeStringFromDateTime(s.ngayGio),
            diaDiem: s.diaDiem || '',
            diaDiemChup: s.diaDiem || '',
            thoChupHinh: canAssignCrew ? (s.nhanVien || '') : '',
            nhanVien: canAssignCrew ? (s.nhanVien || '') : '',
            ghiChu: s.ghiChu || ''
        }));

        const videoSchedules = serviceSchedules.filter(s => s.serviceType === 'video').map((s, idx) => ({
            id: s.id || `vd-${s.serviceId || idx}-${Date.now()}`,
            dichVuId: s.serviceId,
            tenDichVu: s.totalLuot > 1 ? `${s.serviceName} (Lượt ${s.luot})` : s.serviceName,
            ngayGio: s.ngayGio ? convertDateToISOString(s.ngayGio) : null,
            ngayQuayPhim: s.ngayGio ? convertDateToISOString(s.ngayGio) : null,
            gioQuayPhim: getTimeStringFromDateTime(s.ngayGio),
            diaDiem: s.diaDiem || '',
            diaDiemQuayPhim: s.diaDiem || '',
            thoQuayPhim: canAssignCrew ? (s.nhanVien || '') : '',
            nhanVien: canAssignCrew ? (s.nhanVien || '') : '',
            ghiChu: s.ghiChu || ''
        }));

        const firstMakeup = makeupSchedules[0] || null;
        const firstPhoto = photoSchedules[0] || null;
        const firstVideo = videoSchedules[0] || null;

        const processedGioHang = (gioHang || []).map(sp => {
            const isCard = isWeddingCardService(sp);
            const itemToSave = {
                ...sp,
                ngayTrangDiem: sp.ngayTrangDiem ? convertDateToISOString(sp.ngayTrangDiem) : (firstMakeup?.ngayTrangDiem || null),
                gioTrangDiem: sp.gioTrangDiem || firstMakeup?.gioTrangDiem || '',
                diaDiemTrangDiem: sp.diaDiemTrangDiem || firstMakeup?.diaDiem || '',
                thoMakeUp: sp.thoMakeUp || firstMakeup?.thoMakeUp || '',
                ghiChuTrangDiem: sp.ghiChuTrangDiem || firstMakeup?.ghiChu || ''
            };
            if (isCard) {
                itemToSave.maLoaiThiep = sp.maLoaiThiep || "";
                itemToSave.tenLoaiThiep = sp.tenLoaiThiep || "";
                itemToSave.isThiep = true;
            } else {
                delete itemToSave.maLoaiThiep;
                delete itemToSave.tenLoaiThiep;
                delete itemToSave.isThiep;
            }
            return itemToSave;
        });

        otherService.CREATE_HOPDONG({
            maHopDong,
            ngayHopDong,
            khachHang1: idKH1,
            khachHang2: idKH2,
            gioHang: processedGioHang,
            lichTrangDiem: makeupSchedules,
            lichChup: photoSchedules,
            lichQuayPhim: videoSchedules,
            serviceSchedules: canAssignCrew ? serviceSchedules : (serviceSchedules || []).map(s => ({ ...s, nhanVien: "" })),
            thanhToan: {
                giamGia: giamGia,
                loaiGiamGia: loaiGiamGia,
                voucherCode: appliedVoucher?.code || "",
                voucherId: appliedVoucher?._id || undefined,
                voucherGiamGia: appliedVoucher?.calculatedDiscount || 0,
                nhanVien: nhanVienSale,
                khachThanhToan: {
                    amount: khachThanhToan,
                    method: methodPayment
                }
            },
            cacNgay: {
                ngayChup: firstPhoto?.ngayGio || convertDateToISOString(ngayChup),
                ngayAnHoi: isPreWContract ? convertDateToISOString(ngayAnHoi) : null,
                ngayCuoi: isPreWContract ? convertDateToISOString(ngayCuoi) : null,
                ngayChinhAnh: convertDateToISOString(ngayChinhAnh),
                ngayTraAnh: convertDateToISOString(ngayTraAnh),
                gioChup: firstPhoto?.gioChup || (() => {
                    if (!ngayChup) return "";
                    const date = new Date(ngayChup);
                    if (isNaN(date.getTime())) return "";
                    const hh = String(date.getHours()).padStart(2, '0');
                    const mm = String(date.getMinutes()).padStart(2, '0');
                    return `${hh}:${mm}`;
                })(),
                diaDiemChup: firstPhoto?.diaDiem || diaDiemChup,
                chotLich,
                ngayTrangDiem: firstMakeup?.ngayTrangDiem || null,
                gioTrangDiem: firstMakeup?.gioTrangDiem || "",
                diaDiemTrangDiem: firstMakeup?.diaDiem || "",
                ngayQuayPhim: firstVideo?.ngayQuayPhim || null,
                gioQuayPhim: firstVideo?.gioQuayPhim || "",
                diaDiemQuayPhim: firstVideo?.diaDiem || ""
            },
            nguoiPhucVu: {
                thoChupHinh: canAssignCrew ? (firstPhoto?.thoChupHinh || thoChupHinh) : "",
                thoMakeUp: canAssignCrew ? (firstMakeup?.thoMakeUp || thoMakeUp) : "",
                thoQuayPhim: canAssignCrew ? (firstVideo?.thoQuayPhim || "") : "",
                thoChinhAnh: canAssignCrew ? thoChinhAnh : ""
            },
            nhanVienSale: nhanVienSale,
            giaiDoan: 1,
            subGiaiDoan: 'dang_thuc_hien',
            dichVuChinh: dichVuChinh
        }).then(() => {
            toast.success("Tạo hợp đồng mới thành công!");
            if (goToPayment) {
                setOpenPaymentDialog(true);
            } else {
                setIsSuccess(true);
            }
        }).catch((error) => {
            toast.error("Có lỗi xảy ra khi tạo hợp đồng mới: " + (error?.message || error));
        });
    };

    const updateGioHangParam = (fieldName, value) => {
        if (!Array.isArray(gioHang) || gioHang.length === 0) return;
        const newGioHang = [...gioHang];
        newGioHang[0] = {
            ...newGioHang[0],
            [fieldName]: value
        };
        setGioHang(newGioHang);
    };

    const getAggregatedParams = () => {
        const totals = {
            soLuongAnhChinhSua: 0,
            soLuongAnh16x21: 0,
            soLuongAnh20x30: 0,
            soLuongAnh60x90: 0,
            trangDiemNgayAnHoi: [],
            trangDiemNgayCuoi: [],
            trangPhucChoDoiBeLe: [],
            trangPhucCoDauNgayAnHoi: [],
            trangPhucChuReNgayAnHoi: [],
            trangPhucVayCuoiNgayCuoi: [],
            trangPhucVestChuReNgayCuoi: [],
            hoaCamTay: []
        };

        if (Array.isArray(gioHang)) {
            gioHang.forEach(item => {
                const qty = item.soLuong || 1;
                totals.soLuongAnhChinhSua += (Number(item.soLuongAnhChinhSua) || 0) * qty;
                totals.soLuongAnh16x21 += (Number(item.soLuongAnh16x21) || 0) * qty;
                totals.soLuongAnh20x30 += (Number(item.soLuongAnh20x30) || 0) * qty;
                totals.soLuongAnh60x90 += (Number(item.soLuongAnh60x90) || 0) * qty;

                if (item.trangDiemNgayAnHoi) totals.trangDiemNgayAnHoi.push(item.trangDiemNgayAnHoi);
                if (item.trangDiemNgayCuoi) totals.trangDiemNgayCuoi.push(item.trangDiemNgayCuoi);
                if (item.trangPhucChoDoiBeLe) totals.trangPhucChoDoiBeLe.push(item.trangPhucChoDoiBeLe);
                if (item.trangPhucCoDauNgayAnHoi) totals.trangPhucCoDauNgayAnHoi.push(item.trangPhucCoDauNgayAnHoi);
                if (item.trangPhucChuReNgayAnHoi) totals.trangPhucChuReNgayAnHoi.push(item.trangPhucChuReNgayAnHoi);
                if (item.trangPhucVayCuoiNgayCuoi) totals.trangPhucVayCuoiNgayCuoi.push(item.trangPhucVayCuoiNgayCuoi);
                if (item.trangPhucVestChuReNgayCuoi) totals.trangPhucVestChuReNgayCuoi.push(item.trangPhucVestChuReNgayCuoi);
                if (item.hoaCamTay) totals.hoaCamTay.push(item.hoaCamTay);
            });
        }

        const cleanArr = (arr) => (arr || []).filter(x => {
            if (!x) return false;
            const s = String(x).trim().toLowerCase();
            return s !== '' && s !== 'không có' && s !== 'khong co' && s !== 'không' && s !== 'khong';
        }).join(", ");

        return {
            soLuongAnhChinhSua: totals.soLuongAnhChinhSua,
            soLuongAnh16x21: totals.soLuongAnh16x21,
            soLuongAnh20x30: totals.soLuongAnh20x30,
            soLuongAnh60x90: totals.soLuongAnh60x90,
            trangDiemNgayAnHoi: cleanArr(totals.trangDiemNgayAnHoi),
            trangDiemNgayCuoi: cleanArr(totals.trangDiemNgayCuoi),
            trangPhucChoDoiBeLe: cleanArr(totals.trangPhucChoDoiBeLe),
            trangPhucCoDauNgayAnHoi: cleanArr(totals.trangPhucCoDauNgayAnHoi),
            trangPhucChuReNgayAnHoi: cleanArr(totals.trangPhucChuReNgayAnHoi),
            trangPhucVayCuoiNgayCuoi: cleanArr(totals.trangPhucVayCuoiNgayCuoi),
            trangPhucVestChuReNgayCuoi: cleanArr(totals.trangPhucVestChuReNgayCuoi),
            hoaCamTay: cleanArr(totals.hoaCamTay)
        };
    };

    const handlePrintHopDong = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Trình duyệt đang chặn cửa sổ pop-up. Vui lòng cho phép để in.");
            return;
        }

        const ngayHDFormatted = dayjs(ngayHopDong).format('DD/MM/YYYY');
        const ngayChupFormatted = ngayChup ? dayjs(ngayChup).format('DD/MM/YYYY') : '';
        const ngayAnHoiFormatted = ngayAnHoi ? dayjs(ngayAnHoi).format('DD/MM/YYYY') : '';
        const ngayCuoiFormatted = ngayCuoi ? dayjs(ngayCuoi).format('DD/MM/YYYY') : '';
        const ngayTraAnhFormatted = ngayTraAnh ? dayjs(ngayTraAnh).format('DD/MM/YYYY') : '';
        const totals = getAggregatedParams();

        const tongGoc = gioHang.reduce((sum, item) => {
            const price = parseFloat(item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.donGia?.toString().replace(/[^0-9.-]+/g, "") || 0);
            return sum + (price * (item.soLuong || 1));
        }, 0);

        const cacLuotThanhToan = Number(khachThanhToan) > 0 ? [{
            date: new Date().toISOString(),
            amount: Number(khachThanhToan),
            method: methodPayment === 1 ? 'Chuyển khoản' : 'Tiền mặt',
            noiDung: 'Đặt cọc hợp đồng'
        }] : [];

        const rawContract = {
            maHopDong,
            ngayLapHopDongFormatted: ngayHDFormatted,
            nameKH1,
            nameKH2,
            phoneKH1,
            phoneKH2,
            addressKH1,
            addressKH2,
            ngayChupFormatted,
            ngayAnHoiFormatted,
            ngayCuoiFormatted,
            ngayTraAnhFormatted,
            diaDiemChup: diaDiemChup || '',
            thoChupHinh: thoChupHinh || '',
            thoMakeUp: thoMakeUp || '',
            thoChinhAnh: thoChinhAnh || '',
            nhanVienSale: (nhanVienSale && nhanVienSale !== '0') ? nhanVienSale : '',
            chotLich: chotLich || '',
            serviceSchedules,
            trangDiemNgayAnHoi: totals.trangDiemNgayAnHoi,
            trangDiemNgayCuoi: totals.trangDiemNgayCuoi,
            tongTien,
            tongGocDonHang: tongGoc,
            tongGiaTriDonHang: tongGoc,
            voucherGiamGia: appliedVoucher?.calculatedDiscount || 0,
            giamGiaDonHang: giamGia || 0,
            cacLuotThanhToan,
            datCoc: Number(khachThanhToan) || 0,
            daThanhToan: Number(khachThanhToan) || 0
        };

        const printData = extractContractPrintData(rawContract, gioHang, totals);
        const html = generateContractPrintHtml(printData, getContractPrintConfig());

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
    };

    const tongGocDonHang = gioHang.reduce((sum, item) => {
        const price = parseFloat(item.donGia?.toString().replace(/[^0-9.-]+/g, "") || item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || item.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
        return sum + (price * (item.soLuong || 0));
    }, 0);

    const tongGiamTungMon = gioHang.reduce((sum, item) => {
        return sum + (parseFloat(item.giamGiaDichVu || 0));
    }, 0);

    const soTienTietKiem = Math.max(0, tongGocDonHang - tongTien);
    const conLaiPhaiThu = Math.max(0, tongTien - (Number(khachThanhToan) || 0));
    const firstCartItem = gioHang[0] || {};

    return (
        <Dialog 
            onClose={handleClose} 
            open={open}
            fullWidth={true}
            maxWidth={isSuccess ? "sm" : "xl"}
            PaperProps={{
                className: isSuccess ? "" : "hd-modern-dialog-root",
                style: isSuccess ? {
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    margin: '16px',
                    backgroundColor: '#ffffff'
                } : {}
            }}
        >
            {isSuccess ? (
                /* SCREEN: SUCCESS MODAL */
                <div style={{ padding: '36px 24px', textAlign: 'center', fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, Roboto, sans-serif" }}>
                    <div style={{ color: '#16a34a', fontSize: '64px', marginBottom: '14px' }}>
                        <FontAwesomeIcon icon={faCircleCheck} />
                    </div>
                    <h3 style={{ margin: '0 0 6px 0', color: '#15803d', fontWeight: 700, fontSize: '1.45rem', letterSpacing: '-0.3px' }}>
                        TẠO HỢP ĐỒNG THÀNH CÔNG!
                    </h3>
                    <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.92rem' }}>
                        Hợp đồng <strong style={{ color: '#b45309' }}>{maHopDong}</strong> đã được lưu thành công vào hệ thống.
                    </p>
                    
                    <div style={{ 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '12px', 
                        padding: '16px 20px', 
                        textAlign: 'left',
                        marginBottom: '24px',
                        border: '1.5px solid #e2e8f0'
                    }}>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Mã hợp đồng:</span>
                            <span style={{ color: '#b45309', fontWeight: 700 }}>{maHopDong}</span>
                        </div>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Khách hàng 1:</span>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{nameKH1 || 'Chưa cập nhật'} {phoneKH1 ? `(${phoneKH1})` : ''}</span>
                        </div>
                        {nameKH2 && (
                            <div style={{ marginBottom: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>Khách hàng 2:</span>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>{nameKH2} {phoneKH2 ? `(${phoneKH2})` : ''}</span>
                            </div>
                        )}
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Tổng tiền sau giảm:</span>
                            <span style={{ fontWeight: 700, color: '#15803d' }}>{tongTien.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Đã đặt cọc:</span>
                            <span style={{ color: '#0284c7', fontWeight: 700 }}>{Number(khachThanhToan).toLocaleString('vi-VN')} đ</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <Button 
                            variant="outlined" 
                            color="inherit" 
                            onClick={handleCloseAndReset}
                            style={{ minWidth: '130px', height: '40px', textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                        >
                            Thoát
                        </Button>
                        <Button 
                            variant="contained" 
                            color="success" 
                            onClick={handlePrintHopDong}
                            startIcon={<FontAwesomeIcon icon={faPrint} />}
                            style={{ minWidth: '150px', height: '40px', fontWeight: 700, textTransform: 'none', borderRadius: '8px', backgroundColor: '#16a34a' }}
                        >
                            In hợp đồng
                        </Button>
                    </div>
                </div>
            ) : (
                /* SCREEN: MAIN BENTO GRID FORM */
                <div className="hd-modern-wrapper">
                    {/* 1. TOP HEADER (~48px) */}
                    <div className="hd-compact-header">
                        <div className="hd-header-left-group">
                            <div className="hd-header-icon-mini">
                                <span>💎</span>
                            </div>
                            <div className="hd-header-title-text">
                                <h2>
                                    TẠO HỢP ĐỒNG MỚI: 
                                    <input
                                        type="text"
                                        value={maHopDong}
                                        onChange={(e) => setMaHopDong(e.target.value)}
                                        style={{
                                            background: 'rgba(251, 191, 36, 0.15)',
                                            border: '1px solid rgba(251, 191, 36, 0.4)',
                                            borderRadius: '6px',
                                            color: '#fbbf24',
                                            fontWeight: 800,
                                            fontSize: '0.92rem',
                                            padding: '2px 8px',
                                            width: '150px',
                                            marginLeft: '6px',
                                            outline: 'none'
                                        }}
                                        title="Nhấp để sửa mã hợp đồng nếu cần"
                                    />
                                </h2>
                            </div>
                            <Autocomplete
                                disablePortal
                                options={loaiHopDongOptions}
                                size="small"
                                value={loaiHopDongOptions.find(o => o.id === Number(dichVuChinh)) || null}
                                sx={{
                                    minWidth: 260,
                                    '& .MuiOutlinedInput-root': {
                                        height: 32,
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        color: '#fbbf24',
                                        backgroundColor: 'rgba(251, 191, 36, 0.08)',
                                        borderRadius: '6px',
                                        '& fieldset': {
                                            borderColor: '#fbbf24',
                                            borderWidth: '1.5px'
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#f59e0b'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#fbbf24'
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: '#fbbf24'
                                        }
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        placeholder="Chọn loại hợp đồng *" 
                                    />
                                )}
                                onChange={(event, newValue) => {
                                    setDichVuChinh(newValue ? newValue.id : 0);
                                }}
                            />
                        </div>

                        <div className="hd-header-right-group">
                            <button className="hd-close-btn-mini" onClick={onClose} title="Đóng cửa sổ">
                                ×
                            </button>
                        </div>
                    </div>

                    {/* 2. MAIN BENTO GRID BODY (3 COLUMNS) */}
                    <div className="hd-dashboard-content">
                        <div className="hd-bento-grid">
                            
                            {/* ===== CỘT 1 (310px): KHÁCH HÀNG & NHÂN SỰ & LỊCH TRÌNH ===== */}
                            <div className="hd-bento-col">
                                
                                {/* Thẻ 1: Khách hàng 1 */}
                                <div className="hd-card" ref={customer1Ref}>
                                    <div className="hd-card-head">
                                        <h3 className="hd-card-title">
                                            <span>👰</span> Khách Hàng 1 (Chính)
                                        </h3>
                                    </div>
                                    <div className="hd-floating-field">
                                        <label>Số điện thoại</label>
                                        <input 
                                            name="phoneKH1" 
                                            value={phoneKH1} 
                                            onChange={onChangePhoneKH1} 
                                            type="text" 
                                            maxLength={10} 
                                            autoComplete="off" 
                                            placeholder="Nhập SĐT để tìm/tạo..."
                                        />
                                        {showSuggestionPhone1 && suggestionPhone1.length > 0 && (
                                            <ul className="search-suggestions-pop">
                                                {suggestionPhone1.map(p => (
                                                    <li key={p._id || p.soDienThoai} onClick={() => handleSelectProductPhone1(p)}>
                                                        <div>
                                                            <span className="p-name">{p.tenKhachHang || "Chưa có tên"}</span>
                                                            {p.soHopDong > 0 && (
                                                                <span style={{ fontSize: '0.72rem', color: '#0284c7', marginLeft: '4px', fontWeight: 600 }}>
                                                                    ({p.soHopDong} HĐ)
                                                                </span>
                                                            )}
                                                            {p.diaChi && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.diaChi}</div>}
                                                        </div>
                                                        <span className="p-price">{p.soDienThoai || p.facebookId || ""}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="hd-floating-field">
                                        <label>Tên khách hàng</label>
                                        <input 
                                            name="tenKhachHang1" 
                                            value={nameKH1} 
                                            onChange={onChangeNameKH1} 
                                            autoComplete="off" 
                                            placeholder="Tên cô dâu / KH1..."
                                        />
                                        {showSuggestionName1 && suggestionName1.length > 0 && (
                                            <ul className="search-suggestions-pop">
                                                {suggestionName1.map(p => (
                                                    <li key={p._id || p.soDienThoai} onClick={() => handleSelectProductPhone1(p)}>
                                                        <div>
                                                            <span className="p-name">{p.tenKhachHang || "Chưa có tên"}</span>
                                                            {p.soHopDong > 0 && (
                                                                <span style={{ fontSize: '0.72rem', color: '#0284c7', marginLeft: '4px', fontWeight: 600 }}>
                                                                    ({p.soHopDong} HĐ)
                                                                </span>
                                                            )}
                                                            {p.diaChi && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.diaChi}</div>}
                                                        </div>
                                                        <span className="p-price">{p.soDienThoai || p.facebookId || ""}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="hd-floating-field">
                                        <label>Địa chỉ</label>
                                        <input 
                                            name="diaChi1" 
                                            value={addressKH1} 
                                            onChange={(e) => setAddressKH1(e.target.value)} 
                                            placeholder="Địa chỉ cư trú..."
                                        />
                                    </div>

                                    <div className="hd-floating-field">
                                        <label>Link / ID Facebook</label>
                                        <input 
                                            name="facebookKH1" 
                                            value={facebookKH1} 
                                            onChange={onChangeFacebookKH1} 
                                            placeholder="Link Facebook..."
                                        />
                                    </div>

                                    {btnAddKHShow1 && (
                                        <Button
                                            onClick={() => onCreateNewCustomer(1, phoneKH1, nameKH1, addressKH1, facebookKH1)}
                                            color="success"
                                            variant="contained"
                                            size="small"
                                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.74rem', width: '100%', mt: 0.5 }}
                                        >
                                            + Tạo khách hàng 1 mới
                                        </Button>
                                    )}
                                </div>

                                {/* Thẻ 2: Khách hàng 2 */}
                                <div className="hd-card" ref={customer2Ref}>
                                    <div className="hd-card-head">
                                        <h3 className="hd-card-title">
                                            <span>🤵</span> Khách Hàng 2 (Chú Rể)
                                        </h3>
                                    </div>
                                    <div className="hd-floating-field">
                                        <label>Số điện thoại</label>
                                        <input 
                                            name="phoneKH2" 
                                            value={phoneKH2} 
                                            onChange={onChangePhoneKH2} 
                                            type="text" 
                                            maxLength={10} 
                                            placeholder="SĐT chú rể..."
                                        />
                                        {showSuggestionPhone2 && suggestionPhone2.length > 0 && (
                                            <ul className="search-suggestions-pop">
                                                {suggestionPhone2.map(p => (
                                                    <li key={p._id || p.soDienThoai} onClick={() => handleSelectProductPhone2(p)}>
                                                        <div>
                                                            <span className="p-name">{p.tenKhachHang || "Chưa có tên"}</span>
                                                            {p.soHopDong > 0 && (
                                                                <span style={{ fontSize: '0.72rem', color: '#0284c7', marginLeft: '4px', fontWeight: 600 }}>
                                                                    ({p.soHopDong} HĐ)
                                                                </span>
                                                            )}
                                                            {p.diaChi && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.diaChi}</div>}
                                                        </div>
                                                        <span className="p-price">{p.soDienThoai || p.facebookId || ""}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="hd-floating-field">
                                        <label>Tên khách hàng 2</label>
                                        <input 
                                            name="tenKhachHang2" 
                                            value={nameKH2} 
                                            onChange={onChangeNameKH2} 
                                            placeholder="Tên chú rể / KH2..."
                                        />
                                        {showSuggestionName2 && suggestionName2.length > 0 && (
                                            <ul className="search-suggestions-pop">
                                                {suggestionName2.map(p => (
                                                    <li key={p._id || p.soDienThoai} onClick={() => handleSelectProductPhone2(p)}>
                                                        <div>
                                                            <span className="p-name">{p.tenKhachHang || "Chưa có tên"}</span>
                                                            {p.soHopDong > 0 && (
                                                                <span style={{ fontSize: '0.72rem', color: '#0284c7', marginLeft: '4px', fontWeight: 600 }}>
                                                                    ({p.soHopDong} HĐ)
                                                                </span>
                                                            )}
                                                            {p.diaChi && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.diaChi}</div>}
                                                        </div>
                                                        <span className="p-price">{p.soDienThoai || p.facebookId || ""}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="hd-floating-field">
                                        <label>Địa chỉ</label>
                                        <input 
                                            name="diaChi2" 
                                            value={addressKH2} 
                                            onChange={(e) => setAddressKH2(e.target.value)} 
                                            placeholder="Địa chỉ..."
                                        />
                                    </div>

                                    <div className="hd-floating-field">
                                        <label>Link / ID Facebook</label>
                                        <input 
                                            name="facebookKH2" 
                                            value={facebookKH2} 
                                            onChange={onChangeFacebookKH2} 
                                            placeholder="Link Facebook..."
                                        />
                                    </div>

                                    {btnAddKHShow2 && (
                                        <Button
                                            onClick={() => onCreateNewCustomer(2, phoneKH2, nameKH2, addressKH2, facebookKH2)}
                                            color="success"
                                            variant="contained"
                                            size="small"
                                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.74rem', width: '100%', mt: 0.5 }}
                                        >
                                            + Tạo khách hàng 2 mới
                                        </Button>
                                    )}
                                </div>

                                {/* Thẻ 3: Phân công & Lịch */}
                                <div className="hd-card">
                                    <div className="hd-card-head">
                                        <h3 className="hd-card-title">
                                            <span>👥</span> Phân công & Lịch
                                        </h3>
                                        {serviceSchedules.length > 0 && (
                                            <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                                {serviceSchedules.length} lượt lịch
                                            </span>
                                        )}
                                    </div>

                                    {/* Mặc định là Nhân viên Sale */}
                                    <div className="hd-floating-field">
                                        <label>👔 Nhân viên Sale (Mặc định)</label>
                                        <select value={nhanVienSale} onChange={(e) => setNhanVienSale(e.target.value)}>
                                            <option value="0">Chưa phân công</option>
                                            {listStaff.filter(s => s.positon === 'Nhân viên Sale').map(s => {
                                                const name = s.fullname || s.username;
                                                return <option key={s.username} value={name}>{name}</option>;
                                            })}
                                        </select>
                                    </div>

                                    {/* Trạng thái chốt lịch & Thợ chỉnh ảnh */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div className="hd-floating-field">
                                            <label>
                                                🎨 Thợ chỉnh ảnh
                                                {!canAssignCrew && <span style={{ fontSize: '0.72rem', color: '#ef4444', marginLeft: '4px', fontWeight: 600 }}>(🔒 Khóa)</span>}
                                            </label>
                                            <select 
                                                value={thoChinhAnh} 
                                                disabled={!canAssignCrew}
                                                style={!canAssignCrew ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', opacity: 0.8 } : {}}
                                                onChange={(e) => {
                                                    if (!canAssignCrew) {
                                                        toast.error("Bạn chưa được cấp quyền phân công hoặc thay đổi thợ!");
                                                        return;
                                                    }
                                                    setThoChinhAnh(e.target.value);
                                                }}
                                            >
                                                <option value="">Chưa phân công</option>
                                                {listStaff.filter(s => s.positon === 'Thợ chỉnh ảnh').map(s => {
                                                    const name = s.fullname || s.username;
                                                    return <option key={s.username} value={name}>{name}</option>;
                                                })}
                                            </select>
                                        </div>
                                        <div className="hd-floating-field">
                                            <label>📞 Trạng thái chốt lịch</label>
                                            <select value={chotLich} onChange={(e) => setChotLich(e.target.value)}>
                                                <option value="Chưa gọi điện">Chưa gọi điện</option>
                                                <option value="Đã gọi điện xác nhận">Đã gọi điện xác nhận</option>
                                                <option value="Đã chốt lịch">Đã chốt lịch</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Nếu hợp đồng là Pre-Wedding thì có thêm ô nhập Ngày Ăn Hỏi và Ngày Cưới */}
                                    {isPreWContract && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                            <div className="hd-floating-field" style={{ marginBottom: 0 }}>
                                                <label>💍 Ngày ăn hỏi</label>
                                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                                    <LunarDateTimePicker
                                                        value={ngayAnHoi ? dayjs(ngayAnHoi) : null}
                                                        onChange={(newValue) => setNgayAnHoi(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                                        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                                        format="DD/MM/YYYY HH:mm"
                                                    />
                                                </LocalizationProvider>
                                                {ngayAnHoi && (
                                                    <div className="hd-lunar-tag">
                                                        🌙 Âm lịch: {formatLunarDateFull(ngayAnHoi)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="hd-floating-field" style={{ marginBottom: 0 }}>
                                                <label>💒 Ngày cưới</label>
                                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                                    <LunarDateTimePicker
                                                        value={ngayCuoi ? dayjs(ngayCuoi) : null}
                                                        onChange={(newValue) => setNgayCuoi(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                                        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                                        format="DD/MM/YYYY HH:mm"
                                                    />
                                                </LocalizationProvider>
                                                {ngayCuoi && (
                                                    <div className="hd-lunar-tag">
                                                        🌙 Âm lịch: {formatLunarDateFull(ngayCuoi)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Ngày trả ảnh */}
                                    <div className="hd-floating-field" style={{ marginTop: '8px' }}>
                                        <label>📦 Ngày trả ảnh</label>
                                        <input 
                                            type="date" 
                                            value={ngayTraAnh} 
                                            onChange={(e) => setNgayTraAnh(e.target.value)} 
                                        />
                                        {ngayTraAnh && (
                                            <div className="hd-lunar-tag">
                                                🌙 Âm lịch: {formatLunarDateFull(ngayTraAnh)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Danh sách lịch trình & phân công theo dịch vụ */}
                                    <div className="hd-schedule-section" id="them-hd-card-schedules">
                                        <div className="hd-schedule-section-head">
                                            <span className="hd-schedule-section-title">
                                                <span>📅</span> Lịch & Phân Công Nhiệm Vụ
                                            </span>
                                            {serviceSchedules.length > 0 && (
                                                <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                                    {serviceSchedules.length} nhiệm vụ
                                                </span>
                                            )}
                                        </div>

                                        {/* Nút thêm lịch phân công thủ công */}
                                        <div className="hd-schedule-add-bar">
                                            <div className="hd-schedule-add-title">➕ Thêm lịch phân công nhiệm vụ:</div>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-photo"
                                                onClick={() => handleAddSchedule('photo')}
                                                title="Thêm nhiệm vụ Chụp ảnh"
                                            >
                                                <span>📸</span> + Chụp ảnh
                                            </button>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-makeup"
                                                onClick={() => handleAddSchedule('makeup')}
                                                title="Thêm nhiệm vụ Trang điểm"
                                            >
                                                <span>💄</span> + Trang điểm
                                            </button>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-video"
                                                onClick={() => handleAddSchedule('video')}
                                                title="Thêm nhiệm vụ Quay phim"
                                            >
                                                <span>🎥</span> + Quay phim
                                            </button>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-bts"
                                                onClick={() => handleAddSchedule('bts')}
                                                title="Thêm nhiệm vụ Hậu trường"
                                            >
                                                <span>🎬</span> + Hậu trường
                                            </button>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-cskh"
                                                onClick={() => handleAddSchedule('cskh')}
                                                title="Thêm nhiệm vụ Chăm sóc khách hàng"
                                            >
                                                <span>📞</span> + Chăm sóc KH
                                            </button>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-support"
                                                onClick={() => handleAddSchedule('support')}
                                                title="Thêm nhiệm vụ Hỗ trợ"
                                            >
                                                <span>🤝</span> + Hỗ trợ
                                            </button>
                                        </div>

                                        {serviceSchedules.length > 0 ? (
                                            serviceSchedules.map((sch, schIdx) => {
                                                const currentType = sch.serviceType || 'photo';
                                                const isShoot = currentType === 'photo';
                                                const isMakeup = currentType === 'makeup';
                                                const isVideo = currentType === 'video';
                                                const isBTS = currentType === 'bts';
                                                const isCSKH = currentType === 'cskh';
                                                const isSupport = currentType === 'support';

                                                let cardTypeClass = 'type-photo';
                                                let timeLabel = '⏰ Thời gian chụp hình *';
                                                let staffLabel = '📸 Phân công thợ Chụp';
                                                let quickLocations = ['Tại Studio', 'Phim trường', 'Ngoại cảnh', 'Tại gia đình'];

                                                if (isMakeup) {
                                                    cardTypeClass = 'type-makeup';
                                                    timeLabel = '⏰ Thời gian trang điểm *';
                                                    staffLabel = '💄 Phân công thợ Makeup';
                                                    quickLocations = ['Tại Studio', 'Nhà riêng cô dâu', 'Tại tiệc cưới', 'Tại gia đình'];
                                                } else if (isVideo) {
                                                    cardTypeClass = 'type-video';
                                                    timeLabel = '⏰ Thời gian quay phim *';
                                                    staffLabel = '🎥 Phân công thợ Quay phim';
                                                    quickLocations = ['Tại Studio', 'Phim trường', 'Ngoại cảnh', 'Tại gia đình', 'Tiệc cưới'];
                                                } else if (isBTS) {
                                                    cardTypeClass = 'type-bts';
                                                    timeLabel = '⏰ Thời gian quay/chụp hậu trường *';
                                                    staffLabel = '🎬 Phân công nhân sự Hậu trường';
                                                    quickLocations = ['Tại Studio', 'Phim trường', 'Ngoại cảnh', 'Phòng makeup', 'Đoàn ekip'];
                                                } else if (isCSKH) {
                                                    cardTypeClass = 'type-cskh';
                                                    timeLabel = '⏰ Thời gian CSKH / Hẹn *';
                                                    staffLabel = '📞 Nhân viên CSKH';
                                                    quickLocations = ['Tại Studio', 'Gọi điện thoại', 'Nhà khách hàng'];
                                                } else if (isSupport) {
                                                    cardTypeClass = 'type-support';
                                                    timeLabel = '⏰ Thời gian hỗ trợ *';
                                                    staffLabel = '🤝 Nhân viên Hỗ trợ';
                                                    quickLocations = ['Tại Studio', 'Địa điểm chụp', 'Hội trường cưới'];
                                                }

                                                return (
                                                    <div 
                                                        key={sch.id || schIdx} 
                                                        id={`them-schedule-card-${sch.id}`}
                                                        className={`hd-schedule-card ${cardTypeClass} ${highlightedScheduleId === sch.id ? 'schedule-pulse-highlight' : ''}`}
                                                    >
                                                        <div className="hd-schedule-card-header">
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
                                                                <select
                                                                    className="hd-schedule-type-select"
                                                                    value={currentType}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'serviceType', e.target.value)}
                                                                >
                                                                    <option value="photo">📸 Chụp ảnh</option>
                                                                    <option value="makeup">💄 Trang điểm</option>
                                                                    <option value="video">🎥 Quay phim</option>
                                                                    <option value="bts">🎬 Hậu trường</option>
                                                                    <option value="cskh">📞 Chăm sóc khách hàng</option>
                                                                    <option value="support">🤝 Hỗ trợ</option>
                                                                </select>
                                                                <span className="hd-schedule-turn-badge">
                                                                    Lượt {sch.luot || (schIdx + 1)}
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveManualSchedule(sch.id)}
                                                                className="hd-schedule-delete-btn"
                                                                title="Xóa nhiệm vụ này"
                                                            >
                                                                ✕ Xóa
                                                            </button>
                                                        </div>

                                                        <div className="hd-schedule-fields-grid">
                                                            {/* Dịch vụ liên kết trong giỏ hàng */}
                                                            <div className="hd-floating-field">
                                                                <label>🔗 Dịch vụ / Gói liên kết trong giỏ hàng</label>
                                                                <select
                                                                    value={sch.serviceId || ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        const targetItem = (gioHang || []).find(item => {
                                                                            const sId = item.dichVu?._id || item.dichVu || item._id || item.maDichVu;
                                                                            return sId === val;
                                                                        });
                                                                        handleScheduleFieldChange(sch.id, 'serviceId', val);
                                                                        if (targetItem) {
                                                                            const itemName = targetItem.tenDichVu || 'Dịch vụ';
                                                                            if (!sch.serviceName || sch.serviceName === 'Chụp ảnh' || sch.serviceName === 'Quay phim' || sch.serviceName === 'Trang điểm') {
                                                                                handleScheduleFieldChange(sch.id, 'serviceName', `${itemName} - ${currentType}`);
                                                                            }
                                                                            if (!sch.ghiChu || sch.ghiChu.startsWith('Gắn với:')) {
                                                                                handleScheduleFieldChange(sch.id, 'ghiChu', `Gắn với: ${itemName}`);
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <option value="">-- Tự do / Không gắn gói cụ thể --</option>
                                                                    {(gioHang || []).map((cartItem, cIdx) => {
                                                                        const cId = cartItem.dichVu?._id || cartItem.dichVu || cartItem._id || cartItem.maDichVu || `ITEM_${cIdx}`;
                                                                        const cName = cartItem.tenDichVu || `Gói #${cIdx + 1}`;
                                                                        return (
                                                                            <option key={cId || cIdx} value={cId}>
                                                                                📦 {cName} {cartItem.maDichVu ? `(${cartItem.maDichVu})` : ''}
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </select>
                                                            </div>

                                                            {/* Tên / Nội dung nhiệm vụ */}
                                                            <div className="hd-floating-field">
                                                                <label>📌 Nội dung nhiệm vụ phân công *</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="VD: Chụp phóng sự tiệc cưới, Makeup cô dâu tại nhà..."
                                                                    value={sch.serviceName || ''}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'serviceName', e.target.value)}
                                                                />
                                                            </div>

                                                            {/* Thời gian */}
                                                            <div className="hd-floating-field">
                                                                <label>{timeLabel}</label>
                                                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                                                    <LunarDateTimePicker
                                                                        value={sch.ngayGio ? dayjs(sch.ngayGio) : null}
                                                                        onChange={(newValue) => {
                                                                            const formatted = newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '';
                                                                            handleScheduleFieldChange(sch.id, 'ngayGio', formatted);
                                                                            if (formatted && isShoot) {
                                                                                const conflict = checkNgayChupConflict(formatted);
                                                                                if (conflict) {
                                                                                    const conflictTime = new Date(conflict.cacNgay.ngayChup);
                                                                                    const timeStr = `${String(conflictTime.getHours()).padStart(2, '0')}:${String(conflictTime.getMinutes()).padStart(2, '0')} ngày ${conflictTime.getDate()}/${conflictTime.getMonth() + 1}/${conflictTime.getFullYear()}`;
                                                                                    toast.warning(`Cảnh báo: Trùng/gần lịch chụp với HĐ ${conflict.maHopDong} lúc ${timeStr}.`);
                                                                                }
                                                                            }
                                                                        }}
                                                                        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                                                        format="DD/MM/YYYY HH:mm"
                                                                    />
                                                                </LocalizationProvider>
                                                                {sch.ngayGio && (
                                                                    <div className="hd-lunar-tag">
                                                                        🌙 Âm lịch: {formatLunarDateFull(sch.ngayGio)}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Địa điểm */}
                                                            <div className="hd-floating-field">
                                                                <label>📍 Địa điểm *</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder={isShoot ? "VD: Tại Studio, Phim trường, Ngoại cảnh..." : "VD: Nhà riêng cô dâu, Studio..."}
                                                                    value={sch.diaDiem || ''}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'diaDiem', e.target.value)}
                                                                />
                                                                <div className="hd-quick-chips">
                                                                    {quickLocations.map(chip => (
                                                                        <button
                                                                            key={chip}
                                                                            type="button"
                                                                            className="hd-quick-chip-btn"
                                                                            onClick={() => handleScheduleFieldChange(sch.id, 'diaDiem', chip)}
                                                                        >
                                                                            {chip}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Phân công nhân viên */}
                                                            <div className="hd-floating-field">
                                                                <label>{staffLabel}
                                                                    {!canAssignCrew && (
                                                                        <span style={{ fontSize: '0.72rem', color: '#ef4444', marginLeft: '6px', fontWeight: 600 }}>
                                                                            (🔒 Cần quyền phân công)
                                                                        </span>
                                                                    )}
                                                                </label>
                                                                <select
                                                                    value={sch.nhanVien || ''}
                                                                    disabled={!canAssignCrew}
                                                                    title={!canAssignCrew ? "Bạn chưa được cấp quyền phân công thợ" : ""}
                                                                    style={!canAssignCrew ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', opacity: 0.8 } : {}}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'nhanVien', e.target.value)}
                                                                >
                                                                    <option value="">Chưa phân công</option>
                                                                    {(() => {
                                                                        let preferredRole = '';
                                                                        if (isShoot) preferredRole = 'Thợ chụp hình';
                                                                        else if (isMakeup) preferredRole = 'Thợ trang điểm';
                                                                        else if (isVideo) preferredRole = 'Thợ quay phim';
                                                                        else if (isBTS) preferredRole = 'Thợ quay phim';
                                                                        else if (isCSKH) preferredRole = 'Nhân viên Sale';

                                                                        const preferredStaff = preferredRole ? listStaff.filter(s => s.positon === preferredRole || (isBTS && s.positon === 'Thợ chụp hình')) : [];
                                                                        const otherStaff = preferredRole ? listStaff.filter(s => s.positon !== preferredRole && !(isBTS && s.positon === 'Thợ chụp hình')) : listStaff;

                                                                        return (
                                                                            <>
                                                                                {preferredStaff.length > 0 && (
                                                                                    <optgroup label={`-- Phù hợp (${preferredRole}) --`}>
                                                                                        {preferredStaff.map(s => {
                                                                                            const name = s.fullname || s.username;
                                                                                            return <option key={s.username || s._id || name} value={name}>{name}</option>;
                                                                                        })}
                                                                                    </optgroup>
                                                                                )}
                                                                                <optgroup label="-- Tất cả nhân viên --">
                                                                                    {otherStaff.map(s => {
                                                                                        const name = s.fullname || s.username;
                                                                                        return <option key={s.username || s._id || name} value={name}>{name} {s.positon ? `(${s.positon})` : ''}</option>;
                                                                                    })}
                                                                                </optgroup>
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </select>
                                                            </div>

                                                            {/* Ghi chú */}
                                                            <div className="hd-floating-field">
                                                                <label>📝 Ghi chú yêu cầu</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Ghi chú yêu cầu nếu có..."
                                                                    value={sch.ghiChu || ''}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'ghiChu', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="hd-schedule-empty">
                                                <div>📋 <strong>Chưa có lịch phân công nhiệm vụ nào</strong></div>
                                                <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#64748b' }}>
                                                    Bấm vào các nút <strong>+ Chụp ảnh</strong>, <strong>+ Trang điểm</strong>, <strong>+ Quay phim</strong>, <strong>+ Hậu trường</strong>, <strong>+ Chăm sóc KH</strong>, <strong>+ Hỗ trợ</strong> ở trên để thêm lịch phân công nhiệm vụ.
                                                </div>
                                            </div>
                                        )}
                                    </div>


                                </div>
                            </div>

                            {/* ===== CỘT 2 (2fr - CHIẾM 2/3): SẢN PHẨM & QUY CÁCH CHI TIẾT ===== */}
                            <div className="hd-bento-col">
                                
                                {/* Thẻ: Giỏ hàng */}
                                <div className="hd-card">
                                    <div className="hd-card-head">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h3 className="hd-card-title">
                                                <span>🛒</span> Giỏ hàng
                                            </h3>
                                            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                                                ({gioHang.length} mục)
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const nextH = cartHeight <= 260 ? 480 : 260;
                                                    setCartHeight(nextH);
                                                    try {
                                                        localStorage.setItem('hd_cart_table_height', nextH.toString());
                                                    } catch (err) {}
                                                }}
                                                title={cartHeight <= 260 ? "Mở rộng chiều cao giỏ hàng" : "Thu gọn về mặc định"}
                                                style={{
                                                    fontSize: '0.7rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #cbd5e1',
                                                    background: '#fff',
                                                    color: '#475569',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontWeight: 600
                                                }}
                                            >
                                                <span>↕</span> {cartHeight <= 260 ? 'Mở rộng' : 'Thu gọn'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tìm kiếm Dịch vụ */}
                                    <div style={{ position: 'relative', marginBottom: '10px' }} ref={searchRef}>
                                        <AppSearchInput
                                            value={searchTerm}
                                            placeholder="Tìm kiếm tên hoặc mã sản phẩm/dịch vụ..."
                                            width="100%"
                                            autoComplete="off"
                                            onFocus={() => setShowSuggestions(true)}
                                            onChange={(e) => {
                                                const value = e.target ? e.target.value : e;
                                                setSearchTerm(value);
                                                setShowSuggestions(true);
                                            }}
                                        />
                                        {showSuggestions && suggestions.length > 0 && (
                                            <ul className="search-suggestions-pop">
                                                {suggestions.map(p => {
                                                    const isThiep = isWeddingCardService(p);
                                                    const price = Number(p.giaChoThueDichVu || p.donGia || p.giaTriDichVu) || 0;
                                                    return (
                                                        <li key={p.maDichVu || p._id} onClick={() => handleSelectProduct(p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                {p.imageDichVu ? (
                                                                    <img src={p.imageDichVu} alt={p.tenDichVu} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                                                ) : isThiep ? (
                                                                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>💌</div>
                                                                ) : null}
                                                                <div>
                                                                    <div className="p-name" style={{ fontWeight: 600, color: '#0f172a' }}>
                                                                        {isThiep && (
                                                                            <span style={{ fontSize: '0.68rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', marginRight: '6px', fontWeight: 700 }}>
                                                                                💌 Thiệp Online
                                                                            </span>
                                                                        )}
                                                                        {p.tenDichVu}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                                                                        Mã: <strong style={{ color: '#0369a1' }}>{p.maDichVu}</strong>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className="p-price" style={{ fontWeight: 700, color: '#0284c7' }}>
                                                                {price > 0 ? `${price.toLocaleString("vi-VN")} đ` : 'Miễn phí'}
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>

                                    {/* Bảng Giỏ Hàng Bento Resizable */}
                                    <div 
                                        className="hd-cart-table-wrap"
                                        style={{ height: `${cartHeight}px` }}
                                    >
                                        <table className="hd-table-compact">
                                            <thead>
                                                <tr>
                                                    <th>Tên Dịch Vụ</th>
                                                    <th style={{ textAlign: 'center', width: '90px' }}>Số lượng</th>
                                                    <th style={{ textAlign: 'right' }}>Đơn giá</th>
                                                    <th style={{ width: '110px', textAlign: 'center' }}>Giảm giá (đ)</th>
                                                    <th style={{ textAlign: 'right' }}>Thành tiền</th>
                                                    <th style={{ textAlign: 'center', width: '50px' }}>Xóa</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gioHang.length > 0 ? (
                                                    gioHang.map((sp) => {
                                                        const price = parseFloat(sp.donGia?.toString().replace(/[^0-9.-]+/g, "") || sp.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || sp.giaTriDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
                                                        const discountItem = parseFloat(sp.giamGiaDichVu || 0);
                                                        const total = Math.max(0, (price * (sp.soLuong || 0)) - discountItem);

                                                        return (
                                                            <tr 
                                                                key={sp.maDichVu}
                                                                onContextMenu={(e) => handleCartRowContextMenu(e, sp)}
                                                                className={serviceContextMenu?.item === sp ? "hd-cart-row-context" : ""}
                                                                title="Nhấp chuột phải để thêm lịch phân công nhiệm vụ cho gói này"
                                                                style={{ cursor: 'context-menu' }}
                                                            >
                                                                <td style={{ fontWeight: Number(sp.loaiDichVu) !== 1 ? 700 : 500 }}>
                                                                    {sp.tenDichVu}
                                                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{sp.maDichVu}</div>
                                                                    {/* Huy hiệu các lịch phân công gắn với gói này */}
                                                                    {(() => {
                                                                        const itemIdentifier = sp.dichVu?._id || sp.dichVu || sp._id || sp.maDichVu;
                                                                        const itemName = sp.tenDichVu || '';
                                                                        const linkedSchedules = (serviceSchedules || []).filter(sch => 
                                                                            (sch.serviceId && (sch.serviceId === itemIdentifier || sch.serviceId === sp._id || sch.serviceId === sp.maDichVu)) ||
                                                                            (itemName && sch.serviceName && sch.serviceName.includes(itemName)) ||
                                                                            (itemName && sch.ghiChu && sch.ghiChu.includes(itemName))
                                                                        );

                                                                        if (linkedSchedules.length === 0) return null;

                                                                        const typeIcons = {
                                                                            photo: '📸',
                                                                            makeup: '💄',
                                                                            video: '🎥',
                                                                            bts: '🎬',
                                                                            cskh: '📞',
                                                                            support: '🤝'
                                                                        };
                                                                        const typeNames = {
                                                                            photo: 'Chụp',
                                                                            makeup: 'Make',
                                                                            video: 'Quay',
                                                                            bts: 'Hậu trường',
                                                                            cskh: 'CSKH',
                                                                            support: 'Hỗ trợ'
                                                                        };

                                                                        return (
                                                                            <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                                {linkedSchedules.map(sch => {
                                                                                    const icon = typeIcons[sch.serviceType] || '📅';
                                                                                    const typeName = typeNames[sch.serviceType] || sch.serviceType;
                                                                                    const badgeClass = `badge-${sch.serviceType || 'photo'}`;
                                                                                    return (
                                                                                        <button
                                                                                            key={sch.id}
                                                                                            type="button"
                                                                                            className={`hd-cart-linked-schedule-badge ${badgeClass}`}
                                                                                            title={`Nhấp để chuyển đến: ${sch.serviceName || typeName}`}
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                const el = document.getElementById(`them-schedule-card-${sch.id}`);
                                                                                                if (el) {
                                                                                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                                                                    setHighlightedScheduleId(sch.id);
                                                                                                    setTimeout(() => setHighlightedScheduleId(null), 2500);
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            {icon} {typeName} L{sch.luot || 1}{sch.nhanVien ? `: ${sch.nhanVien}` : ''}
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                    {isWeddingCardService(sp) && (
                                                                    <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <span style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 'bold' }}>💌 Mã loại thiệp:</span>
                                                                        <select
                                                                            value={sp.maLoaiThiep || ''}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                const optText = e.target.options[e.target.selectedIndex]?.text || '';
                                                                                handleThiepTemplateChange(sp.maDichVu, val, optText);
                                                                            }}
                                                                            style={{
                                                                                padding: '2px 6px',
                                                                                fontSize: '0.74rem',
                                                                                borderRadius: '4px',
                                                                                border: '1px solid #cbd5e1',
                                                                                backgroundColor: '#fff',
                                                                                color: '#0f172a',
                                                                                fontWeight: '600',
                                                                                outline: 'none'
                                                                            }}
                                                                        >
                                                                            <option value="">-- Mặc định (Tất cả mẫu) --</option>
                                                                            <option value="tpl-luxury-gold">Hoàng Gia Ánh Kim (tpl-luxury-gold)</option>
                                                                            <option value="tpl-romantic-rose">Nàng Thơ Hoa Hồng (tpl-romantic-rose)</option>
                                                                            <option value="tpl-modern-minimal">Tối Giản Thanh Lịch (tpl-modern-minimal)</option>
                                                                            <option value="tpl-botanical-garden">Cỏ Hoa Rustic (tpl-botanical-garden)</option>
                                                                            <option value="tpl-royal-red">Son Hỷ Á Đông (tpl-royal-red)</option>
                                                                            <option value="tpl-korean-pastel">Hàn Quốc Dịu Êm (tpl-korean-pastel)</option>
                                                                            <option value="tpl-dreamy-fairytale">Lâu Đài Cổ Tích (tpl-dreamy-fairytale)</option>
                                                                        </select>
                                                                    </div>
                                                                )}
                                                                </td>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    <div className="hd-qty-box-mini">
                                                                        <button type="button" className="hd-qty-btn-mini" onClick={() => handleDecreaseQuantity(sp.maDichVu)}>-</button>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            className="hd-qty-input-mini"
                                                                            value={sp.soLuong}
                                                                            onChange={(e) => handleQuantityChange(sp.maDichVu, e.target.value)}
                                                                        />
                                                                        <button type="button" className="hd-qty-btn-mini" onClick={() => handleSelectProduct(sp)}>+</button>
                                                                    </div>
                                                                </td>
                                                                <td style={{ textAlign: 'right', color: '#64748b' }}>
                                                                    {price.toLocaleString("vi-VN")} đ
                                                                </td>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        placeholder="0"
                                                                        value={sp.giamGiaDichVu !== undefined && sp.giamGiaDichVu !== null ? sp.giamGiaDichVu : ''}
                                                                        onChange={(e) => handleDiscountItemChange(sp.maDichVu, e.target.value)}
                                                                        style={{
                                                                            width: '85px',
                                                                            padding: '2px 6px',
                                                                            borderRadius: '4px',
                                                                            border: '1px solid #cbd5e1',
                                                                            fontSize: '0.78rem',
                                                                            textAlign: 'right'
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontWeight: 800, color: discountItem > 0 ? '#15803d' : '#0f172a' }}>
                                                                    {total.toLocaleString("vi-VN")} đ
                                                                    {discountItem > 0 && (
                                                                        <div style={{ fontSize: '0.68rem', color: '#dc2626' }}>
                                                                            (-{discountItem.toLocaleString("vi-VN")} đ)
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    <button 
                                                                        onClick={() => handleDeleteProduct(sp.maDichVu)}
                                                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 800 }}
                                                                        title="Xóa sản phẩm"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                                                            Chưa chọn sản phẩm/gói dịch vụ nào
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div 
                                        onMouseDown={handleStartResizeCart}
                                        className={`hd-cart-resize-handle ${isDraggingCart ? 'active' : ''}`}
                                        title="Nhấn giữ và kéo lên/xuống để điều chỉnh chiều cao giỏ hàng"
                                    />
                                </div>

                                {/* Thẻ: Quy Cách & Thông Số Chi Tiết */}
                                <div className="hd-card">
                                    <div className="hd-card-head">
                                        <h3 className="hd-card-title">
                                            <span>📋</span> Quy Cách & Thông Số Chi Tiết
                                        </h3>
                                    </div>

                                    {/* Thông số Album & Ảnh in */}
                                    <div className="hd-spec-section-title">🖼️ Số Lượng Ảnh & Khung Hình</div>
                                    <div className="hd-spec-grid" style={{ marginBottom: '12px' }}>
                                        <div className="hd-form-group">
                                            <label className="hd-form-label">SL ảnh chỉnh sửa</label>
                                            <input
                                                type="number"
                                                className="hd-input-text"
                                                value={firstCartItem.soLuongAnhChinhSua ?? 0}
                                                onChange={(e) => updateGioHangParam("soLuongAnhChinhSua", Number(e.target.value) || 0)}
                                                disabled={gioHang.length === 0}
                                            />
                                        </div>
                                        <div className="hd-form-group">
                                            <label className="hd-form-label">SL ảnh 16x21</label>
                                            <input
                                                type="number"
                                                className="hd-input-text"
                                                value={firstCartItem.soLuongAnh16x21 ?? 0}
                                                onChange={(e) => updateGioHangParam("soLuongAnh16x21", Number(e.target.value) || 0)}
                                                disabled={gioHang.length === 0}
                                            />
                                        </div>
                                        <div className="hd-form-group">
                                            <label className="hd-form-label">SL ảnh 20x30</label>
                                            <input
                                                type="number"
                                                className="hd-input-text"
                                                value={firstCartItem.soLuongAnh20x30 ?? 0}
                                                onChange={(e) => updateGioHangParam("soLuongAnh20x30", Number(e.target.value) || 0)}
                                                disabled={gioHang.length === 0}
                                            />
                                        </div>
                                        <div className="hd-form-group">
                                            <label className="hd-form-label">SL ảnh 60x90</label>
                                            <input
                                                type="number"
                                                className="hd-input-text"
                                                value={firstCartItem.soLuongAnh60x90 ?? 0}
                                                onChange={(e) => updateGioHangParam("soLuongAnh60x90", Number(e.target.value) || 0)}
                                                disabled={gioHang.length === 0}
                                            />
                                        </div>
                                    </div>

                                    {/* Trang Điểm & Trang Phục */}
                                    <div className="hd-spec-section-title">💄 Trang Điểm & Trang Phục</div>
                                    <div className="hd-spec-grid">
                                        <div className="hd-form-group">
                                            <label className="hd-form-label">Trang điểm ngày ăn hỏi</label>
                                            <input
                                                type="text"
                                                className="hd-input-text"
                                                value={firstCartItem.trangDiemNgayAnHoi ?? ""}
                                                onChange={(e) => updateGioHangParam("trangDiemNgayAnHoi", e.target.value)}
                                                disabled={gioHang.length === 0}
                                                placeholder="Không có"
                                            />
                                        </div>
                                        <div className="hd-form-group">
                                            <label className="hd-form-label">Trang điểm ngày cưới</label>
                                            <input
                                                type="text"
                                                className="hd-input-text"
                                                value={firstCartItem.trangDiemNgayCuoi ?? ""}
                                                onChange={(e) => updateGioHangParam("trangDiemNgayCuoi", e.target.value)}
                                                disabled={gioHang.length === 0}
                                                placeholder="Không có"
                                            />
                                        </div>
                                        <div className="hd-form-group">
                                            <label className="hd-form-label">Trang phục bê lễ</label>
                                            <input
                                                type="text"
                                                className="hd-input-text"
                                                value={firstCartItem.trangPhucChoDoiBeLe ?? ""}
                                                onChange={(e) => updateGioHangParam("trangPhucChoDoiBeLe", e.target.value)}
                                                disabled={gioHang.length === 0}
                                                placeholder="Không có"
                                            />
                                        </div>
                                        <div className="hd-form-group">
                                            <label className="hd-form-label">TP cô dâu ăn hỏi</label>
                                            <input
                                                type="text"
                                                className="hd-input-text"
                                                value={firstCartItem.trangPhucCoDauNgayAnHoi ?? ""}
                                                onChange={(e) => updateGioHangParam("trangPhucCoDauNgayAnHoi", e.target.value)}
                                                disabled={gioHang.length === 0}
                                                placeholder="Không có"
                                            />
                                        </div>
                                        <div className="hd-form-group">
                                            <label className="hd-form-label">TP chú rể ăn hỏi</label>
                                            <input
                                                type="text"
                                                className="hd-input-text"
                                                value={firstCartItem.trangPhucChuReNgayAnHoi ?? ""}
                                                onChange={(e) => updateGioHangParam("trangPhucChuReNgayAnHoi", e.target.value)}
                                                disabled={gioHang.length === 0}
                                                placeholder="Không có"
                                            />
                                        </div>
                                        <div className="hd-form-group">
                                            <label className="hd-form-label">Váy cưới ngày cưới</label>
                                            <input
                                                type="text"
                                                className="hd-input-text"
                                                value={firstCartItem.trangPhucVayCuoiNgayCuoi ?? ""}
                                                onChange={(e) => updateGioHangParam("trangPhucVayCuoiNgayCuoi", e.target.value)}
                                                disabled={gioHang.length === 0}
                                                placeholder="Không có"
                                            />
                                        </div>
                                        <div className="hd-form-group">
                                            <label className="hd-form-label">Vest chú rể ngày cưới</label>
                                            <input
                                                type="text"
                                                className="hd-input-text"
                                                value={firstCartItem.trangPhucVestChuReNgayCuoi ?? ""}
                                                onChange={(e) => updateGioHangParam("trangPhucVestChuReNgayCuoi", e.target.value)}
                                                disabled={gioHang.length === 0}
                                                placeholder="Không có"
                                            />
                                        </div>
                                        <div className="hd-form-group">
                                            <label className="hd-form-label">Hoa cầm tay</label>
                                            <input
                                                type="text"
                                                className="hd-input-text"
                                                value={firstCartItem.hoaCamTay ?? ""}
                                                onChange={(e) => updateGioHangParam("hoaCamTay", e.target.value)}
                                                disabled={gioHang.length === 0}
                                                placeholder="Không có"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ===== CỘT 3 (1fr - CHIẾM 1/3): TÀI CHÍNH & THANH TOÁN ===== */}
                            <div className="hd-bento-col">
                                
                                {/* Thẻ: Thông Tin Thanh Toán */}
                                <div className="hd-card">
                                    <div className="hd-card-head">
                                        <h3 className="hd-card-title">
                                            <span>💳</span> Thông Tin Thanh Toán
                                        </h3>
                                    </div>

                                    {/* Giảm giá tổng */}
                                    <div className="hd-form-group">
                                        <label className="hd-form-label">Giảm giá hợp đồng</label>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <NumericFormat
                                                customInput={TextField}
                                                value={giamGia}
                                                onValueChange={(e) => setGiamGia(e.floatValue || 0)}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                decimalScale={2}
                                                allowNegative={false}
                                                fullWidth
                                                size="small"
                                                placeholder="0"
                                                sx={{ '& .MuiInputBase-root': { height: 32, fontSize: '0.82rem' } }}
                                            />
                                            <select
                                                value={loaiGiamGia}
                                                onChange={(e) => setLoaiGiamGia(Number(e.target.value))}
                                                style={{
                                                    borderRadius: '6px',
                                                    border: '1px solid #cbd5e1',
                                                    textAlign: 'center',
                                                    padding: '0 8px',
                                                    width: '75px',
                                                    backgroundColor: '#fff',
                                                    fontSize: '0.82rem',
                                                    height: '32px'
                                                }}
                                            >
                                                <option value={0}>VNĐ</option>
                                                <option value={1}>%</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Voucher Khuyến Mãi */}
                                    <div className="hd-form-group" style={{ marginTop: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <label className="hd-form-label" style={{ margin: 0 }}>
                                                <span>🏷️</span> Mã Voucher
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleOpenSelectVoucherModal}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#d97706',
                                                    fontSize: '0.74rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    padding: 0
                                                }}
                                            >
                                                + Chọn Voucher
                                            </button>
                                        </div>

                                        {!appliedVoucher ? (
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Nhập mã voucher..."
                                                    value={voucherCodeInput}
                                                    onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleApplyVoucher();
                                                        }
                                                    }}
                                                    style={{
                                                        flex: 1,
                                                        height: '32px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        padding: '0 8px',
                                                        fontSize: '0.82rem',
                                                        textTransform: 'uppercase',
                                                        fontWeight: 700,
                                                        outline: 'none'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleApplyVoucher()}
                                                    style={{
                                                        background: '#0f172a',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '0 12px',
                                                        fontSize: '0.78rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Áp dụng
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                background: '#ecfdf5',
                                                border: '1.5px dashed #10b981',
                                                borderRadius: '8px',
                                                padding: '6px 10px'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontSize: '1rem' }}>🎁</span>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.84rem' }}>
                                                            {appliedVoucher.code}
                                                        </div>
                                                        <div style={{ fontSize: '0.72rem', color: '#047857' }}>
                                                            Giảm -{appliedVoucher.calculatedDiscount?.toLocaleString('vi-VN')} đ
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveVoucher}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#dc2626',
                                                        fontSize: '0.9rem',
                                                        cursor: 'pointer',
                                                        fontWeight: 800,
                                                        padding: '2px 6px'
                                                    }}
                                                    title="Gỡ voucher"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bảng tổng kết tài chính */}
                                    <div className="hd-pay-summary-box" style={{ marginTop: '12px' }}>
                                        <div className="hd-pay-row">
                                            <span style={{ color: '#64748b' }}>Tổng tiền dịch vụ:</span>
                                            <b style={{ color: '#0f172a' }}>{tongGocDonHang.toLocaleString("vi-VN")} đ</b>
                                        </div>
                                        <div className="hd-pay-row" style={{ color: soTienTietKiem > 0 ? '#16a34a' : '#64748b' }}>
                                            <span style={{ fontWeight: 600 }}>Số tiền tiết kiệm:</span>
                                            <b>
                                                {soTienTietKiem > 0 ? `-${soTienTietKiem.toLocaleString("vi-VN")} đ` : '0 đ'}
                                                {tongGocDonHang > 0 && soTienTietKiem > 0 && (
                                                    <span style={{ fontSize: '0.72rem', marginLeft: '6px', backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                                        -{((soTienTietKiem / tongGocDonHang) * 100).toFixed(0)}%
                                                    </span>
                                                )}
                                            </b>
                                        </div>
                                        {tongGiamTungMon > 0 && (
                                            <div className="hd-pay-row" style={{ color: '#dc2626', fontSize: '0.76rem', paddingLeft: '8px' }}>
                                                <span>↳ Giảm từng món:</span>
                                                <b>-{tongGiamTungMon.toLocaleString("vi-VN")} đ</b>
                                            </div>
                                        )}
                                        {giamGia > 0 && (
                                            <div className="hd-pay-row" style={{ color: '#dc2626', fontSize: '0.76rem', paddingLeft: '8px' }}>
                                                <span>↳ Giảm giá HĐ:</span>
                                                <b>-{loaiGiamGia === 1 ? `${giamGia}%` : `${giamGia.toLocaleString("vi-VN")} đ`}</b>
                                            </div>
                                        )}
                                        {appliedVoucher && appliedVoucher.calculatedDiscount > 0 && (
                                            <div className="hd-pay-row" style={{ color: '#15803d', fontSize: '0.76rem', paddingLeft: '8px' }}>
                                                <span>↳ Voucher ({appliedVoucher.code}):</span>
                                                <b>-{appliedVoucher.calculatedDiscount.toLocaleString("vi-VN")} đ</b>
                                            </div>
                                        )}
                                        <div className="hd-pay-row" style={{ borderTop: '1.5px dashed #cbd5e1', paddingTop: '8px', marginTop: '4px', color: '#15803d' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Tổng tiền sau giảm:</span>
                                            <b style={{ fontSize: '1.15rem', fontWeight: 900 }}>{tongTien.toLocaleString("vi-VN")} đ</b>
                                        </div>
                                    </div>

                                    {/* Hướng dẫn thanh toán qua Dialog */}
                                    <div style={{
                                        marginTop: '14px',
                                        padding: '10px 12px',
                                        backgroundColor: '#f0fdf4',
                                        border: '1px solid #bbf7d0',
                                        borderRadius: '8px',
                                        fontSize: '0.78rem',
                                        color: '#166534',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                        lineHeight: 1.45
                                    }}>
                                        <span style={{ fontSize: '1rem' }}>💡</span>
                                        <div>
                                            Để thực hiện thanh toán (Chuyển khoản VietQR hoặc Tiền mặt), bấm nút <strong>"Tạo Hợp Đồng & Thanh Toán"</strong> ở thanh thao tác bên dưới.
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 3. FIXED BOTTOM ACTION BAR (~48px) */}
                    <div className="hd-compact-footer" style={{ justifyContent: 'flex-end' }}>
                        <div className="hd-footer-actions-right">
                            <Button
                                onClick={onClose}
                                variant="outlined"
                                color="inherit"
                                size="small"
                                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', height: 32 }}
                            >
                                Hủy / Thoát
                            </Button>
                            <Button
                                onClick={() => {
                                    resetForm();
                                    toast.info("Đã xóa trắng thông tin đã nhập");
                                }}
                                variant="outlined"
                                color="warning"
                                size="small"
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    height: 32,
                                    color: '#d97706',
                                    borderColor: '#fcd34d',
                                    '&:hover': { borderColor: '#b45309', backgroundColor: '#fffbeb' }
                                }}
                            >
                                Clear
                            </Button>
                            <Button
                                onClick={() => onSaveHopDong(false)}
                                variant="contained"
                                size="small"
                                sx={{
                                    backgroundColor: '#d4af37',
                                    color: '#0f172a',
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    borderRadius: '6px',
                                    height: 32,
                                    padding: '0 14px',
                                    '&:hover': { backgroundColor: '#b8962e' }
                                }}
                            >
                                Tạo Hợp Đồng
                            </Button>
                            <Button
                                onClick={() => onSaveHopDong(true)}
                                variant="contained"
                                size="small"
                                sx={{
                                    backgroundColor: '#0284c7',
                                    color: '#ffffff',
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    borderRadius: '6px',
                                    height: 32,
                                    padding: '0 14px',
                                    '&:hover': { backgroundColor: '#0369a1' }
                                }}
                            >
                                Tạo Hợp Đồng & Thanh Toán
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* SEPAY PAYMENT DIALOG */}
            <SePayDialog
                open={openPaymentDialog}
                onClose={() => {
                    setOpenPaymentDialog(false);
                    setIsSuccess(true);
                }}
                maHopDong={maHopDong}
                defaultAmount={tongTien}
                onSuccess={(updatedData) => {
                    if (updatedData?.latestPayment?.amount) {
                        setKhachThanhToan((prev) => (prev || 0) + updatedData.latestPayment.amount);
                    } else if (updatedData?.khachHangDaThanhToan) {
                        setKhachThanhToan(updatedData.khachHangDaThanhToan);
                    }
                }}
            />

            {/* MODAL CHỌN VOUCHER CÓ SẴN */}
            <Dialog
                open={openVoucherModal}
                onClose={() => setOpenVoucherModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '16px', padding: '6px' }
                }}
            >
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🏷️</span> Chọn Mã Voucher Ưu Đãi
                    </div>
                    <button
                        onClick={() => setOpenVoucherModal(false)}
                        style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ padding: '16px 20px', maxHeight: '420px', overflowY: 'auto' }}>
                    {activeVouchersList.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {activeVouchersList.map((v) => {
                                const isPercent = Number(v.discountType) === 1;
                                const isCurrent = appliedVoucher?.code === v.code;
                                return (
                                    <div
                                        key={v._id}
                                        onClick={() => handleApplyVoucher(v.code)}
                                        style={{
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            border: isCurrent ? '2px solid #10b981' : '1px solid #e2e8f0',
                                            background: isCurrent ? '#f0fdf4' : '#ffffff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{
                                                    fontFamily: 'monospace',
                                                    fontWeight: 800,
                                                    background: '#fef3c7',
                                                    color: '#92400e',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {v.code}
                                                </span>
                                                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                                                    {v.title}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                                                Giảm: <strong style={{ color: isPercent ? '#7c3aed' : '#059669' }}>
                                                    {isPercent ? `${v.discountValue}%` : `${v.discountValue?.toLocaleString('vi-VN')} đ`}
                                                </strong>
                                                {v.minOrderValue > 0 && ` • Đơn tối thiểu: ${v.minOrderValue.toLocaleString('vi-VN')} đ`}
                                                {v.endDate && ` • Hạn: ${new Date(v.endDate).toLocaleDateString('vi-VN')}`}
                                            </div>
                                        </div>
                                        <button
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: isCurrent ? '#10b981' : '#0f172a',
                                                color: '#ffffff',
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {isCurrent ? 'Đang dùng' : 'Áp dụng'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                            <p style={{ margin: 0, fontSize: '0.88rem' }}>Không có mã voucher nào đang kích hoạt.</p>
                        </div>
                    )}
                </div>

                <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setOpenVoucherModal(false)}
                        style={{ textTransform: 'none', borderRadius: '8px', color: '#64748b', borderColor: '#cbd5e1' }}
                    >
                        Đóng
                    </Button>
                </div>
            </Dialog>

            {/* Context Menu khi chuột phải vào dòng dịch vụ trong giỏ hàng */}
            {serviceContextMenu && (
                <div
                    className="hd-context-menu"
                    style={{
                        left: Math.max(10, Math.min(serviceContextMenu.mouseX, window.innerWidth - 260)),
                        top: Math.max(10, Math.min(serviceContextMenu.mouseY, window.innerHeight - 260))
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="hd-context-header" title={serviceContextMenu.item?.tenDichVu}>
                        📦 {serviceContextMenu.item?.tenDichVu || 'Dịch vụ'}
                    </div>
                    <div className="hd-context-item hd-context-parent">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📅</span>
                            <span>Thêm lịch phân công</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>▶</span>
                        <div className={`hd-context-submenu ${serviceContextMenu.mouseX > window.innerWidth - 460 ? 'open-left' : ''}`}>
                            <div
                                className="hd-context-subitem"
                                onClick={() => handleAddScheduleFromItem(serviceContextMenu.item, 'photo')}
                            >
                                <span>📸</span> Chụp ảnh
                            </div>
                            <div
                                className="hd-context-subitem"
                                onClick={() => handleAddScheduleFromItem(serviceContextMenu.item, 'makeup')}
                            >
                                <span>💄</span> Trang điểm
                            </div>
                            <div
                                className="hd-context-subitem"
                                onClick={() => handleAddScheduleFromItem(serviceContextMenu.item, 'video')}
                            >
                                <span>🎥</span> Quay phim
                            </div>
                            <div
                                className="hd-context-subitem"
                                onClick={() => handleAddScheduleFromItem(serviceContextMenu.item, 'bts')}
                            >
                                <span>🎬</span> Hậu trường
                            </div>
                            <div
                                className="hd-context-subitem"
                                onClick={() => handleAddScheduleFromItem(serviceContextMenu.item, 'cskh')}
                            >
                                <span>📞</span> Chăm sóc KH
                            </div>
                            <div
                                className="hd-context-subitem"
                                onClick={() => handleAddScheduleFromItem(serviceContextMenu.item, 'support')}
                            >
                                <span>🤝</span> Hỗ trợ ekip
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Dialog>
    );
}

export default ThemHopDongKHDialog;
