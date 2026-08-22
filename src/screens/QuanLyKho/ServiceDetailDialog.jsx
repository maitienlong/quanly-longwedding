import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { formatCurrency, parseCurrency } from "../utils/formatCurrency.js";
import "./addserviceform.css";
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { fileToBase64 } from "../utils/fileToBase64.js";

import Dialog from '@mui/material/Dialog';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';

const SERVICE_TYPES = [
    {
        id: 1,
        name: "Trang Phục",
        prefix: "CLOTHING_",
        icon: "👗",
        color: "#9333ea",
        badgeBg: "#f3e8ff"
    },
    {
        id: 2,
        name: "Gói Dịch Vụ",
        prefix: "SERVICE_",
        icon: "📦",
        color: "#2563eb",
        badgeBg: "#dbeafe"
    },
    {
        id: 3,
        name: "Ảnh (Lab)",
        prefix: "LAB_",
        icon: "🖼️",
        color: "#059669",
        badgeBg: "#d1fae5"
    },
    {
        id: 4,
        name: "Trang Điểm",
        prefix: "MAKEUP_",
        icon: "💄",
        color: "#db2777",
        badgeBg: "#fce7f3"
    }
];

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
    const fileInputRef = useRef(null);

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
    const [loaiDichVu, setLoaiDichVu] = useState(1);
    const [isDragging, setIsDragging] = useState(false);

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
            setTonKho(data.tonKhoDichVu !== undefined ? data.tonKhoDichVu : 0);
            setDescription(data.moTaDichVu || '');
            setImageFile(null);
            setImageBase64(data.imageDichVu || null);
            setLoaiDichVu(Number(data.loaiDichVu) || 1);

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

    const handleProcessImage = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error("Vui lòng chỉ chọn tệp hình ảnh!");
            return;
        }
        try {
            setImageFile(file);
            const base64 = await fileToBase64(file);
            setImageBase64(base64);
        } catch (error) {
            console.error("Error reading file:", error);
            toast.error("Lỗi khi đọc file ảnh!");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleProcessImage(e.dataTransfer.files[0]);
        }
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation();
        setImageFile(null);
        setImageBase64(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClose = (shouldReload = false) => {
        setIsEditing(false);
        onClose(shouldReload);
    };

    const handleDelete = () => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${data.tenDichVu}" (${data.maDichVu}) không?`)) {
            showLoading("Đang xóa dịch vụ...");
            otherService.ServiceRemoveProduct({ maDichVu: data.maDichVu })
                .then((res) => {
                    toast.success("Xóa dịch vụ thành công!");
                    handleClose(true);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("Lỗi khi xóa dịch vụ: " + (err?.message || "Đã có lỗi xảy ra"));
                })
                .finally(() => hideLoading());
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        if (!name || !name.trim()) {
            toast.error("Vui lòng nhập tên dịch vụ!");
            return;
        }

        if (!priceRaw || Number(priceRaw) <= 0) {
            toast.error("Giá dịch vụ không hợp lệ!");
            return;
        }

        showLoading("Đang cập nhật dịch vụ...");

        otherService.ServiceUpdateProduct({
            maDichVu: data.maDichVu,
            tenDichVu: name.trim(),
            giaTriDichVu: Number(priceRaw),
            loaiDichVu: Number(loaiDichVu),
            giaChoThueDichVu: priceThueRaw ? Number(priceThueRaw) : 0,
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
                toast.error("Lỗi khi cập nhật dịch vụ: " + (error?.message || error?.response?.data?.message || "Đã có lỗi xảy ra"));
            })
            .finally(() => hideLoading());
    };

    if (!data) return null;

    const currentTypeObj = SERVICE_TYPES.find(t => t.id === Number(loaiDichVu)) || SERVICE_TYPES[0];
    const dataTypeObj = SERVICE_TYPES.find(t => t.id === Number(data.loaiDichVu)) || SERVICE_TYPES[0];

    return (
        <Dialog 
            onClose={() => handleClose(false)} 
            open={open} 
            fullWidth 
            maxWidth="lg"
            classes={{ paper: 'service-modal-paper' }}
        >
            <div className="service-modal-container">
                {/* ===== HEADER ===== */}
                <div className="service-modal-header">
                    <div className="service-header-title-wrap">
                        <div className="service-header-icon" style={{ background: isEditing ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
                            {isEditing ? <EditRoundedIcon /> : <InfoOutlinedIcon />}
                        </div>
                        <div>
                            <h3>{isEditing ? "Chỉnh sửa sản phẩm & dịch vụ" : "Chi tiết sản phẩm & dịch vụ"}</h3>
                            <p>{isEditing ? `Đang chỉnh sửa mã dịch vụ: ${data.maDichVu}` : `Mã dịch vụ: ${data.maDichVu}`}</p>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        className="service-close-btn"
                        onClick={() => handleClose(false)}
                        title="Đóng"
                    >
                        <CloseRoundedIcon fontSize="small" />
                    </button>
                </div>

                {/* ===== BODY ===== */}
                <div className="service-modal-body">
                    {isEditing ? (
                        /* ================= EDIT MODE ================= */
                        <form id="serviceEditForm" onSubmit={handleUpdate}>
                            {/* 1. Loại dịch vụ */}
                            <div className="service-type-section">
                                <div className="service-section-label">
                                    <span>Loại dịch vụ <span className="required-star">*</span></span>
                                </div>
                                <div className="service-type-grid">
                                    {SERVICE_TYPES.map((type) => {
                                        const isSelected = Number(loaiDichVu) === type.id;
                                        return (
                                            <div
                                                key={type.id}
                                                className={`service-type-card ${isSelected ? 'active' : ''}`}
                                                style={{
                                                    '--card-color': type.color,
                                                    '--badge-bg': type.badgeBg
                                                }}
                                                onClick={() => setLoaiDichVu(type.id)}
                                            >
                                                <div className="service-type-card-top">
                                                    <span className="service-type-icon">{type.icon}</span>
                                                    <div className="service-type-radio" />
                                                </div>
                                                <div className="service-type-name">{type.name}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 2. Bố cục 2 cột */}
                            <div className="service-modal-main-grid">
                                <div className="service-form-col-left">
                                    <div className="service-form-row">
                                        <div className="service-input-group">
                                            <label>
                                                <span>Mã dịch vụ</span>
                                                <span className="service-input-helper">(Không thể sửa)</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="service-custom-input service-code-input"
                                                value={data.maDichVu}
                                                disabled
                                                style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                                            />
                                        </div>

                                        <div className="service-input-group">
                                            <label>
                                                <span>Tên dịch vụ <span className="required-star">*</span></span>
                                            </label>
                                            <input
                                                type="text"
                                                className="service-custom-input"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="service-form-row-3">
                                        <div className="service-input-group">
                                            <label>
                                                <span>Giá bán / Gói <span className="required-star">*</span></span>
                                            </label>
                                            <div className="service-input-wrap">
                                                <input
                                                    type="text"
                                                    className="service-custom-input has-unit"
                                                    value={priceDisplay}
                                                    onChange={handlePriceChange}
                                                    required
                                                />
                                                <span className="service-input-unit">₫</span>
                                            </div>
                                        </div>

                                        <div className="service-input-group">
                                            <label>
                                                <span>Giá cho thuê</span>
                                            </label>
                                            <div className="service-input-wrap">
                                                <input
                                                    type="text"
                                                    className="service-custom-input has-unit"
                                                    value={priceThue}
                                                    onChange={handlePriceThue}
                                                />
                                                <span className="service-input-unit">₫</span>
                                            </div>
                                        </div>

                                        <div className="service-input-group">
                                            <label>
                                                <span>Tồn kho</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="service-custom-input"
                                                value={tonKho}
                                                onChange={(e) => setTonKho(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {Number(loaiDichVu) === 2 && (
                                        <div className="service-package-box">
                                            <div className="service-package-header">
                                                <div className="service-package-title">
                                                    <LayersOutlinedIcon fontSize="small" style={{ color: '#2563eb' }} />
                                                    <span>Thông số chi tiết gói dịch vụ</span>
                                                </div>
                                                <span className="service-package-tag">Gói Dịch Vụ</span>
                                            </div>

                                            <div className="service-package-subgrid">
                                                <div className="service-subgroup-title">📸 Hạng mục Ảnh</div>
                                                
                                                <div className="service-input-group">
                                                    <label>SL ảnh chỉnh sửa</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="service-custom-input"
                                                        value={soLuongAnhChinhSua}
                                                        onChange={(e) => setSoLuongAnhChinhSua(e.target.value)}
                                                    />
                                                </div>

                                                <div className="service-input-group">
                                                    <label>SL ảnh 16x21</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="service-custom-input"
                                                        value={soLuongAnh16x21}
                                                        onChange={(e) => setSoLuongAnh16x21(e.target.value)}
                                                    />
                                                </div>

                                                <div className="service-input-group">
                                                    <label>SL ảnh 20x30</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="service-custom-input"
                                                        value={soLuongAnh20x30}
                                                        onChange={(e) => setSoLuongAnh20x30(e.target.value)}
                                                    />
                                                </div>

                                                <div className="service-input-group">
                                                    <label>SL ảnh 60x90</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="service-custom-input"
                                                        value={soLuongAnh60x90}
                                                        onChange={(e) => setSoLuongAnh60x90(e.target.value)}
                                                    />
                                                </div>

                                                <div className="service-subgroup-title">💄 Trang điểm & Bê lễ</div>

                                                <div className="service-input-group">
                                                    <label>Trang điểm ngày ăn hỏi</label>
                                                    <input
                                                        type="text"
                                                        className="service-custom-input"
                                                        value={trangDiemNgayAnHoi}
                                                        onChange={(e) => setTrangDiemNgayAnHoi(e.target.value)}
                                                    />
                                                </div>

                                                <div className="service-input-group">
                                                    <label>Trang điểm ngày cưới</label>
                                                    <input
                                                        type="text"
                                                        className="service-custom-input"
                                                        value={trangDiemNgayCuoi}
                                                        onChange={(e) => setTrangDiemNgayCuoi(e.target.value)}
                                                    />
                                                </div>

                                                <div className="service-input-group">
                                                    <label>Trang phục đội bê lễ</label>
                                                    <input
                                                        type="text"
                                                        className="service-custom-input"
                                                        value={trangPhucChoDoiBeLe}
                                                        onChange={(e) => setTrangPhucChoDoiBeLe(e.target.value)}
                                                    />
                                                </div>

                                                <div className="service-input-group">
                                                    <label>Hoa cầm tay</label>
                                                    <input
                                                        type="text"
                                                        className="service-custom-input"
                                                        value={hoaCamTay}
                                                        onChange={(e) => setHoaCamTay(e.target.value)}
                                                    />
                                                </div>

                                                <div className="service-subgroup-title">👗 Trang phục ngày cưới & ăn hỏi</div>

                                                <div className="service-input-group">
                                                    <label>TP cô dâu ngày ăn hỏi</label>
                                                    <input
                                                        type="text"
                                                        className="service-custom-input"
                                                        value={trangPhucCoDauNgayAnHoi}
                                                        onChange={(e) => setTrangPhucCoDauNgayAnHoi(e.target.value)}
                                                    />
                                                </div>

                                                <div className="service-input-group">
                                                    <label>TP chú rể ngày ăn hỏi</label>
                                                    <input
                                                        type="text"
                                                        className="service-custom-input"
                                                        value={trangPhucChuReNgayAnHoi}
                                                        onChange={(e) => setTrangPhucChuReNgayAnHoi(e.target.value)}
                                                    />
                                                </div>

                                                <div className="service-input-group">
                                                    <label>Váy cưới ngày cưới (giá trị)</label>
                                                    <input
                                                        type="text"
                                                        className="service-custom-input"
                                                        value={trangPhucVayCuoiNgayCuoi}
                                                        onChange={(e) => setTrangPhucVayCuoiNgayCuoi(e.target.value)}
                                                    />
                                                </div>

                                                <div className="service-input-group">
                                                    <label>Vest chú rể ngày cưới</label>
                                                    <input
                                                        type="text"
                                                        className="service-custom-input"
                                                        value={trangPhucVestChuReNgayCuoi}
                                                        onChange={(e) => setTrangPhucVestChuReNgayCuoi(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="service-input-group">
                                        <label>Mô tả chi tiết</label>
                                        <textarea
                                            rows={4}
                                            className="service-custom-textarea"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Right: Image Edit */}
                                <div className="service-form-col-right">
                                    <div className="service-image-card">
                                        <div className="service-image-card-title">
                                            <span>Ảnh đại diện dịch vụ</span>
                                        </div>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    handleProcessImage(e.target.files[0]);
                                                }
                                            }}
                                        />

                                        {imageBase64 ? (
                                            <div className="service-preview-wrapper">
                                                <img
                                                    src={getImageUrl(imageBase64)}
                                                    alt="Preview"
                                                    className="service-preview-img"
                                                />
                                                <div className="service-preview-overlay">
                                                    <div className="service-preview-info">
                                                        {imageFile ? imageFile.name : 'Ảnh hiện tại'}
                                                    </div>
                                                    <div className="service-preview-actions">
                                                        <button
                                                            type="button"
                                                            className="service-btn-icon-action service-btn-change"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            title="Đổi ảnh khác"
                                                        >
                                                            <AutorenewRoundedIcon fontSize="inherit" />
                                                            <span>Đổi ảnh</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="service-btn-icon-action service-btn-delete"
                                                            onClick={handleRemoveImage}
                                                            title="Xóa ảnh này"
                                                        >
                                                            <DeleteOutlineRoundedIcon fontSize="inherit" />
                                                            <span>Xóa</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={`service-dropzone ${isDragging ? 'drag-active' : ''}`}
                                                onClick={() => fileInputRef.current?.click()}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setIsDragging(true);
                                                }}
                                                onDragLeave={() => setIsDragging(false)}
                                                onDrop={handleDrop}
                                            >
                                                <div className="service-dropzone-icon">
                                                    <CloudUploadOutlinedIcon fontSize="large" />
                                                </div>
                                                <p className="service-dropzone-text">
                                                    Nhấn để duyệt file hoặc kéo thả ảnh vào đây
                                                </p>
                                                <p className="service-dropzone-sub">
                                                    Hỗ trợ JPG, PNG, WEBP (Khuyên dùng tỉ lệ 3:4 hoặc 1:1)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        /* ================= READ-ONLY DETAILS VIEW ================= */
                        <div className="service-modal-main-grid">
                            {/* Cột trái: Thông tin hiển thị */}
                            <div className="service-form-col-left">
                                
                                <div>
                                    <h2 className="service-detail-main-title">{data.tenDichVu}</h2>
                                    <div className="service-detail-badges">
                                        <span className="service-code-badge">{data.maDichVu}</span>
                                        <span 
                                            className="service-type-badge-view"
                                            style={{
                                                background: dataTypeObj.badgeBg,
                                                color: dataTypeObj.color
                                            }}
                                        >
                                            <span>{dataTypeObj.icon}</span>
                                            <span>{dataTypeObj.name}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* 3 Metric Cards */}
                                <div className="service-detail-metrics">
                                    <div className="service-metric-card">
                                        <span className="service-metric-label">Giá Bán / Gói</span>
                                        <span className="service-metric-value price-sale">
                                            {data.giaTriDichVu ? formatCurrency(data.giaTriDichVu) : "0 ₫"}
                                        </span>
                                    </div>
                                    <div className="service-metric-card">
                                        <span className="service-metric-label">Giá Cho Thuê</span>
                                        <span className="service-metric-value price-rent">
                                            {data.giaChoThueDichVu ? formatCurrency(data.giaChoThueDichVu) : "0 ₫"}
                                        </span>
                                    </div>
                                    <div className="service-metric-card">
                                        <span className="service-metric-label">Tồn Kho Hiện Tại</span>
                                        <span className="service-metric-value">
                                            {data.tonKhoDichVu !== undefined ? `${data.tonKhoDichVu} sản phẩm` : "0"}
                                        </span>
                                    </div>
                                </div>

                                {/* Mô tả */}
                                <div className="service-detail-section">
                                    <div className="service-detail-section-title">
                                        <DescriptionOutlinedIcon fontSize="small" style={{ color: '#2563eb' }} />
                                        <span>Mô tả dịch vụ</span>
                                    </div>
                                    <div className="service-detail-desc-content">
                                        {data.moTaDichVu || "Chưa có mô tả chi tiết cho dịch vụ này."}
                                    </div>
                                </div>

                                {/* Thông số gói nếu là Gói Dịch Vụ */}
                                {Number(data.loaiDichVu) === 2 && (
                                    <div className="service-detail-section" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
                                        <div className="service-detail-section-title" style={{ color: '#1e40af' }}>
                                            <LayersOutlinedIcon fontSize="small" />
                                            <span>Thông số chi tiết gói dịch vụ</span>
                                        </div>

                                        <div className="service-detail-package-grid">
                                            <div className="service-detail-package-item">
                                                <span>📸</span>
                                                <div><b>SL ảnh chỉnh sửa:</b> {data.soLuongAnhChinhSua || 0} ảnh</div>
                                            </div>
                                            <div className="service-detail-package-item">
                                                <span>🖼️</span>
                                                <div><b>SL ảnh 16x21:</b> {data.soLuongAnh16x21 || 0} ảnh</div>
                                            </div>
                                            <div className="service-detail-package-item">
                                                <span>🖼️</span>
                                                <div><b>SL ảnh 20x30:</b> {data.soLuongAnh20x30 || 0} ảnh</div>
                                            </div>
                                            <div className="service-detail-package-item">
                                                <span>🖼️</span>
                                                <div><b>SL ảnh 60x90:</b> {data.soLuongAnh60x90 || 0} ảnh</div>
                                            </div>
                                            <div className="service-detail-package-item">
                                                <span>💄</span>
                                                <div><b>Makeup ăn hỏi:</b> {data.trangDiemNgayAnHoi || "Không có"}</div>
                                            </div>
                                            <div className="service-detail-package-item">
                                                <span>💄</span>
                                                <div><b>Makeup cưới:</b> {data.trangDiemNgayCuoi || "Không có"}</div>
                                            </div>
                                            <div className="service-detail-package-item">
                                                <span>👥</span>
                                                <div><b>Trang phục bê lễ:</b> {data.trangPhucChoDoiBeLe || "Không có"}</div>
                                            </div>
                                            <div className="service-detail-package-item">
                                                <span>💐</span>
                                                <div><b>Hoa cầm tay:</b> {data.hoaCamTay || "Không có"}</div>
                                            </div>
                                            <div className="service-detail-package-item">
                                                <span>👰</span>
                                                <div><b>TP cô dâu ăn hỏi:</b> {data.trangPhucCoDauNgayAnHoi || "Không có"}</div>
                                            </div>
                                            <div className="service-detail-package-item">
                                                <span>🤵</span>
                                                <div><b>TP chú rể ăn hỏi:</b> {data.trangPhucChuReNgayAnHoi || "Không có"}</div>
                                            </div>
                                            <div className="service-detail-package-item">
                                                <span>👗</span>
                                                <div><b>Váy cưới ngày cưới:</b> {data.trangPhucVayCuoiNgayCuoi || "Không có"}</div>
                                            </div>
                                            <div className="service-detail-package-item">
                                                <span>🤵</span>
                                                <div><b>Vest chú rể ngày cưới:</b> {data.trangPhucVestChuReNgayCuoi || "Không có"}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Cột phải: Ảnh đại diện */}
                            <div className="service-form-col-right">
                                <div className="service-image-card">
                                    <div className="service-image-card-title">
                                        <span>Ảnh đại diện dịch vụ</span>
                                    </div>
                                    {data.imageDichVu && data.imageDichVu.length > 100 ? (
                                        <div className="service-preview-wrapper" style={{ maxHeight: '380px' }}>
                                            <img
                                                src={getImageUrl(data.imageDichVu)}
                                                alt={data.tenDichVu}
                                                className="service-preview-img"
                                                style={{ maxHeight: '380px' }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="service-dropzone" style={{ cursor: 'default', minHeight: '260px' }}>
                                            <div className="service-dropzone-icon" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                                                <CloudUploadOutlinedIcon fontSize="large" />
                                            </div>
                                            <p className="service-dropzone-text" style={{ color: '#64748b' }}>
                                                Chưa có ảnh đại diện
                                            </p>
                                            <p className="service-dropzone-sub">
                                                Nhấn nút "Chỉnh sửa" để tải ảnh lên
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== FOOTER ===== */}
                <div className="service-modal-footer" style={{ justifyContent: 'space-between' }}>
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                className="service-btn-cancel"
                                onClick={() => setIsEditing(false)}
                            >
                                Hủy thay đổi
                            </button>

                            <button
                                type="submit"
                                form="serviceEditForm"
                                className="service-btn-submit"
                                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                            >
                                <SaveRoundedIcon fontSize="small" />
                                <span>Lưu thay đổi</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="service-btn-clear"
                                style={{ borderColor: '#fca5a5', color: '#dc2626', background: '#fff' }}
                                onClick={handleDelete}
                            >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                                <span>Xóa dịch vụ</span>
                            </button>

                            <button
                                type="button"
                                className="service-btn-submit"
                                onClick={() => setIsEditing(true)}
                            >
                                <EditRoundedIcon fontSize="small" />
                                <span>Chỉnh sửa dịch vụ</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </Dialog>
    );
}

export default ServiceDetailDialog;
