import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DetailHopDongKhachHangDialog from '../HopDong/DetailHopDongKhachHangDialog';

// Import các components dialog của Material UI
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

const getDichVuChinhLabel = (id) => {
    const options = {
        1: 'Pre-Wedding',
        2: 'Phóng Sự Ăn Hỏi',
        3: 'Phóng Sự Cưới',
        4: 'Beauty',
        5: 'Ảnh Thẻ',
        6: 'Bé',
        7: 'Gia Đình',
        8: 'Video Phóng Sự',
        9: 'Thiệp Mời',
        10: 'Livestream',
        11: 'Trang điểm',
        12: 'Cho thuê trang phục',
        13: 'Khác'
    };
    return options[Number(id)] || 'Khác';
};

const formatDateOnly = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const pad = (n) => n.toString().padStart(2, '0');
    const dd = pad(date.getDate());
    const MM = pad(date.getMonth() + 1);
    const yyyy = date.getFullYear();
    return `${dd}/${MM}/${yyyy}`;
};

const isPastToday = (dateString, giaiDoan, tab) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    // Lấy thời điểm bắt đầu của hôm nay (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Kiểm tra xem lịch trình đã hoàn thành chưa
    let isCompleted = false;
    if (tab === 'chupHinh') {
        isCompleted = giaiDoan >= 3; // Giai đoạn >= 3 (Hậu kỳ, In ảnh, Hoàn thành) coi như đã chụp xong
    } else if (tab === 'hauKy') {
        isCompleted = giaiDoan >= 4; // Giai đoạn >= 4 (In ảnh, Hoàn thành) coi như đã chỉnh sửa xong
    }
    
    // Báo đỏ nếu ngày lịch trình nhỏ hơn ngày hôm nay và chưa hoàn thành
    return date.getTime() < today.getTime() && !isCompleted;
};

