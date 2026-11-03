const fs = require('fs');
const path = require('path');

const cssPath = path.resolve('src/screens/QuanLyWebsite/QuanLyWebsite.css');
let css = fs.readFileSync(cssPath, 'utf8');

const newStyles = `
/* =========================================================
   NEW REDESIGNED CMS HEADER & GROUPED NAVIGATION
   ========================================================= */

.cms-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px 22px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  gap: 16px;
  flex-wrap: wrap;
}

.cms-title-area {
  display: flex;
  align-items: center;
  gap: 14px;
}

.cms-header-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

.cms-title-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cms-page-heading {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.2px;
}

.cms-status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.cms-status-indicator.online {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.cms-status-indicator.offline {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.cms-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.cms-status-indicator.online .cms-pulse-dot {
  background-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
  animation: pulse-green 1.8s infinite;
}

.cms-status-indicator.offline .cms-pulse-dot {
  background-color: #ef4444;
}

.cms-page-subtext {
  font-size: 13px;
  color: #64748b;
  margin: 2px 0 0 0;
}

.cms-quick-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.cms-status-toggle-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.cms-toggle-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #475569;
}

.cms-save-status-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #b78752 0%, #9a6f3e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  box-shadow: 0 3px 10px rgba(183, 135, 82, 0.25);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.cms-save-status-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #9a6f3e 0%, #825c31 100%);
  transform: translateY(-1px);
}

.cms-view-site-btn {
  padding: 8px 16px;
  background: #f1f5f9;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.cms-view-site-btn:hover {
  background: #e2e8f0;
  color: #0284c7;
  border-color: #94a3b8;
}

/* Maintenance Alert Bar */
.cms-maintenance-warning-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 12px 18px;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.maintenance-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.maintenance-left .warning-icon {
  font-size: 24px;
}

.maintenance-left strong {
  font-size: 13.5px;
  color: #b45309;
}

.maintenance-left p {
  font-size: 12px;
  color: #92400e;
  margin: 2px 0 0 0;
}

.maintenance-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #78350f;
}

/* ===== 2. GROUPED NAVIGATION ===== */
.cms-grouped-navigation {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Tầng 1: Nhóm nghiệp vụ chính */
.cms-main-group-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
}

.cms-group-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.25s ease;
}

.cms-group-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.cms-group-btn.active {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #0f172a;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);
}

.cms-group-btn .group-icon {
  font-size: 22px;
}

.cms-group-btn .group-text-box {
  display: flex;
  flex-direction: column;
}

.cms-group-btn .group-title {
  font-size: 13.5px;
  font-weight: 800;
}

.cms-group-btn.active .group-title {
  color: #ffffff;
}

.cms-group-btn:not(.active) .group-title {
  color: #1e293b;
}

.cms-group-btn .group-desc {
  font-size: 11px;
}

.cms-group-btn.active .group-desc {
  color: #94a3b8;
}

.cms-group-btn:not(.active) .group-desc {
  color: #64748b;
}

/* Tầng 2: Danh sách chuyên mục con */
.cms-sub-sections-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  gap: 14px;
  flex-wrap: wrap;
}

.cms-sub-sections-list {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.cms-sub-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.cms-sub-tab-btn:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
}

.cms-sub-tab-btn.active {
  background: #eff6ff;
  color: #2563eb;
  border-color: #93c5fd;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12);
}

.cms-sub-tab-btn .sub-icon {
  font-size: 15px;
}

.cms-sub-tab-btn .sub-tag {
  font-size: 10.5px;
  padding: 1px 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  font-weight: 600;
  color: #64748b;
}

.cms-sub-tab-btn.active .sub-tag {
  background: #dbeafe;
  color: #1d4ed8;
}

/* Toolbar bên phải: Tìm kiếm nhanh & Phím tắt */
.cms-sub-toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cms-instant-search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 220px;
}

.cms-instant-search-box .search-icon {
  position: absolute;
  left: 10px;
  font-size: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.cms-instant-search-box input {
  width: 100%;
  padding: 7px 28px 7px 30px;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 12.5px;
  outline: none;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.cms-instant-search-box input:focus {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.cms-instant-search-box .clear-search-btn {
  position: absolute;
  right: 6px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
}

.cms-shortcut-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.cms-shortcut-pill:hover {
  background: #dcfce7;
  color: #166534;
}

.cms-shortcut-pill.pink {
  background: #fdf2f8;
  color: #be185d;
  border-color: #fbcfe8;
}

.cms-shortcut-pill.pink:hover {
  background: #fce7f3;
  color: #9d174d;
}
`;

css = newStyles + '\r\n' + css;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('CSS updated successfully!');

