import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import otherService from '../../../API/services/otherService';
import {
  validatePackageDetails,
  calculatePackageTotals,
  savePackageDraft,
  loadPackageDraft
} from '../../../utils/packageDetailsAdapter';
import './PackageDetailsManager.css';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import TabOutlinedIcon from '@mui/icons-material/TabOutlined';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

const KIND_OPTIONS = [
  { value: 'photo_print', label: 'Ảnh cổng / Phóng lớn' },
  { value: 'photo_table', label: 'Ảnh để bàn' },
  { value: 'album', label: 'Album Photobook' },
  { value: 'frame', label: 'Khung ảnh Mica / Gỗ' },
  { value: 'electronic', label: 'USB / File ảnh HD' },
  { value: 'other', label: 'Khác' }
];

const OCCASION_OPTIONS = [
  { value: 'studio', label: 'Studio chụp ảnh' },
  { value: 'outdoor', label: 'Ngoại cảnh / Phim trường' },
  { value: 'engagement', label: 'Ngày lễ ăn hỏi' },
  { value: 'wedding_day', label: 'Ngày lễ cưới / Tiệc cưới' },
  { value: 'unspecified', label: 'Chưa xác định' }
];

const RECIPIENT_OPTIONS = [
  { value: 'bride', label: 'Cô dâu' },
  { value: 'groom', label: 'Chú rể' },
  { value: 'mother', label: 'Mẹ cô dâu / Chú rể' },
  { value: 'bridesmaid', label: 'Đội bê đỡ tráp' },
  { value: 'other', label: 'Khác' }
];

const WARDROBE_TYPE_OPTIONS = [
  { value: 'ao_dai', label: 'Áo dài' },
  { value: 'wedding_dress', label: 'Váy cưới' },
  { value: 'vest', label: 'Vest chú rể' },
  { value: 'evening_gown', label: 'Váy dạ hội' },
  { value: 'ao_dai_be_trap', label: 'Áo dài bê tráp' },
  { value: 'accessory', label: 'Phụ kiện cưới' },
  { value: 'other', label: 'Khác' }
];

// Popular quick sizes presets
const QUICK_SIZES = [
  { w: 20, h: 30, label: '20×30' },
  { w: 30, h: 45, label: '30×45' },
  { w: 40, h: 60, label: '40×60' },
  { w: 50, h: 75, label: '50×75' },
  { w: 60, h: 90, label: '60×90 (Cổng chuẩn)' },
  { w: 70, h: 105, label: '70×105' },
  { w: 80, h: 120, label: '80×120' }
];

