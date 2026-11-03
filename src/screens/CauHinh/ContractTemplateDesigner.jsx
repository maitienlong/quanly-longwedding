import React, { useState, useRef } from 'react';
import {
    Box,
    Typography,
    Grid,
    TextField,
    Button,
    IconButton,
    Stack,
    Menu,
    MenuItem,
    InputAdornment,
    Switch,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TagIcon from '@mui/icons-material/Tag';
import SearchIcon from '@mui/icons-material/Search';
import TitleIcon from '@mui/icons-material/Title';
import GavelIcon from '@mui/icons-material/Gavel';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import { toast } from 'sonner';

import {
    getSafePrintLogo,
    AVAILABLE_CONTRACT_PARAMS,
    replaceTemplateParams
} from '../../utils/printConfigHelper';
import './contractTemplateDesigner.css';

// Dữ liệu mẫu thực tế hiển thị trên Hợp đồng
export const SAMPLE_CONTRACT_DATA = {
    maHopDong: 'HD-2025-DEMO',
    ngayLapHopDongFormatted: '18/08/2025',
    nameKH1: 'Nguyễn Thị Hoa (Cô Dâu)',
    nameKH2: 'Trần Văn Long (Chú Rể)',
    phoneKH1: '0988.123.456',
    phoneKH2: '0977.654.321',
    addressKH1: 'Khối Tân Cương, TT. Nghĩa Đàn, Nghệ An',
    addressKH2: 'Khối Tân Cương, TT. Nghĩa Đàn, Nghệ An',
    goiPreWedding: 'Gói Chụp Ảnh Cưới Luxury VIP Studio & Ngoại Cảnh',
    giaPreWedding: '12.000.000 đ',
    goiPhongSu: 'Phóng sự cưới 2 máy (Ảnh chụp full ngày)',
    giaPhongSu: '5.000.000 đ',
    goiQuayPhim: 'Quay phim highlight 4K tiệc cưới',
    giaQuayPhim: '6.000.000 đ',
    trangDiemNgayAnHoi: 'Có',
    trangDiemNgayCuoi: 'Có',
    trangDiemLuot: '02',
    ngayTrangDiem: 'Ngày cưới & Ăn hỏi',
    trangDiemThem: 'Trang điểm mẹ cô dâu & chú rể',
    ngayChupFormatted: '20/09/2025',
    ngayAnHoiFormatted: '15/10/2025',
    ngayCuoiFormatted: '20/10/2025',
    ngayTraAnhFormatted: '05/10/2025',
    diaDiemChup: 'Tại Studio & Ngoại cảnh',
    thoChupHinh: 'Long Photographer',
    thoMakeUp: 'Lan Makeup',
    thoChinhAnh: 'Tuấn Photoshop',
    nhanVienSale: 'Hà Wedding',
    serviceSchedules: [
        {
            serviceName: 'Gói Chụp Ảnh Cưới Luxury VIP Studio (Chụp ảnh)',
            serviceType: 'photo',
            luot: 1,
            ngayGio: '07:30 - 20/09/2025',
            diaDiem: 'Tại Studio & Ngoại cảnh',
            nhanVien: 'Long Photographer',
            ghiChu: 'Chụp 4 trang phục'
        },
        {
            serviceName: 'Trang điểm cô dâu ngày ăn hỏi',
            serviceType: 'makeup',
            luot: 1,
            ngayGio: '06:00 - 15/10/2025',
            diaDiem: 'Tại nhà gái',
            nhanVien: 'Lan Makeup',
            ghiChu: 'Tone nhẹ nhàng'
        },
        {
            serviceName: 'Trang điểm cô dâu ngày cưới',
            serviceType: 'makeup',
            luot: 2,
            ngayGio: '05:30 - 20/10/2025',
            diaDiem: 'Tại nhà gái',
            nhanVien: 'Lan Makeup',
            ghiChu: 'Làm tóc + vương miện'
        },
        {
            serviceName: 'Phóng sự cưới 2 máy (Full ngày cưới)',
            serviceType: 'photo',
            luot: 1,
            ngayGio: '07:00 - 20/10/2025',
            diaDiem: 'Nhà trai & Nhà gái',
            nhanVien: 'Thành Camera & Minh Camera',
            ghiChu: 'Bám sát lịch rước dâu'
        }
    ],
    soLuongAnh60x90: 2,
    soLuongAnh20x30: 2,
    soLuongAnh16x21: 1,
    soLuongAnhChinhSua: 35,
    albumTrang: 30,
    aoDaiAnHoi: '01 cặp áo dài cô dâu chú rể màu đỏ Long Phụng',
    trangPhucChuReNgayAnHoi: '01 áo dài cách tân chú rể thêu rồng',
    vayCuoi: '01 Váy Limited làm lễ + 01 Váy đi bàn',
    beTrap: '07 cặp, màu vàng đồng truyền thống',
    vestNgayCuoi: '01 bộ vest đen phong cách Hàn Quốc',
    hoaCamTay: '01 bó hoa tươi cầm tay + hoa cài áo',
    cartItems: [
        {
            tenDichVu: 'Gói Chụp Ảnh Cưới Luxury VIP Studio & Ngoại Cảnh',
            soLuong: 1,
            donGia: 12000000,
            giamGiaDichVu: 0,
            thanhTien: 12000000,
            donGiaFormatted: '12.000.000 đ',
            giamGiaFormatted: '0 đ',
            thanhTienFormatted: '12.000.000 đ'
        },
        {
            tenDichVu: 'Phóng sự cưới 2 máy (Ảnh chụp full ngày)',
            soLuong: 1,
            donGia: 5000000,
            giamGiaDichVu: 0,
            thanhTien: 5000000,
            donGiaFormatted: '5.000.000 đ',
            giamGiaFormatted: '0 đ',
            thanhTienFormatted: '5.000.000 đ'
        },
        {
            tenDichVu: 'Quay phim highlight 4K tiệc cưới',
            soLuong: 1,
            donGia: 6000000,
            giamGiaDichVu: 0,
            thanhTien: 6000000,
            donGiaFormatted: '6.000.000 đ',
            giamGiaFormatted: '0 đ',
            thanhTienFormatted: '6.000.000 đ'
        }
    ],
    tongTienDichVu: 23000000,
    tongTienDichVuFormatted: '23.000.000 đ',
    tongGiaTri: 25000000,
    tongGiaTriFormatted: '25.000.000 đ',
    tongGiamGia: 2000000,
    tongGiamGiaFormatted: '2.000.000 đ',
    tongTien: 23000000,
    datCoc: 5000000,
    daThanhToan: 15000000,
    daThanhToanFormatted: '15.000.000 đ',
    conLai: 8000000,
    conLaiFormatted: '8.000.000 đ',
    cacLuotThanhToan: [
        {
            date: '18/08/2025 09:30',
            amount: 5000000,
            method: 'Chuyển khoản',
            noiDung: 'Đặt cọc hợp đồng dịch vụ cưới'
        },
        {
            date: '20/09/2025 14:00',
            amount: 10000000,
            method: 'Tiền mặt',
            noiDung: 'Thanh toán đợt 2 (trước ngày chụp ảnh)'
        }
    ]
};

export default function ContractTemplateDesigner({
    config,
    onChange,
    onSave,
    onReset,
    onTestPrint
}) {
    // Chế độ xem: 'split' (Chia đôi màn hình) hoặc 'full' (Toàn màn hình bản mẫu A4)
    const [viewMode, setViewMode] = useState('split');
    // Chế độ render trên bản mẫu: 'preview' (Hiển thị dữ liệu thực) hoặc 'tags' (Hiển thị nhãn @)
    const [renderMode, setRenderMode] = useState('preview');
    // Phân vùng đang chọn chỉnh sửa: 'heading', 'studio', 'terms', 'signatures', 'footer'
    const [activeSection, setActiveSection] = useState('heading');

    // Kích thước khu vực soạn thảo (pixel) khi ở chế độ chia đôi
    const [editorWidth, setEditorWidth] = useState(() => {
        try {
            const saved = localStorage.getItem('contract_designer_editor_width');
            return saved ? Math.max(300, Math.min(850, Number(saved))) : 460;
        } catch {
            return 460;
        }
    });

    // Tỷ lệ phóng to/thu nhỏ (%) khu vực hiển thị hợp đồng mẫu
    const [previewZoom, setPreviewZoom] = useState(() => {
        try {
            const saved = localStorage.getItem('contract_designer_zoom');
            return saved ? Math.max(60, Math.min(150, Number(saved))) : 100;
        } catch {
            return 100;
        }
    });

    // Chế độ khổ giấy: 'standard' (800px) hoặc 'wide' (940px)
    const [paperWidthMode, setPaperWidthMode] = useState(() => {
        try {
            return localStorage.getItem('contract_designer_paper_mode') || 'standard';
        } catch {
            return 'standard';
        }
    });

    const [isDraggingDivider, setIsDraggingDivider] = useState(false);

    // Kéo thanh chia đôi để điều chỉnh kích thước khu vực soạn thảo & hiển thị
    const handleStartResize = (e) => {
        e.preventDefault();
        setIsDraggingDivider(true);
        const startX = e.clientX;
        const startW = editorWidth;

        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const newW = Math.max(300, Math.min(850, startW + deltaX));
            setEditorWidth(newW);
        };

        const onMouseUp = (upEvent) => {
            setIsDraggingDivider(false);
            const deltaX = upEvent.clientX - startX;
            const finalW = Math.max(300, Math.min(850, startW + deltaX));
            setEditorWidth(finalW);
            try {
                localStorage.setItem('contract_designer_editor_width', finalW.toString());
            } catch {}
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const handleSetZoom = (val) => {
        setPreviewZoom(val);
        try {
            localStorage.setItem('contract_designer_zoom', val.toString());
        } catch {}
    };

    const handleToggleWidthMode = () => {
        const nextMode = paperWidthMode === 'standard' ? 'wide' : 'standard';
        setPaperWidthMode(nextMode);
        try {
            localStorage.setItem('contract_designer_paper_mode', nextMode);
        } catch {}
    };

    // Quản lý điều khoản
    const [newTermText, setNewTermText] = useState('');

    // Menu Popover chèn tham số @
    const [paramMenuAnchor, setParamMenuAnchor] = useState(null);
    const [paramSearch, setParamSearch] = useState('');

    // Lưu reference của input / textarea đang focus để chèn @param chuẩn xác
    const lastFocusedInputRef = useRef(null);
    const lastFocusedFieldMeta = useRef(null); // { field: 'contractSubtitle', index?: number }

    // Xử lý ghi nhớ trường đang focus
    const handleInputFocus = (e, fieldName, index = null) => {
        lastFocusedInputRef.current = e.target;
        lastFocusedFieldMeta.current = { field: fieldName, index };
    };

    // Hàm chèn tham số @ vào input đang focus hoặc cập nhật trực tiếp state
    const handleInsertParam = (paramKey) => {
        const input = lastFocusedInputRef.current;
        const meta = lastFocusedFieldMeta.current;

        if (input && meta) {
            const start = input.selectionStart || 0;
            const end = input.selectionEnd || 0;
            const currentValue = input.value || '';
            const newValue = currentValue.substring(0, start) + paramKey + currentValue.substring(end);

            if (meta.field === 'newTerm') {
                setNewTermText(newValue);
            } else if (meta.field === 'termItem' && meta.index !== null) {
                const updated = [...(config.terms || [])];
                updated[meta.index] = newValue;
                onChange({ ...config, terms: updated });
            } else {
                onChange({ ...config, [meta.field]: newValue });
            }

            // Đặt lại con trỏ chuột sau khi chèn
            setTimeout(() => {
                input.focus();
                const newPos = start + paramKey.length;
                input.setSelectionRange(newPos, newPos);
            }, 50);

            toast.success(`Đã chèn ${paramKey}`, { duration: 1500 });
        } else {
            // Mặc định chèn vào ô thêm điều khoản nếu chưa focus ô nào
            setNewTermText(prev => `${prev ? prev + ' ' : ''}${paramKey}`);
            toast.info(`Đã chèn ${paramKey} vào ô điều khoản mới`, { duration: 1800 });
        }
        setParamMenuAnchor(null);
    };

    // Helper render chuỗi có chứa @tag trên bản mẫu A4
    const renderPaperText = (rawText, defaultText = '') => {
        const text = rawText || defaultText;
        if (!text) return null;

        if (renderMode === 'preview') {
            return replaceTemplateParams(text, SAMPLE_CONTRACT_DATA, config);
        }

        // Chế độ 'tags': Tìm các @param và hiển thị badge nổi bật
        const regex = /(@[a-zA-Z0-9_]+)/g;
        const parts = text.split(regex);

        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return (
                    <span key={i} className="contract-param-badge" title="Tham số động tự điền theo hợp đồng">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    // Thao tác điều khoản
    const handleAddTerm = () => {
        if (!newTermText.trim()) {
            toast.warning("Vui lòng nhập nội dung điều khoản!");
            return;
        }
        onChange({
            ...config,
            terms: [...(config.terms || []), newTermText.trim()]
        });
        setNewTermText('');
        toast.success("Đã thêm điều khoản mới!");
    };

    const handleDeleteTerm = (idx) => {
        const updated = (config.terms || []).filter((_, i) => i !== idx);
        onChange({ ...config, terms: updated });
        toast.info("Đã xóa điều khoản");
    };

    const handleMoveTerm = (idx, direction) => {
        const terms = [...(config.terms || [])];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= terms.length) return;

        const temp = terms[idx];
        terms[idx] = terms[targetIdx];
        terms[targetIdx] = temp;
        onChange({ ...config, terms });
    };

    // Lọc danh sách tham số theo từ khóa tìm kiếm
    const filteredParamCategories = AVAILABLE_CONTRACT_PARAMS.map(cat => ({
        ...cat,
        params: cat.params.filter(p =>
            p.key.toLowerCase().includes(paramSearch.toLowerCase()) ||
            p.label.toLowerCase().includes(paramSearch.toLowerCase()) ||
            p.desc.toLowerCase().includes(paramSearch.toLowerCase())
        )
    })).filter(cat => cat.params.length > 0);

    return (
        <div className="contract-designer-container">
            {/* 1. THANH CÔNG CỤ ĐIỀU HƯỚNG TRÊN CÙNG */}
            <div className="designer-toolbar">
                <div className="designer-toolbar-left">
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="fa-solid fa-file-signature" style={{ color: '#0284c7' }}></i>
                        Thiết Kế Mẫu Hợp Đồng Trực Quan
                    </Typography>

                    {/* Bộ chuyển đổi chế độ xem */}
                    <div className="designer-mode-switch">
                        <button
                            type="button"
                            className={`designer-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
                            onClick={() => setViewMode('split')}
                            title="Hiển thị song song bảng cấu hình và bản mẫu A4"
                        >
                            <ViewStreamIcon sx={{ fontSize: 18 }} />
                            Xem song song
                        </button>
                        <button
                            type="button"
                            className={`designer-mode-btn ${viewMode === 'full' ? 'active' : ''}`}
                            onClick={() => setViewMode('full')}
                            title="Xem bản mẫu Hợp đồng A4 toàn màn hình"
                        >
                            <FullscreenIcon sx={{ fontSize: 18 }} />
                            Toàn màn hình
                        </button>
                    </div>

                    {/* Bộ chọn nhanh tỷ lệ kích thước khu vực soạn thảo & hiển thị */}
                    {viewMode === 'split' && (
                        <div className="designer-mode-switch" title="Tùy chọn nhanh tỷ lệ khu vực hiển thị">
                            <button
                                type="button"
                                className={`designer-mode-btn ${editorWidth <= 390 ? 'active' : ''}`}
                                onClick={() => { setEditorWidth(360); localStorage.setItem('contract_designer_editor_width', '360'); }}
                                title="Hiển thị hợp đồng rộng 65% - Soạn thảo 35%"
                            >
                                35% : 65%
                            </button>
                            <button
                                type="button"
                                className={`designer-mode-btn ${editorWidth > 390 && editorWidth < 540 ? 'active' : ''}`}
                                onClick={() => { setEditorWidth(460); localStorage.setItem('contract_designer_editor_width', '460'); }}
                                title="Tỷ lệ cân đối (45% : 55%)"
                            >
                                45% : 55%
                            </button>
                            <button
                                type="button"
                                className={`designer-mode-btn ${editorWidth >= 540 ? 'active' : ''}`}
                                onClick={() => { setEditorWidth(580); localStorage.setItem('contract_designer_editor_width', '580'); }}
                                title="Mở rộng khu vực soạn thảo (55% : 45%)"
                            >
                                55% : 45%
                            </button>
                        </div>
                    )}

                    {/* Bộ điều chỉnh kích thước / Zoom hiển thị của hợp đồng mẫu */}
                    <div className="zoom-control-group" title="Điều chỉnh tỷ lệ phóng to/thu nhỏ hợp đồng mẫu">
                        <button
                            type="button"
                            className="size-ctrl-btn"
                            onClick={() => handleSetZoom(Math.max(60, previewZoom - 10))}
                            title="Thu nhỏ kích thước hiển thị (-10%)"
                            disabled={previewZoom <= 60}
                        >
                            <RemoveIcon sx={{ fontSize: 13 }} />
                        </button>
                        <span className="zoom-label" title="Tỷ lệ kích thước hiển thị">
                            {previewZoom}%
                        </span>
                        <button
                            type="button"
                            className="size-ctrl-btn"
                            onClick={() => handleSetZoom(Math.min(150, previewZoom + 10))}
                            title="Phóng to kích thước hiển thị (+10%)"
                            disabled={previewZoom >= 150}
                        >
                            <AddIcon sx={{ fontSize: 13 }} />
                        </button>
                        <button
                            type="button"
                            className={`size-ctrl-btn text-btn ${paperWidthMode === 'wide' ? 'active' : ''}`}
                            onClick={handleToggleWidthMode}
                            title="Chuyển đổi giữa Khổ chuẩn (800px) và Khổ rộng (940px)"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        >
                            <AspectRatioIcon sx={{ fontSize: 13 }} />
                            {paperWidthMode === 'wide' ? 'Khổ rộng' : 'Khổ chuẩn'}
                        </button>
                    </div>
                </div>

                <div className="designer-toolbar-right">
                    {/* Toggle hiển thị dữ liệu mẫu hoặc mã @ */}
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                checked={renderMode === 'preview'}
                                onChange={(e) => setRenderMode(e.target.checked ? 'preview' : 'tags')}
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>
                                {renderMode === 'preview' ? '✨ Hiển thị dữ liệu mẫu' : '🏷️ Hiển thị mã @tham số'}
                            </Typography>
                        }
                    />

                    {/* Nút tra cứu & chèn tham số @ */}
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<TagIcon />}
                        onClick={(e) => setParamMenuAnchor(e.currentTarget)}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            borderColor: '#bae6fd',
                            bgcolor: '#f0f9ff',
                            color: '#0284c7',
                            '&:hover': { bgcolor: '#e0f2fe', borderColor: '#7dd3fc' }
                        }}
                    >
                        Chèn tham số @
                    </Button>

                    <Button
                        variant="outlined"
                        color="inherit"
                        size="small"
                        startIcon={<RestartAltIcon />}
                        onClick={onReset}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                        Mặc định
                    </Button>

                    <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<PrintIcon />}
                        onClick={onTestPrint}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                        In thử bản mẫu
                    </Button>

                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<SaveIcon />}
                        onClick={onSave}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#0284c7' }}
                    >
                        Lưu cấu hình
                    </Button>
                </div>
            </div>

            {/* THANH CHÈN NHANH THAM SỐ ĐỘNG DÀNH CHO NGƯỜI DÙNG */}
            <div className="param-quickbar">
                <div className="param-quickbar-header">
                    <span>
                        <AutoAwesomeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        Gợi ý tham số động: Nhấp vào bất kỳ thẻ bên dưới hoặc gõ ký tự <strong>@</strong> để tự động gán thông tin khách hàng / studio:
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Click để chèn vào vị trí con trỏ
                    </span>
                </div>
                <div className="param-chips-scroll">
                    {AVAILABLE_CONTRACT_PARAMS.flatMap(cat => cat.params).map((p) => (
                        <button
                            key={p.key}
                            type="button"
                            className="param-chip-btn"
                            onClick={() => handleInsertParam(p.key)}
                            title={`${p.label} (Ví dụ thực tế: ${p.sample})`}
                        >
                            <span>{p.key}</span>
                            <span style={{ opacity: 0.7, fontSize: '0.68rem', fontWeight: 400 }}>({p.label})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. KHÔNG GIAN LÀM VIỆC CHÍNH (EDITOR & LIVE A4 PREVIEW) */}
            <div className={`designer-workspace ${viewMode === 'split' ? 'split-view' : 'full-preview'}`}>
                {/* CỘT TRÁI: BẢNG SOẠN THẢO CHI TIẾT */}
                <div className="designer-editor-pane" style={{ width: viewMode === 'split' ? `${editorWidth}px` : undefined }}>
                    {/* Phần 1: Tiêu đề hợp đồng & Studio */}
                    <Accordion
                        expanded={activeSection === 'heading'}
                        onChange={() => setActiveSection(activeSection === 'heading' ? '' : 'heading')}
                        sx={{ borderRadius: '12px !important', overflow: 'hidden', border: '1px solid #e2e8f0', mb: 1 }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc', py: 0.5 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TitleIcon sx={{ fontSize: 19, color: '#0284c7' }} />
                                Tiêu Đề & Thông Tin Studio (Bên B)
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 2 }}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Tiêu đề chính hợp đồng"
                                    size="small"
                                    fullWidth
                                    value={config.contractTitle || ''}
                                    onFocus={(e) => handleInputFocus(e, 'contractTitle')}
                                    onChange={(e) => onChange({ ...config, contractTitle: e.target.value })}
                                    helperText="Ví dụ: HỢP ĐỒNG CUNG CẤP DỊCH VỤ CƯỚI"
                                />
                                <TextField
                                    label="Tiêu đề phụ / Địa điểm ký"
                                    size="small"
                                    fullWidth
                                    value={config.contractSubtitle || ''}
                                    onFocus={(e) => handleInputFocus(e, 'contractSubtitle')}
                                    onChange={(e) => onChange({ ...config, contractSubtitle: e.target.value })}
                                    helperText="Hỗ trợ chèn tham số như @diaChiStudio, @ngayCuoi..."
                                />
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Tên Studio"
                                            size="small"
                                            fullWidth
                                            value={config.studioName || ''}
                                            onFocus={(e) => handleInputFocus(e, 'studioName')}
                                            onChange={(e) => onChange({ ...config, studioName: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Hotline hỗ trợ"
                                            size="small"
                                            fullWidth
                                            value={config.studioHotline || ''}
                                            onFocus={(e) => handleInputFocus(e, 'studioHotline')}
                                            onChange={(e) => onChange({ ...config, studioHotline: e.target.value })}
                                        />
                                    </Grid>
                                </Grid>
                                <TextField
                                    label="Địa chỉ Studio hiển thị trên hợp đồng"
                                    size="small"
                                    fullWidth
                                    value={config.studioAddress || ''}
                                    onFocus={(e) => handleInputFocus(e, 'studioAddress')}
                                    onChange={(e) => onChange({ ...config, studioAddress: e.target.value })}
                                />
                            </Stack>
                        </AccordionDetails>
                    </Accordion>

                    {/* Phần 2: Điều khoản & Cam kết hợp đồng */}
                    <Accordion
                        expanded={activeSection === 'terms'}
                        onChange={() => setActiveSection(activeSection === 'terms' ? '' : 'terms')}
                        sx={{ borderRadius: '12px !important', overflow: 'hidden', border: '1px solid #e2e8f0', mb: 1 }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc', py: 0.5 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <GavelIcon sx={{ fontSize: 19, color: '#f59e0b' }} />
                                Điều Khoản & Cam Kết Dịch Vụ (Mục IV)
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 2 }}>
                            <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5, fontSize: '0.8rem' }}>
                                Điều chỉnh từng điều khoản hoặc chèn tham số @hotlineStudio, @tenKhachHang, @conLai...
                            </Typography>

                            {/* Ô thêm điều khoản mới */}
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <TextField
                                    placeholder="Nhập nội dung điều khoản mới (có thể gõ @)..."
                                    size="small"
                                    fullWidth
                                    value={newTermText}
                                    onFocus={(e) => handleInputFocus(e, 'newTerm')}
                                    onChange={(e) => setNewTermText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTerm()}
                                />
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={handleAddTerm}
                                    sx={{ minWidth: 100, textTransform: 'none', fontWeight: 700, bgcolor: '#0284c7' }}
                                >
                                    Thêm
                                </Button>
                            </Box>

                            {/* Danh sách các điều khoản */}
                            <div className="terms-editor-list">
                                {(config.terms || []).map((term, index) => (
                                    <div key={index} className="term-edit-row">
                                        <div className="term-index-badge">
                                            Điều {index + 1}
                                        </div>
                                        <div className="term-content-box">
                                            <TextField
                                                size="small"
                                                fullWidth
                                                multiline
                                                maxRows={4}
                                                value={term}
                                                onFocus={(e) => handleInputFocus(e, 'termItem', index)}
                                                onChange={(e) => {
                                                    const updated = [...(config.terms || [])];
                                                    updated[index] = e.target.value;
                                                    onChange({ ...config, terms: updated });
                                                }}
                                                variant="outlined"
                                                sx={{
                                                    bgcolor: '#ffffff',
                                                    '& .MuiOutlinedInput-root': { fontSize: '0.84rem' }
                                                }}
                                            />
                                        </div>
                                        <div className="term-actions-box">
                                            <IconButton
                                                size="small"
                                                disabled={index === 0}
                                                onClick={() => handleMoveTerm(index, 'up')}
                                                title="Di chuyển lên"
                                            >
                                                <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                disabled={index === (config.terms || []).length - 1}
                                                onClick={() => handleMoveTerm(index, 'down')}
                                                title="Di chuyển xuống"
                                            >
                                                <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteTerm(index)}
                                                title="Xóa điều khoản này"
                                            >
                                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionDetails>
                    </Accordion>

                    {/* Phần 3: Khu vực Chữ ký & Chân trang */}
                    <Accordion
                        expanded={activeSection === 'signatures'}
                        onChange={() => setActiveSection(activeSection === 'signatures' ? '' : 'signatures')}
                        sx={{ borderRadius: '12px !important', overflow: 'hidden', border: '1px solid #e2e8f0', mb: 1 }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc', py: 0.5 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HistoryEduIcon sx={{ fontSize: 19, color: '#10b981' }} />
                                Khu Vực Chữ Ký & Lời Cảm Ơn Chân Trang
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 2 }}>
                            <Stack spacing={2}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Tiêu đề người ký Bên A (Khách hàng)"
                                            size="small"
                                            fullWidth
                                            value={config.clientSignTitle || ''}
                                            onFocus={(e) => handleInputFocus(e, 'clientSignTitle')}
                                            onChange={(e) => onChange({ ...config, clientSignTitle: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Ghi chú dưới chữ ký Bên A"
                                            size="small"
                                            fullWidth
                                            value={config.clientSignSubtitle || ''}
                                            onFocus={(e) => handleInputFocus(e, 'clientSignSubtitle')}
                                            onChange={(e) => onChange({ ...config, clientSignSubtitle: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Tiêu đề người ký Bên B (Studio)"
                                            size="small"
                                            fullWidth
                                            value={config.studioSignTitle || ''}
                                            onFocus={(e) => handleInputFocus(e, 'studioSignTitle')}
                                            onChange={(e) => onChange({ ...config, studioSignTitle: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Ghi chú dưới chữ ký Bên B"
                                            size="small"
                                            fullWidth
                                            value={config.studioSignSubtitle || ''}
                                            onFocus={(e) => handleInputFocus(e, 'studioSignSubtitle')}
                                            onChange={(e) => onChange({ ...config, studioSignSubtitle: e.target.value })}
                                        />
                                    </Grid>
                                </Grid>
                                <TextField
                                    label="Lời cảm ơn ở chân trang (Footer)"
                                    size="small"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={config.footerNote || ''}
                                    onFocus={(e) => handleInputFocus(e, 'footerNote')}
                                    onChange={(e) => onChange({ ...config, footerNote: e.target.value })}
                                    helperText="Hiển thị ở cuối cùng của trang in hợp đồng"
                                />
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                </div>

                {/* THANH KÉO ĐIỀU CHỈNH KÍCH THƯỚC HAI BÊN */}
                {viewMode === 'split' && (
                    <div
                        className={`designer-split-resizer ${isDraggingDivider ? 'dragging' : ''}`}
                        onMouseDown={handleStartResize}
                        title="Nhấn giữ và kéo chuột sang trái/phải để điều chỉnh kích thước khu vực soạn thảo & hiển thị"
                    >
                        <div className="resizer-handle-line"></div>
                        <div className="resizer-handle-pill">
                            <SwapHorizIcon sx={{ fontSize: 16, color: 'inherit' }} />
                        </div>
                    </div>
                )}

                {/* CỘT PHẢI: MÔ PHỎNG GIẤY A4 HỢP ĐỒNG TRỰC QUAN (LIVE PAPER PREVIEW) */}
                <div className="designer-preview-pane">
                    {/* Thanh thông tin đỉnh bàn vẽ */}
                    <div className="preview-desk-bar">
                        <div className="preview-scale-info">
                            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
                            <strong>Bản Hợp Đồng Mẫu Trực Quan</strong> (Khổ A4 • 210 × 297mm)
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>
                                💡 Nhấn giữ kéo thanh ở giữa hoặc chỉnh tỷ lệ trên thanh công cụ để thay đổi kích thước
                            </span>
                        </div>
                    </div>

                    {/* TỜ GIẤY A4 TRỰC QUAN */}
                    <div
                        className={`contract-a4-paper ${paperWidthMode === 'wide' ? 'wide-mode' : ''}`}
                        style={{
                            zoom: previewZoom !== 100 ? `${previewZoom}%` : undefined
                        }}
                    >
                        {/* 1. Header: Logo Long Wedding & Thông tin mã HĐ */}
                        <div className="paper-header">
                            <div className="paper-logo-box">
                                <img
                                    src={getSafePrintLogo()}
                                    alt="Long Wedding"
                                    className="paper-logo-img"
                                />
                            </div>
                            <div className="paper-contract-meta">
                                <div>Mã số hợp đồng: <strong>{SAMPLE_CONTRACT_DATA.maHopDong}</strong></div>
                                <div>Ngày ký HĐ: <strong>{SAMPLE_CONTRACT_DATA.ngayLapHopDongFormatted}</strong></div>
                            </div>
                        </div>

                        {/* 2. Tiêu đề hợp đồng & phụ đề (Click to edit) */}
                        <div
                            className={`paper-main-heading paper-edit-zone ${activeSection === 'heading' ? 'active-zone' : ''}`}
                            onClick={() => setActiveSection('heading')}
                            title="Nhấp để chỉnh sửa tiêu đề hợp đồng"
                        >
                            <h1>{renderPaperText(config.contractTitle, 'HỢP ĐỒNG CUNG CẤP DỊCH VỤ CƯỚI')}</h1>
                            <p>{renderPaperText(config.contractSubtitle, 'Tại Long Wedding, số 129 đường 1/5, xóm Tân Hồng, Xã Nghĩa Đàn, Nghệ An')}</p>
                        </div>

                        {/* 3. Section I: Các bên tham gia */}
                        <div className="paper-sec-title">I. CÁC BÊN BAO GỒM</div>
                        <div className="paper-party-grid">
                            {/* Bên A: Khách hàng mẫu */}
                            <div className="paper-party-a">
                                <div className="paper-party-header-title">BÊN A (KHÁCH HÀNG)</div>
                                <div className="paper-party-a-row">
                                    <div className="paper-party-a-col"><strong>Cô Dâu:</strong> {SAMPLE_CONTRACT_DATA.nameKH1}</div>
                                    <div className="paper-party-a-col"><strong>Chú Rể:</strong> {SAMPLE_CONTRACT_DATA.nameKH2}</div>
                                </div>
                                <div className="paper-party-a-row">
                                    <div className="paper-party-a-col"><strong>SĐT:</strong> {SAMPLE_CONTRACT_DATA.phoneKH1}</div>
                                    <div className="paper-party-a-col"><strong>SĐT:</strong> {SAMPLE_CONTRACT_DATA.phoneKH2}</div>
                                </div>
                                <div className="paper-party-a-row">
                                    <div className="paper-party-a-col"><strong>Đ/C:</strong> {SAMPLE_CONTRACT_DATA.addressKH1}</div>
                                    <div className="paper-party-a-col"><strong>Đ/C:</strong> {SAMPLE_CONTRACT_DATA.addressKH2}</div>
                                </div>
                            </div>

                            {/* Bên B: Studio (Click to edit) */}
                            <div
                                className={`paper-party-b paper-edit-zone ${activeSection === 'heading' ? 'active-zone' : ''}`}
                                onClick={() => setActiveSection('heading')}
                                title="Nhấp để sửa thông tin Studio & Hotline"
                            >
                                <div className="paper-party-b-card">
                                    <div className="paper-party-header-title">BÊN B (STUDIO)</div>
                                    <div className="paper-party-b-title">
                                        ẢNH VIỆN ÁO CƯỚI<br />
                                        <strong>{renderPaperText(config.studioName, 'LONG WEDDING')}</strong>
                                    </div>
                                    <div className="paper-party-b-hotline">
                                        Hotline: {renderPaperText(config.studioHotline, '0868 66 3637')}
                                    </div>
                                    <div className="paper-party-b-address" style={{ fontSize: '11.5px', marginTop: '2px', lineHeight: 1.3 }}>
                                        Đ/C: {renderPaperText(config.studioAddress, 'số 129 đường 1/5, xóm Tân Hồng, Xã Nghĩa Đàn, Nghệ An')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Section II: Nội dung dịch vụ */}
                        <div className="paper-sec-title">II. NỘI DUNG HỢP ĐỒNG</div>
                        <div className="paper-content-block">
                            {/* 2.1 Dịch vụ sử dụng */}
                            <div className="paper-sec-subtitle"><strong>2.1 Dịch vụ sử dụng:</strong></div>
                            <table className="paper-services-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '32px', textAlign: 'center' }}>STT</th>
                                        <th style={{ textAlign: 'left' }}>Dịch vụ sử dụng</th>
                                        <th style={{ width: '55px', textAlign: 'center' }}>Số lượng</th>
                                        <th style={{ width: '90px', textAlign: 'right' }}>Đơn giá</th>
                                        <th style={{ width: '80px', textAlign: 'right' }}>Giảm giá</th>
                                        <th style={{ width: '95px', textAlign: 'right' }}>Tổng tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(SAMPLE_CONTRACT_DATA.cartItems || []).map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                            <td style={{ textAlign: 'left' }}><strong>{item.tenDichVu}</strong></td>
                                            <td style={{ textAlign: 'center' }}>{item.soLuong}</td>
                                            <td style={{ textAlign: 'right' }}>{item.donGiaFormatted || `${Number(item.donGia).toLocaleString('vi-VN')} đ`}</td>
                                            <td style={{ textAlign: 'right' }}>{item.giamGiaFormatted || `${Number(item.giamGiaDichVu || 0).toLocaleString('vi-VN')} đ`}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{item.thanhTienFormatted || `${Number(item.thanhTien).toLocaleString('vi-VN')} đ`}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="paper-services-total-row">
                                        <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>Tổng tiền dịch vụ:</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                            {SAMPLE_CONTRACT_DATA.tongTienDichVuFormatted || `${Number(SAMPLE_CONTRACT_DATA.tongTien).toLocaleString('vi-VN')} đ`}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            {/* 2.2 Chi tiết sản phẩm & dịch vụ theo hợp đồng */}
                            <div className="paper-sec-subtitle" style={{ marginTop: '6px' }}><strong>2.2 Chi tiết sản phẩm & dịch vụ theo hợp đồng:</strong></div>

                            {/* Quy Cách Chi Tiết Đính Kèm Hợp Đồng (Phần nào có thì hiện, không thì không hiển thị) */}
                            <div className="paper-package-items-container">
                                <div className="paper-package-items-grid">
                                    <div className="paper-package-item-row">
                                        <span className="paper-chk-box">✓</span>
                                        <span><strong>Ảnh phóng 60x90:</strong> {SAMPLE_CONTRACT_DATA.soLuongAnh60x90} cái (Mika HD bo viền Hàn Quốc)</span>
                                    </div>
                                    <div className="paper-package-item-row">
                                        <span className="paper-chk-box">✓</span>
                                        <span><strong>Ảnh để bàn 20x30:</strong> {SAMPLE_CONTRACT_DATA.soLuongAnh20x30} cái</span>
                                    </div>
                                    <div className="paper-package-item-row">
                                        <span className="paper-chk-box">✓</span>
                                        <span><strong>Ảnh 16x21:</strong> {SAMPLE_CONTRACT_DATA.soLuongAnh16x21 || 1} cái</span>
                                    </div>
                                    <div className="paper-package-item-row">
                                        <span className="paper-chk-box">✓</span>
                                        <span><strong>SL ảnh chỉnh sửa:</strong> {SAMPLE_CONTRACT_DATA.soLuongAnhChinhSua || 35} ảnh hoàn thiện</span>
                                    </div>
                                    <div className="paper-package-item-row">
                                        <span className="paper-chk-box">✓</span>
                                        <span><strong>Trang điểm ăn hỏi:</strong> {SAMPLE_CONTRACT_DATA.trangDiemNgayAnHoi || '01 lần tại Studio'}</span>
                                    </div>
                                    <div className="paper-package-item-row">
                                        <span className="paper-chk-box">✓</span>
                                        <span><strong>Trang điểm ngày cưới:</strong> {SAMPLE_CONTRACT_DATA.trangDiemNgayCuoi || '01 lần tại nhà gái'}</span>
                                    </div>
                                    <div className="paper-package-item-row">
                                        <span className="paper-chk-box">✓</span>
                                        <span><strong>Trang phục bê lễ:</strong> {SAMPLE_CONTRACT_DATA.beTrap}</span>
                                    </div>
                                    <div className="paper-package-item-row">
                                        <span className="paper-chk-box">✓</span>
                                        <span><strong>TP cô dâu ăn hỏi:</strong> {SAMPLE_CONTRACT_DATA.aoDaiAnHoi}</span>
                                    </div>
                                    <div className="paper-package-item-row">
                                        <span className="paper-chk-box">✓</span>
                                        <span><strong>TP chú rể ăn hỏi:</strong> {SAMPLE_CONTRACT_DATA.trangPhucChuReNgayAnHoi}</span>
                                    </div>
                                    <div className="paper-package-item-row">
                                        <span className="paper-chk-box">✓</span>
                                        <span><strong>Váy cưới ngày cưới:</strong> {SAMPLE_CONTRACT_DATA.vayCuoi}</span>
                                    </div>
                                    <div className="paper-package-item-row">
                                        <span className="paper-chk-box">✓</span>
                                        <span><strong>Vest chú rể ngày cưới:</strong> {SAMPLE_CONTRACT_DATA.vestNgayCuoi}</span>
                                    </div>
                                    <div className="paper-package-item-row">
                                        <span className="paper-chk-box">✓</span>
                                        <span><strong>Hoa cầm tay:</strong> {SAMPLE_CONTRACT_DATA.hoaCamTay}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 2.3 Lịch và Phân Công */}
                            <div className="paper-sec-subtitle" style={{ marginTop: '6px' }}><strong>2.3 Lịch và Phân Công:</strong></div>
                            <div className="paper-dates-highlight">
                                <strong>Ngày chụp ảnh:</strong> {SAMPLE_CONTRACT_DATA.ngayChupFormatted || '..... tháng ..... năm 20....'} , 
                                <strong> Ăn hỏi:</strong> {SAMPLE_CONTRACT_DATA.ngayAnHoiFormatted || '...... tháng ..... năm 20....'} , 
                                <strong> Lễ cưới:</strong> {SAMPLE_CONTRACT_DATA.ngayCuoiFormatted || '...... tháng ..... năm 20....'}
                                {SAMPLE_CONTRACT_DATA.ngayTraAnhFormatted && (
                                    <span> , <strong> Hẹn trả ảnh:</strong> {SAMPLE_CONTRACT_DATA.ngayTraAnhFormatted}</span>
                                )}
                            </div>

                            {/* Bảng Lịch & Phân Công */}
                            <table className="paper-schedule-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '32px', textAlign: 'center' }}>STT</th>
                                        <th style={{ textAlign: 'left' }}>Lịch trình / Hạng mục</th>
                                        <th style={{ width: '135px', textAlign: 'center' }}>Thời gian</th>
                                        <th style={{ width: '110px', textAlign: 'left' }}>Địa điểm</th>
                                        <th style={{ width: '130px', textAlign: 'left' }}>Nhân sự phân công</th>
                                        <th style={{ width: '100px', textAlign: 'left' }}>Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(SAMPLE_CONTRACT_DATA.serviceSchedules || []).map((sch, idx) => (
                                        <tr key={idx}>
                                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                            <td style={{ textAlign: 'left' }}><strong>{sch.serviceName}</strong></td>
                                            <td style={{ textAlign: 'center' }}>{sch.ngayGio}</td>
                                            <td style={{ textAlign: 'left' }}>{sch.diaDiem}</td>
                                            <td style={{ textAlign: 'left', fontWeight: 'bold' }}>{sch.nhanVien}</td>
                                            <td style={{ textAlign: 'left' }}>{sch.ghiChu || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {(SAMPLE_CONTRACT_DATA.thoChinhAnh || SAMPLE_CONTRACT_DATA.nhanVienSale) && (
                                <div style={{ fontSize: '11px', marginTop: '2px', display: 'flex', gap: '15px', color: '#334155' }}>
                                    {SAMPLE_CONTRACT_DATA.thoChinhAnh && (
                                        <span>• <strong>Thợ chỉnh ảnh:</strong> {SAMPLE_CONTRACT_DATA.thoChinhAnh}</span>
                                    )}
                                    {SAMPLE_CONTRACT_DATA.nhanVienSale && (
                                        <span>• <strong>Tư vấn (Sale):</strong> {SAMPLE_CONTRACT_DATA.nhanVienSale}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 5. Section III: Thanh toán dịch vụ */}
                        <div className="paper-sec-title">III. THANH TOÁN DỊCH VỤ</div>
                        <div style={{ fontWeight: 'bold', fontSize: '12px', margin: '3px 0 2px 0' }}>• Chi tiết các lượt thanh toán:</div>
                        <table className="paper-payment-history-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '55px', textAlign: 'center' }}>Đợt</th>
                                    <th style={{ width: '130px', textAlign: 'center' }}>Thời gian</th>
                                    <th style={{ width: '105px', textAlign: 'right' }}>Số tiền</th>
                                    <th style={{ width: '95px', textAlign: 'center' }}>Hình thức</th>
                                    <th style={{ textAlign: 'left' }}>Nội dung</th>
                                </tr>
                            </thead>
                            <tbody>
                                {SAMPLE_CONTRACT_DATA.cacLuotThanhToan.map((p, idx) => (
                                    <tr key={idx}>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>Đợt {idx + 1}</td>
                                        <td style={{ textAlign: 'center' }}>{p.date}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>
                                            {p.amount.toLocaleString('vi-VN')} đ
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{p.method}</td>
                                        <td style={{ textAlign: 'left' }}>{p.noiDung}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <table className="paper-payment-summary-table" style={{ marginTop: '5px' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '25%', textAlign: 'center' }}>Tổng giá trị hợp đồng</th>
                                    <th style={{ width: '25%', textAlign: 'center' }}>Tổng tiền được giảm bớt</th>
                                    <th style={{ width: '25%', textAlign: 'center' }}>Đã thanh toán</th>
                                    <th style={{ width: '25%', textAlign: 'center' }}>Số tiền còn lại</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                                        {SAMPLE_CONTRACT_DATA.tongGiaTriFormatted}
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#16a34a', fontSize: '12px' }}>
                                        {SAMPLE_CONTRACT_DATA.tongGiamGiaFormatted}
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#0284c7', fontSize: '12px' }}>
                                        {SAMPLE_CONTRACT_DATA.daThanhToanFormatted}
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#dc2626', fontSize: '12px' }}>
                                        {SAMPLE_CONTRACT_DATA.conLaiFormatted}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* 6. Section IV: Điều khoản & Lưu ý (Click to edit) */}
                        <div
                            className={`paper-sec-title paper-edit-zone ${activeSection === 'terms' ? 'active-zone' : ''}`}
                            onClick={() => setActiveSection('terms')}
                            title="Nhấp để chỉnh sửa danh sách điều khoản"
                        >
                            IV. LƯU Ý & ĐIỀU KHOẢN HỢP ĐỒNG
                        </div>
                        <div
                            className={`paper-terms-block paper-edit-zone ${activeSection === 'terms' ? 'active-zone' : ''}`}
                            onClick={() => setActiveSection('terms')}
                        >
                            {(config.terms || []).map((term, index) => (
                                <div key={index} className="paper-term-item">
                                    <span style={{ fontWeight: 'bold' }}>- Điều {index + 1}:</span>
                                    <span>{renderPaperText(term)}</span>
                                </div>
                            ))}
                        </div>

                        {/* 7. Chữ ký 2 bên */}
                        <div
                            className={`paper-signatures-grid paper-edit-zone ${activeSection === 'signatures' ? 'active-zone' : ''}`}
                            onClick={() => setActiveSection('signatures')}
                            title="Nhấp để chỉnh sửa tiêu đề & ghi chú chữ ký"
                        >
                            <div className="paper-sig-column">
                                <div className="paper-sig-title">{renderPaperText(config.clientSignTitle, 'KHÁCH HÀNG')}</div>
                                <div className="paper-sig-guide">{renderPaperText(config.clientSignSubtitle, '(Ký và ghi rõ Họ và Tên)')}</div>
                                <div className="paper-sig-blank"></div>
                                <div className="paper-sig-name">{SAMPLE_CONTRACT_DATA.nameKH1}</div>
                            </div>
                            <div className="paper-sig-column">
                                <div className="paper-sig-title">{renderPaperText(config.studioSignTitle, 'ĐẠI DIỆN LONGWEDDING')}</div>
                                <div className="paper-sig-guide">{renderPaperText(config.studioSignSubtitle, '(Ký và ghi rõ Họ và Tên)')}</div>
                                <div className="paper-sig-blank"></div>
                                <div className="paper-sig-name">{renderPaperText(config.studioName, 'LONG WEDDING')}</div>
                            </div>
                        </div>

                        {/* 8. Lời cảm ơn chân trang (Footer Note) */}
                        {config.footerNote && (
                            <div
                                className={`paper-footer-note paper-edit-zone ${activeSection === 'signatures' ? 'active-zone' : ''}`}
                                onClick={() => setActiveSection('signatures')}
                                title="Nhấp để sửa lời cảm ơn chân trang"
                            >
                                {renderPaperText(config.footerNote)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. MENU POPOVER CHÈN THAM SỐ @ KHI BẤM NÚT "CHÈN THAM SỐ @" */}
            <Menu
                anchorEl={paramMenuAnchor}
                open={Boolean(paramMenuAnchor)}
                onClose={() => setParamMenuAnchor(null)}
                PaperProps={{
                    sx: {
                        width: 380,
                        maxHeight: 460,
                        borderRadius: 3,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        p: 1
                    }
                }}
            >
                <Box sx={{ p: 1, pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TagIcon sx={{ fontSize: 18, color: '#0284c7' }} />
                        Danh Sách Tham Số Động (@parameter)
                    </Typography>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Tìm kiếm tham số (tên, mô tả, từ khóa)..."
                        value={paramSearch}
                        onChange={(e) => setParamSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>

                <Box sx={{ maxHeight: 330, overflowY: 'auto', p: 0.5 }}>
                    {filteredParamCategories.map((cat, cIdx) => (
                        <Box key={cIdx} sx={{ mb: 1.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: cat.color || '#64748b', textTransform: 'uppercase', px: 1, display: 'block', mb: 0.5 }}>
                                {cat.category}
                            </Typography>
                            {cat.params.map((p) => (
                                <MenuItem
                                    key={p.key}
                                    onClick={() => handleInsertParam(p.key)}
                                    sx={{
                                        borderRadius: 2,
                                        py: 0.8,
                                        px: 1.2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: 0.3,
                                        '&:hover': { bgcolor: '#f0f9ff' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7', fontSize: '0.84rem' }}>
                                            {p.key}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>
                                            {p.label}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                                        {p.desc} • <em>VD: {p.sample}</em>
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Box>
                    ))}
                    {filteredParamCategories.length === 0 && (
                        <Box sx={{ p: 2, textAlign: 'center', color: '#94a3b8' }}>
                            Không tìm thấy tham số phù hợp với từ khóa!
                        </Box>
                    )}
                </Box>
            </Menu>
        </div>
    );
}
