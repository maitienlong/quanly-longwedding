import React, { useState, useEffect, useCallback } from 'react';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { toast } from 'sonner';
import { NumericFormat } from 'react-number-format';
import { useContractTypes } from '../../hooks/useContractTypes';
import './quanlyvoucher.css';

// Material UI components
import {
    Button,
    Dialog,
    DialogContent,
    Switch,
    Tooltip,
    Slider
} from '@mui/material';

function QuanLyVoucher() {
    const { showLoading, hideLoading } = useLoading();
    const { loaiHopDongOptions, getDichVuChinhLabel } = useContractTypes();

    const [vouchers, setVouchers] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        totalUsedCount: 0,
        totalDiscountAmount: 0,
        totalGeneratedCodes: 0
    });

    // Filters
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [discountTypeFilter, setDiscountTypeFilter] = useState('all');

    // Dialog Master State (Create / Edit / Codes / History in unified Dialog)
    const [openModal, setOpenModal] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState('settings'); // 'settings' | 'codes' | 'history'
    const [isEditing, setIsEditing] = useState(false);
    const [currentVoucherId, setCurrentVoucherId] = useState(null);
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    // Batch Codes State (inside Tab 2 of Master Dialog)
    const [generatedCodesList, setGeneratedCodesList] = useState([]);
    const [codesStats, setCodesStats] = useState({ total: 0, available: 0, claimed: 0, used: 0 });
    const [codesKeyword, setCodesKeyword] = useState('');
    const [codesStatusFilter, setCodesStatusFilter] = useState('all');
    const [isGenerating, setIsGenerating] = useState(false);
    const [genQuantity, setGenQuantity] = useState(50);
    const [genPrefix, setGenPrefix] = useState('');
    const [genLength, setGenLength] = useState(4);
    const [autoIncreaseLimit, setAutoIncreaseLimit] = useState(true);
    const [copiedSubCode, setCopiedSubCode] = useState('');

    // Form Data State (inside Tab 1 of Master Dialog)
    const [code, setCode] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState(0); // 0: VNĐ, 1: %
    const [discountValue, setDiscountValue] = useState(0);
    const [maxDiscount, setMaxDiscount] = useState(0);
    const [minOrderValue, setMinOrderValue] = useState(0);
    const [usageLimitPerCustomer, setUsageLimitPerCustomer] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [applicableContractTypes, setApplicableContractTypes] = useState([]);
    const [winningRate, setWinningRate] = useState(50); // Tỷ lệ bốc thăm trúng thưởng (0 - 100%)

    // Copied feedback state
    const [copiedCode, setCopiedCode] = useState('');

    const fetchVouchers = useCallback(() => {
        showLoading();
        otherService.findAllVouchers({
            keyword: keyword.trim(),
            status: statusFilter,
            discountType: discountTypeFilter
        })
            .then((res) => {
                if (res?.data?.vouchers || res?.vouchers) {
                    const list = res.data?.vouchers || res.vouchers || [];
                    setVouchers(list);
                    if (res?.data?.stats || res?.stats) {
                        setStats(res.data?.stats || res.stats);
                    }
                } else if (Array.isArray(res?.data)) {
                    setVouchers(res.data);
                }
            })
            .catch((err) => {
                console.error("Lỗi khi tải danh sách voucher:", err);
                toast.error("Không thể tải danh sách voucher");
            })
            .finally(() => {
                hideLoading();
            });
    }, [keyword, statusFilter, discountTypeFilter, showLoading, hideLoading]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchVouchers();
        }, 250);
        return () => clearTimeout(debounceTimer);
    }, [fetchVouchers]);

    // Tạo mã ngẫu nhiên
    const generateRandomCode = () => {
        const prefix = "LONG";
        const year = new Date().getFullYear().toString().slice(-2);
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let randomStr = "";
        for (let i = 0; i < 4; i++) {
            randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(`${prefix}${year}-${randomStr}`);
    };

    const handleCopyCode = (voucherCode) => {
        navigator.clipboard.writeText(voucherCode);
        setCopiedCode(voucherCode);
        toast.success(`Đã sao chép mã "${voucherCode}" vào clipboard!`);
        setTimeout(() => {
            setCopiedCode('');
        }, 2000);
    };

    const handleCopySubCode = (codeStr) => {
        navigator.clipboard.writeText(codeStr);
        setCopiedSubCode(codeStr);
        toast.success(`Đã sao chép mã "${codeStr}"!`);
        setTimeout(() => {
            setCopiedSubCode('');
        }, 2000);
    };

    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setCurrentVoucherId(null);
        setSelectedVoucher(null);
        setActiveModalTab('settings');
        setCode('');
        setTitle('');
        setDescription('');
        setDiscountType(0);
        setDiscountValue(0);
        setMaxDiscount(0);
        setMinOrderValue(0);
        setUsageLimitPerCustomer(1);
        setStartDate('');
        setEndDate('');
        setIsActive(true);
        setApplicableContractTypes([]);
        setWinningRate(50);
        setGeneratedCodesList([]);
        generateRandomCode();
        setOpenModal(true);
    };

    const handleOpenEditModal = (v, defaultTab = 'settings') => {
        setIsEditing(true);
        setCurrentVoucherId(v._id);
        setSelectedVoucher(v);
        setActiveModalTab(defaultTab);
        setCode(v.code || '');
        setTitle(v.title || '');
        setDescription(v.description || '');
        setDiscountType(v.discountType || 0);
        setDiscountValue(v.discountValue || 0);
        setMaxDiscount(v.maxDiscount || 0);
        setMinOrderValue(v.minOrderValue || 0);
        setUsageLimitPerCustomer(v.usageLimitPerCustomer || 1);
        setStartDate(v.startDate ? v.startDate.slice(0, 10) : '');
        setEndDate(v.endDate ? v.endDate.slice(0, 10) : '');
        setIsActive(v.isActive !== undefined ? v.isActive : true);
        setApplicableContractTypes(v.applicableContractTypes || []);
        setWinningRate(v.winningRate !== undefined ? Number(v.winningRate) : 50);

        // Chuẩn bị dữ liệu mã con
        setGenPrefix(v.code || '');
        setGenQuantity(50);
        setCodesKeyword('');
        setCodesStatusFilter('all');
        loadGeneratedCodes(v._id, 'all', '');

        setOpenModal(true);
    };

    const loadGeneratedCodes = (voucherId, status = 'all', kw = '') => {
        if (!voucherId) return;
        otherService.getGeneratedCodes(voucherId, { status, keyword: kw })
            .then((res) => {
                if (res?.data?.codes) {
                    setGeneratedCodesList(res.data.codes || []);
                    if (res?.data?.stats) {
                        setCodesStats(res.data.stats);
                    }
                } else if (Array.isArray(res?.data)) {
                    setGeneratedCodesList(res.data);
                }
            })
            .catch((err) => {
                console.error("Lỗi tải danh sách mã code con:", err);
                toast.error("Không thể tải danh sách mã con");
            });
    };

    const handleGenerateBatch = () => {
        const targetId = currentVoucherId || selectedVoucher?._id;
        if (!targetId) return;
        const q = Number(genQuantity);
        if (q <= 0) {
            toast.warning("Vui lòng nhập số lượng mã cần sinh lớn hơn 0!");
            return;
        }

        setIsGenerating(true);
        otherService.generateBatchCodes(targetId, {
            quantity: q,
            prefix: genPrefix.trim().toUpperCase() || code || selectedVoucher?.code,
            codeLength: Number(genLength) || 4,
            autoIncreaseLimit
        })
            .then((res) => {
                const count = res?.data?.generatedCount || q;
                toast.success(`🎉 Đã sinh thành công ${count} mã code độc nhất!`);
                loadGeneratedCodes(targetId, codesStatusFilter, codesKeyword);
                fetchVouchers();
            })
            .catch((err) => {
                console.error("Lỗi sinh mã:", err);
                toast.error(err?.response?.data?.message || "Lỗi khi sinh mã code");
            })
            .finally(() => {
                setIsGenerating(false);
            });
    };

    const handleDeleteSubCode = (codeId, codeText) => {
        const targetId = currentVoucherId || selectedVoucher?._id;
        if (!targetId) return;
        if (!window.confirm(`Bạn có chắc muốn xóa mã code "${codeText}"?`)) return;

        otherService.deleteGeneratedCode(targetId, codeId)
            .then(() => {
                toast.success(`Đã xóa mã "${codeText}"`);
                loadGeneratedCodes(targetId, codesStatusFilter, codesKeyword);
                fetchVouchers();
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Không thể xóa mã code này");
            });
    };

    const handleCopyAllSubCodes = () => {
        if (generatedCodesList.length === 0) {
            toast.warning("Không có mã nào để sao chép!");
            return;
        }
        const text = generatedCodesList.map(c => c.code).join('\n');
        navigator.clipboard.writeText(text);
        toast.success(`Đã sao chép tất cả ${generatedCodesList.length} mã code vào clipboard!`);
    };

    const handleExportCodes = () => {
        if (generatedCodesList.length === 0) {
            toast.warning("Không có dữ liệu để xuất!");
            return;
        }
        let csv = "STT,Mã Code,Trạng Thái,Khách Hàng Nhận,Số Điện Thoại,Ngày Nhận,Hợp Đồng Đã Dùng\n";
        generatedCodesList.forEach((c, idx) => {
            const statusStr = c.isUsed ? "Đã dùng" : (c.isClaimed ? "Đã cấp cho khách" : "Khả dụng");
            const claimedAtStr = c.claimedAt ? new Date(c.claimedAt).toLocaleString('vi-VN') : "";
            csv += `"${idx + 1}","${c.code}","${statusStr}","${c.claimedName || ''}","${c.claimedPhone || ''}","${claimedAtStr}","${c.usedContract || ''}"\n`;
        });

        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Danh_sach_ma_${code || selectedVoucher?.code || 'voucher'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Đã tải xuống file CSV danh sách mã code!");
    };

    const handleToggleStatus = (id, currentStatus, voucherCode) => {
        otherService.toggleVoucherStatus(id)
            .then(() => {
                toast.success(`Đã ${!currentStatus ? 'kích hoạt' : 'tạm dừng'} mã "${voucherCode}"`);
                fetchVouchers();
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái voucher");
            });
    };

    const handleDeleteVoucher = (v) => {
        if (v.usedCount > 0) {
            toast.warning(`Mã "${v.code}" đã có ${v.usedCount} lượt sử dụng. Để bảo toàn lịch sử hóa đơn, vui lòng tắt trạng thái hoạt động thay vì xóa!`);
            return;
        }

        if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn mã Voucher "${v.code}"?`)) {
            showLoading();
            otherService.removeVoucher(v._id)
                .then(() => {
                    toast.success(`Đã xóa voucher "${v.code}" thành công`);
                    fetchVouchers();
                })
                .catch((err) => {
                    toast.error(err?.response?.data?.message || "Không thể xóa voucher");
                })
                .finally(() => hideLoading());
        }
    };

    const handleSaveVoucher = (e) => {
        e.preventDefault();

        if (!code.trim()) {
            toast.warning("Vui lòng nhập mã Voucher!");
            return;
        }
        if (!title.trim()) {
            toast.warning("Vui lòng nhập tên chương trình ưu đãi!");
            return;
        }
        if (Number(discountValue) <= 0) {
            toast.warning("Vui lòng nhập mức giảm giá lớn hơn 0!");
            return;
        }
        if (discountType === 1 && Number(discountValue) > 100) {
            toast.warning("Giảm giá theo % không thể vượt quá 100%!");
            return;
        }
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            toast.warning("Ngày bắt đầu không thể sau ngày kết thúc!");
            return;
        }

        const payload = {
            code: code.trim().toUpperCase(),
            title: title.trim(),
            description: description.trim(),
            discountType: Number(discountType),
            discountValue: Number(discountValue),
            maxDiscount: discountType === 1 ? Number(maxDiscount) || 0 : 0,
            minOrderValue: Number(minOrderValue) || 0,
            usageLimit: null,
            usageLimitPerCustomer: Number(usageLimitPerCustomer) || 1,
            startDate: startDate || null,
            endDate: endDate || null,
            isActive,
            applicableContractTypes,
            winningRate: Math.max(0, Math.min(100, Number(winningRate) || 0))
        };

        showLoading();
        const apiCall = isEditing
            ? otherService.updateVoucher(currentVoucherId, payload)
            : otherService.createVoucher(payload);

        apiCall
            .then(() => {
                toast.success(isEditing ? `Đã cập nhật voucher "${payload.code}"` : `Đã tạo voucher "${payload.code}" thành công`);
                setOpenModal(false);
                fetchVouchers();
            })
            .catch((err) => {
                console.error("Lỗi lưu voucher:", err);
                toast.error(err?.response?.data?.message || "Đã xảy ra lỗi khi lưu voucher");
            })
            .finally(() => {
                hideLoading();
            });
    };

    const getVoucherStatusInfo = (v) => {
        if (!v.isActive) {
            return { label: 'Tạm dừng', class: 'status-inactive' };
        }
        const now = new Date();
        if (v.endDate && new Date(v.endDate) < now) {
            return { label: 'Hết hạn', class: 'status-expired' };
        }
        if (v.usageLimit && v.usageLimit > 0 && v.usedCount >= v.usageLimit) {
            return { label: 'Hết lượt', class: 'status-exhausted' };
        }
        if (v.startDate && new Date(v.startDate) > now) {
            return { label: 'Sắp diễn ra', class: 'status-upcoming' };
        }
        return { label: 'Đang áp dụng', class: 'status-active' };
    };

    return (
        <div className="quan-ly-voucher-container">
            {/* 1. HEADER & ACTIONS */}
            <div className="voucher-header-wrap">
                <div className="voucher-header-left">
                    <div className="header-icon-box">
                        <i className="fa-solid fa-ticket"></i>
                    </div>
                    <div>
                        <h2 className="voucher-page-title">Quản Lý Voucher & Mã Khuyến Mãi</h2>
                        <p className="voucher-page-sub">
                            Cấu hình các chương trình ưu đãi, tạo mã hàng loạt & tỷ lệ bốc trúng thưởng trên website
                        </p>
                    </div>
                </div>

                <div className="voucher-header-right">
                    <button className="btn-create-voucher" onClick={handleOpenCreateModal}>
                        <i className="fa-solid fa-plus"></i>
                        <span>Tạo Chương Trình / Voucher Mới</span>
                    </button>
                </div>
            </div>

            {/* 2. STATS OVERVIEW CARDS */}
            <div className="voucher-stats-grid">
                <div className="voucher-stat-card card-total">
                    <div className="stat-icon-wrap">
                        <i className="fa-solid fa-tags"></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Tổng Chương Trình</span>
                        <div className="stat-value">{stats.total}</div>
                        <span className="stat-desc">{stats.active} chương trình đang kích hoạt</span>
                    </div>
                </div>

                <div className="voucher-stat-card card-active">
                    <div className="stat-icon-wrap">
                        <i className="fa-solid fa-layer-group"></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Tổng Mã Con Đã Sinh</span>
                        <div className="stat-value">{stats.totalGeneratedCodes || 0}</div>
                        <span className="stat-desc">Mã code con độc nhất trong các chương trình</span>
                    </div>
                </div>

                <div className="voucher-stat-card card-used">
                    <div className="stat-icon-wrap">
                        <i className="fa-solid fa-receipt"></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Lượt Đã Sử Dụng</span>
                        <div className="stat-value">{stats.totalUsedCount}</div>
                        <span className="stat-desc">Áp dụng thành công vào hợp đồng</span>
                    </div>
                </div>

                <div className="voucher-stat-card card-amount">
                    <div className="stat-icon-wrap">
                        <i className="fa-solid fa-hand-holding-dollar"></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Tổng Tiền Đã Giảm</span>
                        <div className="stat-value">
                            {stats.totalDiscountAmount >= 1000000 
                                ? `${(stats.totalDiscountAmount / 1000000).toFixed(1)} Tr` 
                                : `${stats.totalDiscountAmount.toLocaleString('vi-VN')} đ`}
                        </div>
                        <span className="stat-desc">Doanh thu tri ân cho khách hàng</span>
                    </div>
                </div>
            </div>

            {/* 3. FILTER BAR */}
            <div className="voucher-filter-card">
                <div className="filter-search-box">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã code, tên chương trình..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    {keyword && (
                        <button className="clear-search-btn" onClick={() => setKeyword('')}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}
                </div>

                <div className="filter-group">
                    <label>Trạng Thái:</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang áp dụng</option>
                        <option value="inactive">Tạm dừng</option>
                        <option value="expired">Đã hết hạn</option>
                        <option value="exhausted">Đã hết lượt dùng</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Loại Giảm:</label>
                    <select value={discountTypeFilter} onChange={(e) => setDiscountTypeFilter(e.target.value)}>
                        <option value="all">Tất cả hình thức</option>
                        <option value="0">Tiền mặt (VNĐ)</option>
                        <option value="1">Phần trăm (%)</option>
                    </select>
                </div>
            </div>

            {/* 4. DATA TABLE */}
            <div className="voucher-table-wrapper">
                {vouchers.length > 0 ? (
                    <table className="voucher-table">
                        <thead>
                            <tr>
                                <th>Mã Chương Trình</th>
                                <th>Chương Trình & Ưu Đãi</th>
                                <th>Mức Giảm</th>
                                <th style={{ textAlign: 'center' }}>Tỷ Lệ Bốc Trúng</th>
                                <th>Điều Kiện Áp Dụng</th>
                                <th>Thời Gian Hiệu Lực</th>
                                <th>Lượt Dùng</th>
                                <th>Trạng Thái</th>
                                <th style={{ textAlign: 'center' }}>Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.map((v) => {
                                const statusInfo = getVoucherStatusInfo(v);
                                const isPercent = Number(v.discountType) === 1;
                                const rate = v.winningRate !== undefined ? Number(v.winningRate) : 50;
                                const subCodesCount = Array.isArray(v.generatedCodes) ? v.generatedCodes.length : 0;

                                return (
                                    <tr 
                                        key={v._id} 
                                        className="voucher-row-clickable"
                                        onClick={() => handleOpenEditModal(v, 'settings')}
                                        title="Nhấn để mở xem chi tiết & quản lý toàn bộ tính năng của chương trình"
                                    >
                                        {/* Mã Code (Đã bỏ badge mã con bên dưới) */}
                                        <td>
                                            <div className="voucher-code-badge">
                                                <span>{v.code}</span>
                                                <button
                                                    className="copy-btn"
                                                    title="Sao chép mã gốc"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyCode(v.code);
                                                    }}
                                                >
                                                    <i className={`fa-regular ${copiedCode === v.code ? 'fa-circle-check' : 'fa-copy'}`}></i>
                                                </button>
                                            </div>
                                        </td>

                                        {/* Tên & Mô tả */}
                                        <td>
                                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{v.title}</div>
                                            {v.description && (
                                                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', maxWidth: '260px' }}>
                                                    {v.description}
                                                </div>
                                            )}
                                        </td>

                                        {/* Mức Giảm */}
                                        <td>
                                            <div className={`voucher-discount-tag ${isPercent ? 'tag-percent' : 'tag-fixed'}`}>
                                                <i className={`fa-solid ${isPercent ? 'fa-percent' : 'fa-money-bill-wave'}`}></i>
                                                {isPercent ? `${v.discountValue}%` : `${v.discountValue?.toLocaleString('vi-VN')} đ`}
                                            </div>
                                            {isPercent && v.maxDiscount > 0 && (
                                                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                                                    Tối đa: {v.maxDiscount.toLocaleString('vi-VN')} đ
                                                </div>
                                            )}
                                        </td>

                                        {/* Tỷ Lệ Bốc Trúng */}
                                        <td align="center">
                                            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                <div className={`lucky-rate-pill ${rate === 0 ? 'rate-off' : rate > 60 ? 'rate-high' : rate <= 20 ? 'rate-low' : 'rate-med'}`}>
                                                    <span>🎲 {rate}%</span>
                                                    <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                                                        ({rate === 0 ? 'Tắt' : rate > 60 ? 'Cao' : rate <= 20 ? 'Thấp' : 'Vừa'})
                                                    </span>
                                                </div>
                                                {rate > 0 && (
                                                    <div style={{ width: '65px', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${rate}%`,
                                                            height: '100%',
                                                            backgroundColor: rate > 60 ? '#16a34a' : rate <= 20 ? '#ef4444' : '#f59e0b',
                                                            borderRadius: '2px'
                                                        }}></div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Điều Kiện & Loại Hợp Đồng */}
                                        <td>
                                            {v.minOrderValue > 0 ? (
                                                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                                                    Đơn từ: <span style={{ color: '#d97706' }}>{v.minOrderValue.toLocaleString('vi-VN')} đ</span>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Không giới hạn đơn</span>
                                            )}

                                            <div className="contract-type-tag-wrap">
                                                {Array.isArray(v.applicableContractTypes) && v.applicableContractTypes.length > 0 ? (
                                                    v.applicableContractTypes.length <= 2 ? (
                                                        v.applicableContractTypes.map(id => (
                                                            <span key={id} className="contract-type-pill specific">
                                                                <i className="fa-solid fa-file-contract"></i>
                                                                {getDichVuChinhLabel(id)}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <Tooltip
                                                            title={
                                                                <div style={{ padding: '4px 6px', fontSize: '0.78rem' }}>
                                                                    <div style={{ fontWeight: 700, marginBottom: '4px', color: '#fef3c7' }}>
                                                                        Áp dụng cho các loại hợp đồng:
                                                                    </div>
                                                                    {v.applicableContractTypes.map(id => (
                                                                        <div key={id} style={{ margin: '2px 0' }}>• {getDichVuChinhLabel(id)}</div>
                                                                    ))}
                                                                </div>
                                                            }
                                                            arrow
                                                        >
                                                            <span className="contract-type-pill specific" style={{ cursor: 'pointer' }}>
                                                                <i className="fa-solid fa-file-contract"></i>
                                                                {v.applicableContractTypes.length} loại HĐ <i className="fa-solid fa-circle-info" style={{ fontSize: '0.68rem', marginLeft: '2px' }}></i>
                                                            </span>
                                                        </Tooltip>
                                                    )
                                                ) : (
                                                    <span className="contract-type-pill all" title="Áp dụng cho mọi loại dịch vụ và hợp đồng">
                                                        <i className="fa-solid fa-globe"></i> Tất cả loại HĐ
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Thời Gian */}
                                        <td>
                                            <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                                                {v.startDate ? new Date(v.startDate).toLocaleDateString('vi-VN') : 'Từ nay'}
                                                {' → '}
                                                {v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                                            </div>
                                        </td>

                                        {/* Lượt Dùng: Bấm vào mở Tab Lịch Sử Dùng / Mã Con trong Dialog */}
                                        <td 
                                            className="voucher-usage-td"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenEditModal(v, subCodesCount > 0 ? 'codes' : 'history');
                                            }}
                                            title="Nhấn để xem chi tiết mã con & lịch sử sử dụng trên Dialog"
                                        >
                                            <div className="voucher-usage-progress-wrap hover-highlight">
                                                {subCodesCount > 0 ? (
                                                    <>
                                                        <div className="voucher-usage-text">
                                                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                                                                {v.usedCount || 0}
                                                            </span>
                                                            <span style={{ color: '#64748b', fontWeight: 600 }}>
                                                                / {subCodesCount} mã
                                                            </span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', margin: '4px 0' }}>
                                                            <div style={{
                                                                width: `${Math.min(100, Math.round(((v.usedCount || 0) / subCodesCount) * 100))}%`,
                                                                height: '100%',
                                                                backgroundColor: ((v.usedCount || 0) >= subCodesCount) ? '#ef4444' : (((v.usedCount || 0) / subCodesCount) >= 0.7) ? '#f59e0b' : '#3b82f6',
                                                                borderRadius: '3px'
                                                            }} />
                                                        </div>
                                                        <div style={{ fontSize: '0.72rem', color: ((v.usedCount || 0) >= subCodesCount) ? '#ef4444' : '#64748b', fontWeight: 600 }}>
                                                            {((v.usedCount || 0) >= subCodesCount) ? 'Đã dùng hết mã' : `Còn lại ${Math.max(0, subCodesCount - (v.usedCount || 0))} mã`}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="voucher-usage-text">
                                                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>{v.usedCount || 0}</span>
                                                            <span style={{ color: '#64748b' }}>lượt dùng</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                                                            Mã dùng chung (∞)
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>

                                        {/* Trạng Thái & Switch */}
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                                                <span className={`voucher-status-pill ${statusInfo.class}`}>
                                                    <span className="status-dot"></span>
                                                    {statusInfo.label}
                                                </span>
                                                <Switch
                                                    size="small"
                                                    checked={Boolean(v.isActive)}
                                                    onChange={() => handleToggleStatus(v._id, v.isActive, v.code)}
                                                    color="warning"
                                                />
                                            </div>
                                        </td>

                                        {/* Thao Tác (Đã bỏ nút sinh mã con & nút xem lịch sử) */}
                                        <td>
                                            <div className="voucher-actions" style={{ justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                                                <Tooltip title="Chỉnh sửa & Xem toàn bộ chi tiết">
                                                    <button
                                                        className="btn-action-icon btn-edit"
                                                        onClick={() => handleOpenEditModal(v, 'settings')}
                                                    >
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Xóa voucher">
                                                    <button
                                                        className="btn-action-icon btn-delete"
                                                        onClick={() => handleDeleteVoucher(v)}
                                                    >
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="voucher-empty-state">
                        <div className="voucher-empty-icon">
                            <i className="fa-solid fa-ticket-simple"></i>
                        </div>
                        <h3>Chưa có mã Voucher nào</h3>
                        <p>Bấm nút "Tạo Chương Trình / Voucher Mới" ở góc trên để phát hành mã khuyến mãi đầu tiên.</p>
                    </div>
                )}
            </div>

            {/* 5. MASTER DIALOG (TẬP HỢP TẤT CẢ CHỨC NĂNG VÀO 1 DIALOG VỚI 3 TAB) */}
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                maxWidth="lg"
                fullWidth
                scroll="paper"
                PaperProps={{
                    className: 'voucher-modal-paper'
                }}
            >
                <form onSubmit={handleSaveVoucher} className="voucher-modal-form">
                    {/* Master Dialog Header */}
                    <div className="voucher-modal-header">
                        <div className="modal-header-top">
                            <div className="modal-header-left">
                                <div className="modal-header-icon">
                                    <i className={`fa-solid ${isEditing ? 'fa-ticket' : 'fa-wand-magic-sparkles'}`}></i>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        <h3 className="modal-header-title">
                                            {isEditing ? (title || code || 'Chỉnh Sửa Chương Trình') : 'Tạo Chương Trình Ưu Đãi Mới'}
                                        </h3>
                                        {isEditing && code && (
                                            <span className="voucher-code-badge" style={{ fontSize: '0.82rem', padding: '3px 8px' }}>
                                                {code}
                                            </span>
                                        )}
                                    </div>
                                    <p className="modal-header-sub">
                                        {isEditing 
                                            ? 'Cấu hình chi tiết mã khuyến mãi, sinh mã độc nhất & kiểm tra lịch sử sử dụng'
                                            : 'Thiết lập mã khuyến mãi, mức chiết khấu & điều kiện áp dụng cho khách hàng'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setOpenModal(false)}
                                title="Đóng cửa sổ"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        {/* Navigation Tabs Bar Inside Dialog Header */}
                        {isEditing && (
                            <div className="modal-nav-tabs">
                                <button
                                    type="button"
                                    className={`modal-nav-tab ${activeModalTab === 'settings' ? 'active' : ''}`}
                                    onClick={() => setActiveModalTab('settings')}
                                >
                                    <i className="fa-solid fa-sliders"></i>
                                    <span>Cấu Hình & Ưu Đãi</span>
                                </button>

                                <button
                                    type="button"
                                    className={`modal-nav-tab ${activeModalTab === 'codes' ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveModalTab('codes');
                                        if (currentVoucherId) {
                                            loadGeneratedCodes(currentVoucherId, codesStatusFilter, codesKeyword);
                                        }
                                    }}
                                >
                                    <i className="fa-solid fa-layer-group"></i>
                                    <span>Kho Mã Con & Sinh Mã</span>
                                    <span className="tab-count-badge">
                                        {codesStats.total || (Array.isArray(selectedVoucher?.generatedCodes) ? selectedVoucher.generatedCodes.length : 0)}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={`modal-nav-tab ${activeModalTab === 'history' ? 'active' : ''}`}
                                    onClick={() => setActiveModalTab('history')}
                                >
                                    <i className="fa-solid fa-clock-rotate-left"></i>
                                    <span>Lịch Sử Sử Dụng</span>
                                    <span className="tab-count-badge">
                                        {selectedVoucher?.usedCount || (Array.isArray(selectedVoucher?.usageHistory) ? selectedVoucher.usageHistory.length : 0)}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Master Dialog Body */}
                    <DialogContent dividers className="voucher-modal-body">
                        
                        {/* ===================================================
                            TAB 1: CẤU HÌNH CHƯƠNG TRÌNH & MỨC GIẢM GIÁ 
                        =================================================== */}
                        {activeModalTab === 'settings' && (
                            <div className="modal-sections-wrap">

                                {/* 1. THÔNG TIN CƠ BẢN */}
                                <div className="modal-bento-section">
                                    <div className="modal-section-title">
                                        <div className="modal-section-title-left">
                                            <span className="modal-section-title-icon">🏷️</span>
                                            <span>1. Thông Tin Chương Trình</span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                                            Các trường có dấu <span style={{ color: '#ef4444' }}>*</span> là bắt buộc
                                        </span>
                                    </div>

                                    <div className="voucher-form-grid">
                                        {/* Mã Voucher & Nút Tự Tạo */}
                                        <div className="voucher-form-group">
                                            <label>
                                                Mã Voucher Gốc / Tiền Tố <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <div className="code-input-wrap">
                                                <input
                                                    type="text"
                                                    className="voucher-form-input"
                                                    placeholder="VD: LONG2026-500K"
                                                    value={code}
                                                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                                                    style={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em', color: '#92400e', background: '#fffdfa' }}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="btn-random-code"
                                                    onClick={generateRandomCode}
                                                    title="Tự động tạo mã ngẫu nhiên"
                                                >
                                                    <span>🎲</span> Tự tạo
                                                </button>
                                            </div>
                                            <span className="input-hint">Mã viết liền không dấu, dùng để phát hành cho khách.</span>
                                        </div>

                                        {/* Tên Chương Trình */}
                                        <div className="voucher-form-group">
                                            <label>
                                                Tên Chương Trình Ưu Đãi <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="voucher-form-input"
                                                placeholder="VD: Ưu đãi mùa cưới 2026 - Giảm 500K"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                required
                                            />
                                            <span className="input-hint">Tên chương trình hiển thị trong quản trị & website.</span>
                                        </div>

                                        {/* Mô tả chi tiết */}
                                        <div className="voucher-form-group full-width">
                                            <label>Mô Tả Chi Tiết & Thể Lệ Áp Dụng</label>
                                            <textarea
                                                className="voucher-form-textarea"
                                                placeholder="VD: Ưu đãi đặc biệt dành cho khách hàng ký hợp đồng trọn gói trong tháng 10..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. CẤU HÌNH MỨC GIẢM GIÁ */}
                                <div className="modal-bento-section">
                                    <div className="modal-section-title">
                                        <div className="modal-section-title-left">
                                            <span className="modal-section-title-icon">💰</span>
                                            <span>2. Hình Thức & Mức Giảm Giá</span>
                                        </div>
                                    </div>

                                    {/* Selector 2 Card */}
                                    <div className="discount-type-selector-grid">
                                        <div
                                            className={`discount-select-card ${discountType === 0 ? 'active type-fixed' : ''}`}
                                            onClick={() => setDiscountType(0)}
                                        >
                                            <div className="discount-select-icon">
                                                <i className="fa-solid fa-money-bill-wave"></i>
                                            </div>
                                            <div>
                                                <div className="discount-select-title">Giảm Tiền Mặt (VNĐ)</div>
                                                <div className="discount-select-sub">Trừ thẳng một số tiền cố định vào hợp đồng</div>
                                            </div>
                                        </div>

                                        <div
                                            className={`discount-select-card ${discountType === 1 ? 'active type-percent' : ''}`}
                                            onClick={() => setDiscountType(1)}
                                        >
                                            <div className="discount-select-icon">
                                                <i className="fa-solid fa-percent"></i>
                                            </div>
                                            <div>
                                                <div className="discount-select-title">Giảm Theo Phần Trăm (%)</div>
                                                <div className="discount-select-sub">Chiết khấu % giá trị hợp đồng (có thể kèm mức tối đa)</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="voucher-form-grid">
                                        {/* Giá trị giảm */}
                                        <div className="voucher-form-group">
                                            <label>
                                                {discountType === 0 ? 'Số Tiền Giảm (VNĐ)' : 'Tỷ Lệ Chiết Khấu (%)'} <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            {discountType === 0 ? (
                                                <NumericFormat
                                                    className="voucher-form-input"
                                                    placeholder="VD: 500,000"
                                                    value={discountValue || ''}
                                                    thousandSeparator=","
                                                    suffix=" đ"
                                                    onValueChange={(values) => setDiscountValue(values.floatValue || 0)}
                                                    style={{ fontWeight: 800, fontSize: '0.95rem', color: '#059669' }}
                                                    required
                                                />
                                            ) : (
                                                <input
                                                    type="number"
                                                    className="voucher-form-input"
                                                    placeholder="VD: 10"
                                                    value={discountValue || ''}
                                                    min={1}
                                                    max={100}
                                                    onChange={(e) => setDiscountValue(e.target.value)}
                                                    style={{ fontWeight: 800, fontSize: '0.95rem', color: '#7c3aed' }}
                                                    required
                                                />
                                            )}
                                            <span className="input-hint">
                                                {discountType === 0 ? 'Số tiền thực tế được trừ vào hợp đồng' : 'Nhập từ 1% đến 100%'}
                                            </span>
                                        </div>

                                        {/* Giảm tối đa nếu là % */}
                                        {discountType === 1 && (
                                            <div className="voucher-form-group">
                                                <label>
                                                    Mức Giảm Tối Đa (VNĐ) <span className="input-hint" style={{ margin: 0 }}>(0 = Không giới hạn)</span>
                                                </label>
                                                <NumericFormat
                                                    className="voucher-form-input"
                                                    placeholder="VD: 1,000,000 đ"
                                                    value={maxDiscount || ''}
                                                    thousandSeparator=","
                                                    suffix=" đ"
                                                    onValueChange={(values) => setMaxDiscount(values.floatValue || 0)}
                                                    style={{ fontWeight: 700 }}
                                                />
                                                <span className="input-hint">Hạn mức tối đa được giảm khi tính %</span>
                                            </div>
                                        )}

                                        {/* Đơn hàng tối thiểu */}
                                        <div className="voucher-form-group">
                                            <label>
                                                Đơn Hàng Tối Thiểu (VNĐ) <span className="input-hint" style={{ margin: 0 }}>(0 = Áp dụng mọi đơn)</span>
                                            </label>
                                            <NumericFormat
                                                className="voucher-form-input"
                                                placeholder="VD: 3,000,000 đ"
                                                value={minOrderValue || ''}
                                                thousandSeparator=","
                                                suffix=" đ"
                                                onValueChange={(values) => setMinOrderValue(values.floatValue || 0)}
                                                style={{ fontWeight: 700 }}
                                            />
                                            <span className="input-hint">Hợp đồng phải đạt giá trị này mới được dùng voucher</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. TỶ LỆ BỐC TRÚNG & THỜI GIAN */}
                                <div className="modal-bento-section">
                                    <div className="modal-section-title">
                                        <div className="modal-section-title-left">
                                            <span className="modal-section-title-icon">🎲</span>
                                            <span>3. Tỷ Lệ Bốc Thăm & Thời Gian Hiệu Lực</span>
                                        </div>
                                    </div>

                                    {/* Thanh Trượt Tỷ Lệ Bốc Trúng */}
                                    <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ margin: 0, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span>🎁</span> Tỷ Lệ Bốc Trúng Thưởng Trên Website:
                                            </label>
                                            <div className={`lucky-rate-pill ${winningRate === 0 ? 'rate-off' : winningRate > 60 ? 'rate-high' : winningRate <= 20 ? 'rate-low' : 'rate-med'}`}>
                                                <span>🎲 {winningRate}%</span>
                                                <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                                                    {winningRate === 0 ? '(Tắt trúng)' : winningRate > 60 ? '(Tỷ lệ Cao)' : winningRate <= 20 ? '(Tỷ lệ Thấp)' : '(Tỷ lệ Vừa)'}
                                                </span>
                                            </div>
                                        </div>
                                        <Slider
                                            value={winningRate}
                                            onChange={(e, val) => setWinningRate(val)}
                                            min={0}
                                            max={100}
                                            step={5}
                                            marks={[
                                                { value: 0, label: '0% (Tắt)' },
                                                { value: 20, label: '20% (Thấp)' },
                                                { value: 50, label: '50% (Vừa)' },
                                                { value: 80, label: '80% (Cao)' },
                                                { value: 100, label: '100%' }
                                            ]}
                                            valueLabelDisplay="auto"
                                            color="warning"
                                        />
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                                            💡 <em>Xác suất để khách hàng nhận được mã này khi tham gia Vòng quay / Mở quà tri ân trên website.</em>
                                        </div>
                                    </div>

                                    <div className="voucher-form-grid">
                                        {/* Lượt dùng mỗi khách */}
                                        <div className="voucher-form-group">
                                            <label>Lượt Dùng Tối Đa Cho Mỗi Khách Hàng (SĐT)</label>
                                            <input
                                                type="number"
                                                className="voucher-form-input"
                                                placeholder="VD: 1"
                                                value={usageLimitPerCustomer}
                                                min={1}
                                                onChange={(e) => setUsageLimitPerCustomer(e.target.value)}
                                                style={{ fontWeight: 700 }}
                                            />
                                            <span className="input-hint">Mỗi số điện thoại khách hàng được áp dụng tối đa bao nhiêu lần</span>
                                        </div>

                                        {/* Thời Gian Bắt Đầu - Kết Thúc */}
                                        <div className="voucher-form-group">
                                            <label>Thời Gian Hiệu Lực (Từ ngày → Đến ngày)</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <input
                                                    type="date"
                                                    className="voucher-form-input"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    title="Ngày bắt đầu"
                                                />
                                                <input
                                                    type="date"
                                                    className="voucher-form-input"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    title="Ngày hết hạn"
                                                />
                                            </div>
                                            <span className="input-hint">Để trống ngày hết hạn nếu áp dụng vô thời hạn</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. PHẠM VI HỢP ĐỒNG ÁP DỤNG */}
                                <div className="modal-bento-section">
                                    <div className="modal-section-title">
                                        <div className="modal-section-title-left">
                                            <span className="modal-section-title-icon">📑</span>
                                            <span>4. Phạm Vi Loại Hợp Đồng Áp Dụng</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                className="contract-quick-btn"
                                                onClick={() => setApplicableContractTypes(loaiHopDongOptions.map(opt => opt.id))}
                                            >
                                                ✓ Chọn tất cả
                                            </button>
                                            <span style={{ color: '#cbd5e1' }}>|</span>
                                            <button
                                                type="button"
                                                className="contract-quick-btn"
                                                onClick={() => setApplicableContractTypes([])}
                                            >
                                                ✕ Bỏ chọn hết (Tất cả HĐ)
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '10px', fontSize: '0.78rem', color: '#64748b' }}>
                                        {applicableContractTypes.length === 0 
                                            ? '🌐 Đang áp dụng cho TẤT CẢ các loại hợp đồng cưới' 
                                            : `🎯 Đang giới hạn áp dụng cho ${applicableContractTypes.length} loại hợp đồng đã chọn`}
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {loaiHopDongOptions.map(opt => {
                                            const isSelected = applicableContractTypes.includes(opt.id);
                                            const optLabel = opt.label || opt.name || opt.tenLoai || `Loại ${opt.id}`;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    className={`contract-chip-btn ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setApplicableContractTypes(applicableContractTypes.filter(id => id !== opt.id));
                                                        } else {
                                                            setApplicableContractTypes([...applicableContractTypes, opt.id]);
                                                        }
                                                    }}
                                                >
                                                    {isSelected ? (
                                                        <i className="fa-solid fa-circle-check check-icon"></i>
                                                    ) : (
                                                        <i className="fa-regular fa-circle" style={{ color: '#94a3b8', fontSize: '0.8rem' }}></i>
                                                    )}
                                                    <span>{optLabel}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 5. CÔNG TẮC KÍCH HOẠT */}
                                <div className="activation-toggle-card">
                                    <div className="activation-toggle-info">
                                        <div className="activation-toggle-icon">
                                            <i className="fa-solid fa-bolt"></i>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                                                Kích Hoạt Chương Trình Ngay Sau Khi Lưu
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                                                Cho phép khách hàng nhận mã ưu đãi này trên website và áp dụng vào hợp đồng
                                            </div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        color="warning"
                                    />
                                </div>

                            </div>
                        )}

                        {/* ===================================================
                            TAB 2: KHO MÃ CON & SINH MÃ HÀNG LOẠT 
                        =================================================== */}
                        {activeModalTab === 'codes' && isEditing && (
                            <div className="modal-sections-wrap">
                                {/* Thống kê mã code (Nhấn vào để lọc ngay lập tức) */}
                                <div className="batch-stats-grid">
                                    <div 
                                        className={`batch-stat-card ${codesStatusFilter === 'all' ? 'active' : ''}`}
                                        onClick={() => {
                                            setCodesStatusFilter('all');
                                            loadGeneratedCodes(currentVoucherId, 'all', codesKeyword);
                                        }}
                                        title="Xem tất cả mã code con"
                                    >
                                        <div className="stat-label">Tổng Số Mã Con</div>
                                        <div className="stat-val" style={{ color: '#0f172a' }}>{codesStats.total}</div>
                                    </div>
                                    <div 
                                        className={`batch-stat-card ${codesStatusFilter === 'available' ? 'active' : ''}`}
                                        onClick={() => {
                                            setCodesStatusFilter('available');
                                            loadGeneratedCodes(currentVoucherId, 'available', codesKeyword);
                                        }}
                                        title="Xem các mã còn khả dụng (chưa cấp)"
                                    >
                                        <div className="stat-label">Khả Dụng (Chưa Cấp)</div>
                                        <div className="stat-val" style={{ color: '#16a34a' }}>{codesStats.available}</div>
                                    </div>
                                    <div 
                                        className={`batch-stat-card ${codesStatusFilter === 'claimed' ? 'active' : ''}`}
                                        onClick={() => {
                                            setCodesStatusFilter('claimed');
                                            loadGeneratedCodes(currentVoucherId, 'claimed', codesKeyword);
                                        }}
                                        title="Xem các mã đã cấp cho khách (chưa dùng trong hợp đồng)"
                                    >
                                        <div className="stat-label">Đã Cấp Cho Khách</div>
                                        <div className="stat-val" style={{ color: '#d97706' }}>{codesStats.claimed}</div>
                                    </div>
                                    <div 
                                        className={`batch-stat-card ${codesStatusFilter === 'used' ? 'active' : ''}`}
                                        onClick={() => {
                                            setCodesStatusFilter('used');
                                            loadGeneratedCodes(currentVoucherId, 'used', codesKeyword);
                                        }}
                                        title="Xem các mã đã được sử dụng trong hợp đồng"
                                    >
                                        <div className="stat-label">Đã Dùng Hợp Đồng</div>
                                        <div className="stat-val" style={{ color: '#7c3aed' }}>{codesStats.used}</div>
                                    </div>
                                </div>

                                {/* Form sinh mã hàng loạt */}
                                <div className="batch-gen-box">
                                    <div className="batch-gen-title">
                                        <span>🚀</span> Sinh Thêm Mã Code Độc Nhất Cho Chương Trình Này
                                    </div>
                                    <div className="batch-gen-row">
                                        <div className="batch-gen-field">
                                            <label>Số lượng mã cần sinh:</label>
                                            <input
                                                type="number"
                                                className="batch-gen-input"
                                                value={genQuantity}
                                                min={1}
                                                max={500}
                                                onChange={(e) => setGenQuantity(e.target.value)}
                                                style={{ width: '120px' }}
                                            />
                                        </div>

                                        <div className="batch-gen-field">
                                            <label>Tiền tố mã (Prefix):</label>
                                            <input
                                                type="text"
                                                className="batch-gen-input"
                                                value={genPrefix}
                                                onChange={(e) => setGenPrefix(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                                                style={{ width: '180px', textTransform: 'uppercase' }}
                                            />
                                        </div>

                                        <div className="batch-gen-field">
                                            <label>Độ dài hậu tố ngẫu nhiên:</label>
                                            <select
                                                className="batch-gen-input"
                                                value={genLength}
                                                onChange={(e) => setGenLength(e.target.value)}
                                                style={{ width: '110px' }}
                                            >
                                                <option value={4}>4 ký tự</option>
                                                <option value={5}>5 ký tự</option>
                                                <option value={6}>6 ký tự</option>
                                            </select>
                                        </div>

                                        <button
                                            type="button"
                                            className="batch-gen-btn"
                                            onClick={handleGenerateBatch}
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                                    <span>Đang sinh mã...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                                                    <span>Tạo Ngay {genQuantity} Mã Code</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '8px' }}>
                                        💡 <em>Mỗi mã sinh ra sẽ có định dạng `${genPrefix || code}-XXXX`, giá trị giảm và điều kiện hoàn toàn giống nhau nhưng mã độc nhất không trùng lặp.</em>
                                    </div>
                                </div>

                                {/* Danh sách các mã code con */}
                                <div className="batch-list-header">
                                    <div className="batch-filter-tabs">
                                        <button
                                            type="button"
                                            className={`batch-tab-btn ${codesStatusFilter === 'all' ? 'active' : ''}`}
                                            onClick={() => {
                                                setCodesStatusFilter('all');
                                                loadGeneratedCodes(currentVoucherId, 'all', codesKeyword);
                                            }}
                                        >
                                            Tất cả ({codesStats.total})
                                        </button>
                                        <button
                                            type="button"
                                            className={`batch-tab-btn ${codesStatusFilter === 'available' ? 'active' : ''}`}
                                            onClick={() => {
                                                setCodesStatusFilter('available');
                                                loadGeneratedCodes(currentVoucherId, 'available', codesKeyword);
                                            }}
                                        >
                                            Khả dụng ({codesStats.available})
                                        </button>
                                        <button
                                            type="button"
                                            className={`batch-tab-btn ${codesStatusFilter === 'claimed' ? 'active' : ''}`}
                                            onClick={() => {
                                                setCodesStatusFilter('claimed');
                                                loadGeneratedCodes(currentVoucherId, 'claimed', codesKeyword);
                                            }}
                                        >
                                            Đã cấp ({codesStats.claimed})
                                        </button>
                                        <button
                                            type="button"
                                            className={`batch-tab-btn ${codesStatusFilter === 'used' ? 'active' : ''}`}
                                            onClick={() => {
                                                setCodesStatusFilter('used');
                                                loadGeneratedCodes(currentVoucherId, 'used', codesKeyword);
                                            }}
                                        >
                                            Đã dùng ({codesStats.used})
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            className="batch-search-input"
                                            placeholder="Tìm mã code, khách hàng, SĐT..."
                                            value={codesKeyword}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCodesKeyword(val);
                                                loadGeneratedCodes(currentVoucherId, codesStatusFilter, val);
                                            }}
                                        />

                                        <button
                                            type="button"
                                            className="btn-random-code"
                                            onClick={handleCopyAllSubCodes}
                                            title="Sao chép toàn bộ danh sách mã"
                                        >
                                            📋 Sao chép hết
                                        </button>

                                        <button
                                            type="button"
                                            className="btn-random-code"
                                            onClick={handleExportCodes}
                                            title="Xuất file CSV"
                                        >
                                            📥 Xuất CSV
                                        </button>
                                    </div>
                                </div>

                                {/* Bảng mã code con */}
                                <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                                    {generatedCodesList.length > 0 ? (
                                        <table className="voucher-table" style={{ margin: 0 }}>
                                            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc' }}>
                                                <tr>
                                                    <th style={{ width: '50px' }}>STT</th>
                                                    <th>Mã Code Độc Nhất</th>
                                                    <th>Trạng Thái</th>
                                                    <th>Khách Hàng Nhận (Website/Sự kiện)</th>
                                                    <th>Hợp Đồng Sử Dụng</th>
                                                    <th style={{ textAlign: 'center', width: '80px' }}>Thao Tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {generatedCodesList.map((c, idx) => {
                                                    const isUsed = c.isUsed;
                                                    const isClaimed = c.isClaimed && !c.isUsed;

                                                    return (
                                                        <tr key={c._id || idx}>
                                                            <td>{idx + 1}</td>
                                                            <td>
                                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                                                    <span className="subcode-text">{c.code}</span>
                                                                    <button
                                                                        type="button"
                                                                        className="copy-btn"
                                                                        title="Sao chép mã"
                                                                        onClick={() => handleCopySubCode(c.code)}
                                                                    >
                                                                        <i className={`fa-regular ${copiedSubCode === c.code ? 'fa-circle-check' : 'fa-copy'}`}></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {isUsed ? (
                                                                    <span className="subcode-pill used">
                                                                        <i className="fa-solid fa-check-double"></i> Đã dùng trong HĐ
                                                                    </span>
                                                                ) : isClaimed ? (
                                                                    <span className="subcode-pill claimed">
                                                                        <i className="fa-solid fa-user-check"></i> Đã cấp cho khách
                                                                    </span>
                                                                ) : (
                                                                    <span className="subcode-pill available">
                                                                        <i className="fa-solid fa-circle-check"></i> Khả dụng
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {c.claimedName || c.claimedPhone ? (
                                                                    <div>
                                                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.claimedName || 'Khách hàng'}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                                            SĐT: <strong>{c.claimedPhone || '---'}</strong>
                                                                            {c.claimedAt && ` • ${new Date(c.claimedAt).toLocaleDateString('vi-VN')}`}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Chưa cấp cho ai</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {c.usedContract ? (
                                                                    <div>
                                                                        <span style={{ fontWeight: 800, color: '#2563eb' }}>{c.usedContract}</span>
                                                                        {c.usedAt && (
                                                                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                                                                {new Date(c.usedAt).toLocaleDateString('vi-VN')}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Chưa áp dụng</span>
                                                                )}
                                                            </td>
                                                            <td align="center">
                                                                {!isUsed ? (
                                                                    <button
                                                                        type="button"
                                                                        className="btn-action-icon btn-delete"
                                                                        title="Xóa mã này"
                                                                        onClick={() => handleDeleteSubCode(c._id, c.code)}
                                                                    >
                                                                        <i className="fa-solid fa-trash-can"></i>
                                                                    </button>
                                                                ) : (
                                                                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '36px 12px', color: '#94a3b8' }}>
                                            <i className="fa-solid fa-ticket" style={{ fontSize: '2.5rem', marginBottom: '8px', color: '#cbd5e1' }}></i>
                                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                                                {codesStatusFilter === 'used'
                                                    ? 'Chưa có mã voucher nào được sử dụng trong hợp đồng.'
                                                    : codesStatusFilter === 'claimed'
                                                    ? 'Chưa có mã nào được cấp cho khách hàng.'
                                                    : codesStatusFilter === 'available'
                                                    ? 'Không còn mã khả dụng nào (đã được cấp hoặc dùng hết).'
                                                    : 'Chương trình này chưa có mã code con nào được sinh.'}
                                            </p>
                                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                                {codesStatusFilter === 'used'
                                                    ? 'Khi khách hàng áp dụng voucher vào hợp đồng, thông tin chi tiết sẽ hiển thị tại đây.'
                                                    : 'Dùng ô "Sinh Thêm Mã Code" ở trên để tạo ngay hàng loạt mã!'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ===================================================
                            TAB 3: LỊCH SỬ SỬ DỤNG VOUCHER & HỢP ĐỒNG 
                        =================================================== */}
                        {activeModalTab === 'history' && isEditing && (
                            <div className="modal-sections-wrap">
                                {selectedVoucher && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                        <div>
                                            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Chương trình:</span>
                                            <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedVoucher.title}</div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Đã dùng:</span>
                                            <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.1rem', marginTop: '2px' }}>{selectedVoucher.usedCount || 0} lượt</div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Tổng tiền đã giảm:</span>
                                            <div style={{ fontWeight: 800, color: '#15803d', fontSize: '1.1rem', marginTop: '2px' }}>
                                                {selectedVoucher.usageHistory?.reduce((sum, h) => sum + (h.giamGiaAmount || 0), 0)?.toLocaleString('vi-VN') || 0} đ
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedVoucher?.usageHistory && selectedVoucher.usageHistory.length > 0 ? (
                                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                        <table className="voucher-table" style={{ margin: 0 }}>
                                            <thead>
                                                <tr>
                                                    <th>Mã Hợp Đồng</th>
                                                    <th>Khách Hàng</th>
                                                    <th>Số Điện Thoại</th>
                                                    <th>Số Tiền Đã Giảm</th>
                                                    <th>Thời Gian Sử Dụng</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedVoucher.usageHistory.map((h, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ fontWeight: 700, color: '#2563eb' }}>{h.maHopDong}</td>
                                                        <td style={{ fontWeight: 600 }}>{h.tenKhachHang || 'Khách hàng'}</td>
                                                        <td>{h.soDienThoai || '---'}</td>
                                                        <td style={{ fontWeight: 800, color: '#15803d' }}>
                                                            -{h.giamGiaAmount?.toLocaleString('vi-VN')} đ
                                                        </td>
                                                        <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                                            {h.usedAt ? new Date(h.usedAt).toLocaleString('vi-VN') : '---'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '48px 12px', color: '#94a3b8' }}>
                                        <i className="fa-regular fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '8px', color: '#cbd5e1' }}></i>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Chưa có khách hàng nào áp dụng mã Voucher này.</p>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Khi hợp đồng được ký và áp dụng mã, thông tin chi tiết sẽ được tự động ghi nhận tại đây.</p>
                                    </div>
                                )}
                            </div>
                        )}

                    </DialogContent>

                    {/* Master Dialog Footer */}
                    <div className="voucher-modal-footer">
                        {activeModalTab === 'settings' ? (
                            <>
                                <Button
                                    variant="outlined"
                                    className="btn-modal-cancel"
                                    onClick={() => setOpenModal(false)}
                                >
                                    Hủy Bỏ
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className="btn-modal-submit"
                                >
                                    <i className={`fa-solid ${isEditing ? 'fa-floppy-disk' : 'fa-wand-magic-sparkles'}`}></i>
                                    <span>{isEditing ? 'Lưu Thay Đổi' : 'Tạo Voucher Ngay'}</span>
                                </Button>
                            </>
                        ) : activeModalTab === 'codes' ? (
                            <>
                                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                    Hiển thị <strong>{generatedCodesList.length}</strong> / <strong>{codesStats.total}</strong> mã code
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button
                                        type="submit"
                                        variant="outlined"
                                        className="btn-modal-cancel"
                                        style={{ borderColor: '#d97706', color: '#d97706' }}
                                    >
                                        <i className="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }}></i> Lưu Cấu Hình
                                    </Button>
                                    <Button
                                        variant="contained"
                                        className="btn-modal-submit"
                                        onClick={() => setOpenModal(false)}
                                        style={{ background: '#0f172a' }}
                                    >
                                        Đóng
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                    Tổng cộng: <strong>{selectedVoucher?.usageHistory?.length || selectedVoucher?.usedCount || 0}</strong> lượt áp dụng
                                </div>
                                <Button
                                    variant="contained"
                                    className="btn-modal-submit"
                                    onClick={() => setOpenModal(false)}
                                    style={{ background: '#0f172a' }}
                                >
                                    Đóng
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </Dialog>

            {/* FOOTER CREDIT */}
            <div className="voucher-footer-credit">
                Design by Mai Tiến Long • Hệ thống Quản trị Long Wedding Studio
            </div>
        </div>
    );
}

export default QuanLyVoucher;
