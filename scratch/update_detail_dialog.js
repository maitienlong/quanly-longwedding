const fs = require('fs');
const path = 'src/screens/HopDong/DetailHopDongKhachHangDialog.js';
let code = fs.readFileSync(path, 'utf8');

// 1. Load data
const oldLoad = 'const finalSchedules = syncSchedulesWithCart(loadedSchedules, enrichedGioHang);\r\n            setServiceSchedules(finalSchedules);';
const newLoad = `if (Array.isArray(data.serviceSchedules) && data.serviceSchedules.length > 0) {
                setServiceSchedules(data.serviceSchedules);
            } else {
                setServiceSchedules(loadedSchedules);
            }`;

if (!code.includes(oldLoad)) {
    console.error('Error: oldLoad not found');
    process.exit(1);
}
code = code.replace(oldLoad, newLoad);

// 2. updateCartAndTotal
const oldCartSync = 'setServiceSchedules(prev => syncSchedulesWithCart(prev, newCart));';
const newCartSync = '// Bỏ tự động đồng bộ lịch từ giỏ hàng - Quản trị viên thêm thủ công';
if (!code.includes(oldCartSync)) {
    console.error('Error: oldCartSync not found');
    process.exit(1);
}
code = code.replace(oldCartSync, newCartSync);

// 3. handleScheduleFieldChange & handleAddSchedule
const oldScheduleHandlers = `    const handleScheduleFieldChange = (scheduleId, fieldName, value) => {
        setServiceSchedules(prev => prev.map(sch => {
            if (sch.id === scheduleId) {
                return { ...sch, [fieldName]: value };
            }
            return sch;
        }));
    };

    const handleRemoveManualSchedule = (scheduleId) => {
        setServiceSchedules(prev => prev.filter(sch => sch.id !== scheduleId));
    };`;

const newScheduleHandlers = `    const handleAddSchedule = (type = 'photo') => {
        let defaultName = 'Chụp ảnh';
        let defaultLocation = 'Tại Studio';
        if (type === 'makeup') {
            defaultName = 'Trang điểm';
            defaultLocation = 'Tại Studio';
        } else if (type === 'cskh') {
            defaultName = 'Chăm sóc khách hàng';
            defaultLocation = 'Tại Studio';
        } else if (type === 'support') {
            defaultName = 'Hỗ trợ ekip';
            defaultLocation = 'Tại Studio';
        }

        const existingSameType = (serviceSchedules || []).filter(s => s.serviceType === type);
        const newTurn = existingSameType.length + 1;

        const newSchedule = {
            id: \`sch-\${type}-\${Date.now()}-\${Math.floor(Math.random() * 1000)}\`,
            serviceId: \`MANUAL_\${type.toUpperCase()}_\${Date.now()}\`,
            serviceName: \`\${defaultName} \${newTurn > 1 ? \`(Lượt \${newTurn})\` : ''}\`.trim(),
            serviceType: type,
            luot: newTurn,
            totalLuot: newTurn,
            ngayGio: '',
            diaDiem: defaultLocation,
            nhanVien: '',
            ghiChu: ''
        };

        setServiceSchedules(prev => [...(prev || []), newSchedule]);
        toast.success(\`Đã thêm nhiệm vụ: \${defaultName}\`);
    };

    const handleScheduleFieldChange = (scheduleId, fieldName, value) => {
        setServiceSchedules(prev => (prev || []).map(sch => {
            if (sch.id === scheduleId) {
                const updated = { ...sch, [fieldName]: value };
                if (fieldName === 'serviceType') {
                    if (value === 'photo' && (!sch.serviceName || sch.serviceName.includes('Trang điểm') || sch.serviceName.includes('Chăm sóc') || sch.serviceName.includes('Hỗ trợ'))) {
                        updated.serviceName = 'Chụp ảnh';
                    } else if (value === 'makeup' && (!sch.serviceName || sch.serviceName.includes('Chụp ảnh') || sch.serviceName.includes('Chăm sóc') || sch.serviceName.includes('Hỗ trợ'))) {
                        updated.serviceName = 'Trang điểm';
                    } else if (value === 'cskh' && (!sch.serviceName || sch.serviceName.includes('Chụp ảnh') || sch.serviceName.includes('Trang điểm') || sch.serviceName.includes('Hỗ trợ'))) {
                        updated.serviceName = 'Chăm sóc khách hàng';
                    } else if (value === 'support' && (!sch.serviceName || sch.serviceName.includes('Chụp ảnh') || sch.serviceName.includes('Trang điểm') || sch.serviceName.includes('Hỗ trợ'))) {
                        updated.serviceName = 'Hỗ trợ';
                    }
                }
                return updated;
            }
            return sch;
        }));
    };

    const handleRemoveManualSchedule = (scheduleId) => {
        setServiceSchedules(prev => (prev || []).filter(sch => sch.id !== scheduleId));
    };`;

