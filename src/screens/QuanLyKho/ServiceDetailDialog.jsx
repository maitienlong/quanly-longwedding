import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { formatCurrency, parseCurrency } from "../utils/formatCurrency.js";
import "./addserviceform.css";
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { fileToBase64 } from "../utils/fileToBase64.js";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';

const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("data:")) return url;
    if (url.startsWith("http")) return url;
    const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const separator = url.startsWith("/") ? "" : "/";
    return `${apiBaseUrl}${separator}${url}`;
};

function ServiceDetailDialog(props) {
    const { onClose, data, open } = props;
    const { showLoading, hideLoading } = useLoading();

    const [isEditing, setIsEditing] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [priceRaw, setPriceRaw] = useState('');
    const [priceThueRaw, setPriceThueRaw] = useState('');
    const [priceDisplay, setPriceDisplay] = useState('');
    const [priceThue, setPriceThue] = useState('');
    const [tonKho, setTonKho] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [loaiDichVu, setLoaiDichVu] = useState('');

    // Package parameters states
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

    // Load initial data when dialog opens or data changes
    useEffect(() => {
        if (data) {
            setIsEditing(false);
            setName(data.tenDichVu || '');
            setPriceRaw(data.giaTriDichVu || '');
            setPriceDisplay(data.giaTriDichVu ? formatCurrency(data.giaTriDichVu) : '');
            setPriceThueRaw(data.giaChoThueDichVu || '');
            setPriceThue(data.giaChoThueDichVu ? formatCurrency(data.giaChoThueDichVu) : '');
            setTonKho(data.tonKhoDichVu || 0);
            setDescription(data.moTaDichVu || '');
            setImageFile(null);
            setImageBase64(data.imageDichVu || null);
            setLoaiDichVu(data.loaiDichVu || 1);

            // Package parameters
            setSoLuongAnhChinhSua(data.soLuongAnhChinhSua || 0);
            setSoLuongAnh16x21(data.soLuongAnh16x21 || 0);
            setSoLuongAnh20x30(data.soLuongAnh20x30 || 0);
            setSoLuongAnh60x90(data.soLuongAnh60x90 || 0);
            setTrangDiemNgayAnHoi(data.trangDiemNgayAnHoi || '');
            setTrangDiemNgayCuoi(data.trangDiemNgayCuoi || '');
            setTrangPhucChoDoiBeLe(data.trangPhucChoDoiBeLe || '');
            setTrangPhucCoDauNgayAnHoi(data.trangPhucCoDauNgayAnHoi || '');
            setTrangPhucChuReNgayAnHoi(data.trangPhucChuReNgayAnHoi || '');
            setTrangPhucVayCuoiNgayCuoi(data.trangPhucVayCuoiNgayCuoi || '');
            setTrangPhucVestChuReNgayCuoi(data.trangPhucVestChuReNgayCuoi || '');
            setHoaCamTay(data.hoaCamTay || '');
        }
    }, [data, open]);

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

    const handleClose = (shouldReload = false) => {
        setIsEditing(false);
        onClose(shouldReload);
    };

    const handleDelete = () => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${data.tenDichVu}" không?`)) {
            showLoading("Đang xóa dịch vụ...");
            otherService.ServiceRemoveProduct({ maDichVu: data.maDichVu })
                .then((res) => {
                    toast.success("Xóa dịch vụ thành công!");
                    handleClose(true);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("Lỗi khi xóa dịch vụ!");
                })
                .finally(() => hideLoading());
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        if (!name || !description) {
            toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (!priceRaw || priceRaw <= 0) {
            toast.error("Giá dịch vụ không hợp lệ!");
            return;
        }

        showLoading("Đang cập nhật dịch vụ...");

        otherService.ServiceUpdateProduct({
            maDichVu: data.maDichVu,
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
        })
            .then((response) => {
                toast.success("Cập nhật dịch vụ thành công!");
                handleClose(true);
            })
            .catch((error) => {
                console.error(error);
                toast.error("Lỗi khi cập nhật dịch vụ.");
            })
            .finally(() => hideLoading());
    };

    if (!data) return null;

    const getLoaiDichVuLabel = (type) => {
        if (type === 1) return "Trang Phục";
        if (type === 2) return "Gói Dịch Vụ";
        if (type === 3) return "Ảnh";
        return "Khác";
    };

    return (
        <Dialog onClose={() => handleClose(false)} open={open} fullWidth maxWidth="lg">
            <div className="dialog-container">
                <div className="dialog-header">
                    <h3>{isEditing ? "Chỉnh sửa dịch vụ" : "Chi tiết dịch vụ"}</h3>
                </div>

                <div className="dialog-body">
                    {isEditing ? (
                        /* ===== EDIT MODE ===== */
                        <form className="service-form-grid" onSubmit={handleUpdate}>
                            <div className="service-form-left">
                                <div className="form-group">
                                    <label>Mã dịch vụ (Không thể sửa)</label>
                                    <input value={data.maDichVu} disabled style={{ backgroundColor: "#f0f0f0" }} />
                                </div>

                                <div className="form-group">
                                    <label>Tên dịch vụ</label>
                                    <input value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>

                                <FormControl fullWidth style={{ marginTop: "10px", marginBottom: "10px" }}>
                                    <InputLabel id="edit-type-label">Loại dịch vụ</InputLabel>
                                    <Select
                                        labelId="edit-type-label"
                                        value={loaiDichVu}
                                        label="Loại dịch vụ"
                                        onChange={(e) => setLoaiDichVu(e.target.value)}
                                    >
                                        <MenuItem value={1}>Trang Phục</MenuItem>
                                        <MenuItem value={2}>Gói Dịch Vụ</MenuItem>
                                        <MenuItem value={3}>Ảnh</MenuItem>
                                    </Select>
                                </FormControl>

                                <div className="form-group">
                                    <label>Giá trị dịch vụ</label>
                                    <input value={priceDisplay} onChange={handlePriceChange} placeholder="VD: 5.000.000 đ" />
                                </div>

                                <div className="form-group">
                                    <label>Giá Cho Thuê</label>
                                    <input value={priceThue} onChange={handlePriceThue} placeholder="VD: 1.500.000 đ" />
                                </div>

                                <div className="form-group">
                                    <label>Tồn Kho</label>
                                    <input
                                        type="number"
                                        value={tonKho}
                                        onChange={(e) => setTonKho(e.target.value)}
                                        placeholder="Nhập số lượng tồn kho"
                                    />
                                </div>

                                {Number(loaiDichVu) === 2 && (
                                    <>
                                        <div className="package-parameters-title" style={{ marginTop: 20 }}>Thông số gói dịch vụ</div>
                                        <div className="package-parameters-grid">
                                            <div className="form-group">
                                                <label>Số lượng ảnh chỉnh sửa</label>
                                                <input type="number" value={soLuongAnhChinhSua} onChange={(e) => setSoLuongAnhChinhSua(e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Số lượng ảnh 16x21</label>
                                                <input type="number" value={soLuongAnh16x21} onChange={(e) => setSoLuongAnh16x21(e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Số lượng ảnh 20x30</label>
                                                <input type="number" value={soLuongAnh20x30} onChange={(e) => setSoLuongAnh20x30(e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Số lượng ảnh 60x90</label>
                                                <input type="number" value={soLuongAnh60x90} onChange={(e) => setSoLuongAnh60x90(e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Trang điểm ngày ăn hỏi</label>
                                                <input type="text" value={trangDiemNgayAnHoi} onChange={(e) => setTrangDiemNgayAnHoi(e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Trang điểm ngày cưới</label>
                                                <input type="text" value={trangDiemNgayCuoi} onChange={(e) => setTrangDiemNgayCuoi(e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Trang phục bê lễ</label>
                                                <input type="text" value={trangPhucChoDoiBeLe} onChange={(e) => setTrangPhucChoDoiBeLe(e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>TP cô dâu ngày ăn hỏi</label>
                                                <input type="text" value={trangPhucCoDauNgayAnHoi} onChange={(e) => setTrangPhucCoDauNgayAnHoi(e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>TP chú rể ngày ăn hỏi</label>
                                                <input type="text" value={trangPhucChuReNgayAnHoi} onChange={(e) => setTrangPhucChuReNgayAnHoi(e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Váy cưới ngày cưới (giá trị)</label>
                                                <input type="text" value={trangPhucVayCuoiNgayCuoi} onChange={(e) => setTrangPhucVayCuoiNgayCuoi(e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Vest chú rể ngày cưới</label>
                                                <input type="text" value={trangPhucVestChuReNgayCuoi} onChange={(e) => setTrangPhucVestChuReNgayCuoi(e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Hoa cầm tay</label>
                                                <input type="text" value={hoaCamTay} onChange={(e) => setHoaCamTay(e.target.value)} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                    <label>Mô tả</label>
                                    <textarea rows="5" value={description} onChange={(e) => setDescription(e.target.value)} />
                                </div>

                                <div className="form-group">
                                    <label>Thay đổi ảnh</label>
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

                            <div className="service-form-right">
                                {imageBase64 ? (
                                    <img src={getImageUrl(imageBase64)} alt="Preview" className="service-image-preview" />
                                ) : (
                                    <div className="service-image-placeholder">Chưa có ảnh</div>
                                )}
                            </div>

                            <div className="form-actions service-form-actions">
                                <Button variant="outlined" onClick={() => setIsEditing(false)}>Hủy</Button>
                                <Button variant="contained" type="submit">Lưu thay đổi</Button>
                            </div>
                        </form>
                    ) : (
                        /* ===== READ-ONLY DETAILS VIEW ===== */
                        <div className="service-form-grid">
                            <div className="service-form-left text-details" style={{ fontSize: "1.05rem", lineHeight: "1.8" }}>
                                <p><b>Mã dịch vụ:</b> <span style={{ color: "#d32f2f", fontWeight: "bold" }}>{data.maDichVu}</span></p>
                                <p><b>Tên dịch vụ:</b> <strong>{data.tenDichVu}</strong></p>
                                <p><b>Loại dịch vụ:</b> {getLoaiDichVuLabel(data.loaiDichVu)}</p>
                                <p><b>Giá trị dịch vụ:</b> {data.giaTriDichVu ? formatCurrency(data.giaTriDichVu) : "0 đ"}</p>
                                <p><b>Giá thuê dịch vụ:</b> {data.giaChoThueDichVu ? formatCurrency(data.giaChoThueDichVu) : "0 đ"}</p>
                                <p><b>Tồn kho:</b> {data.tonKhoDichVu} sản phẩm</p>
                                <p><b>Mô tả:</b></p>
                                <div style={{ 
                                    whiteSpace: "pre-line", 
                                    background: "#f9f9f9", 
                                    padding: "12px", 
                                    borderRadius: "6px", 
                                    border: "1px solid #eee",
                                    marginBottom: "15px"
                                }}>
                                    {data.moTaDichVu || "Không có mô tả"}
                                </div>

                                {Number(data.loaiDichVu) === 2 && (
                                    <>
                                        <div className="package-parameters-title" style={{ marginTop: "20px", fontWeight: "bold", borderBottom: "1px solid #ddd", paddingBottom: "6px" }}>
                                            Thông số gói dịch vụ đi kèm:
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", padding: "10px 0" }}>
                                            <div><b>SL ảnh chỉnh sửa:</b> {data.soLuongAnhChinhSua || 0} ảnh</div>
                                            <div><b>SL ảnh 16x21:</b> {data.soLuongAnh16x21 || 0} ảnh</div>
                                            <div><b>SL ảnh 20x30:</b> {data.soLuongAnh20x30 || 0} ảnh</div>
                                            <div><b>SL ảnh 60x90:</b> {data.soLuongAnh60x90 || 0} ảnh</div>
                                            <div><b>Trang điểm ngày ăn hỏi:</b> {data.trangDiemNgayAnHoi || "Không có"}</div>
                                            <div><b>Trang điểm ngày cưới:</b> {data.trangDiemNgayCuoi || "Không có"}</div>
                                            <div><b>Trang phục bê lễ:</b> {data.trangPhucChoDoiBeLe || "Không có"}</div>
                                            <div><b>TP cô dâu ngày ăn hỏi:</b> {data.trangPhucCoDauNgayAnHoi || "Không có"}</div>
                                            <div><b>TP chú rể ngày ăn hỏi:</b> {data.trangPhucChuReNgayAnHoi || "Không có"}</div>
                                            <div><b>Váy cưới ngày cưới (giá trị):</b> {data.trangPhucVayCuoiNgayCuoi || "Không có"}</div>
                                            <div><b>Vest chú rể ngày cưới:</b> {data.trangPhucVestChuReNgayCuoi || "Không có"}</div>
                                            <div><b>Hoa cầm tay:</b> {data.hoaCamTay || "Không có"}</div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="service-form-right">
                                {data.imageDichVu ? (
                                    <img src={getImageUrl(data.imageDichVu)} alt={data.tenDichVu} className="service-image-preview" />
                                ) : (
                                    <div className="service-image-placeholder">Không có ảnh đại diện</div>
                                )}
                            </div>

                            <div className="form-actions service-form-actions" style={{ justifyContent: "space-between", width: "100%" }}>
                                <Button variant="outlined" color="error" onClick={handleDelete}>
                                    Xóa dịch vụ
                                </Button>
                                <div>
                                    <Button variant="outlined" onClick={() => handleClose(false)} style={{ marginRight: "12px" }}>
                                        Đóng
                                    </Button>
                                    <Button variant="contained" onClick={() => setIsEditing(true)}>
                                        Chỉnh sửa
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
}

export default ServiceDetailDialog;
