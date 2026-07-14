import React, { useState, useEffect } from 'react';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { toast } from 'sonner';
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
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useAuth } from '../Login/AuthContext/AuthContext';

function LichSoanDo() {
    const { showLoading, hideLoading } = useLoading();
    const { user } = useAuth();
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

    const commonHeight = 56;

    // Load data from APIs
    const loadData = () => {
        showLoading("Đang tải dữ liệu lịch soạn đồ...");
        Promise.all([
            otherService.LIST_HOPDONG({}),
            otherService.findAllLichSoanDo({})
        ])
            .then(([resHD, resLSD]) => {
                // Filter only Pre-Wedding (1) and Cho thuê trang phục (12)
                const list = (resHD.data.hopDong || []).filter(hd => 
                    Number(hd.dichVuChinh) === 1 || Number(hd.dichVuChinh) === 12
                );
                
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

    const getDichVuChinhLabel = (id) => {
        const labels = {
            1: "Pre-Wedding",
            12: "Cho thuê trang phục"
        };
        return labels[id] || "Khác";
    };

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
        
        setOpenDialog(true);
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
        setDsMuon(sd.dsMuon || []);
        
        // If there are borrowed items but no returned items mapped, init them
        if (sd.dsTra && sd.dsTra.length > 0) {
            setDsTra(sd.dsTra);
        } else {
            setDsTra((sd.dsMuon || []).map(item => ({
                ...item,
                trangThaiDo: 'Nguyên vẹn',
                ghiChuTra: ''
            })));
        }

        setOpenDialog(true);
    };

    // Handle adding borrowed dress/suit
    const handleAddTrangPhuc = () => {
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
            maDichVu: selectedTrangPhuc.maDichVu,
            tenDichVu: selectedTrangPhuc.tenDichVu,
            soLuong: Number(trangPhucQty),
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
        toast.success("Đã thêm trang phục vào danh sách!");
    };

    // Remove borrowed attire item
    const handleRemoveTrangPhuc = (idx) => {
        const itemToRemove = dsMuon[idx];
        setDsMuon(dsMuon.filter((_, i) => i !== idx));
        setDsTra(dsTra.filter(item => item.maDichVu !== itemToRemove.maDichVu));
    };

    // Save changes to database
    const handleSave = () => {
        if (!selectedHD) return;

        // Auto update status to Overdue if return date has passed
        let currentStatus = trangThai;
        if (currentStatus === "Đang mượn" && ngayTra) {
            const returnDate = new Date(ngayTra);
            if (!isNaN(returnDate.getTime()) && returnDate.getTime() < Date.now()) {
                currentStatus = "Đang mượn"; // Display code calculates overdue dynamically
            }
        }

        showLoading("Đang cập nhật lịch soạn đồ...");
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
        })
        .then(() => {
            toast.success("Cập nhật lịch soạn đồ thành công!");
            setOpenDialog(false);
            loadData();
        })
        .catch(err => {
            console.error(err);
            toast.error("Có lỗi xảy ra khi cập nhật!");
        })
        .finally(() => hideLoading());
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
                            <th style="width: 50px; text-align: center;">STT</th>
                            <th>Mã Đồ</th>
                            <th>Tên Trang Phục</th>
                            <th style="width: 100px; text-align: center;">Số lượng</th>
                            <th>Ghi chú lúc mượn</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dsMuon.length === 0 ? `<tr><td colspan="5" style="text-align: center;">Chưa chọn đồ mượn</td></tr>` : 
                          dsMuon.map((item, index) => `
                            <tr>
                                <td style="text-align: center;">${index + 1}</td>
                                <td>${item.maDichVu}</td>
                                <td>${item.tenDichVu}</td>
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
        <div className="LichSoanDo" style={{ padding: '20px' }}>
            <style>{`
                .LichSoanDo .content-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .LichSoanDo .content-header h2 {
                    font-size: 1.8rem;
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
                .LichSoanDo-table-row {
                    transition: background-color 0.2s;
                    cursor: pointer;
                }
                .LichSoanDo-table-row:hover {
                    background-color: #f1f8ff !important;
                }
            `}</style>

            {/* HEADER & FILTERS */}
            <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2>QUẢN LÝ LỊCH SOẠN & MƯỢN TRẢ ĐỒ</h2>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleAddNewVoucher}
                    >
                        Thêm phiếu soạn trả
                    </Button>
                </div>
                <div className="filters">
                    {/* Time Filter */}
                    <FormControl variant="outlined" size="small" style={{ width: 180 }}>
                        <InputLabel>Lọc theo thời gian</InputLabel>
                        <Select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            label="Lọc theo thời gian"
                        >
                            <MenuItem value="all">Tất cả thời gian</MenuItem>
                            <MenuItem value="today">Hôm nay</MenuItem>
                            <MenuItem value="week">Tuần này</MenuItem>
                            <MenuItem value="month">Tháng này</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Status Filter */}
                    <FormControl variant="outlined" size="small" style={{ width: 180 }}>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Trạng thái"
                        >
                            <MenuItem value="all">Tất cả trạng thái</MenuItem>
                            <MenuItem value="Chưa mượn">Chưa soạn / Chưa mượn</MenuItem>
                            <MenuItem value="Đang mượn">Đang mượn</MenuItem>
                            <MenuItem value="Đã trả">Đã trả</MenuItem>
                            <MenuItem value="Quá hạn">Quá hạn (Trễ trả)</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Search Field */}
                    <TextField
                        label="Tìm kiếm (Mã HĐ, SĐT, Tên)"
                        variant="outlined"
                        size="small"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{ width: 250 }}
                    />
                </div>
            </div>

            {/* CONTRACT LIST TABLE */}
            <TableContainer component={Paper} elevation={3} style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <Table>
                    <TableHead style={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '60px' }}>STT</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '120px' }}>MÃ SỐ HĐ</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '180px' }}>LOẠI HỢP ĐỒNG</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '220px' }}>TÊN KHÁCH HÀNG</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '150px' }}>SĐT</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '160px' }}>NGÀY SOẠN ĐỒ</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>NỘI DUNG</TableCell>
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
                                            {hd.khachHang1?.tenKhachHang}
                                            {hd.khachHang2?.tenKhachHang && (
                                                <> & <br /> {hd.khachHang2.tenKhachHang}</>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {hd.khachHang1?.soDienThoai}
                                            {hd.khachHang2?.soDienThoai && (
                                                <> / <br /> {hd.khachHang2.soDienThoai}</>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">{formatDate(hd.soanDo?.ngaySoan)}</TableCell>
                                        <TableCell style={{ maxLines: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {hd.soanDo?.noiDung || '-'}
                                        </TableCell>
                                        <TableCell align="center">{formatDate(hd.soanDo?.ngayMuon)}</TableCell>
                                        <TableCell align="center" style={{ color: isRed ? '#d32f2f' : 'inherit', fontWeight: isRed ? 'bold' : 'normal' }}>
                                            {formatDate(hd.soanDo?.ngayTra)}
                                        </TableCell>
                                        <TableCell align="right">
                                            {hd.soanDo?.datCoc ? Number(hd.soanDo.datCoc).toLocaleString('vi-VN') + ' đ' : '-'}
                                        </TableCell>
                                        <TableCell align="center">
                                            <span className={`status-badge ${
                                                status === "Đang mượn" ? "badge-dang-muon" :
                                                status === "Đã trả" ? "badge-da-tra" :
                                                status === "Quá hạn" ? "badge-qua-han" : "badge-chua-muon"
                                            }`}>
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

            {/* DIALOG MANAGE FORM */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle style={{ borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#1976d2' }}>
                    {isNew ? "TẠO PHIẾU SOẠN & MƯỢN TRẢ ĐỒ MỚI" : `QUẢN LÝ LỊCH SOẠN & MƯỢN TRẢ ĐỒ - HĐ: ${selectedHD?.maHopDong}`}
                </DialogTitle>
                <DialogContent dividers style={{ padding: '0px' }}>
                    {isNew && (
                        <Box p={3} pb={2} style={{ borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
                            <Autocomplete
                                options={hopDongs}
                                getOptionLabel={(option) => `HĐ: ${option.maHopDong} - ${option.khachHang1?.tenKhachHang || ''} (${getDichVuChinhLabel(option.dichVuChinh)})`}
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
                                        setDsMuon(sd.dsMuon || []);
                                        setDsTra(sd.dsTra || (sd.dsMuon || []).map(item => ({
                                            ...item,
                                            trangThaiDo: 'Nguyên vẹn',
                                            ghiChuTra: ''
                                        })));
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
                                <Paper variant="outlined" style={{ padding: '16px', backgroundColor: '#fafafa' }}>
                                    <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Thêm trang phục mượn:</h4>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                                        <Autocomplete
                                            style={{ flex: 3 }}
                                            options={trangPhucList}
                                            getOptionLabel={(option) => `[${option.maDichVu}] - ${option.tenDichVu}`}
                                            value={selectedTrangPhuc}
                                            onChange={(e, val) => setSelectedTrangPhuc(val)}
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
                                            label="Ghi chú (màu sắc, size...)"
                                            size="small"
                                            style={{ flex: 2 }}
                                            value={trangPhucNote}
                                            onChange={(e) => setTrangPhucNote(e.target.value)}
                                        />
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleAddTrangPhuc}
                                            style={{ height: '40px' }}
                                        >
                                            Thêm đồ
                                        </Button>
                                    </Stack>
                                </Paper>

                                {/* LIST OF BORROWED ITEMS */}
                                <h4 style={{ margin: '10px 0 0px 0', color: '#1976d2' }}>DANH SÁCH ĐỒ ĐANG CHỌN MƯỢN:</h4>
                                <TableContainer component={Paper} variant="outlined" style={{ maxHeight: 220 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" style={{ fontWeight: 'bold', width: '50px' }}>STT</TableCell>
                                                <TableCell style={{ fontWeight: 'bold', width: '120px' }}>Mã Đồ</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Tên Trang Phục</TableCell>
                                                <TableCell align="center" style={{ fontWeight: 'bold', width: '90px' }}>SL</TableCell>
                                                <TableCell style={{ fontWeight: 'bold' }}>Ghi chú lúc mượn</TableCell>
                                                <TableCell align="center" style={{ fontWeight: 'bold', width: '80px' }}>Xóa</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dsMuon.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center" style={{ padding: '16px', color: '#999' }}>
                                                        Chưa thêm trang phục mượn nào.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                dsMuon.map((item, index) => (
                                                    <TableRow key={item.maDichVu}>
                                                        <TableCell align="center">{index + 1}</TableCell>
                                                        <TableCell>{item.maDichVu}</TableCell>
                                                        <TableCell>{item.tenDichVu}</TableCell>
                                                        <TableCell align="center">{item.soLuong}</TableCell>
                                                        <TableCell>{item.ghiChu || '-'}</TableCell>
                                                        <TableCell align="center">
                                                            <Button
                                                                size="small"
                                                                color="error"
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