function PackageDetailsManager({
  packageCode = 'PACKAGE',
  details,
  onChange,
  isEditing = false
}) {
  const [activeTab, setActiveTab] = useState('schedules'); // 'schedules' | 'retouch' | 'deliverables' | 'makeup' | 'wardrobe' | 'extras' | 'terms'
  const [displayMode, setDisplayMode] = useState('tabs'); // 'tabs' | 'all'
  const [openSections, setOpenSections] = useState({
    schedules: true,
    retouch: true,
    deliverables: true,
    makeup: true,
    wardrobe: true,
    extras: true,
    terms: true
  });

  const [photoSizes, setPhotoSizes] = useState([]);
  const [openAddSizeDialog, setOpenAddSizeDialog] = useState(false);
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizeWidth, setNewSizeWidth] = useState('');
  const [newSizeHeight, setNewSizeHeight] = useState('');
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  // Load photo sizes catalog from backend
  const loadSizes = async () => {
    try {
      const res = await otherService.listPhotoSizes();
      if (res && res.data) {
        setPhotoSizes(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.warn("Could not load photo sizes catalog:", err);
    }
  };

  useEffect(() => {
    loadSizes();
    const existingDraft = loadPackageDraft(packageCode);
    if (existingDraft && isEditing) {
      setHasSavedDraft(true);
    }
  }, [packageCode, isEditing]);

  const toggleSection = (sectionKey) => {
    setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const handleDetailsChange = (updater) => {
    const updated = typeof updater === 'function' ? updater(details) : updater;
    onChange(updated);
    savePackageDraft(packageCode, updated);
  };

  const handleRestoreDraft = () => {
    const draft = loadPackageDraft(packageCode);
    if (draft) {
      onChange(draft);
      setHasSavedDraft(false);
      toast.success("Đã khôi phục dữ liệu bản nháp chưa lưu!");
    }
  };

  // 1. Photo Retouch Handlers
  const updateRetouch = (key, value) => {
    handleDetailsChange(prev => ({
      ...prev,
      photoRetouch: {
        ...(prev.photoRetouch || {}),
        [key]: value
      }
    }));
  };

  // 2. Photo Schedules Handlers
  const addSchedule = () => {
    handleDetailsChange(prev => ({
      ...prev,
      photoSchedules: [
        ...(prev.photoSchedules || []),
        {
          id: `sch_${Date.now()}`,
          occasion: 'studio',
          sessionCount: 1,
          dayCount: 1,
          location: 'Studio Long Wedding',
          staff: '1 Photo + 1 Makeup',
          note: ''
        }
      ]
    }));
  };

  const updateSchedule = (index, key, value) => {
    handleDetailsChange(prev => {
      const list = [...(prev.photoSchedules || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, photoSchedules: list };
    });
  };

  const deleteSchedule = (index) => {
    handleDetailsChange(prev => ({
      ...prev,
      photoSchedules: (prev.photoSchedules || []).filter((_, i) => i !== index)
    }));
  };

  // 3. Deliverables Handlers (Thêm, Sửa, Xóa, Sắp xếp - AC-01, AC-02, AC-03)
  const addDeliverable = () => {
    handleDetailsChange(prev => {
      const list = prev.deliverables || [];
      return {
        ...prev,
        deliverables: [
          ...list,
          {
            id: `del_${Date.now()}`,
            kind: 'photo_print',
            name: 'Ảnh cổng cưới 60×90',
            widthCm: 60,
            heightCm: 90,
            quantity: 1,
            material: 'Mika HD bo viền',
            note: '',
            sortOrder: list.length + 1
          }
        ]
      };
    });
  };

  const quickAddDeliverable = (w, h, label) => {
    handleDetailsChange(prev => {
      const list = prev.deliverables || [];
      const isLarge = (w >= 50 && h >= 75);
      return {
        ...prev,
        deliverables: [
          ...list,
          {
            id: `del_${Date.now()}`,
            kind: isLarge ? 'photo_print' : 'photo_table',
            name: `${isLarge ? 'Ảnh cổng' : 'Ảnh để bàn'} ${w}×${h}`,
            widthCm: w,
            heightCm: h,
            quantity: 1,
            material: isLarge ? 'Mika HD bo viền' : 'Mika để bàn',
            note: '',
            sortOrder: list.length + 1
          }
        ]
      };
    });
    toast.success(`Đã thêm nhanh sản phẩm khổ ${w}×${h} cm!`);
  };

  const updateDeliverable = (index, key, value) => {
    handleDetailsChange(prev => {
      const list = [...(prev.deliverables || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, deliverables: list };
    });
  };

  const handleSelectSizeForDeliverable = (index, sizeName) => {
    if (sizeName === 'ADD_NEW_SIZE') {
      setOpenAddSizeDialog(true);
      return;
    }
    const found = photoSizes.find(s => s.name === sizeName);
    if (found) {
      handleDetailsChange(prev => {
        const list = [...(prev.deliverables || [])];
        list[index] = {
          ...list[index],
          widthCm: found.widthCm,
          heightCm: found.heightCm,
          name: list[index].name || `Ảnh ${found.name}`
        };
        return { ...prev, deliverables: list };
      });
    }
  };

  const deleteDeliverable = (index) => {
    handleDetailsChange(prev => ({
      ...prev,
      deliverables: (prev.deliverables || []).filter((_, i) => i !== index)
    }));
  };

  const moveDeliverable = (index, direction) => {
    handleDetailsChange(prev => {
      const list = [...(prev.deliverables || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      list.forEach((item, idx) => {
        item.sortOrder = idx + 1;
      });
      return { ...prev, deliverables: list };
    });
  };

  // Handle adding new custom photo size to common catalog (AC-02)
  const handleSaveNewCustomSize = async () => {
    const w = parseInt(newSizeWidth, 10);
    const h = parseInt(newSizeHeight, 10);
    if (!w || w <= 0 || !h || h <= 0) {
      toast.error("Chiều rộng và chiều cao phải là số nguyên lớn hơn 0!");
      return;
    }

    const cleanName = (newSizeName && newSizeName.trim()) || `${w}x${h}`;
    try {
      await otherService.createPhotoSize({
        name: cleanName,
        widthCm: w,
        heightCm: h,
        unit: 'cm',
        description: 'Kích thước tùy chỉnh'
      });
      toast.success(`Đã thêm kích thước ${cleanName} vào danh mục dùng chung!`);
      await loadSizes();
      setOpenAddSizeDialog(false);
      setNewSizeName('');
      setNewSizeWidth('');
      setNewSizeHeight('');
    } catch (err) {
      toast.error("Lỗi khi thêm kích thước mới: " + (err?.message || "Đã có lỗi xảy ra"));
    }
  };

  // 4. Makeup Handlers (AC-06, AC-12)
  const addMakeup = () => {
    handleDetailsChange(prev => ({
      ...prev,
      makeupSessions: [
        ...(prev.makeupSessions || []),
        {
          id: `mk_${Date.now()}`,
          occasion: 'wedding_day',
          recipient: 'bride',
          sessionCount: 1,
          location: 'Tại studio / nhà gái',
          note: ''
        }
      ]
    }));
  };

  const updateMakeup = (index, key, value) => {
    handleDetailsChange(prev => {
      const list = [...(prev.makeupSessions || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, makeupSessions: list };
    });
  };

  const deleteMakeup = (index) => {
    handleDetailsChange(prev => ({
      ...prev,
      makeupSessions: (prev.makeupSessions || []).filter((_, i) => i !== index)
    }));
  };

  // 5. Wardrobe Handlers (AC-07)
  const addWardrobe = () => {
    handleDetailsChange(prev => ({
      ...prev,
      wardrobe: [
        ...(prev.wardrobe || []),
        {
          id: `wd_${Date.now()}`,
          occasion: 'wedding_day',
          recipient: 'bride',
          itemType: 'wedding_dress',
          quantity: 1,
          unit: 'bộ',
          maxValueVnd: 0,
          legacyNote: '',
          note: ''
        }
      ]
    }));
  };

  const updateWardrobe = (index, key, value) => {
    handleDetailsChange(prev => {
      const list = [...(prev.wardrobe || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, wardrobe: list };
    });
  };

  const deleteWardrobe = (index) => {
    handleDetailsChange(prev => ({
      ...prev,
      wardrobe: (prev.wardrobe || []).filter((_, i) => i !== index)
    }));
  };

  // 6. Extras Handlers
  const addExtra = () => {
    handleDetailsChange(prev => ({
      ...prev,
      extras: [
        ...(prev.extras || []),
        {
          id: `ex_${Date.now()}`,
          title: 'Hoa tươi cầm tay cô dâu',
          quantity: 1,
          included: 'included',
          estimatedValueVnd: 0,
          note: ''
        }
      ]
    }));
  };

  const updateExtra = (index, key, value) => {
    handleDetailsChange(prev => {
      const list = [...(prev.extras || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, extras: list };
    });
  };

  const deleteExtra = (index) => {
    handleDetailsChange(prev => ({
      ...prev,
      extras: (prev.extras || []).filter((_, i) => i !== index)
    }));
  };

  // 7. Terms Handlers
  const addTerm = () => {
    handleDetailsChange(prev => {
      const list = prev.terms || [];
      return {
        ...prev,
        terms: [
          ...list,
          {
            id: `tm_${Date.now()}`,
            title: 'Quy định dời lịch & trả ảnh',
            body: '',
            visibleToCustomer: true,
            sortOrder: list.length + 1
          }
        ]
      };
    });
  };

  const updateTerm = (index, key, value) => {
    handleDetailsChange(prev => {
      const list = [...(prev.terms || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, terms: list };
    });
  };

  const deleteTerm = (index) => {
    handleDetailsChange(prev => ({
      ...prev,
      terms: (prev.terms || []).filter((_, i) => i !== index)
    }));
  };

  // Derived totals
  const totals = calculatePackageTotals(details);
  const validation = validatePackageDetails(details);

  const TABS = [
    { id: 'schedules', label: 'Lịch & Ekip', icon: '📅', count: totals.totalLichChup, unit: 'buổi', color: 'blue' },
    { id: 'retouch', label: 'Hậu kỳ ảnh', icon: '🎨', count: totals.totalAnhChinhSua, unit: 'file', color: 'amber' },
    { id: 'deliverables', label: 'Bàn giao ảnh', icon: '🖼️', count: totals.totalDeliverablesCount, unit: 'sp', color: 'emerald' },
    { id: 'makeup', label: 'Makeup', icon: '💄', count: totals.totalLichMake, unit: 'lượt', color: 'pink' },
    { id: 'wardrobe', label: 'Trang phục', icon: '👗', count: (details?.wardrobe || []).length, unit: 'mục', color: 'purple' },
    { id: 'extras', label: 'Quà tặng', icon: '🎁', count: (details?.extras || []).length, unit: 'mục', color: 'cyan' },
    { id: 'terms', label: 'Điều khoản', icon: '📜', count: (details?.terms || []).length, unit: 'mục', color: 'slate' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (displayMode === 'all') {
      // If in accordion mode, switch back to focused tab mode for clarity
      setDisplayMode('tabs');
    }
  };

  // =========================================================================
  // RENDER SECTIONS
  // =========================================================================

  // Section 1: Lịch chụp & Ekip
  const renderSchedulesContent = () => (
    <div className="pdm-section-container">
      {isEditing ? (
        <>
          {(details?.photoSchedules || []).length === 0 ? (
            <div className="pdm-empty-state">
              <span className="pdm-empty-icon">📅</span>
              <p>Chưa thiết lập lịch chụp cho gói này.</p>
              <button type="button" className="pdm-btn-primary" onClick={addSchedule}>
                <AddRoundedIcon fontSize="small" /> Thêm buổi chụp đầu tiên
              </button>
            </div>
          ) : (
            <div className="pdm-cards-list">
              {(details?.photoSchedules || []).map((sch, idx) => (
                <div className="pdm-card-row" key={sch.id || idx}>
                  <div className="pdm-card-badge">#{idx + 1}</div>

                  <div className="pdm-card-fields">
                    {/* Field 1: Dịp chụp */}
                    <div className="pdm-field" style={{ minWidth: '150px', flex: '1.2' }}>
                      <label>Dịp / Địa điểm chụp</label>
                      <select
                        className="pdm-select"
                        value={sch.occasion || 'studio'}
                        onChange={(e) => updateSchedule(idx, 'occasion', e.target.value)}
                      >
                        {OCCASION_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Field 2: Số buổi Stepper */}
                    <div className="pdm-field" style={{ width: '120px' }}>
                      <label>Số buổi</label>
                      <div className="pdm-stepper">
                        <button
                          type="button"
                          onClick={() => updateSchedule(idx, 'sessionCount', Math.max(0, (sch.sessionCount || 0) - 1))}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={sch.sessionCount}
                          onChange={(e) => updateSchedule(idx, 'sessionCount', parseInt(e.target.value, 10) || 0)}
                        />
                        <button
                          type="button"
                          onClick={() => updateSchedule(idx, 'sessionCount', (sch.sessionCount || 0) + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Field 3: Số ngày Stepper */}
                    <div className="pdm-field" style={{ width: '120px' }}>
                      <label>Số ngày</label>
                      <div className="pdm-stepper">
                        <button
                          type="button"
                          onClick={() => updateSchedule(idx, 'dayCount', Math.max(0, (sch.dayCount || 0) - 1))}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={sch.dayCount}
                          onChange={(e) => updateSchedule(idx, 'dayCount', parseInt(e.target.value, 10) || 0)}
                        />
                        <button
                          type="button"
                          onClick={() => updateSchedule(idx, 'dayCount', (sch.dayCount || 0) + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Field 4: Địa điểm cụ thể */}
                    <div className="pdm-field" style={{ minWidth: '160px', flex: '1.5' }}>
                      <label>Địa điểm cụ thể</label>
                      <input
                        type="text"
                        className="pdm-input"
                        value={sch.location || ''}
                        onChange={(e) => updateSchedule(idx, 'location', e.target.value)}
                        placeholder="vd: Studio Long Wedding, Phim trường Santorini..."
                      />
                    </div>

                    {/* Field 5: Ekip phân công */}
                    <div className="pdm-field" style={{ minWidth: '150px', flex: '1.3' }}>
                      <label>Ekip phân công</label>
                      <input
                        type="text"
                        className="pdm-input"
                        value={sch.staff || ''}
                        onChange={(e) => updateSchedule(idx, 'staff', e.target.value)}
                        placeholder="vd: 1 Photo + 1 Makeup"
                      />
                    </div>

                    {/* Field 6: Ghi chú */}
                    <div className="pdm-field" style={{ minWidth: '130px', flex: '1' }}>
                      <label>Ghi chú</label>
                      <input
                        type="text"
                        className="pdm-input"
                        value={sch.note || ''}
                        onChange={(e) => updateSchedule(idx, 'note', e.target.value)}
                        placeholder="Lưu ý riêng"
                      />
                    </div>
                  </div>

                  <div className="pdm-card-actions">
                    <button
                      type="button"
                      className="pdm-btn-icon pdm-btn-delete"
                      onClick={() => deleteSchedule(idx)}
                      title="Xóa buổi chụp này"
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pdm-bottom-add">
                <button type="button" className="pdm-btn-add" onClick={addSchedule}>
                  <AddRoundedIcon fontSize="small" /> Thêm lịch chụp
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="pdm-view-grid">
          {(details?.photoSchedules || []).length === 0 ? (
            <div className="pdm-empty-text">Không có lịch chụp.</div>
          ) : (
            (details?.photoSchedules || []).map((sch, i) => (
              <div className="pdm-view-card" key={sch.id || i}>
                <span className="pdm-view-icon">📸</span>
                <div className="pdm-view-info">
                  <div className="pdm-view-title">{sch.location || 'Studio'} ({sch.sessionCount} buổi)</div>
                  <div className="pdm-view-desc">Ekip: {sch.staff || 'Theo phân công'} • {sch.dayCount} ngày</div>
                  {sch.note && <div className="pdm-view-desc" style={{ fontStyle: 'italic' }}>{sch.note}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // Section 2: File ảnh & Hậu kỳ
  const renderRetouchContent = () => (
    <div className="pdm-section-container">
      {isEditing ? (
        <div className="pdm-retouch-grid">
          <div className="pdm-form-box">
            <div className="pdm-form-box-header">
              <span className="pdm-box-icon">🎨</span>
              <div>
                <h4>Số file ảnh chỉnh sửa (retouch)</h4>
                <p>Số lượng ảnh hoàn thiện bàn giao cho khách</p>
              </div>
            </div>
            <div className="pdm-stepper-large">
              <button
                type="button"
                onClick={() => updateRetouch('editedFileCount', Math.max(0, ((details?.photoRetouch?.editedFileCount) || 0) - 1))}
              >
                −
              </button>
              <input
                type="number"
                min="0"
                className={`pdm-input-number ${validation.fieldErrors['photoRetouch.editedFileCount'] ? 'has-error' : ''}`}
                value={details?.photoRetouch?.editedFileCount ?? 0}
                onChange={(e) => updateRetouch('editedFileCount', parseInt(e.target.value, 10) || 0)}
              />
              <button
                type="button"
                onClick={() => updateRetouch('editedFileCount', ((details?.photoRetouch?.editedFileCount) || 0) + 1)}
              >
                +
              </button>
            </div>
            {validation.fieldErrors['photoRetouch.editedFileCount'] && (
              <div className="pdm-error-text">{validation.fieldErrors['photoRetouch.editedFileCount']}</div>
            )}
          </div>

          <div className="pdm-form-box">
            <div className="pdm-form-box-header">
              <span className="pdm-box-icon">💾</span>
              <div>
                <h4>Bàn giao toàn bộ file gốc</h4>
                <p>Khách có được nhận toàn bộ file chụp thô?</p>
              </div>
            </div>
            <select
              className="pdm-select pdm-select-large"
              value={details?.photoRetouch?.rawFileStatus || 'unset'}
              onChange={(e) => updateRetouch('rawFileStatus', e.target.value)}
            >
              <option value="included">✅ Có (Trả toàn bộ file gốc)</option>
              <option value="excluded">❌ Không (Chỉ trả ảnh chỉnh sửa)</option>
              <option value="unset">⚪ Chưa thiết lập</option>
            </select>
          </div>

          <div className="pdm-form-box">
            <div className="pdm-form-box-header">
              <span className="pdm-box-icon">⏳</span>
              <div>
                <h4>Thời gian cam kết trả ảnh</h4>
                <p>Số ngày sau khi khách chọn ảnh duyệt in</p>
              </div>
            </div>
            <div className="pdm-inline-unit">
              <input
                type="number"
                min="0"
                className="pdm-input pdm-input-large"
                value={details?.photoRetouch?.deliveryDays ?? 7}
                onChange={(e) => updateRetouch('deliveryDays', parseInt(e.target.value, 10) || 0)}
                placeholder="7"
              />
              <span className="pdm-unit-badge">ngày</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="pdm-view-grid">
          <div className="pdm-view-card">
            <span className="pdm-view-icon">🎨</span>
            <div className="pdm-view-info">
              <div className="pdm-view-title">Số file ảnh chỉnh sửa</div>
              <div className="pdm-view-desc">{details?.photoRetouch?.editedFileCount || 0} file hoàn thiện</div>
            </div>
          </div>
          <div className="pdm-view-card">
            <span className="pdm-view-icon">💾</span>
            <div className="pdm-view-info">
              <div className="pdm-view-title">Trả toàn bộ file gốc</div>
              <div className="pdm-view-desc">
                {details?.photoRetouch?.rawFileStatus === 'included'
                  ? '✅ Bao gồm trả toàn bộ file gốc'
                  : (details?.photoRetouch?.rawFileStatus === 'excluded' ? '❌ Không bao gồm' : 'Chưa thiết lập')}
              </div>
            </div>
          </div>
          <div className="pdm-view-card">
            <span className="pdm-view-icon">⏳</span>
            <div className="pdm-view-info">
              <div className="pdm-view-title">Thời gian hẹn trả ảnh</div>
              <div className="pdm-view-desc">
                {details?.photoRetouch?.deliveryDays ? `${details.photoRetouch.deliveryDays} ngày sau khi chọn ảnh` : 'Theo thỏa thuận'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Section 3: Sản phẩm bàn giao (Deliverables - AC-01, AC-02, AC-03, AC-05, AC-09)
  const renderDeliverablesContent = () => (
    <div className="pdm-section-container">
      {isEditing && (
        <div className="pdm-quick-bar">
          <div className="pdm-quick-title">
            <FlashOnRoundedIcon fontSize="small" style={{ color: '#059669' }} />
            <span>Chọn nhanh khổ ảnh in ấn:</span>
          </div>
          <div className="pdm-quick-chips">
            {QUICK_SIZES.map(s => (
              <button
                key={`${s.w}x${s.h}`}
                type="button"
                className="pdm-quick-chip"
                onClick={() => quickAddDeliverable(s.w, s.h, s.label)}
              >
                + {s.label}
              </button>
            ))}
            <button
              type="button"
              className="pdm-quick-chip pdm-quick-chip-new"
              onClick={() => setOpenAddSizeDialog(true)}
            >
              ➕ Khổ mới vào danh mục...
            </button>
          </div>
        </div>
      )}

      {isEditing ? (
        <>
          {(details?.deliverables || []).length === 0 ? (
            <div className="pdm-empty-state">
              <span className="pdm-empty-icon">🖼️</span>
              <p>Chưa có sản phẩm in ấn / bàn giao nào.</p>
              <p className="pdm-empty-sub">Hãy nhấn chọn nhanh một khổ ảnh ở trên hoặc bấm thêm sản phẩm.</p>
              <button type="button" className="pdm-btn-primary" onClick={addDeliverable}>
                <AddRoundedIcon fontSize="small" /> Thêm sản phẩm bàn giao
              </button>
            </div>
          ) : (
            <div className="pdm-cards-list">
              {(details?.deliverables || []).map((del, idx) => {
                const wErr = validation.fieldErrors[`deliverables.${idx}.widthCm`];
                const hErr = validation.fieldErrors[`deliverables.${idx}.heightCm`];
                const qErr = validation.fieldErrors[`deliverables.${idx}.quantity`];
                const currentSizeKey = `${del.widthCm}x${del.heightCm}`;

                return (
                  <div className="pdm-card-row" key={del.id || idx}>
                    {/* Sắp xếp & Thứ tự */}
                    <div className="pdm-row-drag">
                      <span className="pdm-row-idx">#{idx + 1}</span>
                      <div className="pdm-row-arrows">
                        <button
                          type="button"
                          className="pdm-btn-arrow"
                          onClick={() => moveDeliverable(idx, -1)}
                          disabled={idx === 0}
                          title="Chuyển lên"
                        >
                          <ArrowUpwardRoundedIcon fontSize="inherit" />
                        </button>
                        <button
                          type="button"
                          className="pdm-btn-arrow"
                          onClick={() => moveDeliverable(idx, 1)}
                          disabled={idx === (details.deliverables.length - 1)}
                          title="Chuyển xuống"
                        >
                          <ArrowDownwardRoundedIcon fontSize="inherit" />
                        </button>
                      </div>
                    </div>

                    <div className="pdm-card-fields">
                      {/* Phân loại */}
                      <div className="pdm-field" style={{ minWidth: '150px', flex: '1.1' }}>
                        <label>Loại sản phẩm</label>
                        <select
                          className="pdm-select"
                          value={del.kind || 'photo_print'}
                          onChange={(e) => updateDeliverable(idx, 'kind', e.target.value)}
                        >
                          {KIND_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Khổ ảnh: Dropdown + Rộng x Cao */}
                      <div className="pdm-field" style={{ minWidth: '220px', flex: '1.6' }}>
                        <label>Khổ ảnh (Rộng × Cao cm)</label>
                        <div className="pdm-size-combo">
                          <select
                            className="pdm-select"
                            value={photoSizes.some(s => s.name === currentSizeKey) ? currentSizeKey : ''}
                            onChange={(e) => handleSelectSizeForDeliverable(idx, e.target.value)}
                            style={{ maxWidth: '120px' }}
                          >
                            <option value="">Khổ chuẩn...</option>
                            {photoSizes.map(s => (
                              <option key={s._id || s.name} value={s.name}>{s.name} cm</option>
                            ))}
                            <option value="ADD_NEW_SIZE">+ Khổ mới...</option>
                          </select>
                          <div className="pdm-wh-inputs">
                            <input
                              type="number"
                              min="1"
                              className={`pdm-input-wh ${wErr ? 'has-error' : ''}`}
                              value={del.widthCm}
                              onChange={(e) => updateDeliverable(idx, 'widthCm', parseInt(e.target.value, 10) || 0)}
                              placeholder="R"
                              title={wErr || ''}
                            />
                            <span className="pdm-wh-times">×</span>
                            <input
                              type="number"
                              min="1"
                              className={`pdm-input-wh ${hErr ? 'has-error' : ''}`}
                              value={del.heightCm}
                              onChange={(e) => updateDeliverable(idx, 'heightCm', parseInt(e.target.value, 10) || 0)}
                              placeholder="C"
                              title={hErr || ''}
                            />
                            <span className="pdm-unit-text">cm</span>
                          </div>
                        </div>
                      </div>

                      {/* Số lượng Stepper */}
                      <div className="pdm-field" style={{ width: '115px' }}>
                        <label>Số lượng</label>
                        <div className="pdm-stepper">
                          <button
                            type="button"
                            onClick={() => updateDeliverable(idx, 'quantity', Math.max(0, (del.quantity || 0) - 1))}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            className={qErr ? 'has-error' : ''}
                            value={del.quantity}
                            onChange={(e) => updateDeliverable(idx, 'quantity', parseInt(e.target.value, 10) || 0)}
                            title={qErr || ''}
                          />
                          <button
                            type="button"
                            onClick={() => updateDeliverable(idx, 'quantity', (del.quantity || 0) + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Chất liệu / Quy cách */}
                      <div className="pdm-field" style={{ minWidth: '150px', flex: '1.3' }}>
                        <label>Quy cách / Chất liệu</label>
                        <input
                          type="text"
                          className="pdm-input"
                          value={del.material || ''}
                          onChange={(e) => updateDeliverable(idx, 'material', e.target.value)}
                          placeholder="vd: Mika HD bo viền, Gỗ composite..."
                        />
                      </div>

                      {/* Ghi chú */}
                      <div className="pdm-field" style={{ minWidth: '120px', flex: '1' }}>
                        <label>Ghi chú</label>
                        <input
                          type="text"
                          className="pdm-input"
                          value={del.note || ''}
                          onChange={(e) => updateDeliverable(idx, 'note', e.target.value)}
                          placeholder="Lưu ý riêng"
                        />
                      </div>
                    </div>

                    <div className="pdm-card-actions">
                      <button
                        type="button"
                        className="pdm-btn-icon pdm-btn-delete"
                        onClick={() => deleteDeliverable(idx)}
                        title="Xóa sản phẩm này"
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pdm-bottom-add">
                <button type="button" className="pdm-btn-add" onClick={addDeliverable}>
                  <AddRoundedIcon fontSize="small" /> Thêm sản phẩm bàn giao
                </button>
                <span className="pdm-sub-hint">
                  💡 Các dòng có số lượng = 0 sẽ tự động ẩn khi in phụ lục hợp đồng.
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="pdm-view-grid">
          {(details?.deliverables || []).length === 0 ? (
            <div className="pdm-empty-text">Không có sản phẩm bàn giao nào.</div>
          ) : (
            (details?.deliverables || []).map((del, i) => (
              <div className="pdm-view-card" key={del.id || i}>
                <span className="pdm-view-icon">🖼️</span>
                <div className="pdm-view-info">
                  <div className="pdm-view-title">{del.name || `Ảnh ${del.widthCm}×${del.heightCm}`} ({del.quantity} cái)</div>
                  <div className="pdm-view-desc">Kích thước: <strong>{del.widthCm}×{del.heightCm} cm</strong></div>
                  {del.material && <div className="pdm-view-desc">Chất liệu: {del.material}</div>}
                  {del.note && <div className="pdm-view-desc" style={{ fontStyle: 'italic' }}>{del.note}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // Section 4: Makeup & Làm đẹp
  const renderMakeupContent = () => (
    <div className="pdm-section-container">
      {isEditing ? (
        <>
          {(details?.makeupSessions || []).length === 0 ? (
            <div className="pdm-empty-state">
              <span className="pdm-empty-icon">💄</span>
              <p>Gói dịch vụ này hiện không bao gồm makeup (sẽ không phát sinh lịch trang điểm).</p>
              <button type="button" className="pdm-btn-primary" onClick={addMakeup}>
                <AddRoundedIcon fontSize="small" /> Thêm lịch makeup
              </button>
            </div>
          ) : (
            <div className="pdm-cards-list">
              {(details?.makeupSessions || []).map((mk, idx) => (
                <div className="pdm-card-row" key={mk.id || idx}>
                  <div className="pdm-card-badge">#{idx + 1}</div>

                  <div className="pdm-card-fields">
                    {/* Dịp makeup */}
                    <div className="pdm-field" style={{ minWidth: '150px', flex: '1.2' }}>
                      <label>Dịp trang điểm</label>
                      <select
                        className="pdm-select"
                        value={mk.occasion || 'wedding_day'}
                        onChange={(e) => updateMakeup(idx, 'occasion', e.target.value)}
                      >
                        {OCCASION_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Đối tượng */}
                    <div className="pdm-field" style={{ minWidth: '140px', flex: '1.1' }}>
                      <label>Đối tượng</label>
                      <select
                        className="pdm-select"
                        value={mk.recipient || 'bride'}
                        onChange={(e) => updateMakeup(idx, 'recipient', e.target.value)}
                      >
                        {RECIPIENT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Số lượt Stepper */}
                    <div className="pdm-field" style={{ width: '120px' }}>
                      <label>Số lượt make</label>
                      <div className="pdm-stepper">
                        <button
                          type="button"
                          onClick={() => updateMakeup(idx, 'sessionCount', Math.max(0, (mk.sessionCount || 0) - 1))}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          className={validation.fieldErrors[`makeupSessions.${idx}.sessionCount`] ? 'has-error' : ''}
                          value={mk.sessionCount}
                          onChange={(e) => updateMakeup(idx, 'sessionCount', parseInt(e.target.value, 10) || 0)}
                        />
                        <button
                          type="button"
                          onClick={() => updateMakeup(idx, 'sessionCount', (mk.sessionCount || 0) + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Địa điểm */}
                    <div className="pdm-field" style={{ minWidth: '160px', flex: '1.5' }}>
                      <label>Địa điểm</label>
                      <input
                        type="text"
                        className="pdm-input"
                        value={mk.location || ''}
                        onChange={(e) => updateMakeup(idx, 'location', e.target.value)}
                        placeholder="vd: Tại Studio / Nhà gái..."
                      />
                    </div>

                    {/* Ghi chú */}
                    <div className="pdm-field" style={{ minWidth: '130px', flex: '1' }}>
                      <label>Ghi chú</label>
                      <input
                        type="text"
                        className="pdm-input"
                        value={mk.note || ''}
                        onChange={(e) => updateMakeup(idx, 'note', e.target.value)}
                        placeholder="Lưu ý riêng"
                      />
                    </div>
                  </div>

                  <div className="pdm-card-actions">
                    <button
                      type="button"
                      className="pdm-btn-icon pdm-btn-delete"
                      onClick={() => deleteMakeup(idx)}
                      title="Xóa lượt make này"
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pdm-bottom-add">
                <button type="button" className="pdm-btn-add" onClick={addMakeup}>
                  <AddRoundedIcon fontSize="small" /> Thêm lịch makeup
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="pdm-view-grid">
          {(details?.makeupSessions || []).length === 0 ? (
            <div className="pdm-empty-text">Không bao gồm makeup.</div>
          ) : (
            (details?.makeupSessions || []).map((mk, i) => (
              <div className="pdm-view-card" key={mk.id || i}>
                <span className="pdm-view-icon">💄</span>
                <div className="pdm-view-info">
                  <div className="pdm-view-title">
                    {mk.recipient === 'bride' ? 'Cô dâu' : (mk.recipient === 'groom' ? 'Chú rể' : mk.recipient)} ({mk.sessionCount} lượt)
                  </div>
                  <div className="pdm-view-desc">Địa điểm: {mk.location || 'Tại studio'}</div>
                  {mk.note && <div className="pdm-view-desc" style={{ fontStyle: 'italic' }}>{mk.note}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // Section 5: Trang phục & Phụ kiện
  const renderWardrobeContent = () => (
    <div className="pdm-section-container">
      {isEditing ? (
        <>
          {(details?.wardrobe || []).length === 0 ? (
            <div className="pdm-empty-state">
              <span className="pdm-empty-icon">👗</span>
              <p>Chưa cấu hình trang phục cho gói này.</p>
              <button type="button" className="pdm-btn-primary" onClick={addWardrobe}>
                <AddRoundedIcon fontSize="small" /> Thêm trang phục
              </button>
            </div>
          ) : (
            <div className="pdm-cards-list">
              {(details?.wardrobe || []).map((wd, idx) => (
                <div className="pdm-card-row" key={wd.id || idx}>
                  <div className="pdm-card-badge">#{idx + 1}</div>

                  <div className="pdm-card-fields">
                    {/* Dịp & Đối tượng */}
                    <div className="pdm-field" style={{ minWidth: '130px', flex: '1' }}>
                      <label>Dịp sử dụng</label>
                      <select
                        className="pdm-select"
                        value={wd.occasion || 'wedding_day'}
                        onChange={(e) => updateWardrobe(idx, 'occasion', e.target.value)}
                      >
                        {OCCASION_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="pdm-field" style={{ minWidth: '120px', flex: '1' }}>
                      <label>Người mặc</label>
                      <select
                        className="pdm-select"
                        value={wd.recipient || 'bride'}
                        onChange={(e) => updateWardrobe(idx, 'recipient', e.target.value)}
                      >
                        {RECIPIENT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Loại trang phục */}
                    <div className="pdm-field" style={{ minWidth: '130px', flex: '1.2' }}>
                      <label>Loại trang phục</label>
                      <select
                        className="pdm-select"
                        value={wd.itemType || 'wedding_dress'}
                        onChange={(e) => updateWardrobe(idx, 'itemType', e.target.value)}
                      >
                        {WARDROBE_TYPE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Số lượng & Đơn vị */}
                    <div className="pdm-field" style={{ width: '135px' }}>
                      <label>Số lượng & ĐV</label>
                      <div className="pdm-stepper-combo">
                        <input
                          type="number"
                          min="0"
                          className="pdm-input-qty"
                          value={wd.quantity}
                          onChange={(e) => updateWardrobe(idx, 'quantity', parseInt(e.target.value, 10) || 0)}
                        />
                        <input
                          type="text"
                          className="pdm-input-unit"
                          value={wd.unit || 'bộ'}
                          onChange={(e) => updateWardrobe(idx, 'unit', e.target.value)}
                          placeholder="bộ"
                        />
                      </div>
                    </div>

                    {/* Trị giá tối đa VNĐ */}
                    <div className="pdm-field" style={{ minWidth: '140px', flex: '1.2' }}>
                      <label>Trị giá tối đa (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        step="100000"
                        className="pdm-input"
                        value={wd.maxValueVnd || 0}
                        onChange={(e) => updateWardrobe(idx, 'maxValueVnd', parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                      />
                    </div>

                    {/* Ghi chú */}
                    <div className="pdm-field" style={{ minWidth: '150px', flex: '1.5' }}>
                      <label>
                        Ghi chú
                        {wd.legacyNote && <span className="pdm-legacy-tag">[Legacy Note]</span>}
                      </label>
                      <input
                        type="text"
                        className="pdm-input"
                        value={wd.legacyNote ? `[Legacy] ${wd.legacyNote}` : (wd.note || '')}
                        onChange={(e) => updateWardrobe(idx, 'note', e.target.value)}
                        placeholder="Ghi chú thêm"
                      />
                    </div>
                  </div>

                  <div className="pdm-card-actions">
                    <button
                      type="button"
                      className="pdm-btn-icon pdm-btn-delete"
                      onClick={() => deleteWardrobe(idx)}
                      title="Xóa trang phục này"
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pdm-bottom-add">
                <button type="button" className="pdm-btn-add" onClick={addWardrobe}>
                  <AddRoundedIcon fontSize="small" /> Thêm trang phục
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="pdm-view-grid">
          {(details?.wardrobe || []).length === 0 ? (
            <div className="pdm-empty-text">Không có trang phục kèm theo.</div>
          ) : (
            (details?.wardrobe || []).map((wd, i) => (
              <div className="pdm-view-card" key={wd.id || i}>
                <span className="pdm-view-icon">👗</span>
                <div className="pdm-view-info">
                  <div className="pdm-view-title">
                    {wd.quantity > 0 ? `${wd.quantity} ${wd.unit || 'bộ'} ` : ''}{wd.itemType} ({wd.recipient === 'bride' ? 'Cô dâu' : (wd.recipient === 'groom' ? 'Chú rể' : wd.recipient)})
                  </div>
                  {wd.maxValueVnd > 0 && <div className="pdm-view-desc">Trị giá: {Number(wd.maxValueVnd).toLocaleString('vi-VN')} VNĐ</div>}
                  {wd.legacyNote && <div className="pdm-view-desc" style={{ color: '#d97706' }}>Nguyên bản: {wd.legacyNote}</div>}
                  {wd.note && <div className="pdm-view-desc" style={{ fontStyle: 'italic' }}>{wd.note}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // Section 6: Quà tặng & Quyền lợi
  const renderExtrasContent = () => (
    <div className="pdm-section-container">
      {isEditing ? (
        <>
          {(details?.extras || []).length === 0 ? (
            <div className="pdm-empty-state">
              <span className="pdm-empty-icon">🎁</span>
              <p>Chưa có quà tặng hoặc quyền lợi nào.</p>
              <button type="button" className="pdm-btn-primary" onClick={addExtra}>
                <AddRoundedIcon fontSize="small" /> Thêm quà tặng / quyền lợi
              </button>
            </div>
          ) : (
            <div className="pdm-cards-list">
              {(details?.extras || []).map((ex, idx) => (
                <div className="pdm-card-row" key={ex.id || idx}>
                  <div className="pdm-card-badge">#{idx + 1}</div>

                  <div className="pdm-card-fields">
                    {/* Tên quà tặng */}
                    <div className="pdm-field" style={{ minWidth: '180px', flex: '1.8' }}>
                      <label>Tên quà tặng / Quyền lợi</label>
                      <input
                        type="text"
                        className="pdm-input"
                        value={ex.title || ''}
                        onChange={(e) => updateExtra(idx, 'title', e.target.value)}
                        placeholder="vd: Hoa tươi cầm tay cô dâu, Xe hoa đưa đón..."
                      />
                    </div>

                    {/* Số lượng */}
                    <div className="pdm-field" style={{ width: '110px' }}>
                      <label>Số lượng</label>
                      <div className="pdm-stepper">
                        <button
                          type="button"
                          onClick={() => updateExtra(idx, 'quantity', Math.max(0, (ex.quantity || 0) - 1))}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={ex.quantity}
                          onChange={(e) => updateExtra(idx, 'quantity', parseInt(e.target.value, 10) || 0)}
                        />
                        <button
                          type="button"
                          onClick={() => updateExtra(idx, 'quantity', (ex.quantity || 0) + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Trạng thái */}
                    <div className="pdm-field" style={{ minWidth: '140px', flex: '1.1' }}>
                      <label>Trạng thái</label>
                      <select
                        className="pdm-select"
                        value={ex.included || 'included'}
                        onChange={(e) => updateExtra(idx, 'included', e.target.value)}
                      >
                        <option value="included">✅ Tặng kèm (Bao gồm)</option>
                        <option value="excluded">❌ Không bao gồm</option>
                        <option value="unset">⚪ Chưa thiết lập</option>
                      </select>
                    </div>

                    {/* Trị giá ước tính */}
                    <div className="pdm-field" style={{ minWidth: '130px', flex: '1.1' }}>
                      <label>Trị giá ước tính (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        step="50000"
                        className="pdm-input"
                        value={ex.estimatedValueVnd || 0}
                        onChange={(e) => updateExtra(idx, 'estimatedValueVnd', parseInt(e.target.value, 10) || 0)}
                      />
                    </div>

                    {/* Ghi chú */}
                    <div className="pdm-field" style={{ minWidth: '130px', flex: '1' }}>
                      <label>Ghi chú</label>
                      <input
                        type="text"
                        className="pdm-input"
                        value={ex.note || ''}
                        onChange={(e) => updateExtra(idx, 'note', e.target.value)}
                        placeholder="Lưu ý"
                      />
                    </div>
                  </div>

                  <div className="pdm-card-actions">
                    <button
                      type="button"
                      className="pdm-btn-icon pdm-btn-delete"
                      onClick={() => deleteExtra(idx)}
                      title="Xóa quyền lợi này"
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pdm-bottom-add">
                <button type="button" className="pdm-btn-add" onClick={addExtra}>
                  <AddRoundedIcon fontSize="small" /> Thêm quà tặng / quyền lợi
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="pdm-view-grid">
          {(details?.extras || []).length === 0 ? (
            <div className="pdm-empty-text">Không có quà tặng đi kèm.</div>
          ) : (
            (details?.extras || []).map((ex, i) => (
              <div className="pdm-view-card" key={ex.id || i}>
                <span className="pdm-view-icon">🎁</span>
                <div className="pdm-view-info">
                  <div className="pdm-view-title">{ex.title} (x{ex.quantity || 1})</div>
                  <div className="pdm-view-desc">
                    {ex.included === 'included' ? '✅ Được tặng kèm' : (ex.included === 'excluded' ? '❌ Không bao gồm' : 'Chưa thiết lập')}
                    {ex.estimatedValueVnd > 0 && ` - Trị giá: ${Number(ex.estimatedValueVnd).toLocaleString('vi-VN')} VNĐ`}
                  </div>
                  {ex.note && <div className="pdm-view-desc" style={{ fontStyle: 'italic' }}>{ex.note}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // Section 7: Điều kiện & Quy định
  const renderTermsContent = () => (
    <div className="pdm-section-container">
      {isEditing ? (
        <>
          {(details?.terms || []).length === 0 ? (
            <div className="pdm-empty-state">
              <span className="pdm-empty-icon">📜</span>
              <p>Chưa thêm điều khoản hoặc lưu ý riêng cho gói này.</p>
              <button type="button" className="pdm-btn-primary" onClick={addTerm}>
                <AddRoundedIcon fontSize="small" /> Thêm điều khoản
              </button>
            </div>
          ) : (
            <div className="pdm-terms-list">
              {(details?.terms || []).map((tm, idx) => (
                <div className="pdm-term-card" key={tm.id || idx}>
                  <div className="pdm-term-header">
                    <span className="pdm-term-badge">Điều khoản #{idx + 1}</span>
                    <label className="pdm-checkbox-label">
                      <input
                        type="checkbox"
                        checked={tm.visibleToCustomer !== false}
                        onChange={(e) => updateTerm(idx, 'visibleToCustomer', e.target.checked)}
                      />
                      <span>In trên hợp đồng / báo giá</span>
                    </label>
                    <button
                      type="button"
                      className="pdm-btn-icon pdm-btn-delete"
                      onClick={() => deleteTerm(idx)}
                      title="Xóa điều khoản"
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </button>
                  </div>
                  <input
                    type="text"
                    className="pdm-input pdm-term-title-input"
                    value={tm.title || ''}
                    onChange={(e) => updateTerm(idx, 'title', e.target.value)}
                    placeholder="Tiêu đề điều khoản (vd: Quy định dời ngày chụp vì thời tiết)"
                  />
                  <textarea
                    rows={2}
                    className="pdm-textarea"
                    value={tm.body || ''}
                    onChange={(e) => updateTerm(idx, 'body', e.target.value)}
                    placeholder="Nội dung điều khoản chi tiết..."
                  />
                </div>
              ))}

              <div className="pdm-bottom-add">
                <button type="button" className="pdm-btn-add" onClick={addTerm}>
                  <AddRoundedIcon fontSize="small" /> Thêm điều khoản
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="pdm-terms-view-list">
          {(details?.terms || []).length === 0 ? (
            <div className="pdm-empty-text">Áp dụng theo điều khoản chung của hợp đồng.</div>
          ) : (
            (details?.terms || []).map((tm, i) => (
              <div className="pdm-view-card pdm-view-term" key={tm.id || i}>
                <div className="pdm-view-title">📌 {tm.title || `Điều khoản ${i + 1}`}</div>
                <div className="pdm-view-desc" style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>
                  {tm.body}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="pdm-container">
      {/* =========================================================================
          TOP DASHBOARD: METRIC CARDS & MODE SWITCHER
      ========================================================================= */}
      <div className="pdm-top-dashboard">
        <div className="pdm-kpi-cards">
          <div
            className={`pdm-kpi-card pdm-kpi-blue ${activeTab === 'schedules' ? 'active' : ''}`}
            onClick={() => handleTabClick('schedules')}
            title="Bấm để xem phân hệ Lịch chụp"
          >
            <span className="pdm-kpi-icon">📅</span>
            <div className="pdm-kpi-info">
              <span className="pdm-kpi-label">Lịch chụp</span>
              <span className="pdm-kpi-val">{totals.totalLichChup} buổi</span>
            </div>
          </div>

          <div
            className={`pdm-kpi-card pdm-kpi-amber ${activeTab === 'retouch' ? 'active' : ''}`}
            onClick={() => handleTabClick('retouch')}
            title="Bấm để xem phân hệ Ảnh hậu kỳ"
          >
            <span className="pdm-kpi-icon">🎨</span>
            <div className="pdm-kpi-info">
              <span className="pdm-kpi-label">Ảnh hoàn thiện</span>
              <span className="pdm-kpi-val">{totals.totalAnhChinhSua} file</span>
            </div>
          </div>

          <div
            className={`pdm-kpi-card pdm-kpi-emerald ${activeTab === 'deliverables' ? 'active' : ''}`}
            onClick={() => handleTabClick('deliverables')}
            title="Bấm để xem phân hệ Bàn giao ảnh"
          >
            <span className="pdm-kpi-icon">🖼️</span>
            <div className="pdm-kpi-info">
              <span className="pdm-kpi-label">Sản phẩm bàn giao</span>
              <span className="pdm-kpi-val">{totals.totalDeliverablesCount} cái</span>
            </div>
          </div>

          <div
            className={`pdm-kpi-card pdm-kpi-pink ${activeTab === 'makeup' ? 'active' : ''}`}
            onClick={() => handleTabClick('makeup')}
            title="Bấm để xem phân hệ Makeup"
          >
            <span className="pdm-kpi-icon">💄</span>
            <div className="pdm-kpi-info">
              <span className="pdm-kpi-label">Lịch makeup</span>
              <span className="pdm-kpi-val">{totals.totalLichMake} lượt</span>
            </div>
          </div>
        </div>

        {/* Action / Mode Toggles */}
        <div className="pdm-top-tools">
          {hasSavedDraft && isEditing && (
            <div className="pdm-draft-pill">
              <span>Bản nháp chưa lưu</span>
              <button
                type="button"
                className="pdm-btn-restore"
                onClick={handleRestoreDraft}
                title="Khôi phục bản nháp"
              >
                <RestoreRoundedIcon fontSize="small" /> Khôi phục
              </button>
            </div>
          )}

          <div className="pdm-mode-switcher">
            <button
              type="button"
              className={`pdm-mode-btn ${displayMode === 'tabs' ? 'active' : ''}`}
              onClick={() => setDisplayMode('tabs')}
              title="Xem theo từng phân hệ tập trung"
            >
              <TabOutlinedIcon fontSize="small" />
              <span>Xem dạng Tab</span>
            </button>
            <button
              type="button"
              className={`pdm-mode-btn ${displayMode === 'all' ? 'active' : ''}`}
              onClick={() => setDisplayMode('all')}
              title="Xem mở rộng tất cả các phân hệ"
            >
              <ViewAgendaOutlinedIcon fontSize="small" />
              <span>Mở rộng tất cả</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODE 1: FOCUSED SEGMENTED TABS (MẶC ĐỊNH - KHOA HỌC & GỌN GÀNG)
      ========================================================================= */}
      {displayMode === 'tabs' ? (
        <div className="pdm-tabbed-view">
          {/* Segmented Navigation Bar */}
          <div className="pdm-nav-tabs">
            {TABS.map(tab => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`pdm-nav-tab ${isSelected ? 'active' : ''} pdm-tab-${tab.color}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="pdm-tab-icon">{tab.icon}</span>
                  <span className="pdm-tab-label">{tab.label}</span>
                  <span className="pdm-tab-badge">
                    {tab.count} {tab.unit}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Panel */}
          <div className="pdm-tab-panel">
            {activeTab === 'schedules' && renderSchedulesContent()}
            {activeTab === 'retouch' && renderRetouchContent()}
            {activeTab === 'deliverables' && renderDeliverablesContent()}
            {activeTab === 'makeup' && renderMakeupContent()}
            {activeTab === 'wardrobe' && renderWardrobeContent()}
            {activeTab === 'extras' && renderExtrasContent()}
            {activeTab === 'terms' && renderTermsContent()}
          </div>
        </div>
      ) : (
        /* =========================================================================
            MODE 2: EXPANDED ACCORDIONS (MỞ RỘNG TOÀN BỘ)
        ========================================================================= */
        <div className="pdm-accordions-view">
          {/* 1. Lịch & Ekip */}
          <div className={`pdm-accordion ${openSections.schedules ? 'open' : ''}`}>
            <div className="pdm-accordion-header" onClick={() => toggleSection('schedules')}>
              <div className="pdm-header-title">
                <span className="pdm-header-icon">📅</span>
                <span>(1) Lịch chụp & Nhân sự phân công</span>
                <span className="pdm-badge pdm-badge-blue">{totals.totalLichChup} buổi</span>
              </div>
              <div className="pdm-header-actions">
                {openSections.schedules ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              </div>
            </div>
            {openSections.schedules && (
              <div className="pdm-accordion-body">{renderSchedulesContent()}</div>
            )}
          </div>

          {/* 2. Hậu kỳ */}
          <div className={`pdm-accordion ${openSections.retouch ? 'open' : ''}`}>
            <div className="pdm-accordion-header" onClick={() => toggleSection('retouch')}>
              <div className="pdm-header-title">
                <span className="pdm-header-icon">🎨</span>
                <span>(2) Ảnh & Hậu kỳ</span>
                <span className="pdm-badge pdm-badge-amber">{totals.totalAnhChinhSua} file hoàn thiện</span>
              </div>
              <div className="pdm-header-actions">
                {openSections.retouch ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              </div>
            </div>
            {openSections.retouch && (
              <div className="pdm-accordion-body">{renderRetouchContent()}</div>
            )}
          </div>

          {/* 3. Bàn giao */}
          <div className={`pdm-accordion ${openSections.deliverables ? 'open' : ''}`}>
            <div className="pdm-accordion-header" onClick={() => toggleSection('deliverables')}>
              <div className="pdm-header-title">
                <span className="pdm-header-icon">🖼️</span>
                <span>(3) Sản phẩm bàn giao (Ảnh phóng, Để bàn, Album...)</span>
                <span className="pdm-badge pdm-badge-emerald">{totals.totalDeliverablesCount} sản phẩm</span>
              </div>
              <div className="pdm-header-actions">
                {openSections.deliverables ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              </div>
            </div>
            {openSections.deliverables && (
              <div className="pdm-accordion-body">{renderDeliverablesContent()}</div>
            )}
          </div>

          {/* 4. Makeup */}
          <div className={`pdm-accordion ${openSections.makeup ? 'open' : ''}`}>
            <div className="pdm-accordion-header" onClick={() => toggleSection('makeup')}>
              <div className="pdm-header-title">
                <span className="pdm-header-icon">💄</span>
                <span>(4) Makeup & Làm đẹp</span>
                <span className="pdm-badge pdm-badge-pink">{totals.totalLichMake} lượt</span>
              </div>
              <div className="pdm-header-actions">
                {openSections.makeup ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              </div>
            </div>
            {openSections.makeup && (
              <div className="pdm-accordion-body">{renderMakeupContent()}</div>
            )}
          </div>

          {/* 5. Trang phục */}
          <div className={`pdm-accordion ${openSections.wardrobe ? 'open' : ''}`}>
            <div className="pdm-accordion-header" onClick={() => toggleSection('wardrobe')}>
              <div className="pdm-header-title">
                <span className="pdm-header-icon">👗</span>
                <span>(5) Trang phục & Phụ kiện cưới</span>
                <span className="pdm-badge pdm-badge-purple">{(details?.wardrobe || []).length} hạng mục</span>
              </div>
              <div className="pdm-header-actions">
                {openSections.wardrobe ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              </div>
            </div>
            {openSections.wardrobe && (
              <div className="pdm-accordion-body">{renderWardrobeContent()}</div>
            )}
          </div>

          {/* 6. Quà tặng */}
          <div className={`pdm-accordion ${openSections.extras ? 'open' : ''}`}>
            <div className="pdm-accordion-header" onClick={() => toggleSection('extras')}>
              <div className="pdm-header-title">
                <span className="pdm-header-icon">🎁</span>
                <span>(6) Quà tặng & Quyền lợi đi kèm</span>
                <span className="pdm-badge pdm-badge-cyan">{(details?.extras || []).length} mục</span>
              </div>
              <div className="pdm-header-actions">
                {openSections.extras ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              </div>
            </div>
            {openSections.extras && (
              <div className="pdm-accordion-body">{renderExtrasContent()}</div>
            )}
          </div>

          {/* 7. Điều khoản */}
          <div className={`pdm-accordion ${openSections.terms ? 'open' : ''}`}>
            <div className="pdm-accordion-header" onClick={() => toggleSection('terms')}>
              <div className="pdm-header-title">
                <span className="pdm-header-icon">📜</span>
                <span>(7) Điều kiện & Quy định áp dụng</span>
                <span className="pdm-badge pdm-badge-slate">{(details?.terms || []).length} điều khoản</span>
              </div>
              <div className="pdm-header-actions">
                {openSections.terms ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              </div>
            </div>
            {openSections.terms && (
              <div className="pdm-accordion-body">{renderTermsContent()}</div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          DIALOG: THÊM KÍCH THƯỚC VÀO DANH MỤC DÙNG CHUNG (AC-01, AC-02)
      ========================================================================= */}
      <Dialog
        open={openAddSizeDialog}
        onClose={() => setOpenAddSizeDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle style={{ fontWeight: 700, fontSize: '1rem', borderBottom: '1px solid #e2e8f0' }}>
          ➕ Thêm Khổ Ảnh Vào Danh Mục Dùng Chung
        </DialogTitle>
        <DialogContent style={{ paddingTop: '16px' }}>
          <div className="pdm-size-dialog">
            <div className="pdm-form-group">
              <label>Tên kích thước (vd: 50×75, 60×90, 70×105)</label>
              <input
                type="text"
                className="pdm-input"
                value={newSizeName}
                onChange={(e) => setNewSizeName(e.target.value)}
                placeholder="vd: 50x75"
              />
            </div>
            <div className="pdm-grid-2">
              <div className="pdm-form-group">
                <label>Chiều rộng (cm)</label>
                <input
                  type="number"
                  min="1"
                  className="pdm-input"
                  value={newSizeWidth}
                  onChange={(e) => setNewSizeWidth(e.target.value)}
                  placeholder="50"
                />
              </div>
              <div className="pdm-form-group">
                <label>Chiều cao (cm)</label>
                <input
                  type="number"
                  min="1"
                  className="pdm-input"
                  value={newSizeHeight}
                  onChange={(e) => setNewSizeHeight(e.target.value)}
                  placeholder="75"
                />
              </div>
            </div>
            <span className="pdm-dialog-hint">
              💡 Khổ ảnh mới tạo sẽ được lưu vào danh mục dùng chung và có thể chọn ở mọi gói dịch vụ khác trong hệ thống.
            </span>
          </div>
        </DialogContent>
        <DialogActions style={{ padding: '12px 18px', borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenAddSizeDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleSaveNewCustomSize} variant="contained" color="primary">
            Lưu vào danh mục
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PackageDetailsManager;
