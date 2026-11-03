import React, { useState, useMemo } from 'react';
import { getContractStatusInfo, isUnscheduledShooting, getStageSlaInfo } from '../../utils/contractStatusHelper';
import './HopDongKanbanBoard.css';

const KANBAN_COLUMNS = [
    {
        id: 'no_schedule',
        title: 'Chưa Xếp Lịch',
        icon: '🔴',
        className: 'col-unscheduled',
        stageNum: 1,
        isUnscheduled: true
    },
    {
        id: 'stage_1',
        title: '1. Chụp Hình',
        icon: '📸',
        className: 'col-stage-1',
        stageNum: 1
    },
    {
        id: 'stage_2',
        title: '2. Hậu Kỳ',
        icon: '🎨',
        className: 'col-stage-2',
        stageNum: 2
    },
    {
        id: 'stage_3',
        title: '3. In Ảnh',
        icon: '🖼️',
        className: 'col-stage-3',
        stageNum: 3
    },
    {
        id: 'stage_4',
        title: '4. Hoàn Thành',
        icon: '🏁',
        className: 'col-stage-4',
        stageNum: 4
    }
];

const HopDongKanbanBoard = ({ 
    contracts = [], 
    onContractClick, 
    onAdvanceStage 
}) => {
    const [draggedContract, setDraggedContract] = useState(null);
    const [dragOverCol, setDragOverCol] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa có';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return 'Chưa có';
            return d.toLocaleDateString('vi-VN');
        } catch {
            return 'Chưa có';
        }
    };

    // Phân loại hợp đồng vào 5 cột
    const columnsData = useMemo(() => {
        const groups = {
            no_schedule: [],
            stage_1: [],
            stage_2: [],
            stage_3: [],
            stage_4: []
        };

        (contracts || []).forEach(hd => {
            const isUnscheduled = isUnscheduledShooting(hd);
            if (isUnscheduled) {
                groups.no_schedule.push(hd);
                return;
            }

            const stageNum = Number(hd.giaiDoan) || 1;
            if (stageNum === 1) {
                groups.stage_1.push(hd);
            } else if (stageNum === 2) {
                groups.stage_2.push(hd);
            } else if (stageNum === 3) {
                groups.stage_3.push(hd);
            } else if (stageNum >= 4) {
                groups.stage_4.push(hd);
            } else {
                groups.stage_1.push(hd);
            }
        });

        return groups;
    }, [contracts]);

    // Xử lý kéo - thả (Drag and Drop)
    const handleDragStart = (e, hd) => {
        setDraggedContract(hd);
        e.dataTransfer.setData('text/plain', hd.maHopDong);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDraggedContract(null);
        setDragOverCol(null);
    };

    const handleDragOver = (e, colId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverCol !== colId) {
            setDragOverCol(colId);
        }
    };

    const handleDragLeave = () => {
        setDragOverCol(null);
    };

    const handleDrop = (e, targetCol) => {
        e.preventDefault();
        setDragOverCol(null);

        if (!draggedContract) return;
        if (targetCol.id === 'no_schedule') return; // Không kéo vào cột chưa xếp lịch

        const currentStage = Number(draggedContract.giaiDoan) || 1;
        const targetStage = targetCol.stageNum;

        if (currentStage === targetStage) return; // Cùng cột

        if (onAdvanceStage) {
            onAdvanceStage(draggedContract, targetStage);
        }
    };

    return (
        <div className="kanban-board-container">
            {KANBAN_COLUMNS.map(col => {
                const colContracts = columnsData[col.id] || [];
                const isOver = dragOverCol === col.id;

                return (
                    <div 
                        key={col.id} 
                        className={`kanban-column ${col.className} ${isOver ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, col.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, col)}
                    >
                        {/* Column Header */}
                        <div className="kanban-column-header">
                            <div className="col-header-left">
                                <span className="col-icon">{col.icon}</span>
                                <h4 className="col-title">{col.title}</h4>
                            </div>
                            <span className="col-count-badge">{colContracts.length}</span>
                        </div>

                        {/* Column Body / Cards List */}
                        <div className="kanban-column-body">
                            {colContracts.length === 0 ? (
                                <div className="kanban-empty-hint">
                                    Không có hợp đồng nào
                                </div>
                            ) : (
                                colContracts.map(hd => {
                                    const statusInfo = getContractStatusInfo(hd);
                                    const slaInfo = getStageSlaInfo(hd);
                                    const client1 = hd.khachHang1?.tenKhachHang || 'Khách hàng';
                                    const client2 = hd.khachHang2?.tenKhachHang;
                                    const phone = hd.khachHang1?.soDienThoai;
                                    const totalVal = hd.thanhToan?.tongGiaTriSauGiam || hd.thanhToan?.tongGiaTri || 0;
                                    const conLai = hd.thanhToan?.conLai || 0;
                                    const isDragging = draggedContract?.maHopDong === hd.maHopDong;
                                    const hasCustomerApproved = hd.khachHangXacNhanAnh?.daXacNhan;

                                    return (
                                        <div
                                            key={hd._id || hd.maHopDong}
                                            className={`kanban-card ${isDragging ? 'dragging' : ''}`}
                                            style={{
                                                borderLeft: `4px solid ${statusInfo.color}`,
                                                backgroundColor: statusInfo.rowBgColor || '#ffffff'
                                            }}
                                            draggable={true}
                                            onDragStart={(e) => handleDragStart(e, hd)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => onContractClick && onContractClick(hd)}
                                            title="Nhấn để xem chi tiết / Kéo thả để đổi giai đoạn"
                                        >
                                            {/* Top info */}
                                            <div className="kanban-card-top">
                                                <span className="card-code">#{hd.maHopDong}</span>
                                                <span 
                                                    style={{
                                                        fontSize: '0.74rem',
                                                        fontWeight: 700,
                                                        color: statusInfo.color,
                                                        background: statusInfo.bgColor,
                                                        border: `1px solid ${statusInfo.borderColor || statusInfo.color}`,
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    {statusInfo.badgeText}
                                                </span>
                                            </div>

                                            {/* Client */}
                                            <div className="kanban-card-client">
                                                <span className="client-names">
                                                    {client1} {client2 && `❤️ ${client2}`}
                                                </span>
                                                {phone && (
                                                    <span className="client-phone">
                                                        📞 {phone}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Meta Dates & Finance */}
                                            <div className="kanban-card-meta">
                                                <div className="meta-row">
                                                    <span>Ngày chụp:</span>
                                                    <span className="val highlight">{formatDate(hd.cacNgay?.ngayChup)}</span>
                                                </div>
                                                {hd.cacNgay?.ngayCuoi && (
                                                    <div className="meta-row">
                                                        <span>Ngày cưới:</span>
                                                        <span className="val">{formatDate(hd.cacNgay?.ngayCuoi)}</span>
                                                    </div>
                                                )}
                                                <div className="meta-row">
                                                    <span>Công nợ:</span>
                                                    <span className="val" style={{ color: conLai > 0 ? '#ef4444' : '#16a34a', fontWeight: 700 }}>
                                                        {conLai > 0 ? `Còn nợ: ${formatCurrency(conLai)}` : '✓ Đã đủ'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Customer Approval Alert if any */}
                                            {hasCustomerApproved && (
                                                <div className="card-approved-tag">
                                                    <span>✓ Khách đã duyệt in</span>
                                                </div>
                                            )}

                                            {/* Bottom SLA & Actions */}
                                            <div className="kanban-card-footer">
                                                <span 
                                                    className="card-sla-badge"
                                                    style={{
                                                        background: slaInfo.badgeBg,
                                                        color: slaInfo.badgeColor,
                                                        border: `1px solid ${slaInfo.badgeColor}33`
                                                    }}
                                                    title={slaInfo.tooltip || `Thời hạn chuẩn SLA: ${slaInfo.slaLimit} ngày`}
                                                >
                                                    ⏱️ {slaInfo.shortText || slaInfo.text}
                                                </span>

                                                <button
                                                    type="button"
                                                    className="card-advance-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (onContractClick) onContractClick(hd);
                                                    }}
                                                >
                                                    Chi tiết ➔
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default HopDongKanbanBoard;