// normalize line endings for match
const normalizedCode = code.replace(/\r\n/g, '\n');
const normalizedOldHandlers = oldScheduleHandlers.replace(/\r\n/g, '\n');
if (!normalizedCode.includes(normalizedOldHandlers)) {
    console.error('Error: oldScheduleHandlers not found');
    process.exit(1);
}
const repHandlers = newScheduleHandlers.replace(/\r\n/g, '\r\n');
code = code.replace(/\r?\n    const handleScheduleFieldChange = \(scheduleId, fieldName, value\) => \{[\s\S]*?const handleRemoveManualSchedule = \(scheduleId\) => \{[\s\S]*?setServiceSchedules\(prev => prev\.filter\(sch => sch\.id !== scheduleId\)\);\r?\n    \};/, '\r\n' + repHandlers);

// 4. Update payload
const oldUpdateCall = 'lichChup: photoSchedules,';
const newUpdateCall = 'lichChup: photoSchedules,\r\n            serviceSchedules: serviceSchedules,';
if (!code.includes(oldUpdateCall)) {
    console.error('Error: oldUpdateCall not found');
    process.exit(1);
}
code = code.replace(oldUpdateCall, newUpdateCall);

// 5. Section render
const startMarker = '<div className="hd-schedule-section">';
const endMarker = '{/* ================= COLUMN 2: SẢN PHẨM & QUY CÁCH ================= */}';

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);
if (startIdx === -1 || endIdx === -1) {
    console.error('Error: schedule section markers not found');
    process.exit(1);
}

// Find the closing </div> of hd-schedule-section
const sectionOld = code.slice(startIdx, endIdx);

