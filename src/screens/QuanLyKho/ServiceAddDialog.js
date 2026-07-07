import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { formatCurrency, parseCurrency } from "../utils/formatCurrency.js";
import "./addserviceform.css";
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";

import { fileToBase64 } from "../utils/fileToBase64.js";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

function ServiceAddDialog(props) {
    const { open, onClose } = props;
    const handleClose = (data) => {
        onClose(data);
    };

    const nameRef = useRef(null);

    useEffect(() => {
        nameRef.current?.focus();
    }, []);


    const { showLoading, hideLoading } = useLoading();

    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [priceRaw, setPriceRaw] = useState('');
    const [priceThueRaw, setPriceThueRaw] = useState('');
    const [priceDisplay, setPriceDisplay] = useState('');
    const [priceThue, setPriceThue] = useState('');
    const [tonKho, setTonKho] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [loaiDichVu, setLoaiDichVu] = useState('');

    const [soLuongAnhChinhSua, setSoLuongAnhChinhSua] = useState(0);
    const [soLuongAnh16x21, setSoLuongAnh16x21] = useState(0);
    const [soLuongAnh20x30, setSoLuongAnh20x30] = useState(0);
    const [soLuongAnh60x90, setSoLuongAnh60x90] = useState(0);
    const [trangDiemNgayAnHoi, setTrangDiemNgayAnHoi] = useState('');
    const [trangDiemNgayCuoi, setTrangDiemNgayCuoi] = useState('');
    const [trangPhucChoDoiBeLe, setTrangPhucChoDoiBeLe] = useState('');
    const [trangPhucCoDauNgayAnHoi, setTrangPhucCoDauNgayAnHoi] = useState('');
    const [trangPhucChuReNgayAnHoi, setTrangPhucChuReNgayAnHoi] = useState('');
    const [trangPhucVayCuoiNgayCuoi, setTrangPhucVayCuoiNgayCuoi] = useState('');
    const [trangPhucVestChuReNgayCuoi, setTrangPhucVestChuReNgayCuoi] = useState('');
    const [hoaCamTay, setHoaCamTay] = useState('');

    const handlePriceChange = (e) => {
        const raw = parseCurrency(e.target.value);
        setPriceRaw(raw);
        setPriceDisplay(raw ? formatCurrency(raw) : '');
    };

    const handlePriceThue = (e) => {
        const raw = parseCurrency(e.target.value);
        setPriceThueRaw(raw);
        setPriceThue(raw ? formatCurrency(raw) : '');
    };

    const handleChangeTypeDichVu = (e) => {
        setLoaiDichVu(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name || !id || !description) {
            toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (!priceRaw || priceRaw <= 0) {
            toast.error("Giá dịch vụ không hợp lệ!");
            return;
        }

        showLoading("Đang thêm dịch vụ ...");

        otherService.ServiceAddProdcut({
            maDichVu: id.trim(),
            tenDichVu: name.trim(),
            giaTriDichVu: priceRaw,
            loaiDichVu: loaiDichVu,
            giaChoThueDichVu: priceThueRaw,
            tonKhoDichVu: tonKho ? Number(tonKho) : 0,
            moTaDichVu: description.trim(),
            imageDichVu: imageBase64,
            soLuongAnhChinhSua: Number(loaiDichVu) === 2 ? Number(soLuongAnhChinhSua) || 0 : 0,
            soLuongAnh16x21: Number(loaiDichVu) === 2 ? Number(soLuongAnh16x21) || 0 : 0,
            soLuongAnh20x30: Number(loaiDichVu) === 2 ? Number(soLuongAnh20x30) || 0 : 0,
            soLuongAnh60x90: Number(loaiDichVu) === 2 ? Number(soLuongAnh60x90) || 0 : 0,
            trangDiemNgayAnHoi: Number(loaiDichVu) === 2 ? trangDiemNgayAnHoi : "",
            trangDiemNgayCuoi: Number(loaiDichVu) === 2 ? trangDiemNgayCuoi : "",
            trangPhucChoDoiBeLe: Number(loaiDichVu) === 2 ? trangPhucChoDoiBeLe : "",
            trangPhucCoDauNgayAnHoi: Number(loaiDichVu) === 2 ? trangPhucCoDauNgayAnHoi : "",
            trangPhucChuReNgayAnHoi: Number(loaiDichVu) === 2 ? trangPhucChuReNgayAnHoi : "",
            trangPhucVayCuoiNgayCuoi: Number(loaiDichVu) === 2 ? trangPhucVayCuoiNgayCuoi : "",
            trangPhucVestChuReNgayCuoi: Number(loaiDichVu) === 2 ? trangPhucVestChuReNgayCuoi : "",
            hoaCamTay: Number(loaiDichVu) === 2 ? hoaCamTay : ""
        }).then((response) => {
            console.log(response);
            toast.success("Thêm dịch vụ thành công!");
            handleClose(true);
            hideLoading();
        })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error("Lỗi khi tải dữ liệu hợp đồng khách hàng.");
                hideLoading();
            });
    };

    return (
        <Dialog onClose={handleClose} open={open} fullWidth maxWidth="lg">
            <div className="dialog-container">
                {/* ===== CỘT TRÁI: FORM ===== */}
                <div className="dialog-header">
                    <h3>Thêm dịch vụ mới</h3>

                </div>
                <div className="dialog-body">
                    <form className="service-form-grid" onSubmit={handleSubmit}>
                        <div className="service-form-left">

                            <div className="form-group">
                                <label>Mã dịch vụ</label>
                                <input
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Tên dịch vụ</label>
                                <input
                                    ref={nameRef}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Loại dịch vụ</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={loaiDichVu}
                                    label="Loại dịch vụ"
                                    onChange={handleChangeTypeDichVu}
                                >
                                    <MenuItem value={1}>Trang Phục</MenuItem>
                                    <MenuItem value={2}>Gói Dịch Vụ</MenuItem>
                                    <MenuItem value={3}>Ảnh</MenuItem>
                                </Select>
                            </FormControl>

                            <div className="form-group">
                                <label>Giá</label>
                                <input

                                    value={priceDisplay}
                                    onChange={handlePriceChange}
                                    placeholder="VD: 5.000.000 đ"
                                />
                            </div>

                            <div className="form-group">
                                <label>Giá Thuê</label>
                                <input
                                    value={priceThue}
                                    onChange={handlePriceThue}
                                    placeholder="VD: 5.000.000 đ"
                                />
                            </div>

                            <div className="form-group">
                                <label>Tồn Kho</label>
                                <input
                                    type='number'
                                    value={tonKho}
                                    onChange={(e) => setTonKho(e.target.value)}
                                    placeholder="Nhập số lượng tồn kho"
                                />
                            </div>

                            {Number(loaiDichVu) === 2 && (
                                <>
                                    <div className="package-parameters-title">Thông số gói dịch vụ</div>
                                    <div className="package-parameters-grid">
                                        <div className="form-group">
                                            <label>Số lượng ảnh chỉnh sửa</label>
                                            <input
                                                type="number"
                                                value={soLuongAnhChinhSua}
                                                onChange={(e) => setSoLuongAnhChinhSua(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số lượng ảnh 16x21</label>
                                            <input
                                                type="number"
                                                value={soLuongAnh16x21}
                                                onChange={(e) => setSoLuongAnh16x21(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số lượng ảnh 20x30</label>
                                            <input
                                                type="number"
                                                value={soLuongAnh20x30}
                                                onChange={(e) => setSoLuongAnh20x30(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số lượng ảnh 60x90</label>
                                            <input
                                                type="number"
                                                value={soLuongAnh60x90}
                                                onChange={(e) => setSoLuongAnh60x90(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Trang điểm ngày ăn hỏi</label>
                                            <input
                                                type="text"
                                                placeholder="VD: Make up cô dâu"
                                                value={trangDiemNgayAnHoi}
                                                onChange={(e) => setTrangDiemNgayAnHoi(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Trang điểm ngày cưới</label>
                                            <input
                                                type="text"
                                                placeholder="VD: Make up cô dâu"
                                                value={trangDiemNgayCuoi}
                                                onChange={(e) => setTrangDiemNgayCuoi(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Trang phục bê lễ</label>
                                            <input
                                                type="text"
                                                placeholder="VD: 5 bộ nam, 5 bộ nữ"
                                                value={trangPhucChoDoiBeLe}
                                                onChange={(e) => setTrangPhucChoDoiBeLe(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>TP cô dâu ngày ăn hỏi</label>
                                            <input
                                                type="text"
                                                placeholder="VD: 1 áo dài đỏ"
                                                value={trangPhucCoDauNgayAnHoi}
                                                onChange={(e) => setTrangPhucCoDauNgayAnHoi(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>TP chú rể ngày ăn hỏi</label>
                                            <input
                                                type="text"
                                                placeholder="VD: 1 áo dài đỏ"
                                                value={trangPhucChuReNgayAnHoi}
                                                onChange={(e) => setTrangPhucChuReNgayAnHoi(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Váy cưới ngày cưới (giá trị)</label>
                                            <input
                                                type="text"
                                                placeholder="VD: Váy Luxury 10tr"
                                                value={trangPhucVayCuoiNgayCuoi}
                                                onChange={(e) => setTrangPhucVayCuoiNgayCuoi(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Vest chú rể ngày cưới</label>
                                            <input
                                                type="text"
                                                placeholder="VD: 1 vest đen"
                                                value={trangPhucVestChuReNgayCuoi}
                                                onChange={(e) => setTrangPhucVestChuReNgayCuoi(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Hoa cầm tay</label>
                                            <input
                                                type="text"
                                                placeholder="VD: Hoa hồng tươi"
                                                value={hoaCamTay}
                                                onChange={(e) => setHoaCamTay(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    rows="5"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Ảnh đại diện</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        setImageFile(file);

                                        const base64 = await fileToBase64(file);
                                        setImageBase64(base64);
                                    }}
                                />
                            </div>
                        </div>

                        {/* ===== CỘT PHẢI: PREVIEW ===== */}
                        <div className="service-form-right">
                            {imageFile ? (
                                <img
                                    src={imageBase64}
                                    alt="Preview"
                                    className="service-image-preview"
                                />
                            ) : (
                                <div className="service-image-placeholder">
                                    Chưa có ảnh<br />Preview sẽ hiển thị tại đây
                                </div>
                            )}
                        </div>

                        {/* ===== ACTION ===== */}
                        <div className="form-actions service-form-actions">
                            <Button
                                variant="outlined" color="error"
                                onClick={() => handleClose(false)}
                            >
                                Hủy
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                            >
                                Thêm dịch vụ
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Dialog>
    );
};

export default ServiceAddDialog;
