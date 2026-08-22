import React, { useState, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import { toast } from 'sonner';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import { downloadServiceExcelTemplate, parseServicesFromExcel } from '../../utils/excelServiceHelper';
import otherService from '../../API/services/otherService';
import { formatCurrency } from '../utils/formatCurrency';

function ServiceExcelImportDialog({ open, onClose, onSuccess, existingServices = [] }) {
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    
    // Parsed Data States
    const [parsedData, setParsedData] = useState(null);
    const [upsertExisting, setUpsertExisting] = useState(true);
    const [activeFilterTab, setActiveFilterTab] = useState('all'); // 'all', 'valid', 'invalid'

    // Import Execution States
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importResult, setImportResult] = useState(null);

    // Existing service codes map for quick lookup
    const existingCodeMap = new Set((existingServices || []).map(s => String(s.maDichVu).trim().toUpperCase()));

    const handleReset = () => {
        setFile(null);
        setParsedData(null);
        setIsImporting(false);
        setImportProgress(0);
        setImportResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClose = () => {
        if (isImporting) {
            if (!window.confirm("Quá trình nhập dữ liệu đang diễn ra. Bạn có chắc muốn dừng lại?")) {
                return;
            }
        }
        handleReset();
        onClose();
    };

    const handleFileSelected = async (selectedFile) => {
        if (!selectedFile) return;
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileName = selectedFile.name.toLowerCase();
        const isValid = validExtensions.some(ext => fileName.endsWith(ext));

        if (!isValid) {
            toast.error("Vui lòng chỉ chọn tệp định dạng Excel (.xlsx, .xls) hoặc CSV!");
            return;
        }

        setFile(selectedFile);
        setIsParsing(true);
        try {
            const result = await parseServicesFromExcel(selectedFile);
            setParsedData(result);
            if (result.validItems.length === 0) {
                toast.warning("Không tìm thấy dữ liệu hợp lệ trong file Excel!");
            } else {
                toast.success(`Đã phân tích thành công ${result.validItems.length} sản phẩm hợp lệ!`);
            }
        } catch (err) {
            console.error("Lỗi phân tích file:", err);
            toast.error("Lỗi khi đọc file Excel: " + (err.message || "Vui lòng kiểm tra lại cấu trúc file"));
            setParsedData(null);
        } finally {
            setIsParsing(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelected(e.dataTransfer.files[0]);
        }
    };

    const handleExecuteImport = async () => {
        if (!parsedData || !parsedData.validItems || parsedData.validItems.length === 0) {
            toast.error("Không có dữ liệu hợp lệ để nhập!");
            return;
        }

        setIsImporting(true);
        setImportProgress(0);

        const itemsToImport = parsedData.validItems;
        const total = itemsToImport.length;
        let successCount = 0;
        let updateCount = 0;
        let failCount = 0;
        const failureDetails = [];

        const DEFAULT_EMPTY_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        // Concurrency chunking (3 concurrent requests for high speed and reliability)
        const CHUNK_SIZE = 3;
        for (let i = 0; i < total; i += CHUNK_SIZE) {
            const chunk = itemsToImport.slice(i, i + CHUNK_SIZE);

            await Promise.all(chunk.map(async (item) => {
                const isExisted = existingCodeMap.has(item.maDichVu.trim().toUpperCase());

                const payload = {
                    maDichVu: item.maDichVu.trim(),
                    tenDichVu: item.tenDichVu.trim(),
                    loaiDichVu: Number(item.loaiDichVu) || 1,
                    tonKhoDichVu: Number(item.tonKhoDichVu) || 0,
                    giaTriDichVu: Number(item.giaTriDichVu) || 0,
                    giaChoThueDichVu: Number(item.giaChoThueDichVu) || 0,
                    moTaDichVu: item.moTaDichVu || "",
                    imageDichVu: (item.imageDichVu && item.imageDichVu.startsWith('data:')) ? item.imageDichVu : DEFAULT_EMPTY_IMAGE,
                    soLuongAnhChinhSua: Number(item.soLuongAnhChinhSua) || 0,
                    soLuongAnh16x21: Number(item.soLuongAnh16x21) || 0,
                    soLuongAnh20x30: Number(item.soLuongAnh20x30) || 0,
                    soLuongAnh60x90: Number(item.soLuongAnh60x90) || 0,
                    trangDiemNgayAnHoi: item.trangDiemNgayAnHoi || "",
                    trangDiemNgayCuoi: item.trangDiemNgayCuoi || "",
                    trangPhucChoDoiBeLe: item.trangPhucChoDoiBeLe || "",
                    trangPhucCoDauNgayAnHoi: item.trangPhucCoDauNgayAnHoi || "",
                    trangPhucChuReNgayAnHoi: item.trangPhucChuReNgayAnHoi || "",
                    trangPhucVayCuoiNgayCuoi: item.trangPhucVayCuoiNgayCuoi || "",
                    trangPhucVestChuReNgayCuoi: item.trangPhucVestChuReNgayCuoi || "",
                    hoaCamTay: item.hoaCamTay || ""
                };

                try {
                    if (isExisted) {
                        if (upsertExisting) {
                            await otherService.ServiceUpdateProduct(payload);
                            updateCount++;
                            successCount++;
                        } else {
                            // Bỏ qua không cập nhật
                        }
                    } else {
                        await otherService.ServiceAddProdcut(payload);
                        successCount++;
                    }
                } catch (err) {
                    console.error("Lỗi khi thêm dịch vụ:", item.maDichVu, err);
                    failCount++;
                    failureDetails.push({
                        maDichVu: item.maDichVu,
                        tenDichVu: item.tenDichVu,
                        error: err?.response?.data?.message || err.message || "Lỗi lưu dữ liệu"
                    });
                }
            }));

            const processedCount = Math.min(i + CHUNK_SIZE, total);
            setImportProgress(Math.round((processedCount / total) * 100));
        }

        setIsImporting(false);
        setImportResult({
            total,
            successCount,
            updateCount,
            failCount,
            failureDetails
        });

        toast.success(`Đã hoàn tất nhập dữ liệu! Thành công: ${successCount}, Thất bại: ${failCount}`);
        if (onSuccess) {
            onSuccess();
        }
    };

    // Filter displayed rows
    const displayedRows = (() => {
        if (!parsedData) return [];
        if (activeFilterTab === 'valid') return parsedData.validItems;
        if (activeFilterTab === 'invalid') return parsedData.invalidItems;
        return [...parsedData.validItems, ...parsedData.invalidItems];
    })();

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            classes={{ paper: 'service-modal-paper' }}
        >
            <div className="service-modal-container" style={{ minHeight: '520px' }}>
                {/* ===== HEADER ===== */}
                <div className="service-modal-header">
                    <div className="service-header-title-wrap">
                        <div className="service-header-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                            <TableViewOutlinedIcon />
                        </div>
                        <div>
                            <h3>Nhập sản phẩm & dịch vụ từ Excel</h3>
                            <p>Tự động thêm mới và cập nhật hàng loạt dịch vụ nhanh chóng</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="service-close-btn"
                        onClick={handleClose}
                        title="Đóng"
                    >
                        <CloseRoundedIcon fontSize="small" />
                    </button>
                </div>

                {/* ===== BODY ===== */}
                <div className="service-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    
                    {/* BƯỚC 1: NẾU CHƯA CÓ FILE */}
                    {!parsedData && !isParsing && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Toolbar tải mẫu */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: '#f8fafc',
                                padding: '12px 18px',
                                borderRadius: '12px',
                                border: '1.5px solid #e2e8f0'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                                        Chưa có file mẫu chuẩn?
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        Tải file mẫu Excel có sẵn các cột thông tin và dòng ví dụ minh họa
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="service-btn-clear"
                                    style={{ borderColor: '#10b981', color: '#059669', background: '#ecfdf5' }}
                                    onClick={downloadServiceExcelTemplate}
                                >
                                    <FileDownloadOutlinedIcon fontSize="small" />
                                    <span>Tải file mẫu Excel (.xlsx)</span>
                                </button>
                            </div>

                            {/* Dropzone */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".xlsx, .xls, .csv"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        handleFileSelected(e.target.files[0]);
                                    }
                                }}
                            />

                            <div
                                className={`service-dropzone ${isDragging ? 'drag-active' : ''}`}
                                style={{ minHeight: '260px' }}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                            >
                                <div className="service-dropzone-icon" style={{ width: 64, height: 64, background: '#d1fae5', color: '#059669' }}>
                                    <CloudUploadOutlinedIcon style={{ fontSize: 36 }} />
                                </div>
                                <p className="service-dropzone-text" style={{ fontSize: '15px' }}>
                                    Nhấp vào đây để chọn file Excel hoặc Kéo & thả file vào đây
                                </p>
                                <p className="service-dropzone-sub">
                                    Hỗ trợ định dạng: <strong>.xlsx, .xls, .csv</strong> (Kích thước tối đa 10MB)
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ĐANG XỬ LÝ / PHÂN TÍCH */}
                    {isParsing && (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
                                Đang đọc và kiểm tra dữ liệu file Excel...
                            </div>
                            <LinearProgress sx={{ maxWidth: 400, margin: '0 auto', height: 8, borderRadius: 4 }} />
                        </div>
                    )}

                    {/* BƯỚC 2: XEM TRƯỚC DỮ LIỆU & TIẾN HÀNH */}
                    {parsedData && !isImporting && !importResult && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            
                            {/* Summary Bar */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 12,
                                background: '#f8fafc',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1.5px solid #cbd5e1'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Tệp: {file?.name}</span>
                                    <button
                                        type="button"
                                        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}
                                        onClick={handleReset}
                                    >
                                        Đổi file khác
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Chip
                                        label={`Tất cả (${parsedData.total})`}
                                        size="small"
                                        clickable
                                        color={activeFilterTab === 'all' ? 'primary' : 'default'}
                                        onClick={() => setActiveFilterTab('all')}
                                    />
                                    <Chip
                                        icon={<CheckCircleOutlineRoundedIcon fontSize="small" />}
                                        label={`Hợp lệ (${parsedData.validItems.length})`}
                                        size="small"
                                        clickable
                                        color={activeFilterTab === 'valid' ? 'success' : 'default'}
                                        onClick={() => setActiveFilterTab('valid')}
                                    />
                                    {parsedData.invalidItems.length > 0 && (
                                        <Chip
                                            icon={<ErrorOutlineRoundedIcon fontSize="small" />}
                                            label={`Lỗi (${parsedData.invalidItems.length})`}
                                            size="small"
                                            clickable
                                            color={activeFilterTab === 'invalid' ? 'error' : 'default'}
                                            onClick={() => setActiveFilterTab('invalid')}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Option Checkbox */}
                            <div style={{ paddingLeft: 4 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={upsertExisting}
                                            onChange={(e) => setUpsertExisting(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <span style={{ fontSize: '13.5px', color: '#334155', fontWeight: 600 }}>
                                            Tự động cập nhật thông tin nếu mã dịch vụ đã tồn tại trong kho
                                        </span>
                                    }
                                />
                            </div>

                            {/* Preview Table */}
                            <div style={{
                                maxHeight: '300px',
                                overflowY: 'auto',
                                border: '1.5px solid #cbd5e1',
                                borderRadius: '10px'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                    <thead style={{ background: '#f1f5f9', position: 'sticky', top: 0, zIndex: 2 }}>
                                        <tr>
                                            <th style={{ padding: '10px', borderBottom: '1.5px solid #cbd5e1' }}>Dòng</th>
                                            <th style={{ padding: '10px', borderBottom: '1.5px solid #cbd5e1' }}>Mã dịch vụ</th>
                                            <th style={{ padding: '10px', borderBottom: '1.5px solid #cbd5e1' }}>Tên dịch vụ</th>
                                            <th style={{ padding: '10px', borderBottom: '1.5px solid #cbd5e1' }}>Loại</th>
                                            <th style={{ padding: '10px', borderBottom: '1.5px solid #cbd5e1' }}>Giá bán</th>
                                            <th style={{ padding: '10px', borderBottom: '1.5px solid #cbd5e1' }}>Giá thuê</th>
                                            <th style={{ padding: '10px', borderBottom: '1.5px solid #cbd5e1' }}>Tồn kho</th>
                                            <th style={{ padding: '10px', borderBottom: '1.5px solid #cbd5e1' }}>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedRows.map((row, idx) => {
                                            const isExisted = existingCodeMap.has(String(row.maDichVu).trim().toUpperCase());
                                            const isError = Boolean(row.errors);

                                            return (
                                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: isError ? '#fef2f2' : '#ffffff' }}>
                                                    <td style={{ padding: '8px 10px', color: '#64748b' }}>#{row.rowNum}</td>
                                                    <td style={{ padding: '8px 10px', fontWeight: 700, fontFamily: 'monospace', color: '#1e40af' }}>
                                                        {row.maDichVu || '-'}
                                                    </td>
                                                    <td style={{ padding: '8px 10px', fontWeight: 600, color: '#0f172a' }}>
                                                        {row.tenDichVu || '-'}
                                                    </td>
                                                    <td style={{ padding: '8px 10px' }}>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            background: '#f1f5f9',
                                                            fontWeight: 600
                                                        }}>
                                                            {row.loaiDichVuText}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '8px 10px', color: '#059669', fontWeight: 600 }}>
                                                        {formatCurrency(row.giaTriDichVu)}
                                                    </td>
                                                    <td style={{ padding: '8px 10px', color: '#64748b' }}>
                                                        {formatCurrency(row.giaChoThueDichVu)}
                                                    </td>
                                                    <td style={{ padding: '8px 10px' }}>
                                                        {row.tonKhoDichVu}
                                                    </td>
                                                    <td style={{ padding: '8px 10px' }}>
                                                        {isError ? (
                                                            <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '11.5px' }}>
                                                                ✕ {row.errors}
                                                            </span>
                                                        ) : isExisted ? (
                                                            <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '11.5px' }}>
                                                                ↻ Đã có (Sẽ cập nhật)
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '11.5px' }}>
                                                                ✓ Mới
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ĐANG THỰC HIỆN NHẬP DỮ LIỆU */}
                    {isImporting && (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                                Đang tiến hành nhập dữ liệu vào hệ thống...
                            </div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: 20 }}>
                                Vui lòng không đóng cửa sổ này cho đến khi hoàn tất.
                            </div>
                            <LinearProgress variant="determinate" value={importProgress} sx={{ height: 10, borderRadius: 5, marginBottom: 2 }} />
                            <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 16, marginTop: 8 }}>
                                {importProgress}%
                            </div>
                        </div>
                    )}

                    {/* BƯỚC 3: KẾT QUẢ HOÀN TẤT */}
                    {importResult && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '20px 10px' }}>
                            <div style={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: importResult.failCount === 0 ? '#d1fae5' : '#fef3c7',
                                color: importResult.failCount === 0 ? '#059669' : '#d97706',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto'
                            }}>
                                <CheckRoundedIcon style={{ fontSize: 32 }} />
                            </div>

                            <div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#0f172a' }}>
                                    Đã hoàn thành nhập dữ liệu!
                                </h4>
                                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                                    Tổng cộng: <strong>{importResult.total}</strong> | Thành công: <strong style={{ color: '#10b981' }}>{importResult.successCount}</strong> {importResult.failCount > 0 && <span>| Thất bại: <strong style={{ color: '#ef4444' }}>{importResult.failCount}</strong></span>}
                                </p>
                            </div>

                            {importResult.failureDetails.length > 0 && (
                                <div style={{
                                    textAlign: 'left',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    maxHeight: '140px',
                                    overflowY: 'auto'
                                }}>
                                    <div style={{ fontWeight: 700, color: '#b91c1c', fontSize: 12, marginBottom: 4 }}>
                                        Các dòng gặp lỗi:
                                    </div>
                                    {importResult.failureDetails.map((f, i) => (
                                        <div key={i} style={{ fontSize: 12, color: '#7f1d1d' }}>
                                            • [{f.maDichVu}] {f.tenDichVu}: {f.error}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* ===== FOOTER ===== */}
                <div className="service-modal-footer">
                    {!importResult ? (
                        <>
                            <button
                                type="button"
                                className="service-btn-clear"
                                onClick={handleClose}
                                disabled={isImporting}
                            >
                                Hủy bỏ
                            </button>

                            {parsedData && (
                                <button
                                    type="button"
                                    className="service-btn-submit"
                                    disabled={isImporting || parsedData.validItems.length === 0}
                                    onClick={handleExecuteImport}
                                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                                >
                                    <CheckCircleOutlineRoundedIcon fontSize="small" />
                                    <span>Xác nhận nhập ({parsedData.validItems.length} dịch vụ)</span>
                                </button>
                            )}
                        </>
                    ) : (
                        <button
                            type="button"
                            className="service-btn-submit"
                            onClick={handleClose}
                        >
                            <span>Hoàn tất & Đóng</span>
                        </button>
                    )}
                </div>
            </div>
        </Dialog>
    );
}

export default ServiceExcelImportDialog;