function LichCuaHang() {
    const [hopDong, setHopDong] = useState([]);
    const { showLoading, hideLoading } = useLoading();

    // Tab quản lý
    const [activeTab, setActiveTab] = useState('chupHinh'); // 'chupHinh' hoặc 'hauKy'

    // Lọc và Tìm kiếm
    const locThoiGian = [
        { label: 'Tất cả thời gian', id: 'all' },
        { label: 'Hôm nay', id: 'hôm nay' },
        { label: 'Tuần này', id: 'tuần này' },
        { label: 'Tháng này', id: 'tháng này' }
    ];

    // Mặc định lọc thời gian là "Tuần này"
    const [selectedTime, setSelectedTime] = useState(locThoiGian[2]);
    const [searchInput, setSearchInput] = useState("");

    // dialog chi tiết hợp đồng cho Tab Hậu Kỳ
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [sendData, setSendData] = useState({});

    // dialog cập nhật lịch chụp cho Tab Chụp Hình
    const [openChupHinhDialog, setOpenChupHinhDialog] = useState(false);
    const [selectedChupHinhContract, setSelectedChupHinhContract] = useState(null);
    const [confirmGioChup, setConfirmGioChup] = useState("");
    const [confirmDiaDiem, setConfirmDiaDiem] = useState("");
    const [confirmChotLich, setConfirmChotLich] = useState("Chưa gọi điện");
    const [confirmLinkAnh, setConfirmLinkAnh] = useState("");

    const loadHopDong = useCallback((tabVal, timeVal, searchVal) => {
        showLoading("Đang tải lịch cửa hàng ...");
        const dateField = tabVal === 'chupHinh' ? 'cacNgay.ngayChup' : 'cacNgay.ngayChinhAnh';
        const targetStage = tabVal === 'chupHinh' ? [1, 2] : 3;
        
        const params = {
            isCalendar: true,
            dateField: dateField,
            status: targetStage
        };
        if (tabVal === 'hauKy') {
            params.chotLich = ["Đã gọi điện xác nhận", "Đã chốt lịch"];
        }
        if (timeVal && timeVal !== 'all') {
            params.filter = timeVal;
        }
        if (searchVal) {
            params.keyword = searchVal;
        }

        otherService.LIST_HOPDONG(params)
            .then((response) => {
                setHopDong(response.data.hopDong);
                hideLoading();
            })
            .catch((error) => {
                console.error('Error fetching calendar data:', error);
                toast.error("Lỗi tải lịch cửa hàng: " + error.message);
                hideLoading();
            });
    }, [showLoading, hideLoading]);

    const handleCloseDetailDialog = (updated) => {
        setOpenDetailDialog(false);
        if (updated === true) {
            loadHopDong(activeTab, selectedTime?.id, searchInput);
        }
    };

    const handleRowClick = (hd) => {
        if (activeTab === 'chupHinh') {
            setSelectedChupHinhContract(hd);
            setConfirmGioChup(hd.cacNgay?.gioChup || "");
            setConfirmDiaDiem(hd.cacNgay?.diaDiemChup || "");
            setConfirmChotLich(hd.cacNgay?.chotLich || "Chưa gọi điện");
            setConfirmLinkAnh(hd.linkAnhGoc || "");
            setOpenChupHinhDialog(true);
        } else {
            setSendData(hd);
            setOpenDetailDialog(true);
        }
    };

    const handleUpdateChupHinh = (shouldTransitionToHauKy = false) => {
        if (!selectedChupHinhContract) return;

        if (shouldTransitionToHauKy && !confirmLinkAnh.trim()) {
            toast.error("Vui lòng nhập đường dẫn ảnh gốc (link ảnh) trước khi chuyển sang hậu kỳ!");
            return;
        }

        showLoading(shouldTransitionToHauKy ? "Đang chuyển trạng thái sang hậu kỳ..." : "Đang cập nhật lịch chụp...");

        const payload = {
            maHopDong: selectedChupHinhContract.maHopDong,
            cacNgay: {
                ...selectedChupHinhContract.cacNgay,
                gioChup: confirmGioChup,
                diaDiemChup: confirmDiaDiem,
                chotLich: confirmChotLich
            },
            linkAnhGoc: confirmLinkAnh
        };

        if (shouldTransitionToHauKy) {
            payload.giaiDoan = 3; // Chuyển sang hậu kỳ
        }

        otherService.UPDATE_HOPDONG(payload)
            .then((response) => {
                toast.success(shouldTransitionToHauKy ? "Đã chuyển sang hậu kỳ thành công!" : "Cập nhật thông tin chụp thành công!");
                setOpenChupHinhDialog(false);
                setSelectedChupHinhContract(null);
                loadHopDong(activeTab, selectedTime?.id, searchInput);
                hideLoading();
            })
            .catch((error) => {
                console.error(error);
                toast.error("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
                hideLoading();
            });
    };

    const commonHeight = 56;

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadHopDong(activeTab, selectedTime?.id, searchInput);
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [activeTab, selectedTime?.id, searchInput, loadHopDong]);

    useEffect(() => {
        if (sendData && sendData._id) {
            const updatedHD = hopDong.find(hd => hd._id === sendData._id);
            if (updatedHD) {
                setSendData(updatedHD);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hopDong, sendData?._id]);

    const filteredHopDong = hopDong || [];

    const renderTrangThaiBadge = (giaiDoan) => {
        const states = {
            1: { label: "Tạo hợp đồng", color: "#7f8c8d" },
            2: { label: "Chụp hình", color: "#3498db" },
            3: { label: "Hậu kỳ", color: "#9b59b6" },
            4: { label: "In ảnh", color: "#e67e22" },
            5: { label: "Hoàn thành", color: "#2ecc71" }
        };
        const st = states[giaiDoan] || { label: "Không rõ", color: "#95a5a6" };
        return (
            <span style={{
                backgroundColor: st.color,
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '500',
                whiteSpace: 'nowrap'
            }}>
                {st.label}
            </span>
        );
    };

    return (
        <div className="hopdongkhachhang">
            {/* Tab Container */}
            <div style={{ 
                display: 'flex', 
                gap: '15px', 
                marginBottom: '20px', 
                borderBottom: '2px solid #e0e0e0', 
                paddingBottom: '10px' 
            }}>
                <button
                    onClick={() => {
                        setActiveTab('chupHinh');
                        setSendData({});
                    }}
                    style={{
                        padding: '10px 24px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        background: activeTab === 'chupHinh' ? '#1976d2' : 'transparent',
                        color: activeTab === 'chupHinh' ? '#fff' : '#666',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: activeTab === 'chupHinh' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
                    }}
                >
                    <i className="fa-solid fa-camera" style={{ marginRight: '8px' }}></i>
                    QUẢN LÝ LỊCH CHỤP HÌNH
                </button>
                <button
                    onClick={() => {
                        setActiveTab('hauKy');
                        setSendData({});
                    }}
                    style={{
                        padding: '10px 24px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        background: activeTab === 'hauKy' ? '#1976d2' : 'transparent',
                        color: activeTab === 'hauKy' ? '#fff' : '#666',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: activeTab === 'hauKy' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
                    }}
                >
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: '8px' }}></i>
                    QUẢN LÝ LỊCH HẬU KỲ
                </button>
            </div>

            <div className="content-header">
                <h2>{activeTab === 'chupHinh' ? 'LỊCH LÀM VIỆC CHỤP HÌNH' : 'LỊCH LÀM VIỆC HẬU KỲ'}</h2>
                <Stack spacing={2} direction="row">
                    <Autocomplete
                        disablePortal
                        options={locThoiGian}
                        value={selectedTime}
                        onChange={(event, newValue) => {
                            setSelectedTime(newValue || locThoiGian[0]);
                        }}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        sx={{ width: 220, height: commonHeight }}
                        renderInput={(params) => <TextField {...params} label="Lọc theo thời gian" />}
                    />

                    <TextField
                        id="outlined-basic"
                        label="Tìm kiếm (Mã HĐ, SĐT, Tên)"
                        variant="outlined"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        InputProps={{
                            sx: { height: commonHeight }
                        }}
                        sx={{ width: 280 }}
                    />
                </Stack>
            </div>

            {/* ===== DANH SÁCH LỊCH LÀM VIỆC ===== */}
            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        {activeTab === 'chupHinh' ? (
                            <TableRow>
                                <TableCell align='center' style={{ width: 20 }}>STT</TableCell>
                                <TableCell align='center' style={{ width: 50 }}>MÃ SỐ HĐ</TableCell>
                                <TableCell align='center' style={{ width: 150 }}>TÊN KHÁCH HÀNG</TableCell>
                                <TableCell style={{ width: 100 }}>SĐT</TableCell>
                                <TableCell align='center' style={{ width: 120 }}>ĐỊA ĐIỂM CHỤP</TableCell>
                                <TableCell align='center' style={{ width: 120 }}>EKIP</TableCell>
                                <TableCell align='center' style={{ width: 100 }}>DỊCH VỤ</TableCell>
                                <TableCell align='center' style={{ width: 100 }}>NGÀY CHỤP</TableCell>
                                <TableCell align='center' style={{ width: 80 }}>GIỜ CHỤP</TableCell>
                                <TableCell align='center' style={{ width: 120 }}>CHỐT LỊCH</TableCell>
                            </TableRow>
                        ) : (
                            <TableRow>
                                <TableCell align='center' style={{ width: 20 }}>STT</TableCell>
                                <TableCell align='center' style={{ width: 50 }}>MÃ SỐ HĐ</TableCell>
                                <TableCell align='center' style={{ width: 150 }}>TÊN KHÁCH HÀNG</TableCell>
                                <TableCell style={{ width: 100 }}>SĐT</TableCell>
                                <TableCell align='center' style={{ width: 120 }}>THỢ CHỈNH ẢNH</TableCell>
                                <TableCell align='center' style={{ width: 100 }}>DỊCH VỤ</TableCell>
                                <TableCell align='center' style={{ width: 100 }}>NGÀY HẬU KỲ</TableCell>
                                <TableCell align='center' style={{ width: 100 }}>NGÀY TRẢ ẢNH</TableCell>
                                <TableCell align='center' style={{ width: 120 }}>TIẾN TRÌNH</TableCell>
                            </TableRow>
                        )}
                    </TableHead>

                    <TableBody>
                        {filteredHopDong && filteredHopDong.length > 0 ? (
                            filteredHopDong.map((hd, index) => {
                                const targetDate = activeTab === 'chupHinh' ? hd.cacNgay?.ngayChup : hd.cacNgay?.ngayChinhAnh;
                                const isOverdue = isPastToday(targetDate, hd.giaiDoan, activeTab);

                                return (
                                    <TableRow key={index}
                                        style={{ 
                                            cursor: "pointer",
                                            backgroundColor: isOverdue ? '#fff5f5' : 'inherit',
                                            transition: 'background-color 0.3s'
                                        }}
                                        onClick={() => handleRowClick(hd)}
                                    >
                                        <TableCell align='center'>{index + 1}</TableCell>
                                        <TableCell align='center'>{hd.maHopDong}</TableCell>
                                        <TableCell align='left'>
                                            {hd.khachHang1?.tenKhachHang}
                                            {hd.khachHang2?.tenKhachHang && (
                                                <>
                                                    <br />
                                                    <hr style={{ opacity: "40%", margin: "4px 0" }} />
                                                    {hd.khachHang2.tenKhachHang}
                                                </>
                                            )}
                                        </TableCell>
                                        <TableCell align='left'>
                                            {hd.khachHang1?.soDienThoai}
                                            {hd.khachHang2?.soDienThoai && (
                                                <>
                                                    <br />
                                                    <hr style={{ opacity: "40%", margin: "4px 0" }} />
                                                    {hd.khachHang2.soDienThoai}
                                                </>
                                            )}
                                        </TableCell>

                                        {activeTab === 'chupHinh' ? (
                                            <>
                                                <TableCell align='center'>{hd.cacNgay?.diaDiemChup || "Chưa cập nhật"}</TableCell>
                                                <TableCell align='center'>
                                                    {(() => {
                                                        const parts = [];
                                                        if (hd.nguoiPhucVu?.thoChupHinh) parts.push(`Chụp: ${hd.nguoiPhucVu.thoChupHinh}`);
                                                        if (hd.nguoiPhucVu?.thoMakeUp) parts.push(`Make: ${hd.nguoiPhucVu.thoMakeUp}`);
                                                        return parts.join(" + ") || "Chưa giao ekip";
                                                    })()}
                                                </TableCell>
                                                <TableCell align='center'>{getDichVuChinhLabel(hd.dichVuChinh)}</TableCell>
                                                <TableCell align='center' style={{ 
                                                    color: isOverdue ? '#e53e3e' : 'inherit', 
                                                    fontWeight: isOverdue ? 'bold' : 'normal' 
                                                }}>
                                                    {formatDateOnly(hd.cacNgay?.ngayChup) || "Chưa cập nhật"}
                                                    {isOverdue && (
                                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#e53e3e', fontWeight: 'bold', marginTop: '2px' }}>
                                                            (Trễ lịch)
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell align='center'>{hd.cacNgay?.gioChup || "Chưa cập nhật"}</TableCell>
                                                <TableCell align='center'>
                                                    {(() => {
                                                        const status = hd.cacNgay?.chotLich || "Chưa gọi điện";
                                                        let color = "#e67e22"; // default orange
                                                        if (status === "Đã gọi điện xác nhận" || status === "Đã chốt lịch") {
                                                            color = "#2ecc71"; // green
                                                        }
                                                        return (
                                                            <span style={{
                                                                backgroundColor: color,
                                                                color: '#fff',
                                                                padding: '4px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '500',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {status}
                                                            </span>
                                                        );
                                                    })()}
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell align='center'>{hd.nguoiPhucVu?.thoChinhAnh || "Chưa giao"}</TableCell>
                                                <TableCell align='center'>{getDichVuChinhLabel(hd.dichVuChinh)}</TableCell>
                                                <TableCell align='center' style={{ 
                                                    color: isOverdue ? '#e53e3e' : 'inherit', 
                                                    fontWeight: isOverdue ? 'bold' : 'normal' 
                                                }}>
                                                    {formatDateOnly(hd.cacNgay?.ngayChinhAnh) || "Chưa cập nhật"}
                                                    {isOverdue && (
                                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#e53e3e', fontWeight: 'bold', marginTop: '2px' }}>
                                                            (Trễ lịch)
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell align='center'>{formatDateOnly(hd.cacNgay?.ngayTraAnh) || "Chưa cập nhật"}</TableCell>
                                                <TableCell align='center'>{renderTrangThaiBadge(hd.giaiDoan)}</TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={activeTab === 'chupHinh' ? 10 : 9} align="center" style={{ color: "#999", padding: "20px 0" }}>
                                    Không có dữ liệu lịch làm việc.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog chi tiết hợp đồng cho Tab Hậu Kỳ */}
            <DetailHopDongKhachHangDialog
                data={sendData}
                open={openDetailDialog}
                onClose={handleCloseDetailDialog}
            />

            {/* Dialog Cập nhật lịch chụp hình & Gọi điện xác nhận cho Tab Chụp Hình */}
            <Dialog open={openChupHinhDialog} onClose={() => setOpenChupHinhDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    XÁC NHẬN LỊCH CHỤP HÌNH - HĐ: {selectedChupHinhContract?.maHopDong}
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="confirm-chot-lich-label">Gọi điện xác nhận / Chốt lịch</InputLabel>
                            <Select
                                labelId="confirm-chot-lich-label"
                                value={confirmChotLich}
                                onChange={(e) => setConfirmChotLich(e.target.value)}
                                label="Gọi điện xác nhận / Chốt lịch"
                            >
                                <MenuItem value="Chưa gọi điện">Chưa gọi điện</MenuItem>
                                <MenuItem value="Đã gọi điện xác nhận">Đã gọi điện xác nhận</MenuItem>
                                <MenuItem value="Đã chốt lịch">Đã chốt lịch</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Giờ chụp"
                            variant="outlined"
                            fullWidth
                            value={confirmGioChup}
                            onChange={(e) => setConfirmGioChup(e.target.value)}
                        />

                        <TextField
                            label="Địa điểm chụp"
                            variant="outlined"
                            fullWidth
                            value={confirmDiaDiem}
                            onChange={(e) => setConfirmDiaDiem(e.target.value)}
                        />

                        <TextField
                            label="Đường dẫn ảnh gốc (Link ảnh)"
                            variant="outlined"
                            fullWidth
                            value={confirmLinkAnh}
                            onChange={(e) => setConfirmLinkAnh(e.target.value)}
                            placeholder="https://drive.google.com/..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button onClick={() => setOpenChupHinhDialog(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={() => handleUpdateChupHinh(false)} variant="outlined" color="primary">
                        Cập nhật
                    </Button>
                    <Button onClick={() => handleUpdateChupHinh(true)} variant="contained" color="success">
                        Chuyển sang hậu kỳ
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default LichCuaHang;