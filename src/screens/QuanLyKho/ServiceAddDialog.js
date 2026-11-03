import React, { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "sonner";
import { formatCurrency, parseCurrency } from "../utils/formatCurrency.js";
import "./addserviceform.css";
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { fileToBase64 } from "../utils/fileToBase64.js";
import { useServiceTypes } from "../../hooks/useServiceTypes";
import { generateServiceCode, extractCodeSuffix } from "../../utils/serviceTypesHelper";

import Dialog from '@mui/material/Dialog';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import AddBusinessRoundedIcon from '@mui/icons-material/AddBusinessRounded';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import PackageDetailsManager from './components/PackageDetailsManager';
import { createDefaultPackageDetails, validatePackageDetails, clearPackageDraft } from '../../utils/packageDetailsAdapter';

function ServiceAddDialog(props) {
    const { open, onClose, existingServices = [] } = props;
    const { showLoading, hideLoading } = useLoading();
    const { serviceTypes } = useServiceTypes();
    const fileInputRef = useRef(null);

    const existingCodes = useMemo(() => {
        return (existingServices || []).map(s => s.maDichVu).filter(Boolean);
    }, [existingServices]);

    const defaultTypeId = (serviceTypes && serviceTypes.length > 0) ? serviceTypes[0].id : 1;
    const defaultPrefix = (serviceTypes && serviceTypes.length > 0) ? (serviceTypes[0].prefix || '') : 'CLOTHING_';

    const [loaiDichVu, setLoaiDichVu] = useState(defaultTypeId);
    const [id, setId] = useState(defaultPrefix);
    const [name, setName] = useState('');
    const [isAutoCode, setIsAutoCode] = useState(true);
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
    const [soLuongLichChup, setSoLuongLichChup] = useState(0);
    const [soLuongLichMake, setSoLuongLichMake] = useState(0);
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
    const [packageDetails, setPackageDetails] = useState(() => createDefaultPackageDetails('NEW_PKG'));

    const currentTypeObj = useMemo(() => {
        return (serviceTypes || []).find(t => t.id === Number(loaiDichVu)) || serviceTypes[0] || {
            id: 1,
            name: "Trang Phục",
            prefix: "CLOTHING_",
            icon: "👗",
            color: "#9333ea",
            badgeBg: "#f3e8ff"
        };
    }, [serviceTypes, loaiDichVu]);

    useEffect(() => {
        if (open) {
            const firstType = (serviceTypes && serviceTypes.length > 0) ? serviceTypes[0] : null;
            const initTypeId = firstType ? firstType.id : 1;
            const initPrefix = firstType ? (firstType.prefix || '') : 'CLOTHING_';

            setLoaiDichVu(initTypeId);
            setId(initPrefix);
            setName('');
            setIsAutoCode(true);
            setPriceRaw('');
            setPriceDisplay('');
            setPriceThueRaw('');
            setPriceThue('');
            setTonKho('');
            setDescription('');
            setImageFile(null);
            setImageBase64(null);
            setIsDragging(false);

            setSoLuongLichChup(initTypeId === 2 ? 1 : 0);
            setSoLuongLichMake(initTypeId === 4 ? 1 : 0);
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
            setPackageDetails(createDefaultPackageDetails('NEW_PKG'));
        }
    }, [open, serviceTypes]);

    const handleClose = (data) => {
        onClose(data);
    };

    const handleClearForm = () => {
        const initPrefix = currentTypeObj?.prefix || '';
        setLoaiDichVu(currentTypeObj?.id || 1);
        setId(initPrefix);
        setName('');
        setIsAutoCode(true);
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

        setSoLuongLichChup(currentTypeObj?.id === 2 ? 1 : 0);
        setSoLuongLichMake(currentTypeObj?.id === 4 ? 1 : 0);
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

    // Khi người dùng nhập tên dịch vụ -> Tự động sinh mã theo tên (Viết tắt)
    const handleNameChange = (e) => {
        const newName = e.target.value;
        setName(newName);

        if (isAutoCode) {
            const prefix = currentTypeObj ? (currentTypeObj.prefix || '') : '';
            if (newName.trim()) {
                const autoCode = generateServiceCode(newName, prefix, existingCodes);
                setId(autoCode);
            } else {
                setId(prefix);
            }
        }
    };

    // Bấm nút sinh lại mã tự động theo tên
    const handleRegenerateCode = () => {
        const prefix = currentTypeObj ? (currentTypeObj.prefix || '') : '';
        if (!name.trim()) {
            toast.warning("Vui lòng nhập tên dịch vụ trước để sinh mã viết tắt!");
            return;
        }
        const autoCode = generateServiceCode(name, prefix, existingCodes);
        setId(autoCode);
        setIsAutoCode(true);
        toast.success(`Đã tự động tạo mã: ${autoCode}`);
    };

    const handleSelectLoaiDichVu = (typeId) => {
        const numId = Number(typeId);
        setLoaiDichVu(numId);
        const targetType = (serviceTypes || []).find(t => t.id === numId);
        const newPrefix = targetType ? (targetType.prefix || '') : "";

        if (numId === 2) {
            if (soLuongLichChup === 0) setSoLuongLichChup(1);
        } else if (numId === 4) {
            if (soLuongLichMake === 0) setSoLuongLichMake(1);
        }

        if (isAutoCode && name.trim()) {
            const autoCode = generateServiceCode(name, newPrefix, existingCodes);
            setId(autoCode);
        } else {
            const suffix = extractCodeSuffix(id, serviceTypes);
            setId(newPrefix + suffix);
        }
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
        const currentPrefix = (currentTypeObj?.prefix || "").trim();

        if (!trimmedId || (currentPrefix && trimmedId.toUpperCase() === currentPrefix.toUpperCase())) {
            toast.error("Vui lòng nhập tên dịch vụ để tự sinh mã hoặc nhập mã dịch vụ!");
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

        if (Number(loaiDichVu) === 2 && packageDetails) {
            const validation = validatePackageDetails(packageDetails);
            if (!validation.isValid) {
                toast.error("Thông số gói không hợp lệ: " + validation.errors.join("; "));
                return;
            }
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
            details: Number(loaiDichVu) === 2 ? packageDetails : null,
            soLuongLichChup: Number(loaiDichVu) === 2 ? (Number(soLuongLichChup) || 0) : 0,
            soLuongLichMake: (Number(loaiDichVu) === 2 || Number(loaiDichVu) === 4) ? (Number(soLuongLichMake) || 0) : 0,
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
            clearPackageDraft(trimmedId);
            toast.success("Thêm dịch vụ mới thành công!");
            handleClose(true);
        }).catch((error) => {
            console.error('Error adding service:', error);
            toast.error("Lỗi khi thêm dịch vụ: " + (error?.message || error?.response?.data?.message || "Đã có lỗi xảy ra"));
        }).finally(() => {
            hideLoading();
        });
    };

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
                        
                        {/* 1. LOẠI DỊCH VỤ (HIỂN THỊ ĐỘNG TỪ DANH MỤC) */}
                        <div className="service-type-section">
                            <div className="service-section-label">
                                <span>
                                    1. Chọn loại dịch vụ <span className="required-star">*</span>
                                </span>
                            </div>
                            
                            <div className="service-type-grid">
                                {serviceTypes.map((type) => {
                                    const isSelected = Number(loaiDichVu) === type.id;
                                    return (
                                        <div
                                            key={type.id}
                                            className={`service-type-card ${isSelected ? 'active' : ''}`}
                                            style={{
                                                '--card-color': type.color || '#2563eb',
                                                '--badge-bg': type.badgeBg || '#dbeafe'
                                            }}
                                            onClick={() => handleSelectLoaiDichVu(type.id)}
                                        >
                                            <div className="service-type-card-top">
                                                <span className="service-type-icon">{type.icon || '📦'}</span>
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
                                
                                {/* Hàng 1: Tên dịch vụ & Mã dịch vụ (Mã sinh tự động theo tên viết tắt) */}
                                <div className="service-form-row">
                                    <div className="service-input-group">
                                        <label>
                                            <span>Tên dịch vụ <span className="required-star">*</span></span>
                                        </label>
                                        <div className="service-input-wrap">
                                            <input
                                                type="text"
                                                className="service-custom-input"
                                                value={name}
                                                onChange={handleNameChange}
                                                placeholder="VD: Váy cưới Hoàng Gia Luxury, Gói Chụp Ngoại Cảnh..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="service-input-group">
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>
                                                Mã dịch vụ <span className="required-star">*</span>
                                                <span className="service-input-helper" style={{ marginLeft: 6, color: '#059669', fontWeight: 600 }}>
                                                    (Tự sinh viết tắt)
                                                </span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleRegenerateCode}
                                                title="Bấm để sinh lại mã theo tên viết tắt"
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#0284c7',
                                                    cursor: 'pointer',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '3px',
                                                    padding: '2px 4px',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                <AutorenewRoundedIcon style={{ fontSize: '1rem' }} /> Sinh lại
                                            </button>
                                        </label>
                                        <div className="service-input-wrap">
                                            <input
                                                type="text"
                                                className="service-custom-input service-code-input"
                                                value={id}
                                                onChange={(e) => {
                                                    setId(e.target.value.toUpperCase());
                                                    setIsAutoCode(false); // Người dùng đã chỉnh sửa thủ công
                                                }}
                                                placeholder={`VD: ${currentTypeObj.prefix || ''}VCHG`}
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

                                 {/* Hàng 3b (CHỈ HIỂN THỊ KHI CHỌN MAKEUP - TYPE 4): THIẾT LẬP SỐ LỊCH MAKEUP */}
                                {Number(loaiDichVu) === 4 && (
                                    <div className="service-package-box" style={{ borderColor: '#fbcfe8', background: '#fff5f7' }}>
                                        <div className="service-package-header">
                                            <div className="service-package-title" style={{ color: '#be185d' }}>
                                                <span>💄 Cấu hình số lịch phân công Make-up</span>
                                            </div>
                                            <span className="service-package-tag" style={{ background: '#fce7f3', color: '#be185d' }}>Dịch vụ Make-up</span>
                                        </div>
                                        <div className="service-input-group">
                                            <label style={{ color: '#be185d', fontWeight: 700 }}>
                                                Số lượt / lịch trang điểm phân công
                                                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#db2777', display: 'block' }}>
                                                    (Mặc định là 1 lịch; nếu gói makeup 2 lần ăn hỏi + cưới thì nhập 2)
                                                </span>
                                            </label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', maxWidth: '300px' }}>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    className="service-custom-input"
                                                    value={soLuongLichMake}
                                                    onChange={(e) => setSoLuongLichMake(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                                    style={{ fontWeight: 700, fontSize: '1rem', color: '#be185d' }}
                                                />
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#be185d', whiteSpace: 'nowrap' }}>
                                                    ⚡ {soLuongLichMake || 1} lịch make
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Hàng 4: Mô tả (Cho các dịch vụ thông thường không phải gói) */}
                                {Number(loaiDichVu) !== 2 && (
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
                                )}

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

                        {/* 3. KHU VỰC THÔNG SỐ CHI TIẾT GÓI DỊCH VỤ (FULL WIDTH - RỘNG RÃI & KHOA HỌC) */}
                        {Number(loaiDichVu) === 2 && (
                            <div className="service-package-box service-package-box-full" style={{ marginTop: '18px', padding: '18px' }}>
                                <div className="service-package-header" style={{ marginBottom: '14px' }}>
                                    <div className="service-package-title">
                                        <LayersOutlinedIcon fontSize="small" style={{ color: '#2563eb' }} />
                                        <span>Thông số chi tiết gói dịch vụ</span>
                                    </div>
                                    <span className="service-package-tag">Gói Dịch Vụ</span>
                                </div>
                                <PackageDetailsManager
                                    packageCode={id || 'NEW_PKG'}
                                    details={packageDetails}
                                    onChange={setPackageDetails}
                                    isEditing={true}
                                />
                                <div className="service-input-group" style={{ marginTop: '16px' }}>
                                    <label>
                                        <span>Mô tả chi tiết gói dịch vụ</span>
                                        <span className="service-input-helper">Đặc điểm nổi bật, lưu ý riêng...</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="service-custom-textarea"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Nhập thông tin giới thiệu hoặc lưu ý về gói dịch vụ..."
                                    />
                                </div>
                            </div>
                        )}
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
