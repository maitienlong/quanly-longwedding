import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { formatCurrency, parseCurrency } from "../utils/formatCurrency.js";
import "./addserviceform.css";
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { fileToBase64 } from "../utils/fileToBase64.js";

import Dialog from '@mui/material/Dialog';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import AddBusinessRoundedIcon from '@mui/icons-material/AddBusinessRounded';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

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

const KNOWN_PREFIXES = ["CLOTHING_", "SERVICE_", "LAB_", "MAKEUP_"];

const extractCodeSuffix = (fullId) => {
    if (!fullId) return "";
    for (const prefix of KNOWN_PREFIXES) {
        if (fullId.toUpperCase().startsWith(prefix)) {
            return fullId.slice(prefix.length);
        }
    }
    return fullId;
};

function ServiceAddDialog(props) {
    const { open, onClose } = props;
    const { showLoading, hideLoading } = useLoading();
    const fileInputRef = useRef(null);

    const [loaiDichVu, setLoaiDichVu] = useState(1);
    const [id, setId] = useState('CLOTHING_');
    const [name, setName] = useState('');
    const [priceRaw, setPriceRaw] = useState('');
    const [priceThueRaw, setPriceThueRaw] = useState('');
    const [priceDisplay, setPriceDisplay] = useState('');
    const [priceThue, setPriceThue] = useState('');
    const [tonKho, setTonKho] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Package parameters
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

    useEffect(() => {
        if (open) {
            setLoaiDichVu(1);
            setId('CLOTHING_');
            setName('');
            setPriceRaw('');
            setPriceDisplay('');
            setPriceThueRaw('');
            setPriceThue('');
            setTonKho('');
            setDescription('');
            setImageFile(null);
            setImageBase64(null);
            setIsDragging(false);

            setSoLuongAnhChinhSua(0);
            setSoLuongAnh16x21(0);
            setSoLuongAnh20x30(0);
            setSoLuongAnh60x90(0);
            setTrangDiemNgayAnHoi('');
            setTrangDiemNgayCuoi('');
            setTrangPhucChoDoiBeLe('');
            setTrangPhucCoDauNgayAnHoi('');
            setTrangPhucChuReNgayAnHoi('');
            setTrangPhucVayCuoiNgayCuoi('');
            setTrangPhucVestChuReNgayCuoi('');
            setHoaCamTay('');
        }
    }, [open]);

    const handleClose = (data) => {
        onClose(data);
    };

    const handleClearForm = () => {
        setLoaiDichVu(1);
        setId('CLOTHING_');
        setName('');
        setPriceRaw('');
        setPriceDisplay('');
        setPriceThueRaw('');
        setPriceThue('');
        setTonKho('');
        setDescription('');
        setImageFile(null);
        setImageBase64(null);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setSoLuongAnhChinhSua(0);
        setSoLuongAnh16x21(0);
        setSoLuongAnh20x30(0);
        setSoLuongAnh60x90(0);
        setTrangDiemNgayAnHoi('');
        setTrangDiemNgayCuoi('');
        setTrangPhucChoDoiBeLe('');
        setTrangPhucCoDauNgayAnHoi('');
        setTrangPhucChuReNgayAnHoi('');
        setTrangPhucVayCuoiNgayCuoi('');
        setTrangPhucVestChuReNgayCuoi('');
        setHoaCamTay('');
        toast.info("Đã làm mới dữ liệu form!");
    };

    const handleSelectLoaiDichVu = (typeId) => {
        const numId = Number(typeId);
        setLoaiDichVu(numId);
        const targetType = SERVICE_TYPES.find(t => t.id === numId);
        const newPrefix = targetType ? targetType.prefix : "";
        const suffix = extractCodeSuffix(id);
        setId(newPrefix + suffix);
    };

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

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedId = id.trim();
        if (!trimmedId || KNOWN_PREFIXES.includes(trimmedId)) {
            toast.error("Vui lòng nhập phần mã số cho mã dịch vụ (VD: CLOTHING_001)!");
            return;
        }

        if (!name || !name.trim()) {
            toast.error("Vui lòng nhập tên dịch vụ!");
            return;
        }

        if (!priceRaw || Number(priceRaw) <= 0) {
            toast.error("Giá dịch vụ không hợp lệ!");
            return;
        }

        const DEFAULT_EMPTY_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        showLoading("Đang thêm dịch vụ mới...");

        otherService.ServiceAddProdcut({
            maDichVu: trimmedId,
            tenDichVu: name.trim(),
            giaTriDichVu: Number(priceRaw),
            loaiDichVu: Number(loaiDichVu),
            giaChoThueDichVu: priceThueRaw ? Number(priceThueRaw) : 0,
            tonKhoDichVu: tonKho ? Number(tonKho) : 0,
            moTaDichVu: description.trim(),
            imageDichVu: imageBase64 || DEFAULT_EMPTY_IMAGE,
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
            toast.success("Thêm dịch vụ mới thành công!");
            handleClose(true);
        }).catch((error) => {
            console.error('Error adding service:', error);
            toast.error("Lỗi khi thêm dịch vụ: " + (error?.message || error?.response?.data?.message || "Đã có lỗi xảy ra"));
        }).finally(() => {
            hideLoading();
        });
    };

    const currentTypeObj = SERVICE_TYPES.find(t => t.id === Number(loaiDichVu)) || SERVICE_TYPES[0];

    return (
        <Dialog 
            onClose={() => handleClose(false)} 
            open={open} 
            fullWidth 
            maxWidth="lg"
            classes={{ paper: 'service-modal-paper' }}
        >
            <div className="service-modal-container">
                {/* ===== MODAL HEADER ===== */}
                <div className="service-modal-header">
                    <div className="service-header-title-wrap">
                        <div className="service-header-icon">
                            <AddBusinessRoundedIcon />
                        </div>
                        <div>
                            <h3>Thêm dịch vụ mới</h3>
                            <p>Tạo mới trang phục, gói chụp, ảnh lab hoặc dịch vụ makeup trong hệ thống</p>
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

                {/* ===== MODAL BODY ===== */}
                <div className="service-modal-body">
                    <form id="serviceAddForm" onSubmit={handleSubmit}>
                        
                        {/* 1. LOẠI DỊCH VỤ (ĐƯỢC ĐƯA LÊN ĐẦU TIÊN) */}
                        <div className="service-type-section">
                            <div className="service-section-label">
                                <span>
                                    1. Chọn loại dịch vụ <span className="required-star">*</span>
                                </span>
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
                                            onClick={() => handleSelectLoaiDichVu(type.id)}
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

                        {/* 2. BỐ CỤC 2 CỘT CHÍNH: FORM TRÁI + ẢNH PHẢI */}
                        <div className="service-modal-main-grid">
                            
                            {/* CỘT TRÁI: THÔNG TIN DỊCH VỤ */}
                            <div className="service-form-col-left">
                                
                                {/* Hàng 1: Mã dịch vụ & Tên dịch vụ */}
                                <div className="service-form-row">
                                    <div className="service-input-group">
                                        <label>
                                            <span>Mã dịch vụ <span className="required-star">*</span></span>
                                            <span className="service-input-helper">(Đã điền sẵn tiền tố)</span>
                                        </label>
                                        <div className="service-input-wrap">
                                            <input
                                                type="text"
                                                className="service-custom-input service-code-input"
                                                value={id}
                                                onChange={(e) => setId(e.target.value.toUpperCase())}
                                                placeholder={`VD: ${currentTypeObj.prefix}001`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="service-input-group">
                                        <label>
                                            <span>Tên dịch vụ <span className="required-star">*</span></span>
                                        </label>
                                        <div className="service-input-wrap">
                                            <input
                                                type="text"
                                                className="service-custom-input"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="VD: Váy cưới Hoàng Gia Luxury, Gói Chụp Ngoại Cảnh..."
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Hàng 2: Giá bán, Giá thuê, Tồn kho */}
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
                                                placeholder="0"
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
                                                placeholder="0"
                                            />
                                            <span className="service-input-unit">₫</span>
                                        </div>
                                    </div>

                                    <div className="service-input-group">
                                        <label>
                                            <span>Tồn kho</span>
                                        </label>
                                        <div className="service-input-wrap">
                                            <input
                                                type="number"
                                                min="0"
                                                className="service-custom-input"
                                                value={tonKho}
                                                onChange={(e) => setTonKho(e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Hàng 3 (CHỈ HIỂN THỊ KHI CHỌN GÓI DỊCH VỤ - TYPE 2): THÔNG SỐ GÓI */}
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
                                                    placeholder="0"
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
                                                    placeholder="0"
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
                                                    placeholder="0"
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
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div className="service-subgroup-title">💄 Trang điểm & Bê lễ</div>

                                            <div className="service-input-group">
                                                <label>Trang điểm ngày ăn hỏi</label>
                                                <input
                                                    type="text"
                                                    className="service-custom-input"
                                                    placeholder="VD: Makeup cô dâu tại cửa hàng"
                                                    value={trangDiemNgayAnHoi}
                                                    onChange={(e) => setTrangDiemNgayAnHoi(e.target.value)}
                                                />
                                            </div>

                                            <div className="service-input-group">
                                                <label>Trang điểm ngày cưới</label>
                                                <input
                                                    type="text"
                                                    className="service-custom-input"
                                                    placeholder="VD: Makeup cô dâu + 1 mẹ"
                                                    value={trangDiemNgayCuoi}
                                                    onChange={(e) => setTrangDiemNgayCuoi(e.target.value)}
                                                />
                                            </div>

                                            <div className="service-input-group">
                                                <label>Trang phục đội bê lễ</label>
                                                <input
                                                    type="text"
                                                    className="service-custom-input"
                                                    placeholder="VD: 5 áo dài nam, 5 áo dài nữ"
                                                    value={trangPhucChoDoiBeLe}
                                                    onChange={(e) => setTrangPhucChoDoiBeLe(e.target.value)}
                                                />
                                            </div>

                                            <div className="service-input-group">
                                                <label>Hoa cầm tay</label>
                                                <input
                                                    type="text"
                                                    className="service-custom-input"
                                                    placeholder="VD: 01 bó hoa hồng tươi + hoa cài áo"
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
                                                    placeholder="VD: 1 áo dài thiết kế"
                                                    value={trangPhucCoDauNgayAnHoi}
                                                    onChange={(e) => setTrangPhucCoDauNgayAnHoi(e.target.value)}
                                                />
                                            </div>

                                            <div className="service-input-group">
                                                <label>TP chú rể ngày ăn hỏi</label>
                                                <input
                                                    type="text"
                                                    className="service-custom-input"
                                                    placeholder="VD: 1 áo dài truyền thống"
                                                    value={trangPhucChuReNgayAnHoi}
                                                    onChange={(e) => setTrangPhucChuReNgayAnHoi(e.target.value)}
                                                />
                                            </div>

                                            <div className="service-input-group">
                                                <label>Váy cưới ngày cưới (giá trị)</label>
                                                <input
                                                    type="text"
                                                    className="service-custom-input"
                                                    placeholder="VD: 01 Váy cưới Luxury 15.000.000đ"
                                                    value={trangPhucVayCuoiNgayCuoi}
                                                    onChange={(e) => setTrangPhucVayCuoiNgayCuoi(e.target.value)}
                                                />
                                            </div>

                                            <div className="service-input-group">
                                                <label>Vest chú rể ngày cưới</label>
                                                <input
                                                    type="text"
                                                    className="service-custom-input"
                                                    placeholder="VD: 01 Bộ vest cao cấp kèm caravat"
                                                    value={trangPhucVestChuReNgayCuoi}
                                                    onChange={(e) => setTrangPhucVestChuReNgayCuoi(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Hàng 4: Mô tả */}
                                <div className="service-input-group">
                                    <label>
                                        <span>Mô tả chi tiết</span>
                                        <span className="service-input-helper">Đặc điểm nổi bật, chất liệu, phụ kiện kèm theo...</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="service-custom-textarea"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Nhập thông tin chi tiết về sản phẩm / dịch vụ..."
                                    />
                                </div>

                            </div>

                            {/* CỘT PHẢI: TẢI ẢNH ĐẠI DIỆN & PREVIEW */}
                            <div className="service-form-col-right">
                                <div className="service-image-card">
                                    <div className="service-image-card-title">
                                        <span>Ảnh đại diện dịch vụ</span>
                                        {imageBase64 && (
                                            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✓ Đã chọn ảnh</span>
                                        )}
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
                                                src={imageBase64}
                                                alt="Preview"
                                                className="service-preview-img"
                                            />
                                            <div className="service-preview-overlay">
                                                <div className="service-preview-info">
                                                    {imageFile ? imageFile.name : 'Ảnh dịch vụ'}
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
                </div>

                {/* ===== MODAL FOOTER ===== */}
                <div className="service-modal-footer">
                    <button
                        type="button"
                        className="service-btn-clear"
                        onClick={handleClearForm}
                        title="Xóa và nhập lại từ đầu"
                    >
                        <RestartAltRoundedIcon fontSize="small" />
                        <span>Clear</span>
                    </button>
                    <button
                        type="submit"
                        form="serviceAddForm"
                        className="service-btn-submit"
                    >
                        <AddCircleOutlineRoundedIcon fontSize="small" />
                        <span>Thêm dịch vụ mới</span>
                    </button>
                </div>
            </div>
        </Dialog>
    );
}

export default ServiceAddDialog;
