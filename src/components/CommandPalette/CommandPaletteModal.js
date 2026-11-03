import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import otherService from '../../API/services/otherService';
import './commandPalette.css';

function CommandPaletteModal({ isOpen, onClose, onTriggerLock, onOpenClockModal }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Search Results State
    const [contracts, setContracts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [services, setServices] = useState([]);

    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setActiveIndex(0);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    // Quick Actions definition
    const quickActions = useMemo(() => [
        {
            id: 'action_new_contract',
            type: 'action',
            category: 'Tác vụ nhanh',
            title: 'Tạo hợp đồng mới',
            subtitle: 'Lập hợp đồng dịch vụ / chụp ảnh cưới cho khách',
            icon: 'fa-solid fa-plus',
            badge: 'Bán hàng',
            action: () => {
                navigate('/banhang');
                onClose();
            }
        },
        {
            id: 'action_tongquan',
            type: 'action',
            category: 'Tác vụ nhanh',
            title: 'Tổng quan hệ thống (Dashboard)',
            subtitle: 'Lịch 7 ngày tới, cảnh báo trễ hạn & doanh số tháng',
            icon: 'fa-solid fa-chart-pie',
            badge: 'Tổng quan',
            action: () => {
                navigate('/tongquan');
                onClose();
            }
        },
        {
            id: 'action_calendar',
            type: 'action',
            category: 'Tác vụ nhanh',
            title: 'Lịch cửa hàng & Lịch chụp',
            subtitle: 'Xem toàn bộ lịch hẹn, lịch makeup, ngày cưới',
            icon: 'fa-solid fa-calendar-days',
            badge: 'Lịch',
            action: () => {
                navigate('/lichcuahang');
                onClose();
            }
        },
        {
            id: 'action_dress_prep',
            type: 'action',
            category: 'Tác vụ nhanh',
            title: 'Lịch soạn đồ cưới & Vest',
            subtitle: 'Soạn trang phục, kiểm tra đồ mượn / trả',
            icon: 'fa-solid fa-shirt',
            badge: 'Kho & Đồ',
            action: () => {
                navigate('/lichSoanDo');
                onClose();
            }
        },
        {
            id: 'action_revenue',
            type: 'action',
            category: 'Tác vụ nhanh',
            title: 'Báo cáo doanh thu',
            subtitle: 'Thống kê tài chính, biểu đồ kinh doanh',
            icon: 'fa-solid fa-chart-pie',
            badge: 'Doanh thu',
            action: () => {
                navigate('/doanhthu');
                onClose();
            }
        },
        {
            id: 'action_competition',
            type: 'action',
            category: 'Tác vụ nhanh',
            title: 'Bảng vàng thi đua & KPI',
            subtitle: 'Xếp hạng nhân viên, vinh danh tháng',
            icon: 'fa-solid fa-trophy',
            badge: 'Thi đua',
            action: () => {
                navigate('/thi-dua');
                onClose();
            }
        },
        {
            id: 'action_lucky_date',
            type: 'action',
            category: 'Tác vụ nhanh',
            title: 'Tra cứu Ngày đẹp & Lịch âm hoàng đạo',
            subtitle: 'Xem giờ tốt, ngày hoàng đạo tư vấn dâu rể',
            icon: 'fa-solid fa-sparkles',
            badge: 'Phong thủy',
            action: () => {
                if (onOpenClockModal) onOpenClockModal();
                onClose();
            }
        },
        {
            id: 'action_lock_pin',
            type: 'action',
            category: 'Tác vụ nhanh',
            title: 'Khóa màn hình bảo mật (Mã PIN)',
            subtitle: 'Bảo vệ dữ liệu khi rời bàn làm việc',
            icon: 'fa-solid fa-lock',
            badge: 'Bảo mật',
            action: () => {
                if (onTriggerLock) onTriggerLock();
                onClose();
            }
        }
    ], [navigate, onClose, onOpenClockModal, onTriggerLock]);

    // Perform debounced search when query changes
    useEffect(() => {
        if (!isOpen) return;

        const trimmed = query.trim();
        if (!trimmed) {
            setContracts([]);
            setCustomers([]);
            setServices([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const [resHopDong, resKhachHang, resDichVu] = await Promise.allSettled([
                    otherService.SEARCH_HOPDONG({ keyword: trimmed }),
                    otherService.findKhachHang({ keyword: trimmed }),
                    otherService.findDichVu({ keyword: trimmed })
                ]);

                // Parse contracts
                if (resHopDong.status === 'fulfilled' && resHopDong.value?.data) {
                    const rawList = Array.isArray(resHopDong.value.data) ? resHopDong.value.data : (resHopDong.value.data?.data || []);
                    setContracts(rawList.slice(0, 6));
                } else {
                    setContracts([]);
                }

                // Parse customers
                if (resKhachHang.status === 'fulfilled' && resKhachHang.value?.data) {
                    const rawCust = Array.isArray(resKhachHang.value.data) ? resKhachHang.value.data : (resKhachHang.value.data?.data || []);
                    setCustomers(rawCust.slice(0, 5));
                } else {
                    setCustomers([]);
                }

                // Parse services/dresses
                if (resDichVu.status === 'fulfilled' && resDichVu.value?.data) {
                    const rawServ = Array.isArray(resDichVu.value.data) ? resDichVu.value.data : (resDichVu.value.data?.data || []);
                    setServices(rawServ.slice(0, 5));
                } else {
                    setServices([]);
                }
            } catch (err) {
                console.error("Lỗi quick search:", err);
            } finally {
                setLoading(false);
            }
        }, 220);

        return () => clearTimeout(timer);
    }, [query, isOpen]);

    // Flatten all active list items for keyboard navigation
    const allItems = useMemo(() => {
        const items = [];

        // When query is empty, show Quick Actions
        if (!query.trim()) {
            quickActions.forEach(action => {
                items.push(action);
            });
            return items;
        }

        // Filter matching quick actions
        const matchedActions = quickActions.filter(a => 
            a.title.toLowerCase().includes(query.toLowerCase()) || 
            a.subtitle.toLowerCase().includes(query.toLowerCase())
        );
        matchedActions.forEach(a => items.push(a));

        // Contracts
        contracts.forEach(hd => {
            const ten1 = hd.khachHang1?.tenKhachHang || "Khách hàng";
            const sdt1 = hd.khachHang1?.soDienThoai || "";
            const ten2 = hd.khachHang2?.tenKhachHang ? ` & ${hd.khachHang2.tenKhachHang}` : "";
            const tongTien = hd.thanhToan?.tongGiaTriSauGiam ? Number(hd.thanhToan.tongGiaTriSauGiam).toLocaleString('vi-VN') + ' đ' : '';
            
            items.push({
                id: `hd_${hd.maHopDong}`,
                type: 'contract',
                category: 'Hợp đồng cưới',
                title: `${hd.maHopDong} - ${ten1}${ten2}`,
                subtitle: `SĐT: ${sdt1 || 'Chưa cập nhật'} | Trạng thái: ${hd.thanhToan?.trangThaiThanhToan || 'Giai đoạn ' + hd.giaiDoan}`,
                extra: tongTien,
                icon: 'fa-solid fa-file-signature',
                badge: 'Hợp đồng',
                action: () => {
                    navigate(`/?search=${encodeURIComponent(hd.maHopDong)}`);
                    onClose();
                }
            });
        });

        // Customers
        customers.forEach(kh => {
            items.push({
                id: `kh_${kh._id || kh.soDienThoai}`,
                type: 'customer',
                category: 'Khách hàng',
                title: kh.tenKhachHang || 'Khách hàng',
                subtitle: `SĐT: ${kh.soDienThoai || '---'} | Địa chỉ: ${kh.diaChi || 'Chưa có'}`,
                icon: 'fa-solid fa-user-heart',
                badge: 'Khách hàng',
                action: () => {
                    navigate(`/quanlykhachhang`);
                    onClose();
                }
            });
        });

        // Services / Dresses
        services.forEach(dv => {
            const loai = dv.loaiDichVu === 1 ? 'Váy cưới' : dv.loaiDichVu === 2 ? 'Vest' : 'Gói dịch vụ';
            const gia = dv.giaChoThueDichVu ? Number(dv.giaChoThueDichVu).toLocaleString('vi-VN') + ' đ' : '';
            items.push({
                id: `dv_${dv.maDichVu || dv._id}`,
                type: 'service',
                category: 'Váy cưới & Dịch vụ',
                title: `${dv.maDichVu || ''} - ${dv.tenDichVu}`,
                subtitle: `Loại: ${loai} | Tồn kho: ${dv.tonKhoDichVu ?? 1}`,
                extra: gia,
                icon: dv.loaiDichVu === 1 ? 'fa-solid fa-person-dress' : 'fa-solid fa-box-open',
                badge: loai,
                action: () => {
                    navigate(`/quanlykho`);
                    onClose();
                }
            });
        });

        return items;
    }, [query, quickActions, contracts, customers, services, navigate, onClose]);

    // Keyboard handlers
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((prev) => (prev + 1) % (allItems.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((prev) => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (allItems[activeIndex]) {
                    allItems[activeIndex].action();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, allItems, activeIndex, onClose]);

    // Scroll active item into view
    useEffect(() => {
        if (listRef.current) {
            const activeElem = listRef.current.querySelector('.cmd-item.active');
            if (activeElem) {
                activeElem.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [activeIndex]);

    if (!isOpen) return null;

    // Group items by category for visual display
    const groupedItems = allItems.reduce((acc, item, index) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push({ ...item, globalIndex: index });
        return acc;
    }, {});

    return (
        <div className="cmd-palette-backdrop" onClick={onClose}>
            <div className="cmd-palette-container" onClick={(e) => e.stopPropagation()}>
                {/* Search Bar Header */}
                <div className="cmd-search-wrapper">
                    <span className="cmd-search-icon">
                        {loading ? (
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                        ) : (
                            <i className="fa-solid fa-magnifying-glass"></i>
                        )}
                    </span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="cmd-search-input"
                        placeholder="Tìm hợp đồng, tên khách hàng, số điện thoại, váy cưới, hoặc tác vụ..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActiveIndex(0);
                        }}
                    />
                    <div className="cmd-shortcut-badges">
                        <span className="cmd-kbd">ESC để đóng</span>
                    </div>
                </div>

                {/* Results List */}
                <div className="cmd-results-list" ref={listRef}>
                    {allItems.length === 0 && !loading && (
                        <div className="cmd-empty-state">
                            <div className="cmd-empty-icon">
                                <i className="fa-regular fa-folder-open"></i>
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#94a3b8' }}>
                                Không tìm thấy kết quả phù hợp với "{query}"
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                                Thử tìm với mã hợp đồng (#HD...), tên cô dâu chú rể hoặc số điện thoại
                            </div>
                        </div>
                    )}

                    {Object.entries(groupedItems).map(([category, items]) => (
                        <div key={category} style={{ marginBottom: 12 }}>
                            <div className="cmd-section-title">
                                <i className="fa-solid fa-layer-group" style={{ fontSize: '0.7rem' }}></i>
                                {category} ({items.length})
                            </div>
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`cmd-item ${item.globalIndex === activeIndex ? 'active' : ''}`}
                                    onClick={item.action}
                                    onMouseEnter={() => setActiveIndex(item.globalIndex)}
                                >
                                    <div className="cmd-item-icon">
                                        <i className={item.icon}></i>
                                    </div>
                                    <div className="cmd-item-body">
                                        <div className="cmd-item-primary">
                                            <span>{item.title}</span>
                                            {item.badge && (
                                                <span className={`cmd-tag ${item.type === 'contract' ? 'cmd-tag-gold' : item.type === 'customer' ? 'cmd-tag-green' : ''}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <div className="cmd-item-secondary">{item.subtitle}</div>
                                    </div>
                                    {item.extra && (
                                        <div className="cmd-item-extra">{item.extra}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Footer Controls */}
                <div className="cmd-palette-footer">
                    <div className="cmd-footer-keys">
                        <span className="cmd-footer-key-item">
                            <span className="cmd-kbd">↑</span>
                            <span className="cmd-kbd">↓</span>
                            <span>Di chuyển</span>
                        </span>
                        <span className="cmd-footer-key-item">
                            <span className="cmd-kbd">↵</span>
                            <span>Chọn mở</span>
                        </span>
                    </div>
                    <div className="cmd-footer-brand">
                        <i className="fa-solid fa-crown" style={{ marginRight: 5, color: '#eab308' }}></i>
                        LONG WEDDING PRO
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CommandPaletteModal;
