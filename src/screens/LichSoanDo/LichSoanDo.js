import React, { useState, useEffect } from 'react';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { toast } from 'sonner';
import { useContractTypes } from '../../hooks/useContractTypes';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

// Material UI components
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useAuth } from '../Login/AuthContext/AuthContext';

function LichSoanDo() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { showLoading, hideLoading } = useLoading();
    const { user } = useAuth();
    const { getDichVuChinhLabel } = useContractTypes();
    const loggedInUserFullname = user?.fullname || '';
    const [hopDongs, setHopDongs] = useState([]);
    const [trangPhucList, setTrangPhucList] = useState([]);
    
    // Filters & Search
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('all');

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedHD, setSelectedHD] = useState(null);
    const [dialogTab, setDialogTab] = useState(0);
    const [isNew, setIsNew] = useState(false);

    // Form inputs state for selected contract
    const [ngaySoan, setNgaySoan] = useState('');
    const [ngayMuon, setNgayMuon] = useState('');
    const [ngayTra, setNgayTra] = useState('');
    const [datCoc, setDatCoc] = useState(0);
    const [nguoiKiem, setNguoiKiem] = useState('');
    const [noiDung, setNoiDung] = useState('');
    const [trangThai, setTrangThai] = useState('Chưa mượn');
    const [dsMuon, setDsMuon] = useState([]);
    const [dsTra, setDsTra] = useState([]);

    // Temporary input state for adding to dsMuon
    const [selectedTrangPhuc, setSelectedTrangPhuc] = useState(null);
    const [trangPhucQty, setTrangPhucQty] = useState(1);
    const [trangPhucNote, setTrangPhucNote] = useState('');
    const [trangPhucTienNangCap, setTrangPhucTienNangCap] = useState(0);
    const [trangPhucIsThueThem, setTrangPhucIsThueThem] = useState(false);
    const [trangPhucDonGiaThue, setTrangPhucDonGiaThue] = useState(0);

    const commonHeight = 56;

    // Load data from APIs
    const loadData = () => {
        showLoading("Đang tải dữ liệu lịch soạn đồ...");
        Promise.all([
            otherService.LIST_HOPDONG({}),
            otherService.findAllLichSoanDo({})
        ])
            .then(([resHD, resLSD]) => {
                // Filter Pre-Wedding (1) and Cho thuê trang phục (12), excluding completed contracts (giaiDoan === 5)
                const list = (resHD.data.hopDong || []).filter(hd => {
                    const dvId = Number(hd.dichVuChinh);
                    const label = getDichVuChinhLabel(hd.dichVuChinh)?.toLowerCase() || '';
                    const isTargetService = dvId === 1 || dvId === 12 || label.includes('pre-wedding') || label.includes('cho thuê trang phục');
                    const isNotCompleted = Number(hd.giaiDoan) !== 5;
                    return isTargetService && isNotCompleted;
                });
                
                const schedules = resLSD.data?.lichSoanDo || [];
                const updatedList = list.map(hd => {
                    const matchedSD = schedules.find(sd => 
                        (sd.hopDongId === hd._id) || 
                        (sd.hopDongId?._id === hd._id) ||
                        (sd.maHopDong === hd.maHopDong)
                    );
                    return {
                        ...hd,
                        soanDo: matchedSD || null
                    };
                });
                setHopDongs(updatedList);
            })
            .catch(err => {
                console.error(err);
                toast.error("Lỗi khi tải danh sách lịch soạn đồ");
            })
            .finally(() => hideLoading());
    };

    useEffect(() => {
        loadData();

        // Fetch clothing list
        otherService.findDichVu({})
            .then(res => {
                // Filter only services with loaiDichVu === 1 (Trang Phục)
                const list = (res.data.dichVu || []).filter(item => Number(item.loaiDichVu) === 1);
                setTrangPhucList(list);
            })
            .catch(err => {
                console.error("Lỗi khi tải danh sách trang phục:", err);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Get current status text considering overdue date
    const getTrangThaiText = (soanDo) => {
        if (!soanDo) return "Chưa mượn";
        if (soanDo.trangThai === "Đang mượn") {
            if (soanDo.ngayTra) {
                const returnDate = new Date(soanDo.ngayTra);
                if (!isNaN(returnDate.getTime()) && returnDate.getTime() < Date.now()) {
                    return "Quá hạn";
                }
            }
        }
        return soanDo.trangThai || "Chưa mượn";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "-";
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const MM = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${hh}:${mm} ${dd}/${MM}/${yyyy}`;
    };

    // getDichVuChinhLabel is now loaded dynamically from useContractTypes hook

    // Filter items based on time, status and search keyword
    const getFilteredHopDongs = () => {
        return hopDongs.filter(hd => {
            const status = getTrangThaiText(hd.soanDo);

            // 1. Status Filter
            if (statusFilter !== 'all' && status !== statusFilter) {
                return false;
            }

            // 2. Time Filter
            if (timeFilter !== 'all' && hd.soanDo?.ngaySoan) {
                const date = new Date(hd.soanDo.ngaySoan);
                const now = new Date();
                if (timeFilter === 'today') {
                    if (date.toDateString() !== now.toDateString()) return false;
                } else if (timeFilter === 'week') {
                    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                    if (date < startOfWeek) return false;
                } else if (timeFilter === 'month') {
                    if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return false;
                }
            }

            // 3. Search Filter
            if (searchInput.trim()) {
                const kw = searchInput.toLowerCase();
                const matchesMa = hd.maHopDong?.toLowerCase().includes(kw);
                const matchesKH1 = hd.khachHang1?.tenKhachHang?.toLowerCase().includes(kw);
                const matchesKH2 = hd.khachHang2?.tenKhachHang?.toLowerCase().includes(kw);
                const matchesPhone = hd.khachHang1?.soDienThoai?.includes(kw) || hd.khachHang2?.soDienThoai?.includes(kw);
                return matchesMa || matchesKH1 || matchesKH2 || matchesPhone;
            }

            return true;
        });
    };

    const handleAddNewVoucher = () => {
        setSelectedHD(null);
        setIsNew(true);
        setDialogTab(0);
        
        // Reset all states
        setNgaySoan('');
        setNgayMuon('');
        setNgayTra('');
        setDatCoc(0);
        setNguoiKiem(loggedInUserFullname);
        setNoiDung('');
        setTrangThai('Chưa mượn');
        setDsMuon([]);
        setDsTra([]);
        
        setSelectedTrangPhuc(null);
        setTrangPhucQty(1);
        setTrangPhucNote('');
        setTrangPhucTienNangCap(0);
        setTrangPhucIsThueThem(false);
        setTrangPhucDonGiaThue(0);

        setOpenDialog(true);
    };

    // Helper: Extract attire items from contract's gioHang and merge with existing dsMuon
    const extractAttireFromContract = (hd, existingDsMuon = []) => {
        const result = [...existingDsMuon];
        const existingCodes = new Set(result.map(i => i.maDichVu).filter(Boolean));
        const existingIds = new Set(result.map(i => (i.dichVuId || i._id)?.toString()).filter(Boolean));

        if (Array.isArray(hd?.gioHang)) {
            hd.gioHang.forEach(sp => {
                const rawName = sp.tenDichVuSnapshot || sp.tenDichVu || sp.dichVu?.tenDichVu || '';
                if (rawName.startsWith('[Nâng cấp]')) return; // Skip upgrade pseudo-items

                const isClothing = Number(sp.loaiDichVu) === 1 || 
                                   Number(sp.dichVu?.loaiDichVu) === 1 || 
                                   trangPhucList.some(tp => tp._id === (sp.dichVu?._id || sp.dichVu || sp._id) || (tp.maDichVu && tp.maDichVu === sp.maDichVu));

                if (isClothing) {
                    const dvId = (sp.dichVu?._id || sp.dichVu || sp._id)?.toString();
                    const maDV = sp.maDichVu || sp.dichVu?.maDichVu || '';
                    const codeToCheck = maDV;

                    const alreadyExists = (codeToCheck && existingCodes.has(codeToCheck)) || (dvId && existingIds.has(dvId));

                    if (!alreadyExists) {
                        const isThueThem = rawName.startsWith('[Thuê thêm]');
                        const cleanName = rawName.replace('[Thuê thêm] ', '');
                        const donGia = Number(sp.donGia !== undefined ? sp.donGia : (sp.giaChoThueDichVu || sp.dichVu?.giaChoThueDichVu || 0));

                        result.push({
                            _id: sp.dichVu?._id || sp.dichVu || sp._id,
                            dichVuId: sp.dichVu?._id || sp.dichVu || sp._id,
                            maDichVu: maDV,
                            tenDichVu: cleanName,
                            soLuong: Number(sp.soLuong) || 1,
                            tienNangCap: 0,
                            isThueThem: isThueThem,
                            donGiaThue: donGia,
                            giaChoThueDichVu: donGia,
                            ghiChu: ''
                        });

                        if (codeToCheck) existingCodes.add(codeToCheck);
                        if (dvId) existingIds.add(dvId);
                    }
                }
            });
        }
        return result;
    };

    // Handle opening details dialog
    const handleRowClick = (hd) => {
        setSelectedHD(hd);
        setIsNew(false);
        setDialogTab(0);
        
        // Initialize form states
        const sd = hd.soanDo || {};
        setNgaySoan(sd.ngaySoan || '');
        setNgayMuon(sd.ngayMuon || '');
        setNgayTra(sd.ngayTra || '');
        setDatCoc(sd.datCoc || 0);
        setNguoiKiem(sd.nguoiKiem || loggedInUserFullname);
        setNoiDung(sd.noiDung || '');
        setTrangThai(sd.trangThai || 'Chưa mượn');
        
        // Pre-populate attire items from contract cart if present
        const mergedDsMuon = extractAttireFromContract(hd, sd.dsMuon || []);
        setDsMuon(mergedDsMuon);
        
        // If there are borrowed items but no returned items mapped, init them
        if (sd.dsTra && sd.dsTra.length > 0) {
            const activeMuonCodes = new Set(mergedDsMuon.map(i => i.maDichVu));
            const existingTra = sd.dsTra.filter(i => activeMuonCodes.has(i.maDichVu));
            const existingTraCodes = new Set(existingTra.map(i => i.maDichVu));
            
            const additionalTra = mergedDsMuon.filter(i => !existingTraCodes.has(i.maDichVu)).map(item => ({
                ...item,
                trangThaiDo: 'Nguyên vẹn',
                ghiChuTra: ''
            }));
            setDsTra([...existingTra, ...additionalTra]);
        } else {
            setDsTra(mergedDsMuon.map(item => ({
                ...item,
                trangThaiDo: 'Nguyên vẹn',
                ghiChuTra: ''
            })));
        }

        setSelectedTrangPhuc(null);
        setTrangPhucQty(1);
        setTrangPhucNote('');
        setTrangPhucTienNangCap(0);
        setTrangPhucIsThueThem(false);
        setTrangPhucDonGiaThue(0);

        setOpenDialog(true);
    };

    // Handle adding borrowed dress/suit
    const handleAddTrangPhuc = () => {
        if (trangThai === "Đang mượn" || trangThai === "Đã trả") {
            toast.error("Không thể thêm trang phục khi đã chuyển sang trạng thái Đang mượn hoặc Đã trả!");
            return;
        }

        if (!selectedTrangPhuc) {
            toast.warning("Vui lòng chọn trang phục!");
            return;
        }
        
        const exists = dsMuon.some(item => item.maDichVu === selectedTrangPhuc.maDichVu);
        if (exists) {
            toast.error("Trang phục này đã có trong danh sách mượn!");
            return;
        }

        const newItem = {
            _id: selectedTrangPhuc._id,
            dichVuId: selectedTrangPhuc._id,
            maDichVu: selectedTrangPhuc.maDichVu,
            tenDichVu: selectedTrangPhuc.tenDichVu,
            soLuong: Number(trangPhucQty) || 1,
            tienNangCap: Number(trangPhucTienNangCap) || 0,
            isThueThem: Boolean(trangPhucIsThueThem),
            donGiaThue: Boolean(trangPhucIsThueThem) ? (Number(trangPhucDonGiaThue) || Number(selectedTrangPhuc.giaChoThueDichVu) || 0) : 0,
            giaChoThueDichVu: Number(selectedTrangPhuc.giaChoThueDichVu) || 0,
            ghiChu: trangPhucNote.trim()
        };

        const updatedDsMuon = [...dsMuon, newItem];
        setDsMuon(updatedDsMuon);

        // Also add or keep in dsTra sync
        setDsTra([...dsTra, {
            ...newItem,
            trangThaiDo: 'Nguyên vẹn',
            ghiChuTra: ''
        }]);

        // Reset inputs
        setSelectedTrangPhuc(null);
        setTrangPhucQty(1);
        setTrangPhucNote('');
        setTrangPhucTienNangCap(0);
        setTrangPhucIsThueThem(false);
        setTrangPhucDonGiaThue(0);
        toast.success("Đã thêm trang phục vào danh sách!");
    };

    // Remove borrowed attire item
    const handleRemoveTrangPhuc = (idx) => {
        if (trangThai === "Đang mượn" || trangThai === "Đã trả") {
            toast.error("Không thể xóa trang phục khi đã chuyển sang trạng thái Đang mượn hoặc Đã trả!");
            return;
        }

        const itemToRemove = dsMuon[idx];
        setDsMuon(dsMuon.filter((_, i) => i !== idx));
        setDsTra(dsTra.filter(item => item.maDichVu !== itemToRemove.maDichVu));
    };

    // Save changes to database and update contract cart/totals
    const handleSave = async () => {
        if (!selectedHD) return;

        // Auto update status to Overdue if return date has passed
        let currentStatus = trangThai;
        if (currentStatus === "Đang mượn" && ngayTra) {
            const returnDate = new Date(ngayTra);
            if (!isNaN(returnDate.getTime()) && returnDate.getTime() < Date.now()) {
                currentStatus = "Đang mượn"; // Display code calculates overdue dynamically
            }
        }

        showLoading("Đang cập nhật lịch soạn đồ và hợp đồng...");
        try {
            // 1. Prepare cart items for contract:
            // Keep existing cart items except those generated by LichSoanDo ([Thuê thêm] or [Nâng cấp])
            const currentGioHang = Array.isArray(selectedHD.gioHang) ? selectedHD.gioHang : [];
            const baseGioHang = currentGioHang.filter(item => {
                const name = item.tenDichVuSnapshot || item.tenDichVu || item.dichVu?.tenDichVu || '';
                return !name.startsWith('[Thuê thêm]') && !name.startsWith('[Nâng cấp]');
            }).map(item => ({
                dichVu: item.dichVu?._id || item.dichVu || item._id,
                tenDichVuSnapshot: item.tenDichVuSnapshot || item.tenDichVu || item.dichVu?.tenDichVu || '',
                maDichVu: item.maDichVu || item.dichVu?.maDichVu || '',
                loaiDichVu: item.loaiDichVu || item.dichVu?.loaiDichVu || 1,
                soLuong: Number(item.soLuong) || 1,
                donGia: Number(item.donGia !== undefined ? item.donGia : (item.giaChoThueDichVu || item.dichVu?.giaChoThueDichVu || 0)),
                giamGiaDichVu: Number(item.giamGiaDichVu) || 0,
                thanhTien: Number(item.thanhTien) || ((Number(item.donGia !== undefined ? item.donGia : (item.giaChoThueDichVu || item.dichVu?.giaChoThueDichVu || 0))) * (Number(item.soLuong) || 1))
            }));

            // Generate additional items from dsMuon
            const additionalItems = [];
            (dsMuon || []).forEach(item => {
                // Thuê thêm
                if (item.isThueThem) {
                    const price = Number(item.donGiaThue) || Number(item.giaChoThueDichVu) || 0;
                    const qty = Number(item.soLuong) || 1;
                    additionalItems.push({
                        dichVu: item.dichVuId || item._id || item.dichVu,
                        tenDichVuSnapshot: `[Thuê thêm] ${item.tenDichVu}`,
                        maDichVu: item.maDichVu,
                        loaiDichVu: 1,
                        soLuong: qty,
                        donGia: price,
                        giamGiaDichVu: 0,
                        thanhTien: price * qty
                    });
                }
                // Nâng cấp
                if (Number(item.tienNangCap) > 0) {
                    const upgradeAmount = Number(item.tienNangCap);
                    additionalItems.push({
                        dichVu: item.dichVuId || item._id || item.dichVu,
                        tenDichVuSnapshot: `[Nâng cấp] ${item.tenDichVu}`,
                        maDichVu: item.maDichVu,
                        loaiDichVu: 1,
                        soLuong: 1,
                        donGia: upgradeAmount,
                        giamGiaDichVu: 0,
                        thanhTien: upgradeAmount
                    });
                }
            });

            const newGioHang = [...baseGioHang, ...additionalItems];

            // 2. Save both LichSoanDo and HopDong
            await Promise.all([
                otherService.saveLichSoanDo({
                    hopDongId: selectedHD._id,
                    maHopDong: selectedHD.maHopDong,
                    ngaySoan,
                    ngayMuon,
                    ngayTra,
                    datCoc: Number(datCoc),
                    nguoiKiem,
                    noiDung,
                    trangThai: currentStatus,
                    dsMuon,
                    dsTra
                }),
                otherService.UPDATE_HOPDONG({
                    _id: selectedHD._id,
                    maHopDong: selectedHD.maHopDong,
                    gioHang: newGioHang
                })
            ]);

            toast.success("Cập nhật lịch soạn đồ và tổng tiền hợp đồng thành công!");
            setOpenDialog(false);
            loadData();
        } catch (err) {
            console.error(err);
            toast.error("Có lỗi xảy ra khi cập nhật!");
        } finally {
            hideLoading();
        }
    };

    // Print Loan Receipt
    const handlePrintPhieuMuon = () => {
        if (!selectedHD) return;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
            <head>
                <title>Phiếu Mượn Đồ - ${selectedHD.maHopDong}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
                    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
                    .info-table td { padding: 8px 12px; vertical-align: top; border: none; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .items-table th, .items-table td { border: 1px solid #999; padding: 10px; text-align: left; }
                    .items-table th { background-color: #f0f0f0; font-weight: bold; }
                    .signature-section { display: flex; justify-content: space-between; margin-top: 60px; }
                    .signature-box { text-align: center; width: 220px; }
                    .signature-space { height: 90px; }
                    .footer { text-align: center; font-size: 11px; color: #777; margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">PHIẾU MƯỢN TRANG PHỤC</div>
                    <div>Mã hợp đồng: <strong>${selectedHD.maHopDong}</strong></div>
                    <div>Cửa hàng: <strong>LONG WEDDING</strong></div>
                </div>
                <table class="info-table">
                    <tr>
                        <td style="width: 50%;"><strong>Khách hàng 1:</strong> ${selectedHD.khachHang1?.tenKhachHang || ''} (${selectedHD.khachHang1?.soDienThoai || ''})</td>
                        <td style="width: 50%;"><strong>Ngày mượn:</strong> ${ngayMuon ? dayjs(ngayMuon).format('DD/MM/YYYY HH:mm') : ''}</td>
                    </tr>
                    <tr>
                        <td><strong>Khách hàng 2:</strong> ${selectedHD.khachHang2?.tenKhachHang || ''} (${selectedHD.khachHang2?.soDienThoai || ''})</td>
                        <td><strong>Ngày trả dự kiến:</strong> ${ngayTra ? dayjs(ngayTra).format('DD/MM/YYYY HH:mm') : ''}</td>
                    </tr>
                    <tr>
                        <td><strong>Người bàn giao:</strong> ${nguoiKiem || ''}</td>
                        <td><strong>Đặt cọc:</strong> ${datCoc ? Number(datCoc).toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ'}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>Ghi chú mượn:</strong> ${noiDung || ''}</td>
                    </tr>
                </table>
                <h3>DANH SÁCH ĐỒ MƯỢN</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;">STT</th>
                            <th>Mã Đồ</th>
                            <th>Tên Trang Phục</th>
                            <th style="width: 110px; text-align: center;">Phân loại</th>
                            <th style="width: 110px; text-align: right;">Nâng cấp</th>
                            <th style="width: 70px; text-align: center;">SL</th>
                            <th>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dsMuon.length === 0 ? `<tr><td colspan="7" style="text-align: center;">Chưa chọn đồ mượn</td></tr>` : 
                          dsMuon.map((item, index) => `
                            <tr>
                                <td style="text-align: center;">${index + 1}</td>
                                <td>${item.maDichVu}</td>
                                <td>${item.tenDichVu}</td>
                                <td style="text-align: center;">${item.isThueThem ? `Thuê thêm (${Number(item.donGiaThue || 0).toLocaleString('vi-VN')} đ)` : 'Trong gói'}</td>
                                <td style="text-align: right;">${item.tienNangCap ? Number(item.tienNangCap).toLocaleString('vi-VN') + ' đ' : '-'}</td>
                                <td style="text-align: center;">${item.soLuong}</td>
                                <td>${item.ghiChu || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="signature-section">
                    <div class="signature-box">
                        <p><strong>Khách hàng ký nhận</strong></p>
                        <p style="font-size: 11px; color: #666; margin-top: -10px;">(Ký và ghi rõ họ tên)</p>
                        <div class="signature-space"></div>
                        <p><strong>${selectedHD.khachHang1?.tenKhachHang || ''}</strong></p>
                    </div>
                    <div class="signature-box">
                        <p><strong>Người bàn giao</strong></p>
                        <p style="font-size: 11px; color: #666; margin-top: -10px;">(Ký nhận)</p>
                        <div class="signature-space"></div>
                        <p><strong>${nguoiKiem || ''}</strong></p>
                    </div>
                </div>
                <div class="footer">
                    <p>Cảm ơn quý khách hàng đã lựa chọn dịch vụ của Long Wedding!</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    };

    // Print Return Receipt
    const handlePrintPhieuTra = () => {
        if (!selectedHD) return;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
            <head>
                <title>Phiếu Trả Đồ - ${selectedHD.maHopDong}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
                    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
                    .info-table td { padding: 8px 12px; vertical-align: top; border: none; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .items-table th, .items-table td { border: 1px solid #999; padding: 10px; text-align: left; }
                    .items-table th { background-color: #f0f0f0; font-weight: bold; }
                    .signature-section { display: flex; justify-content: space-between; margin-top: 60px; }
                    .signature-box { text-align: center; width: 220px; }
                    .signature-space { height: 90px; }
                    .footer { text-align: center; font-size: 11px; color: #777; margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">PHIẾU TRẢ TRANG PHỤC</div>
                    <div>Mã hợp đồng: <strong>${selectedHD.maHopDong}</strong></div>
                    <div>Cửa hàng: <strong>LONG WEDDING</strong></div>
                </div>
                <table class="info-table">
                    <tr>
                        <td style="width: 50%;"><strong>Khách hàng 1:</strong> ${selectedHD.khachHang1?.tenKhachHang || ''} (${selectedHD.khachHang1?.soDienThoai || ''})</td>
                        <td style="width: 50%;"><strong>Ngày mượn:</strong> ${ngayMuon ? dayjs(ngayMuon).format('DD/MM/YYYY HH:mm') : ''}</td>
                    </tr>
                    <tr>
                        <td><strong>Khách hàng 2:</strong> ${selectedHD.khachHang2?.tenKhachHang || ''} (${selectedHD.khachHang2?.soDienThoai || ''})</td>
                        <td><strong>Ngày trả thực tế:</strong> ${dayjs().format('DD/MM/YYYY HH:mm')}</td>
                    </tr>
                    <tr>
                        <td><strong>Người nhận đồ:</strong> ${nguoiKiem || ''}</td>
                        <td><strong>Hoàn cọc:</strong> ${datCoc ? Number(datCoc).toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ'}</td>
                    </tr>
                </table>
                <h3>DANH SÁCH ĐỒ TRẢ</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 50px; text-align: center;">STT</th>
                            <th>Mã Đồ</th>
                            <th>Tên Trang Phục</th>
                            <th style="width: 100px; text-align: center;">Số lượng</th>
                            <th style="width: 120px;">Tình trạng đồ</th>
                            <th>Ghi chú trả đồ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dsTra.length === 0 ? `<tr><td colspan="6" style="text-align: center;">Chưa có đồ nào trong phiếu trả</td></tr>` : 
                          dsTra.map((item, index) => `
                            <tr>
                                <td style="text-align: center;">${index + 1}</td>
                                <td>${item.maDichVu}</td>
                                <td>${item.tenDichVu}</td>
                                <td style="text-align: center;">${item.soLuong}</td>
                                <td><strong>${item.trangThaiDo || 'Nguyên vẹn'}</strong></td>
                                <td>${item.ghiChuTra || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="signature-section">
                    <div class="signature-box">
                        <p><strong>Khách hàng bàn giao</strong></p>
                        <p style="font-size: 11px; color: #666; margin-top: -10px;">(Ký tên)</p>
                        <div class="signature-space"></div>
                        <p><strong>${selectedHD.khachHang1?.tenKhachHang || ''}</strong></p>
                    </div>
                    <div class="signature-box">
                        <p><strong>Người nhận bàn giao</strong></p>
                        <p style="font-size: 11px; color: #666; margin-top: -10px;">(Ký xác nhận)</p>
                        <div class="signature-space"></div>
                        <p><strong>${nguoiKiem || ''}</strong></p>
                    </div>
                </div>
                <div class="footer">
                    <p>LONG WEDDING COPYRIGHT 2025</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    };

    const listToDisplay = getFilteredHopDongs();

    return (
        <div className="LichSoanDo" style={{ padding: isMobile ? '10px' : '20px', height: isMobile ? 'calc(100vh - 145px)' : 'auto', display: isMobile ? 'flex' : 'block', flexDirection: 'column' }}>
            <style>{`
                .LichSoanDo .content-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .LichSoanDo .content-header h2 {
                    font-weight: bold;
                    color: #1976d2;
                    margin: 0;
                }
                .LichSoanDo .filters {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }
                .LichSoanDo .status-badge {
                    padding: 6px 12px;
                    border-radius: 16px;
                    font-size: 0.8rem;
                    font-weight: bold;
                    color: white;
                    display: inline-block;
                    text-align: center;
                    min-width: 90px;
                }
                .LichSoanDo .badge-chua-muon {
                    background-color: #95a5a6;
                }
                .LichSoanDo .badge-dang-muon {
                    background-color: #2980b9;
                }
                .LichSoanDo .badge-da-tra {
                    background-color: #2ecc71;
                }
                .LichSoanDo .badge-qua-han {
                    background-color: #e74c3c;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.6; }
                    100% { opacity: 1; }
                }
            `}</style>

            {/* HEADER & FILTERS */}
            <div className="content-header">
                <h2 style={{ color: '#0d1b3f', marginBottom: isMobile ? '12px' : '0' }}>LỊCH SOẠN & MƯỢN TRẢ ĐỒ</h2>
                <Stack 
                    spacing={2} 
                    direction={isMobile ? 'column' : 'row'} 
                    sx={{ width: '100%', mb: 2 }}
                >
                    <TextField
                        label="Tìm kiếm (Mã HĐ, SĐT, Tên)"
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        InputProps={{
                            sx: { height: isMobile ? 42 : commonHeight }
                        }}
                        sx={{ width: isMobile ? '100%' : 280, order: isMobile ? 1 : 3 }}
                    />
                    
                    <Stack direction="row" spacing={2} sx={{ width: isMobile ? '100%' : 'auto', order: isMobile ? 2 : 1 }}>
                        <FormControl variant="outlined" size={isMobile ? "small" : "medium"} sx={{ flex: 1, minWidth: isMobile ? 0 : 220 }}>
                            <InputLabel>Lọc theo thời gian</InputLabel>
                            <Select
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value)}
                                label="Lọc theo thời gian"
                                sx={{ height: isMobile ? 42 : commonHeight }}
                            >
                                <MenuItem value="all">Tất cả thời gian</MenuItem>
                                <MenuItem value="today">Hôm nay</MenuItem>
                                <MenuItem value="week">Tuần này</MenuItem>
                                <MenuItem value="month">Tháng này</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" size={isMobile ? "small" : "medium"} sx={{ flex: 1, minWidth: isMobile ? 0 : 220 }}>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                label="Trạng thái"
                                sx={{ height: isMobile ? 42 : commonHeight }}
                            >
                                <MenuItem value="all">Tất cả trạng thái</MenuItem>
                                <MenuItem value="Chưa mượn">Chưa soạn / Chưa mượn</MenuItem>
                                <MenuItem value="Đang mượn">Đang mượn</MenuItem>
                                <MenuItem value="Đã trả">Đã trả</MenuItem>
                                <MenuItem value="Quá hạn">Quá hạn (Trễ trả)</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    {!isMobile && (
                        <Button
                            onClick={handleAddNewVoucher}
                            variant="contained"
                            sx={{
                                height: commonHeight, 
                                whiteSpace: 'nowrap',  
                                order: 4
                            }}
                        >Thêm phiếu soạn trả</Button>
                    )}
                </Stack>
                {isMobile && (
                    <div 
                        style={{ 
                            width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#1976d2', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            color: 'white', fontSize: '24px', opacity: 0.8,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)', position: 'fixed', bottom: '90px', right: '20px', zIndex: 1000, cursor: 'pointer'
                        }}
                        onClick={handleAddNewVoucher}
                    >
                        <i className="fa-solid fa-plus"></i>
                    </div>
                )}
            </div>
            {/* CONTRACT LIST TABLE */}
            {isMobile ? (
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                    <Stack spacing={2}>
                    {listToDisplay.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                            Không tìm thấy hợp đồng nào phù hợp.
                        </div>
                    ) : (
                        listToDisplay.map((hd, index) => {
                            const status = getTrangThaiText(hd.soanDo);
                            const isRed = status === "Quá hạn";
                            return (
                                <Card key={index} sx={{ mb: 2, borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }} onClick={() => handleRowClick(hd)}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '1rem', color: '#333' }}>
                                            {hd.maHopDong}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip 
                                                label={status} 
                                                size="small" 
                                                sx={{ 
                                                    bgcolor: isRed ? '#d32f2f' : (status === "Đang mượn" ? '#2980b9' : (status === "Đã trả" ? '#2ecc71' : '#95a5a6')), 
                                                    color: '#fff',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.75rem',
                                                    height: '24px'
                                                }} 
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ p: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Khách hàng</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem', color: '#333' }}>
                                                    {hd.khachHang1 ? hd.khachHang1.tenKhachHang : ''}
                                                    {hd.khachHang2 && hd.khachHang2.tenKhachHang ? ' / ' + hd.khachHang2.tenKhachHang : ''}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Liên hệ</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                                    {hd.khachHang1 ? hd.khachHang1.soDienThoai : ''}
                                                    {hd.khachHang2 && hd.khachHang2.soDienThoai ? ' / ' + hd.khachHang2.soDienThoai : ''}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Dịch vụ</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{getDichVuChinhLabel(hd.dichVuChinh)}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Ngày mượn</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{formatDate(hd.soanDo?.ngayMuon) || '-'}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Ngày trả</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem', color: isRed ? '#d32f2f' : 'inherit' }}>{formatDate(hd.soanDo?.ngayTra) || '-'}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Đặt cọc</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem', color: '#2e7d32' }}>{hd.soanDo?.datCoc ? Number(hd.soanDo.datCoc).toLocaleString('vi-VN') + ' đ' : '-'}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Card>
                            );
                        })
                    )}
                    </Stack>
                </div>
            ) : (
            <TableContainer component={Paper} elevation={3} style={{ borderRadius: '8px', overflow: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
                <Table stickyHeader>
                    <TableHead sx={{ '& th': { backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold', whiteSpace: 'nowrap' } }}>
                        <TableRow>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '60px' }}>STT</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '120px' }}>MÃ SỐ HĐ</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '180px' }}>LOẠI HỢP ĐỒNG</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '220px' }}>TÊN KHÁCH HÀNG</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '150px' }}>SĐT</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '160px' }}>NGÀY SOẠN ĐỒ</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '200px' }}>NỘI DUNG</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '160px' }}>NGÀY MƯỢN</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '160px' }}>NGÀY TRẢ</TableCell>
                            <TableCell align="right" style={{ fontWeight: 'bold', width: '140px' }}>ĐẶT CỌC</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '150px' }}>TRẠNG THÁI</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listToDisplay.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center" style={{ padding: '30px', color: '#999' }}>
                                    Không tìm thấy hợp đồng nào phù hợp.
                                </TableCell>
                            </TableRow>
                        ) : (
                            listToDisplay.map((hd, idx) => {
                                const status = getTrangThaiText(hd.soanDo);
                                const isRed = status === "Quá hạn";
                                const badgeClass = status === "Đang mượn" ? "badge-dang-muon" :
                                                   status === "Đã trả" ? "badge-da-tra" :
                                                   status === "Quá hạn" ? "badge-qua-han" : "badge-chua-muon";
                                return (
                                    <TableRow
                                        key={hd._id}
                                        className="LichSoanDo-table-row"
                                        style={{ backgroundColor: isRed ? '#ffebee' : 'inherit' }}
                                        onClick={() => handleRowClick(hd)}
                                    >
                                        <TableCell align="center">{idx + 1}</TableCell>
                                        <TableCell align="center" style={{ fontWeight: '500' }}>{hd.maHopDong}</TableCell>
                                        <TableCell>{getDichVuChinhLabel(hd.dichVuChinh)}</TableCell>
                                        <TableCell>
                                            {hd.khachHang1 ? hd.khachHang1.tenKhachHang : ''}
                                            {hd.khachHang2 && hd.khachHang2.tenKhachHang && (
                                                <> & <br /> {hd.khachHang2.tenKhachHang}</>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span>{hd.khachHang1 ? hd.khachHang1.soDienThoai : ''}</span>
                                                {hd.khachHang1?.facebookId && (
                                                    <a 
                                                        href={hd.khachHang1.facebookId.startsWith('http') ? hd.khachHang1.facebookId : `https://facebook.com/${hd.khachHang1.facebookId}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        style={{ color: '#1877f2', textDecoration: 'none' }}
                                                        title="Mở Facebook Khách hàng 1"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <i className="fa-brands fa-facebook"></i>
                                                    </a>
                                                )}
                                            </div>
                                             {hd.khachHang2 && hd.khachHang2.soDienThoai && (
                                                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                     <span>{hd.khachHang2.soDienThoai}</span>
                                                     {hd.khachHang2?.facebookId && (
                                                         <a 
                                                             href={hd.khachHang2.facebookId.startsWith('http') ? hd.khachHang2.facebookId : `https://facebook.com/${hd.khachHang2.facebookId}`} 
                                                             target="_blank" 
                                                             rel="noopener noreferrer" 
                                                             style={{ color: '#1877f2', textDecoration: 'none' }}
                                                             title="Mở Facebook Khách hàng 2"
                                                             onClick={(e) => e.stopPropagation()}
                                                         >
                                                             <i className="fa-brands fa-facebook"></i>
                                                         </a>
                                                     )}
                                                 </div>
                                             )}
                                        </TableCell>
                                        <TableCell align="center">{formatDate(hd.soanDo ? hd.soanDo.ngaySoan : null)}</TableCell>
                                        <TableCell style={{ maxLines: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {hd.soanDo && hd.soanDo.noiDung ? hd.soanDo.noiDung : '-'}
                                        </TableCell>
                                        <TableCell align="center">{formatDate(hd.soanDo ? hd.soanDo.ngayMuon : null)}</TableCell>
                                        <TableCell align="center" style={{ color: isRed ? '#d32f2f' : 'inherit', fontWeight: isRed ? 'bold' : 'normal' }}>
                                            {formatDate(hd.soanDo ? hd.soanDo.ngayTra : null)}
                                        </TableCell>
                                        <TableCell align="right">
                                            {hd.soanDo && hd.soanDo.datCoc ? Number(hd.soanDo.datCoc).toLocaleString('vi-VN') + ' đ' : '-'}
                                        </TableCell>
                                        <TableCell align="center">
                                            <span className={"status-badge " + badgeClass}>
                                                {status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            )}

            {/* DIALOG MANAGE FORM */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle style={{ borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#1976d2' }}>
                    {isNew ? "TẠO PHIẾU SOẠN & MƯỢN TRẢ ĐỒ MỚI" : "QUẢN LÝ LỊCH SOẠN & MƯỢN TRẢ ĐỒ - HĐ: " + (selectedHD ? selectedHD.maHopDong : '')}
                </DialogTitle>
                <DialogContent dividers style={{ padding: '0px' }}>
                    {isNew && (
                        <Box p={3} pb={2} style={{ borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
                            <Autocomplete
                                options={hopDongs}
                                getOptionLabel={(option) => "HĐ: " + option.maHopDong + " - " + (option.khachHang1 ? option.khachHang1.tenKhachHang : '') + " (" + getDichVuChinhLabel(option.dichVuChinh) + ")"}
                                value={selectedHD}
                                onChange={(event, newValue) => {
                                    setSelectedHD(newValue);
                                    if (newValue) {
                                        const sd = newValue.soanDo || {};
                                        setNgaySoan(sd.ngaySoan || '');
                                        setNgayMuon(sd.ngayMuon || '');
                                        setNgayTra(sd.ngayTra || '');
                                        setDatCoc(sd.datCoc || 0);
                                        setNguoiKiem(sd.nguoiKiem || loggedInUserFullname);
                                        setNoiDung(sd.noiDung || '');
                                        setTrangThai(sd.trangThai || 'Chưa mượn');
                                        
                                        const mergedDsMuon = extractAttireFromContract(newValue, sd.dsMuon || []);
                                        setDsMuon(mergedDsMuon);
                                        
                                        if (sd.dsTra && sd.dsTra.length > 0) {
                                            const activeMuonCodes = new Set(mergedDsMuon.map(i => i.maDichVu));
                                            const existingTra = sd.dsTra.filter(i => activeMuonCodes.has(i.maDichVu));
                                            const existingTraCodes = new Set(existingTra.map(i => i.maDichVu));
                                            const additionalTra = mergedDsMuon.filter(i => !existingTraCodes.has(i.maDichVu)).map(item => ({
                                                ...item,
                                                trangThaiDo: 'Nguyên vẹn',
                                                ghiChuTra: ''
                                            }));
                                            setDsTra([...existingTra, ...additionalTra]);
                                        } else {
                                            setDsTra(mergedDsMuon.map(item => ({
                                                ...item,
                                                trangThaiDo: 'Nguyên vẹn',
                                                ghiChuTra: ''
                                            })));
                                        }
                                    } else {
                                        setNgaySoan('');
                                        setNgayMuon('');
                                        setNgayTra('');
                                        setDatCoc(0);
                                        setNguoiKiem('');
                                        setNoiDung('');
                                        setTrangThai('Chưa mượn');
                                        setDsMuon([]);
                                        setDsTra([]);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Chọn Hợp đồng liên kết" size="small" fullWidth required />
                                )}
                            />
                        </Box>
                    )}

                    {!selectedHD ? (
                        <Box p={4} textAlign="center" color="#777" fontSize="1.1rem">
                            Vui lòng chọn một Hợp đồng ở trên để lập phiếu soạn đồ.
                        </Box>
                    ) : (
                        <>
                            <Tabs
                                value={dialogTab}
                                onChange={(e, val) => setDialogTab(val)}
                                indicatorColor="primary"
                                textColor="primary"
                                variant="fullWidth"
                            >
                                <Tab label="1. Lịch Mượn Đồ (Phiếu Mượn)" />
                                <Tab label="2. Lịch Trả Đồ (Phiếu Trả)" disabled={dsMuon.length === 0} />
                            </Tabs>

                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                        {dialogTab === 0 ? (
                            /* TAB 1: MUON DO */
                            <Box p={3} display="flex" flexDirection="column" gap={3}>
                                {/* Date and detail inputs */}
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <DateTimePicker
                                        label="Ngày soạn đồ"
                                        value={ngaySoan ? dayjs(ngaySoan) : null}
                                        onChange={(newValue) => setNgaySoan(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                        format="DD/MM/YYYY HH:mm"
                                    />
                                    <DateTimePicker
                                        label="Ngày mượn đồ"
                                        value={ngayMuon ? dayjs(ngayMuon) : null}
                                        onChange={(newValue) => setNgayMuon(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                        format="DD/MM/YYYY HH:mm"
                                    />
                                    <DateTimePicker
                                        label="Ngày trả đồ dự kiến"
                                        value={ngayTra ? dayjs(ngayTra) : null}
                                        onChange={(newValue) => setNgayTra(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                        format="DD/MM/YYYY HH:mm"
                                    />
                                </Stack>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        label="Số tiền đặt cọc (VNĐ)"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={datCoc}
                                        onChange={(e) => setDatCoc(Math.max(0, parseInt(e.target.value) || 0))}
                                    />
                                    <TextField
                                        label="Nhân viên kiểm đồ"
                                        size="small"
                                        fullWidth
                                        value={nguoiKiem}
                                        onChange={(e) => setNguoiKiem(e.target.value)}
                                    />
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Trạng thái</InputLabel>
                                        <Select
                                            value={trangThai}
                                            onChange={(e) => setTrangThai(e.target.value)}
                                            label="Trạng thái"
                                        >
                                            <MenuItem value="Chưa mượn">Chưa mượn</MenuItem>
                                            <MenuItem value="Đang mượn">Đang mượn</MenuItem>
                                            <MenuItem value="Đã trả">Đã trả</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Stack>

                                <TextField
                                    label="Nội dung soạn đồ / Ghi chú mượn"
                                    size="small"
                                    multiline
                                    rows={2}
                                    fullWidth
                                    value={noiDung}
                                    onChange={(e) => setNoiDung(e.target.value)}
                                />

                                {/* SECTION: CHOOSE ITEMS TO BORROW */}
                                {(trangThai === "Đang mượn" || trangThai === "Đã trả") ? (
                                    <Paper variant="outlined" style={{ padding: '14px 18px', backgroundColor: '#fffbeb', borderColor: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <i className="fa-solid fa-lock" style={{ color: '#d97706', fontSize: '1.25rem' }}></i>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#92400e', fontSize: '0.95rem' }}>
                                                Danh sách trang phục mượn đã bị khóa
                                            </div>
                                            <div style={{ color: '#b45309', fontSize: '0.85rem' }}>
                                                Phiếu đang ở trạng thái <strong>"{trangThai}"</strong> nên không thể thêm mới, sửa hoặc xóa các trang phục đã mượn.
                                            </div>
                                        </div>
                                    </Paper>
                                ) : (
                                    <Paper variant="outlined" style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                        <h4 style={{ margin: '0 0 12px 0', color: '#1e293b', fontWeight: 'bold' }}>Thêm trang phục mượn:</h4>
                                        <Stack spacing={2}>
                                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                                                <Autocomplete
                                                    style={{ flex: 3 }}
                                                    options={trangPhucList}
                                                    getOptionLabel={(option) => `[${option.maDichVu}] - ${option.tenDichVu} (${option.giaChoThueDichVu ? Number(option.giaChoThueDichVu).toLocaleString('vi-VN') + ' đ' : '0 đ'})`}
                                                    value={selectedTrangPhuc}
                                                    onChange={(e, val) => {
                                                        setSelectedTrangPhuc(val);
                                                        if (val) {
                                                            setTrangPhucDonGiaThue(val.giaChoThueDichVu || 0);
                                                        } else {
                                                            setTrangPhucDonGiaThue(0);
                                                        }
                                                    }}
                                                    renderInput={(params) => <TextField {...params} label="Chọn trang phục" size="small" />}
                                                />
                                                <TextField
                                                    label="Số lượng"
                                                    type="number"
                                                    size="small"
                                                    style={{ flex: 1 }}
                                                    value={trangPhucQty}
                                                    onChange={(e) => setTrangPhucQty(Math.max(1, parseInt(e.target.value) || 1))}
                                                    inputProps={{ min: 1 }}
                                                />
                                                <TextField
                                                    label="Tiền nâng cấp (VNĐ)"
                                                    type="number"
                                                    size="small"
                                                    style={{ flex: 1.5 }}
                                                    value={trangPhucTienNangCap}
                                                    onChange={(e) => setTrangPhucTienNangCap(Math.max(0, parseInt(e.target.value) || 0))}
                                                    helperText={trangPhucTienNangCap > 0 ? `${Number(trangPhucTienNangCap).toLocaleString('vi-VN')} đ` : ""}
                                                />
                                            </Stack>

                                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                                                <Box style={{ flex: 1.5, display: 'flex', alignItems: 'center' }}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={trangPhucIsThueThem}
                                                                onChange={(e) => setTrangPhucIsThueThem(e.target.checked)}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={<span style={{ fontWeight: trangPhucIsThueThem ? 'bold' : 'normal', color: trangPhucIsThueThem ? '#0284c7' : '#64748b' }}>Thuê thêm</span>}
                                                    />
                                                </Box>

                                                {trangPhucIsThueThem && (
                                                    <TextField
                                                        label="Giá thuê thêm (VNĐ)"
                                                        type="number"
                                                        size="small"
                                                        style={{ flex: 1.5 }}
                                                        value={trangPhucDonGiaThue}
                                                        onChange={(e) => setTrangPhucDonGiaThue(Math.max(0, parseInt(e.target.value) || 0))}
                                                        helperText={trangPhucDonGiaThue > 0 ? `${Number(trangPhucDonGiaThue).toLocaleString('vi-VN')} đ` : ""}
                                                    />
                                                )}

                                                <TextField
                                                    label="Ghi chú (màu sắc, size...)"
                                                    size="small"
                                                    style={{ flex: 3 }}
                                                    value={trangPhucNote}
                                                    onChange={(e) => setTrangPhucNote(e.target.value)}
                                                />
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleAddTrangPhuc}
                                                    style={{ height: '40px', minWidth: '110px', whiteSpace: 'nowrap' }}
                                                >
                                                    Thêm đồ
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                )}

                                {/* LIST OF BORROWED ITEMS */}
                                <h4 style={{ margin: '10px 0 0px 0', color: '#1976d2' }}>DANH SÁCH ĐỒ ĐANG CHỌN MƯỢN:</h4>
                                <TableContainer component={Paper} variant="outlined" style={{ maxHeight: 240 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow sx={{ '& th': { backgroundColor: '#f1f5f9', fontWeight: 'bold' } }}>
                                                <TableCell align="center" style={{ width: '45px' }}>STT</TableCell>
                                                <TableCell style={{ width: '100px' }}>Mã Đồ</TableCell>
                                                <TableCell>Tên Trang Phục</TableCell>
                                                <TableCell align="center" style={{ width: '140px' }}>Phân loại</TableCell>
                                                <TableCell align="right" style={{ width: '130px' }}>Tiền nâng cấp</TableCell>
                                                <TableCell align="center" style={{ width: '50px' }}>SL</TableCell>
                                                <TableCell>Ghi chú lúc mượn</TableCell>
                                                <TableCell align="center" style={{ width: '60px' }}>Xóa</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dsMuon.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} align="center" style={{ padding: '16px', color: '#999' }}>
                                                        Chưa thêm trang phục mượn nào.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                dsMuon.map((item, index) => (
                                                    <TableRow key={item.maDichVu || index}>
                                                        <TableCell align="center">{index + 1}</TableCell>
                                                        <TableCell style={{ fontWeight: '500' }}>{item.maDichVu}</TableCell>
                                                        <TableCell style={{ fontWeight: '500' }}>{item.tenDichVu}</TableCell>
                                                        <TableCell align="center">
                                                            {item.isThueThem ? (
                                                                <Chip 
                                                                    size="small" 
                                                                    label={`Thuê thêm (+${Number(item.donGiaThue || 0).toLocaleString('vi-VN')} đ)`} 
                                                                    color="info" 
                                                                    variant="outlined" 
                                                                    sx={{ fontWeight: 'bold', fontSize: '0.75rem' }} 
                                                                />
                                                            ) : (
                                                                <Chip 
                                                                    size="small" 
                                                                    label="Trong gói" 
                                                                    variant="outlined" 
                                                                    sx={{ color: '#64748b', borderColor: '#cbd5e1', fontSize: '0.75rem' }} 
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {item.tienNangCap > 0 ? (
                                                                <span style={{ color: '#d97706', fontWeight: 'bold' }}>
                                                                    +{Number(item.tienNangCap).toLocaleString('vi-VN')} đ
                                                                </span>
                                                            ) : '-'}
                                                        </TableCell>
                                                        <TableCell align="center">{item.soLuong}</TableCell>
                                                        <TableCell style={{ minWidth: '180px' }}>
                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                placeholder="Nhập ghi chú (màu sắc, size, tình trạng...)"
                                                                value={item.ghiChu || ''}
                                                                disabled={trangThai === "Đang mượn" || trangThai === "Đã trả"}
                                                                onChange={(e) => {
                                                                    const newNote = e.target.value;
                                                                    setDsMuon(prev => prev.map((m, i) => i === index ? { ...m, ghiChu: newNote } : m));
                                                                    setDsTra(prev => prev.map((t, i) => (t.maDichVu === item.maDichVu || i === index) ? { ...t, ghiChu: newNote } : t));
                                                                }}
                                                                sx={{
                                                                    '& .MuiInputBase-input': {
                                                                        fontSize: '0.85rem',
                                                                        padding: '4px 8px'
                                                                    }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Button
                                                                size="small"
                                                                color="error"
                                                                disabled={trangThai === "Đang mượn" || trangThai === "Đã trả"}
                                                                onClick={() => handleRemoveTrangPhuc(index)}
                                                            >
                                                                Xóa
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* SUMMARY BOX */}
                                {dsMuon.length > 0 && (() => {
                                    const tongTienThueThem = dsMuon.reduce((sum, item) => sum + (item.isThueThem ? ((Number(item.donGiaThue) || Number(item.giaChoThueDichVu) || 0) * (Number(item.soLuong) || 1)) : 0), 0);
                                    const tongTienNangCap = dsMuon.reduce((sum, item) => sum + (Number(item.tienNangCap) || 0), 0);
                                    const tongPhatSinh = tongTienThueThem + tongTienNangCap;
                                    return (
                                        <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                                <Typography variant="body2">
                                                    Thuê thêm: <strong style={{ color: '#0284c7' }}>{tongTienThueThem.toLocaleString('vi-VN')} đ</strong>
                                                </Typography>
                                                <Typography variant="body2">
                                                    Nâng cấp: <strong style={{ color: '#d97706' }}>{tongTienNangCap.toLocaleString('vi-VN')} đ</strong>
                                                </Typography>
                                            </Box>
                                            <Typography variant="subtitle2" sx={{ color: '#16a34a', fontWeight: 'bold' }}>
                                                Tổng phát sinh bổ sung vào HĐ: {tongPhatSinh.toLocaleString('vi-VN')} đ
                                            </Typography>
                                        </Box>
                                    );
                                })()}

                                {/* Print action */}
                                <Box display="flex" justifyContent="flex-end">
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={handlePrintPhieuMuon}
                                        disabled={dsMuon.length === 0}
                                        startIcon={<i className="fa-solid fa-print"></i>}
                                    >
                                        In Phiếu Mượn Đồ
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            /* TAB 2: TRA DO */
                            <Box p={3} display="flex" flexDirection="column" gap={3}>
                                <p style={{ fontSize: '0.95rem', color: '#555', margin: 0 }}>
                                    Kiểm tra và xác nhận tình trạng trang phục khách hàng mang trả:
                                </p>

                                <TableContainer component={Paper} variant="outlined" style={{ maxHeight: 300 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" style={{ fontWeight: 'bold', width: '50px' }}>STT</TableCell>
                                                <TableCell style={{ fontWeight: 'bold', width: '120px' }}>Mã Đồ</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Tên Trang Phục</TableCell>
                                                <TableCell align="center" style={{ fontWeight: 'bold', width: '90px' }}>SL Mượn</TableCell>
                                                <TableCell style={{ fontWeight: 'bold', width: '180px' }}>Tình trạng khi trả</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Ghi chú lúc trả</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dsTra.map((item, index) => (
                                                <TableRow key={item.maDichVu}>
                                                    <TableCell align="center">{index + 1}</TableCell>
                                                    <TableCell>{item.maDichVu}</TableCell>
                                                    <TableCell>{item.tenDichVu}</TableCell>
                                                    <TableCell align="center">{item.soLuong}</TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={item.trangThaiDo || 'Nguyên vẹn'}
                                                            onChange={(e) => {
                                                                const updated = dsTra.map((el, i) => 
                                                                    i === index ? { ...el, trangThaiDo: e.target.value } : el
                                                                );
                                                                setDsTra(updated);
                                                            }}
                                                            size="small"
                                                            fullWidth
                                                        >
                                                            <MenuItem value="Nguyên vẹn">Nguyên vẹn</MenuItem>
                                                            <MenuItem value="Hao mòn ít">Hao mòn ít</MenuItem>
                                                            <MenuItem value="Hư hỏng" style={{ color: 'red' }}>Hư hỏng</MenuItem>
                                                            <MenuItem value="Bẩn/Rách" style={{ color: 'red' }}>Bẩn/Rách</MenuItem>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <input
                                                            type="text"
                                                            placeholder="Nhập ghi chú tình trạng trả..."
                                                            value={item.ghiChuTra || ''}
                                                            onChange={(e) => {
                                                                const updated = dsTra.map((el, i) => 
                                                                    i === index ? { ...el, ghiChuTra: e.target.value } : el
                                                                );
                                                                setDsTra(updated);
                                                            }}
                                                            style={{
                                                                width: '90%',
                                                                padding: '6px 8px',
                                                                border: '1px solid #ccc',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Complete Return check boxes & action */}
                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => {
                                            setTrangThai("Đã trả");
                                            toast.success("Đã thiết lập trạng thái sang 'Đã trả'. Vui lòng bấm 'Lưu thay đổi' để hoàn tất.");
                                        }}
                                    >
                                        Xác nhận khách đã trả đủ
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={handlePrintPhieuTra}
                                        startIcon={<i className="fa-solid fa-print"></i>}
                                    >
                                        In Phiếu Trả Đồ
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </LocalizationProvider>
                        </>
                    )}
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleSave} variant="contained" color="primary" disabled={!selectedHD}>
                        Lưu thay đổi
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default LichSoanDo;
