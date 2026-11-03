const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('src/screens/QuanLyWebsite/QuanLyWebsite.js');
let code = fs.readFileSync(targetPath, 'utf8');

// Định vị đoạn từ Header đến hết website-tabs-container
const startHeader = code.indexOf('{/* ===== PAGE HEADER ===== */}');
const endTabs = code.indexOf('{/* ===== CONTENT PANEL ===== */}');

if (startHeader === -1 || endTabs === -1) {
  console.error('Không tìm thấy vị trí startHeader hoặc endTabs');
  process.exit(1);
}

const currentSectionObjCode = `
      {/* ===== 1. COMPACT PAGE HEADER & WEBSITE STATUS ===== */}
      <div className="cms-top-bar">
        <div className="cms-title-area">
          <div className="cms-header-icon-box">🌐</div>
          <div>
            <div className="cms-title-badge-row">
              <h2 className="cms-page-heading">QUẢN LÝ NỘI DUNG WEBSITE (CMS)</h2>
              <span className={\`cms-status-indicator \${globalSettings.isPublished ? 'online' : 'offline'}\`}>
                <span className="cms-pulse-dot"></span>
                {globalSettings.isPublished ? 'WEBSITE ĐANG HOẠT ĐỘNG (PUBLIC)' : 'TẠM ẨN / BẢO TRÌ'}
              </span>
            </div>
            <p className="cms-page-subtext">Hệ thống điều phối hiển thị nội dung, banner, bảng giá và chiến dịch studio</p>
          </div>
        </div>

        <div className="cms-quick-actions">
          <div className="cms-status-toggle-box">
            <span className="cms-toggle-label">Phát hành:</span>
            <label className="switch" title="Bật/Tắt hiển thị Website ra công chúng">
              <input 
                type="checkbox" 
                checked={globalSettings.isPublished} 
                onChange={(e) => setGlobalSettings({...globalSettings, isPublished: e.target.checked})} 
              />
              <span className="slider round"></span>
            </label>
          </div>

          <button 
            type="button" 
            className="cms-save-status-btn"
            onClick={handleSaveGlobalSettings} 
            disabled={isSavingSettings}
            title="Lưu trạng thái công bố website"
          >
            <span>{isSavingSettings ? '⏳ Đang lưu...' : '💾 Lưu Trạng Thái'}</span>
          </button>

          <a 
            href={SECTIONS.find(s => s.id === activeTab)?.previewLink || '/'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="cms-view-site-btn"
            title="Mở tab mới xem trực tiếp giao diện website"
          >
            <span>👁️ Xem Website ↗</span>
          </a>
        </div>
      </div>

      {!globalSettings.isPublished && (
        <div className="cms-maintenance-warning-bar">
          <div className="maintenance-left">
            <span className="warning-icon">⚠️</span>
            <div>
              <strong>Website đang ở chế độ Tạm ẩn / Chuẩn bị lên sóng!</strong>
              <p>Khách hàng truy cập sẽ thấy màn hình đếm ngược. Bạn có thể hẹn giờ tự động mở lại bên dưới.</p>
            </div>
          </div>
          <div className="maintenance-right">
            <label>⏰ Hẹn giờ mở lại:</label>
            <input 
              type="datetime-local" 
              className="settings-datetime-input"
              value={globalSettings.scheduledPublishTime} 
              onChange={(e) => setGlobalSettings({...globalSettings, scheduledPublishTime: e.target.value})} 
            />
          </div>
        </div>
      )}

      {/* ===== 2. GROUPED TABS NAVIGATION (4 NHÓM NGHIỆP VỤ) ===== */}
      <div className="cms-grouped-navigation">
        {/* Tầng 1: Các Nhóm Nghiệp Vụ Chính */}
        <div className="cms-main-group-tabs">
          {SECTION_GROUPS.map(group => {
            const isGroupActive = activeGroup === group.id || group.sections.some(s => s.id === activeTab);
            return (
              <button
                key={group.id}
                type="button"
                className={\`cms-group-btn \${isGroupActive ? 'active' : ''}\`}
                onClick={() => {
                  setActiveGroup(group.id);
                  // Chuyển sang mục đầu tiên của nhóm nếu mục hiện tại không nằm trong nhóm
                  if (!group.sections.some(s => s.id === activeTab)) {
                    setActiveTab(group.sections[0].id);
                  }
                }}
              >
                <span className="group-icon">{group.icon}</span>
                <div className="group-text-box">
                  <span className="group-title">{group.title}</span>
                  <span className="group-desc">{group.badge}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tầng 2: Các Chuyên Mục Con Của Nhóm Đang Chọn */}
        <div className="cms-sub-sections-bar">
          <div className="cms-sub-sections-list">
            {(SECTION_GROUPS.find(g => g.id === activeGroup) || SECTION_GROUPS[0]).sections.map(sub => {
              const isSubActive = activeTab === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  className={\`cms-sub-tab-btn \${isSubActive ? 'active' : ''}\`}
                  onClick={() => setActiveTab(sub.id)}
                >
                  <span className="sub-icon">{sub.icon}</span>
                  <span className="sub-name">{sub.name}</span>
                  {sub.tag && <span className="sub-tag">{sub.tag}</span>}
                </button>
              );
            })}
          </div>

          {/* Ô Tìm Kiếm Nhanh Tức Thì & Liên Kết Ngoài */}
          <div className="cms-sub-toolbar-right">
            {activeTab !== 'intro' && activeTab !== 'event_management' && activeTab !== 'footer' && (
              <div className="cms-instant-search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Tìm nhanh nội dung..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
                {searchTerm && (
                  <button type="button" className="clear-search-btn" onClick={() => setSearchTerm('')}>✕</button>
                )}
              </div>
            )}

            {/* Lối tắt liên kết CRM / Thiệp 4.0 nếu tab liên quan */}
            {activeTab === 'bookings' && (
              <a href="/leads" className="cms-shortcut-pill">
                <span>📋 Mở CRM Lead Toàn Diện ➔</span>
              </a>
            )}
            {activeTab === 'invitations' && (
              <a href="/quanlythiepmoi" className="cms-shortcut-pill pink">
                <span>💌 Mở Hệ Thống Thiệp Online 4.0 ➔</span>
              </a>
            )}
          </div>
        </div>
      </div>
`;

code = code.slice(0, startHeader) + currentSectionObjCode.trim() + '\r\n\r\n      ' + code.slice(endTabs);

fs.writeFileSync(targetPath, code, 'utf8');
console.log('Step 2: Navigation & Header updated successfully!');