const sectionNew = `<div className="hd-schedule-section">
                                        <div className="hd-schedule-section-head">
                                            <span className="hd-schedule-section-title">
                                                <span>📅</span> Lịch & Phân Công Nhiệm Vụ
                                            </span>
                                            {serviceSchedules.length > 0 && (
                                                <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                                    {serviceSchedules.length} nhiệm vụ
                                                </span>
                                            )}
                                        </div>

                                        {/* Nút thêm lịch phân công thủ công */}
                                        <div className="hd-schedule-add-bar">
                                            <div className="hd-schedule-add-title">➕ Thêm lịch phân công nhiệm vụ:</div>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-photo"
                                                onClick={() => handleAddSchedule('photo')}
                                                title="Thêm nhiệm vụ Chụp ảnh"
                                            >
                                                <span>📸</span> + Chụp ảnh
                                            </button>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-makeup"
                                                onClick={() => handleAddSchedule('makeup')}
                                                title="Thêm nhiệm vụ Trang điểm"
                                            >
                                                <span>💄</span> + Trang điểm
                                            </button>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-cskh"
                                                onClick={() => handleAddSchedule('cskh')}
                                                title="Thêm nhiệm vụ Chăm sóc khách hàng"
                                            >
                                                <span>📞</span> + Chăm sóc KH
                                            </button>
                                            <button
                                                type="button"
                                                className="hd-schedule-add-btn btn-support"
                                                onClick={() => handleAddSchedule('support')}
                                                title="Thêm nhiệm vụ Hỗ trợ"
                                            >
                                                <span>🤝</span> + Hỗ trợ
                                            </button>
                                        </div>

                                        {serviceSchedules.length > 0 ? (
                                            serviceSchedules.map((sch, schIdx) => {
                                                const currentType = sch.serviceType || 'photo';
                                                const isShoot = currentType === 'photo';
                                                const isMakeup = currentType === 'makeup';
                                                const isCSKH = currentType === 'cskh';
                                                const isSupport = currentType === 'support';

                                                let cardTypeClass = 'type-photo';
                                                let timeLabel = '⏰ Thời gian chụp hình *';
                                                let staffLabel = '📸 Phân công thợ Chụp';
                                                let quickLocations = ['Tại Studio', 'Phim trường', 'Ngoại cảnh', 'Tại gia đình'];

                                                if (isMakeup) {
                                                    cardTypeClass = 'type-makeup';
                                                    timeLabel = '⏰ Thời gian trang điểm *';
                                                    staffLabel = '💄 Phân công thợ Makeup';
                                                    quickLocations = ['Tại Studio', 'Nhà riêng cô dâu', 'Tại tiệc cưới', 'Tại gia đình'];
                                                } else if (isCSKH) {
                                                    cardTypeClass = 'type-cskh';
                                                    timeLabel = '⏰ Thời gian CSKH / Hẹn *';
                                                    staffLabel = '📞 Nhân viên CSKH';
                                                    quickLocations = ['Tại Studio', 'Gọi điện thoại', 'Nhà khách hàng'];
                                                } else if (isSupport) {
                                                    cardTypeClass = 'type-support';
                                                    timeLabel = '⏰ Thời gian hỗ trợ *';
                                                    staffLabel = '🤝 Nhân viên Hỗ trợ';
                                                    quickLocations = ['Tại Studio', 'Địa điểm chụp', 'Hội trường cưới'];
                                                }

                                                return (
                                                    <div key={sch.id || schIdx} className={\`hd-schedule-card \${cardTypeClass}\`}>
                                                        <div className="hd-schedule-card-header">
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
                                                                <select
                                                                    className="hd-schedule-type-select"
                                                                    value={currentType}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'serviceType', e.target.value)}
                                                                >
                                                                    <option value="photo">📸 Chụp ảnh</option>
                                                                    <option value="makeup">💄 Trang điểm</option>
                                                                    <option value="cskh">📞 Chăm sóc khách hàng</option>
                                                                    <option value="support">🤝 Hỗ trợ</option>
                                                                </select>
                                                                <span className="hd-schedule-turn-badge">
                                                                    Lượt {sch.luot || (schIdx + 1)}
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveManualSchedule(sch.id)}
                                                                className="hd-schedule-delete-btn"
                                                                title="Xóa nhiệm vụ này"
                                                            >
                                                                ✕ Xóa
                                                            </button>
                                                        </div>

                                                        <div className="hd-schedule-fields-grid">
                                                            {/* Tên / Nội dung nhiệm vụ */}
                                                            <div className="hd-floating-field">
                                                                <label>📌 Nội dung nhiệm vụ phân công *</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="VD: Chụp phóng sự tiệc cưới, Makeup cô dâu tại nhà..."
                                                                    value={sch.serviceName || ''}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'serviceName', e.target.value)}
                                                                />
                                                            </div>

                                                            {/* Thời gian */}
                                                            <div className="hd-floating-field">
                                                                <label>{timeLabel}</label>
                                                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                                                    <LunarDateTimePicker
                                                                        value={sch.ngayGio ? dayjs(sch.ngayGio) : null}
                                                                        onChange={(newValue) => {
                                                                            const formatted = newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '';
                                                                            handleScheduleFieldChange(sch.id, 'ngayGio', formatted);
                                                                            if (formatted && isShoot) {
                                                                                const conflict = checkNgayChupConflict(formatted, data?._id);
                                                                                if (conflict) {
                                                                                    const conflictTime = new Date(conflict.cacNgay.ngayChup);
                                                                                    const timeStr = \`\${String(conflictTime.getHours()).padStart(2, '0')}:\${String(conflictTime.getMinutes()).padStart(2, '0')} ngày \${conflictTime.getDate()}/\${conflictTime.getMonth() + 1}/\${conflictTime.getFullYear()}\`;
                                                                                    toast.warning(\`Cảnh báo: Trùng/gần lịch chụp với HĐ \${conflict.maHopDong} lúc \${timeStr}.\`);
                                                                                }
                                                                            }
                                                                        }}
                                                                        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                                                        format="DD/MM/YYYY HH:mm"
                                                                    />
                                                                </LocalizationProvider>
                                                                {sch.ngayGio && (
                                                                    <div className="hd-lunar-tag">
                                                                        🌙 Âm lịch: {formatLunarDateFull(sch.ngayGio)}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Địa điểm */}
                                                            <div className="hd-floating-field">
                                                                <label>📍 Địa điểm *</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder={isShoot ? "VD: Tại Studio, Phim trường, Ngoại cảnh..." : "VD: Nhà riêng cô dâu, Studio..."}
                                                                    value={sch.diaDiem || ''}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'diaDiem', e.target.value)}
                                                                />
                                                                <div className="hd-quick-chips">
                                                                    {quickLocations.map(chip => (
                                                                        <button
                                                                            key={chip}
                                                                            type="button"
                                                                            className="hd-quick-chip-btn"
                                                                            onClick={() => handleScheduleFieldChange(sch.id, 'diaDiem', chip)}
                                                                        >
                                                                            {chip}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Phân công nhân viên */}
                                                            <div className="hd-floating-field">
                                                                <label>{staffLabel}</label>
                                                                <select
                                                                    value={sch.nhanVien || ''}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'nhanVien', e.target.value)}
                                                                >
                                                                    <option value="">Chưa phân công</option>
                                                                    {(() => {
                                                                        let preferredRole = '';
                                                                        if (isShoot) preferredRole = 'Thợ chụp hình';
                                                                        else if (isMakeup) preferredRole = 'Thợ trang điểm';
                                                                        else if (isCSKH) preferredRole = 'Nhân viên Sale';

                                                                        const preferredStaff = preferredRole ? listStaff.filter(s => s.positon === preferredRole) : [];
                                                                        const otherStaff = preferredRole ? listStaff.filter(s => s.positon !== preferredRole) : listStaff;

                                                                        return (
                                                                            <>
                                                                                {preferredStaff.length > 0 && (
                                                                                    <optgroup label={\`-- Phù hợp (\${preferredRole}) --\`}>
                                                                                        {preferredStaff.map(s => {
                                                                                            const name = s.fullname || s.username;
                                                                                            return <option key={s.username || s._id || name} value={name}>{name}</option>;
                                                                                        })}
                                                                                    </optgroup>
                                                                                )}
                                                                                <optgroup label="-- Tất cả nhân viên --">
                                                                                    {otherStaff.map(s => {
                                                                                        const name = s.fullname || s.username;
                                                                                        return <option key={s.username || s._id || name} value={name}>{name} {s.positon ? \`(\${s.positon})\` : ''}</option>;
                                                                                    })}
                                                                                </optgroup>
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </select>
                                                            </div>

                                                            {/* Ghi chú */}
                                                            <div className="hd-floating-field">
                                                                <label>📝 Ghi chú yêu cầu</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Ghi chú yêu cầu nếu có..."
                                                                    value={sch.ghiChu || ''}
                                                                    onChange={(e) => handleScheduleFieldChange(sch.id, 'ghiChu', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="hd-schedule-empty">
                                                <div>📋 <strong>Chưa có lịch phân công nhiệm vụ nào</strong></div>
                                                <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#64748b' }}>
                                                    Bấm vào các nút <strong>+ Chụp ảnh</strong>, <strong>+ Trang điểm</strong>, <strong>+ Chăm sóc KH</strong>, <strong>+ Hỗ trợ</strong> ở trên để thêm lịch phân công nhiệm vụ.
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                            `;

code = code.slice(0, startIdx) + sectionNew + code.slice(endIdx);
fs.writeFileSync(path, code, 'utf8');
console.log('Update DetailHopDongKhachHangDialog.js successful!');

