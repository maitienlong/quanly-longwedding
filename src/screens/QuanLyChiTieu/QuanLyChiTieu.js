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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useAuth } from '../Login/AuthContext/AuthContext';

function QuanLyChiTieu() {
    const { showLoading, hideLoading } = useLoading();
    const { user } = useAuth();
    const loggedInUserFullname = user?.fullname || '';
    const [hopDongs, setHopDongs] = useState([]);
    const [expensesList, setExpensesList] = useState([]);
    
    // Filters & Search
    const [searchInput, setSearchInput] = useState('');
    const [timeFilter, setTimeFilter] = useState('all');

    // Dialog state
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    // Form inputs state
    const [selectedHD, setSelectedHD] = useState(null); // Linked contract
    const [ngayChi, setNgayChi] = useState(dayjs().format('YYYY-MM-DDTHH:mm'));
    const [donViNhan, setDonViNhan] = useState('');
    const [lyDoChi, setLyDoChi] = useState('');
    const [soTien, setSoTien] = useState('');
    const [nguoiChi, setNguoiChi] = useState('');

    useEffect(() => {
        if (user?.fullname) {
            setNguoiChi(user.fullname);
        }
    }, [user]);
    const [ghiChu, setGhiChu] = useState('');

    // Selected expense for editing/deleting
    const [selectedExpense, setSelectedExpense] = useState(null);

    const commonHeight = 40;

    // Load data from contracts API and chiTieu API
    const loadData = () => {
        showLoading("Đang tải dữ liệu chi tiêu...");
        Promise.all([
            otherService.LIST_HOPDONG({}),
            otherService.LIST_CHITIEU({})
        ])
        .then(([resHD, resCT]) => {
            const listHD = resHD.data.hopDong || [];
            setHopDongs(listHD);

            const listCT = resCT.data.chiTieu || [];
            const mapped = listCT.map(exp => {
                const hd = listHD.find(h => h.maHopDong === exp.maHopDong);
                return {
                    ...exp,
                    khachHangLabel: exp.maHopDong === 'CH-CHUNG' || !exp.maHopDong ? 'Chi tiêu chung cửa hàng' : 
                        (hd?.khachHang1?.tenKhachHang || 'Hợp đồng không tên')
                };
            });

            // Sort by date descending
            mapped.sort((a, b) => new Date(b.date) - new Date(a.date));
            setExpensesList(mapped);
        })
        .catch(err => {
            console.error(err);
            toast.error("Lỗi khi tải danh sách chi tiêu: " + err.message);
        })
        .finally(() => hideLoading());
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter aggregated expenses by time and search keyword
    const getFilteredExpenses = () => {
        return expensesList.filter(exp => {
            // 1. Time Filter
            if (timeFilter !== 'all' && exp.date) {
                const date = new Date(exp.date);
                const now = new Date();
                if (timeFilter === 'today') {
                    if (date.toDateString() !== now.toDateString()) return false;
                } else if (timeFilter === 'week') {
                    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                    if (date < startOfWeek) return false;
                } else if (timeFilter === 'month') {
                    if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return false;
                } else if (timeFilter === 'year') {
                    if (date.getFullYear() !== now.getFullYear()) return false;
                }
            }

            // 2. Search Keyword Filter
            if (searchInput.trim()) {
                const kw = searchInput.toLowerCase();
                const matchesCode = exp.maHopDong?.toLowerCase().includes(kw);
                const matchesReceiver = exp.receiver?.toLowerCase().includes(kw);
                const matchesReason = exp.reason?.toLowerCase().includes(kw);
                const matchesCreator = exp.creator?.toLowerCase().includes(kw);
                const matchesCustomer = exp.khachHangLabel?.toLowerCase().includes(kw);
                return matchesCode || matchesReceiver || matchesReason || matchesCreator || matchesCustomer;
            }

            return true;
        });
    };

    // Reset Form fields
    const resetForm = () => {
        setSelectedHD(null);
        setNgayChi(dayjs().format('YYYY-MM-DDTHH:mm'));
        setDonViNhan('');
        setLyDoChi('');
        setSoTien('');
        setNguoiChi(loggedInUserFullname);
        setGhiChu('');
        setSelectedExpense(null);
    };

    // Save a new expenditure
    const handleSaveExpense = () => {
        if (!donViNhan.trim()) {
            toast.warning("Vui lòng nhập đơn vị nhận tiền!");
            return;
        }
        if (!lyDoChi.trim()) {
            toast.warning("Vui lòng nhập lý do chi!");
            return;
        }
        if (!soTien || Number(soTien) <= 0) {
            toast.warning("Vui lòng nhập số tiền chi hợp lệ!");
            return;
        }

        const isGeneral = !selectedHD;
        const targetMaHopDong = isGeneral ? "CH-CHUNG" : selectedHD.maHopDong;
        
        const payload = {
            id: `EXP-${Date.now()}`,
            date: ngayChi ? new Date(ngayChi).toISOString() : new Date().toISOString(),
            receiver: donViNhan.trim(),
            reason: lyDoChi.trim(),
            amount: Number(soTien),
            creator: nguoiChi.trim() || "Cửa hàng",
            note: ghiChu.trim(),
            maHopDong: targetMaHopDong
        };

        showLoading("Đang ghi nhận chi tiêu...");
        otherService.CREATE_CHITIEU(payload)
            .then(() => {
                toast.success("Ghi nhận chi tiêu thành công!");
                setOpenAddDialog(false);
                resetForm();
                loadData();
            })
            .catch(err => {
                toast.error("Có lỗi xảy ra: " + err.message);
                hideLoading();
            });
    };

    // Delete an expenditure transaction
    const handleDeleteExpense = (exp) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa khoản chi ${Number(exp.amount).toLocaleString('vi-VN')} đ cho ${exp.receiver} không?`)) {
            return;
        }

        showLoading("Đang xóa chi tiêu...");
        otherService.REMOVE_CHITIEU({ id: exp.id })
            .then(() => {
                toast.success("Xóa khoản chi tiêu thành công!");
                loadData();
            })
            .catch(err => {
                toast.error("Lỗi khi xóa chi tiêu: " + err.message);
                hideLoading();
            });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "-";
        return dayjs(date).format('DD/MM/YYYY HH:mm');
    };

    const docSoTiengViet = (so) => {
        if (so === 0) return "Không đồng";
        
        const docBlock = (number, daydu) => {
            const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
            let tram = Math.floor(number / 100);
            let chuc = Math.floor((number % 100) / 10);
            let donvi = number % 10;
            let result = "";
            
            if (tram > 0 || daydu) {
                result += chuSo[tram] + " trăm ";
            }
            
            if (chuc === 0 && donvi === 0) return result;
            
            if (chuc === 0) {
                result += "lẻ " + chuSo[donvi] + " ";
            } else if (chuc === 1) {
                result += "mười ";
                if (donvi === 1) result += "một ";
                else if (donvi === 5) result += "lăm ";
                else if (donvi > 0) result += chuSo[donvi] + " ";
            } else {
                result += chuSo[chuc] + " mươi ";
                if (donvi === 1) result += "mốt ";
                else if (donvi === 5) result += "lăm ";
                else if (donvi > 0) result += chuSo[donvi] + " ";
            }
            return result;
        };

        const dvBlock = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ"];
        let str = "";
        let number = Math.abs(so);
        let blocks = [];
        
        while (number > 0) {
            blocks.push(number % 1000);
            number = Math.floor(number / 1000);
        }
        
        for (let i = blocks.length - 1; i >= 0; i--) {
            const dec = blocks[i];
            const daydu = (i < blocks.length - 1);
            const blockStr = docBlock(dec, daydu);
            if (blockStr) {
                str += blockStr + dvBlock[i];
            }
        }
        
        str = str.trim();
        if (str) {
            str = str.charAt(0).toUpperCase() + str.slice(1);
        }
        return str + " đồng";
    };

    const handlePrintPhieuChi = (exp) => {
        const printWindow = window.open("", "_blank");
        const dateObj = new Date(exp.date);
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Phiếu Chi - ${exp.id}</title>
                <style>
                    body { font-family: "Arial", sans-serif; padding: 20px; line-height: 1.5; color: #333; }
                    .voucher { border: 1px solid #333; padding: 20px; position: relative; max-width: 800px; margin: 0 auto; }
                    .header-sec { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .company-info { font-size: 13px; font-weight: bold; }
                    .voucher-title-sec { text-align: center; }
                    .title { font-size: 22px; font-weight: bold; margin: 0; }
                    .date-line { font-style: italic; font-size: 13px; margin-top: 5px; }
                    .voucher-code { font-size: 13px; font-weight: bold; text-align: right; }
                    .form-line { display: flex; margin-bottom: 8px; font-size: 14px; }
                    .label { font-weight: bold; min-width: 180px; }
                    .value { flex-grow: 1; border-bottom: 1px dashed #666; padding-left: 5px; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 40px; font-size: 13px; font-weight: bold; text-align: center; }
                    .sig-box { width: 150px; }
                    .sig-space { height: 70px; }
                </style>
            </head>
            <body>
                <div class="voucher">
                    <div class="header-sec">
                        <div class="company-info">
                            <div>LONG WEDDING</div>
                            <div style="font-weight: normal; font-size: 11px;">Hệ thống CNTT Cửa hàng</div>
                        </div>
                        <div class="voucher-title-sec">
                            <div class="title">PHIẾU CHI</div>
                            <div class="date-line">Ngày \${day} tháng \${month} năm \${year}</div>
                        </div>
                        <div class="voucher-code">
                            <div>Mẫu số: 02 - TT</div>
                            <div>Mã HĐ: \${exp.maHopDong === 'CH-CHUNG' ? 'Chi chung' : exp.maHopDong}</div>
                            <div style="font-weight: normal; font-size: 11px; margin-top: 5px;">Mã PC: \${exp.id}</div>
                        </div>
                    </div>
                    
                    <div class="form-line">
                        <span class="label">Họ và tên người nhận tiền:</span>
                        <span class="value">\${exp.receiver}</span>
                    </div>
                    <div class="form-line">
                        <span class="label">Địa chỉ / Mục liên kết:</span>
                        <span class="value">\${exp.khachHangLabel || ''}</span>
                    </div>
                    <div class="form-line">
                        <span class="label">Lý do chi:</span>
                        <span class="value">\${exp.reason}</span>
                    </div>
                    <div class="form-line">
                        <span class="label">Số tiền chi:</span>
                        <span class="value"><strong>\${Number(exp.amount).toLocaleString('vi-VN')} VNĐ</strong></span>
                    </div>
                    <div class="form-line">
                        <span class="label">Viết bằng chữ:</span>
                        <span class="value" style="font-style: italic;">\${docSoTiengViet(exp.amount)}</span>
                    </div>
                    <div class="form-line">
                        <span class="label">Kèm theo:</span>
                        <span class="value">\${exp.note || 'Chứng từ gốc'}</span>
                    </div>
                    
                    <div class="signatures">
                        <div class="sig-box">
                            <p>Thủ trưởng đơn vị</p>
                            <p style="font-weight: normal; font-size: 11px; margin-top: -10px;">(Ký, đóng dấu)</p>
                            <div class="sig-space"></div>
                        </div>
                        <div class="sig-box">
                            <p>Thủ quỹ</p>
                            <p style="font-weight: normal; font-size: 11px; margin-top: -10px;">(Ký nhận)</p>
                            <div class="sig-space"></div>
                        </div>
                        <div class="sig-box">
                            <p>Người lập phiếu</p>
                            <p style="font-weight: normal; font-size: 11px; margin-top: -10px;">(Ký nhận)</p>
                            <div class="sig-space"></div>
                            <p style="font-size: 12px; margin: 0;">\${exp.creator || ''}</p>
                        </div>
                        <div class="sig-box">
                            <p>Người nhận tiền</p>
                            <p style="font-weight: normal; font-size: 11px; margin-top: -10px;">(Ký, ghi rõ họ tên)</p>
                            <div class="sig-space"></div>
                            <p style="font-size: 12px; margin: 0;">\${exp.receiver}</p>
                        </div>
                    </div>
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

    const filteredExpenses = getFilteredExpenses();

    return (
        <div className="hopdongkhachhang" style={{ padding: '20px' }}>
            <style>{`
                .QuanLyChiTieu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .QuanLyChiTieu-header h2 {
                    font-size: 1.8rem;
                    font-weight: bold;
                    color: #1976d2;
                    margin: 0;
                }
                .QuanLyChiTieu-filters {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }
                .QuanLyChiTieu-row:hover {
                    background-color: #f9f9f9;
                }
            `}</style>

            {/* HEADER & FILTERS */}
            <div className="QuanLyChiTieu-header">
                <h2>QUẢN LÝ CHI TIÊU CỬA HÀNG</h2>
                <div className="QuanLyChiTieu-filters">
                    {/* Add Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            resetForm();
                            setOpenAddDialog(true);
                        }}
                        startIcon={<i className="fa-solid fa-plus"></i>}
                        style={{ height: '40px' }}
                    >
                        Thêm Chi Tiêu
                    </Button>

                    {/* Time period filter */}
                    <FormControl variant="outlined" size="small" style={{ width: 180 }}>
                        <InputLabel>Thời gian chi</InputLabel>
                        <Select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            label="Thời gian chi"
                        >
                            <MenuItem value="all">Tất cả thời gian</MenuItem>
                            <MenuItem value="today">Hôm nay</MenuItem>
                            <MenuItem value="week">Tuần này</MenuItem>
                            <MenuItem value="month">Tháng này</MenuItem>
                            <MenuItem value="year">Năm nay</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Search Field */}
                    <TextField
                        label="Tìm kiếm (Mã HĐ, Lý do, Người nhận...)"
                        variant="outlined"
                        size="small"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{ width: 280 }}
                    />
                </div>
            </div>

            {/* EXPENSES LIST TABLE */}
            <TableContainer component={Paper} elevation={3} style={{ borderRadius: '8px', overflow: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
                <Table stickyHeader>
                    <TableHead sx={{ '& th': { backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' } }}>
                        <TableRow>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '60px' }}>STT</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '130px' }}>MÃ LIÊN KẾT</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '220px' }}>KHÁCH HÀNG / MỤC</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '160px' }}>NGÀY CHI</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '200px' }}>ĐƠN VỊ NHẬN TIỀN</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '200px' }}>LÝ DO CHI</TableCell>
                            <TableCell align="right" style={{ fontWeight: 'bold', width: '140px' }}>SỐ TIỀN</TableCell>
                            <TableCell style={{ fontWeight: 'bold', width: '150px' }}>NGƯỜI CHI</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>GHI CHÚ</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', width: '180px' }}>HÀNH ĐỘNG</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredExpenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center" style={{ padding: '30px', color: '#999' }}>
                                    Không tìm thấy giao dịch chi tiêu nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredExpenses.map((exp, idx) => (
                                <TableRow key={exp.id} className="QuanLyChiTieu-row">
                                    <TableCell align="center">{idx + 1}</TableCell>
                                    <TableCell align="center" style={{ fontWeight: '500' }}>
                                        {exp.maHopDong === 'CH-CHUNG' ? (
                                            <span style={{ color: '#7f8c8d', fontSize: '0.85rem', fontWeight: 'bold' }}>CHUNG</span>
                                        ) : (
                                            exp.maHopDong
                                        )}
                                    </TableCell>
                                    <TableCell>{exp.khachHangLabel}</TableCell>
                                    <TableCell align="center">{formatDate(exp.date)}</TableCell>
                                    <TableCell>{exp.receiver}</TableCell>
                                    <TableCell>{exp.reason}</TableCell>
                                    <TableCell align="right" style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                        {Number(exp.amount).toLocaleString('vi-VN')} đ
                                    </TableCell>
                                    <TableCell>{exp.creator || '-'}</TableCell>
                                    <TableCell>{exp.note || '-'}</TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => handlePrintPhieuChi(exp)}
                                                startIcon={<i className="fa-solid fa-print"></i>}
                                            >
                                                In
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleDeleteExpense(exp)}
                                            >
                                                Xóa
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* DIALOG ADD EXPENDITURE */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#1976d2', borderBottom: '1px solid #eee' }}>
                    GHI NHẬN KHOẢN CHI TIÊU MỚI
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                        {/* Contract Selector */}
                        <Autocomplete
                            options={hopDongs.filter(hd => hd.maHopDong !== 'CH-CHUNG')}
                            getOptionLabel={(option) => `${option.maHopDong} - ${option.khachHang1?.tenKhachHang || 'Hợp đồng không tên'} (${option.khachHang1?.soDienThoai || ''})`}
                            value={selectedHD}
                            onChange={(e, val) => setSelectedHD(val)}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label="Liên kết Hợp đồng (Bỏ trống nếu là chi tiêu chung cửa hàng)" 
                                    placeholder="Tìm mã HĐ hoặc tên khách hàng..."
                                    size="small" 
                                />
                            )}
                        />

                        {/* Date Picker */}
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                            <DateTimePicker
                                label="Ngày chi tiền"
                                value={ngayChi ? dayjs(ngayChi) : null}
                                onChange={(newValue) => setNgayChi(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
                                format="DD/MM/YYYY HH:mm"
                            />
                        </LocalizationProvider>

                        {/* Receiver */}
                        <TextField
                            label="Đơn vị / Người nhận tiền"
                            required
                            size="small"
                            fullWidth
                            value={donViNhan}
                            onChange={(e) => setDonViNhan(e.target.value)}
                            placeholder="Ví dụ: Hoàng Gia Lab, Thợ chụp A, Thợ makeup B..."
                        />

                        {/* Reason select/input */}
                        <Autocomplete
                            freeSolo
                            options={[
                                "Tiền in ảnh / album / cổng",
                                "Tiền lương / thù lao thợ chụp",
                                "Tiền lương / thù lao thợ makeup",
                                "Tiền lương / thù lao thợ chỉnh ảnh",
                                "Tiền thuê trang phục ngoài",
                                "Tiền giặt là trang phục",
                                "Tiền thuê xe di chuyển",
                                "Tiền điện nước / mạng cửa hàng",
                                "Mua sắm thiết bị / phụ kiện",
                                "Chi tiêu lặt vặt cửa hàng"
                            ]}
                            value={lyDoChi}
                            onChange={(e, val) => setLyDoChi(val || '')}
                            onInputChange={(e, val) => setLyDoChi(val || '')}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label="Lý do chi" 
                                    required 
                                    size="small" 
                                    fullWidth
                                    placeholder="Chọn hoặc tự nhập lý do chi..."
                                />
                            )}
                        />

                        <Stack direction="row" spacing={2}>
                            {/* Amount */}
                            <TextField
                                label="Số tiền chi (VNĐ)"
                                required
                                type="number"
                                size="small"
                                fullWidth
                                value={soTien}
                                onChange={(e) => setSoTien(Math.max(0, parseInt(e.target.value) || 0))}
                                inputProps={{ min: 0 }}
                            />

                            {/* Creator */}
                            <TextField
                                label="Người thực hiện chi"
                                size="small"
                                fullWidth
                                value={nguoiChi}
                                onChange={(e) => setNguoiChi(e.target.value)}
                                placeholder="Tên nhân viên..."
                            />
                        </Stack>

                        {/* Note */}
                        <TextField
                            label="Ghi chú chi tiết"
                            size="small"
                            multiline
                            rows={2}
                            fullWidth
                            value={ghiChu}
                            onChange={(e) => setGhiChu(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setOpenAddDialog(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={handleSaveExpense} variant="contained" color="primary">
                        Xác nhận chi
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default QuanLyChiTieu;
