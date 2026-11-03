/**
 * Tiện ích sinh mã nguồn (HTML, CSS, JS, JSON) cho Mẫu Thiệp Cưới Online
 * Long Wedding Studio - Luxury Wedding Invitation Generator
 */

// Bảng màu & Typography mặc định theo Theme ID
export const THEME_PRESETS = {
  'luxury-gold': {
    name: 'Hoàng Gia & Ánh Kim (Luxury Gold)',
    primaryColor: '#D4AF37',
    secondaryColor: '#1A1A1A',
    accentColor: '#F5E6BE',
    backgroundColor: '#0F0F0F',
    textColor: '#FDFBF7',
    textMuted: '#9CA3AF',
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Montserrat', sans-serif",
    fontScript: "'Great Vibes', cursive",
    effectType: 'sparkles',
    envelopeSealColor: '#C59B27',
    badgeText: 'ĐẶC QUYỀN VIP'
  },
  'romantic-rose': {
    name: 'Nàng Thơ & Hoa Hồng (Romantic Rose)',
    primaryColor: '#E07A5F',
    secondaryColor: '#FFF1F2',
    accentColor: '#F4A261',
    backgroundColor: '#FAF5F5',
    textColor: '#2D2323',
    textMuted: '#7D6E6E',
    fontHeading: "'Cormorant Garamond', serif",
    fontBody: "'Montserrat', sans-serif",
    fontScript: "'Alex Brush', cursive",
    effectType: 'roses',
    envelopeSealColor: '#D86868',
    badgeText: 'ĐẶC QUYỀN VIP'
  },
  'modern-minimal': {
    name: 'Tối Giản & Thanh Lịch (Modern Minimal)',
    primaryColor: '#2B2D42',
    secondaryColor: '#F8F9FA',
    accentColor: '#8D99AE',
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    textMuted: '#6C757D',
    fontHeading: "'Cinzel', serif",
    fontBody: "'Inter', sans-serif",
    fontScript: "'MonteCarlo', cursive",
    effectType: 'none',
    envelopeSealColor: '#3D405B',
    badgeText: 'MIỄN PHÍ'
  },
  'botanical-garden': {
    name: 'Cỏ Hoa & Thảo Mộc (Botanical Garden)',
    primaryColor: '#2D6A4F',
    secondaryColor: '#F4F7F5',
    accentColor: '#52B788',
    backgroundColor: '#F8FAF8',
    textColor: '#1B3022',
    textMuted: '#587060',
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Nunito', sans-serif",
    fontScript: "'Great Vibes', cursive",
    effectType: 'gold-dust',
    envelopeSealColor: '#2D6A4F',
    badgeText: 'MIỄN PHÍ'
  },
  'royal-red': {
    name: 'Son Hỷ & Á Đông (Royal Crimson Red)',
    primaryColor: '#C9184A',
    secondaryColor: '#FFF0F3',
    accentColor: '#FF758F',
    backgroundColor: '#1F060B',
    textColor: '#FFF5F5',
    textMuted: '#FCA311',
    fontHeading: "'Cinzel Decorative', serif",
    fontBody: "'Montserrat', sans-serif",
    fontScript: "'Great Vibes', cursive",
    effectType: 'hearts',
    envelopeSealColor: '#9B0830',
    badgeText: 'ĐẶC QUYỀN VIP'
  },
  'korean-pastel': {
    name: 'Hàn Quốc Dịu Êm (Korean Pastel)',
    primaryColor: '#7B2CBF',
    secondaryColor: '#F8F7FF',
    accentColor: '#C77DFF',
    backgroundColor: '#FCFBFE',
    textColor: '#2E1E3D',
    textMuted: '#7F6A93',
    fontHeading: "'Cormorant Garamond', serif",
    fontBody: "'Inter', sans-serif",
    fontScript: "'Parisienne', cursive",
    effectType: 'sparkles',
    envelopeSealColor: '#7B2CBF',
    badgeText: 'TRẢ PHÍ'
  },
  'dreamy-fairytale': {
    name: 'Lâu Đài Cổ Tích & Nơ Lụa Hồng (Dreamy Fairytale)',
    primaryColor: '#B76E79',
    secondaryColor: '#FFF5F7',
    accentColor: '#D49B9B',
    backgroundColor: '#FFF9FA',
    textColor: '#4A2E35',
    textMuted: '#8C656E',
    fontHeading: "'Cormorant Garamond', serif",
    fontBody: "'Montserrat', sans-serif",
    fontScript: "'Great Vibes', cursive",
    effectType: 'fairytale-petals',
    envelopeSealColor: '#E8A598',
    envelopeStyle: 'ribbon-bow',
    badgeText: 'ĐẶC QUYỀN VIP'
  },
  'song-hy-xanh': {
    name: 'Song Hỷ Xanh (Song Hỷ Xanh Lá & Ngọc Lục Bảo)',
    primaryColor: '#1F3A25',
    secondaryColor: '#fff7eb',
    accentColor: '#e8f0e4',
    backgroundColor: '#fff7eb',
    textColor: '#1F3A25',
    textMuted: '#666666',
    fontHeading: "'Playfair Display', 'Cormorant Garamond', serif",
    fontBody: "'Montserrat', 'Inter', sans-serif",
    fontScript: "'Great Vibes', cursive",
    effectType: 'song-hy-float',
    envelopeSealColor: '#e8f0e4',
    envelopeStyle: 'song-hy-seal',
    badgeText: 'ĐẶC QUYỀN VIP'
  }
};

// Dữ liệu mẫu chú rể - cô dâu demo
export const SAMPLE_WEDDING_DATA = {
  groom: {
    name: 'Nguyễn Hoàng Long',
    nickname: 'Hoàng Long',
    parents: 'Ông Nguyễn Văn Hùng - Bà Trần Thị Tuyết',
    address: 'Nghĩa Đàn, Nghệ An',
    bank: 'MB Bank',
    accountNumber: '0868663637',
    accountName: 'NGUYEN HOANG LONG'
  },
  bride: {
    name: 'Trần Mai Phương',
    nickname: 'Mai Phương',
    parents: 'Ông Trần Minh Đức - Bà Lê Thị Thu Hà',
    address: 'Thị xã Thái Hòa, Nghệ An',
    bank: 'Vietcombank',
    accountNumber: '9868663637',
    accountName: 'TRAN MAI PHUONG'
  },
  dateSolar: '2026-11-20',
  dateSolarText: '20 Tháng 11, 2026',
  dateLunarText: 'Ngày 12 tháng 10 năm Bính Ngọ',
  time: '17:30',
  venue: 'Trung Tâm Tiệc Cưới & Hội Nghị Long Palace',
  address: 'Đại Lộ Lê Nin, TP. Vinh, Tỉnh Nghệ An',
  quote: 'Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng. Hạnh phúc lớn nhất của chúng mình là có sự hiện diện của bạn trong ngày chung đôi.'
};

/**
 * 1. Sinh đoạn mã HTML cấu trúc layout
 */
export const generateHtmlSnippet = (template, customData = SAMPLE_WEDDING_DATA) => {
  const theme = THEME_PRESETS[template.themeId] || THEME_PRESETS['luxury-gold'];
  const tplName = template.name || 'Mẫu Thiệp Cưới Online';
  const groom = customData.groom;
  const bride = customData.bride;
  const isRibbonBow = template.envelopeStyle === 'ribbon-bow' || template.themeId === 'dreamy-fairytale';
  const isSongHy = template.envelopeStyle === 'song-hy-seal' || template.themeId === 'song-hy-xanh';
  const isDreamy = template.themeId === 'dreamy-fairytale';

  return `<!-- ======================================================== -->
<!-- THIỆP CƯỚI ONLINE: ${tplName.toUpperCase()} -->
<!-- Cấu trúc Layout HTML - Long Wedding Studio -->
<!-- ======================================================== -->
<div id="wedding-invitation-root" class="wedding-invitation-wrapper theme-${template.themeId || 'luxury-gold'}">

  <!-- 1. BÌ THƯ SÁP NIÊM PHONG HOẶC NƠ LỤA SATIN -->
  ${isRibbonBow ? `
  <div id="wax-envelope-screen" class="wax-envelope-screen ribbon-bow-screen">
    <div class="envelope-card ribbon-envelope-card" id="open-envelope-trigger" title="Nhấn để mở nơ lụa thiệp mời">
      <div class="envelope-top-flap"></div>
      
      <!-- Cổng vòm hoa hồng leo nghệ thuật -->
      <div class="envelope-floral-arch">
        <div class="floral-garland"></div>
      </div>

      <!-- Nơ Lụa Satin 3D Tương Tác -->
      <div class="satin-ribbon-bow-wrap" id="satin-bow-knot-box">
        <div class="satin-ribbon-band"></div>
        <div class="satin-bow-knot">
          <div class="satin-loop loop-left"></div>
          <div class="satin-loop loop-right"></div>
          <div class="satin-center-knot"></div>
          <div class="satin-tail tail-left"></div>
          <div class="satin-tail tail-right"></div>
        </div>
      </div>

      <div class="envelope-pocket ribbon-pocket">
        <p class="envelope-calligraphy-sub">Requests the pleasure of your company</p>
        <h2 class="envelope-couple-names dreamy-font">${groom.nickname || 'Diana'} & ${bride.nickname || 'Richard'}</h2>
        <div class="envelope-tap-hint">
          <span class="tap-icon">✨</span>
          <span>Chạm vào nơ lụa để mở thiệp</span>
        </div>
      </div>
    </div>
  </div>` : isSongHy ? `
  <div id="wax-envelope-screen" class="wax-envelope-screen songhy-envelope-screen">
    <div class="songhy-ambient-particles" aria-hidden="true">
      <div class="songhy-ambient-xi" style="top: 14.5%; left: 53%; font-size: 13px; --base-op: 0.35;">囍</div>
      <div class="songhy-ambient-xi" style="top: 24.5%; right: 27%; font-size: 17px; --base-op: 0.38;">囍</div>
      <div class="songhy-ambient-xi" style="top: 62%; right: 28.5%; font-size: 12px; --base-op: 0.32;">囍</div>
      <div class="songhy-ambient-xi" style="bottom: 38%; left: 21.8%; font-size: 11px; --base-op: 0.3;">囍</div>
      <div class="songhy-ambient-xi" style="bottom: 31%; left: 27.2%; font-size: 13px; --base-op: 0.35;">囍</div>
      <div class="songhy-ambient-xi" style="bottom: 32.5%; left: 9.8%; font-size: 18px; --base-op: 0.38;">囍</div>
      <div class="songhy-ambient-xi" style="bottom: 14%; left: 40.5%; font-size: 16px; --base-op: 0.35;">囍</div>
    </div>
    <div class="songhy-envelope-card-wrap">
      <div class="songhy-envelope-card">
        <div class="songhy-card-watermark top-left">
          <img src="/images/song-hy/chu-hy.webp" alt="" />
        </div>
        <div class="songhy-card-watermark bottom-right">
          <img src="/images/song-hy/chu-hy.webp" alt="" />
        </div>
        <div class="songhy-envelope-card-content">
          <button type="button" class="songhy-seal-crest-btn" id="open-envelope-trigger" title="Nhấn để mở thiệp">
            <img src="/images/song-hy/songhy-round-seal.svg" alt="Song Hỷ" class="songhy-round-seal-img" />
          </button>
          <h1 class="songhy-envelope-title">
            <span class="person-name">${groom.nickname || groom.name || 'Hải Nam'}</span>
            <span class="ampersand">&amp;</span>
            <span class="person-name">${bride.nickname || bride.name || 'Khánh Linh'}</span>
          </h1>
          <div class="songhy-flourish-divider">
            <span class="f-line"></span>
            <span class="f-icon">❦</span>
            <span class="f-line"></span>
          </div>
          <div class="songhy-envelope-date-text">
            ${customData.tiecCuoi?.dateSolar || '30 tháng 7, 2026'}
          </div>
          <div class="songhy-envelope-invitee-text">
            <span>Thân Mời</span>
          </div>
          <button type="button" class="songhy-open-envelope-btn" id="open-envelope-btn-2">
            <span>Mở thiệp</span>
          </button>
        </div>
      </div>
    </div>
  </div>` : `
  <div id="wax-envelope-screen" class="wax-envelope-screen">
    <div class="envelope-card">
      <div class="envelope-top-flap"></div>
      <div class="envelope-wax-seal" id="open-envelope-trigger" title="Nhấn để mở thiệp mời">
        <div class="wax-seal-inner">
          <span class="wax-monogram">L & P</span>
          <span class="wax-subtext">SAVE OUR DATE</span>
        </div>
      </div>
      <div class="envelope-pocket">
        <p class="envelope-notice">Trân trọng kính mời quý khách</p>
        <h2 class="envelope-couple-names">${groom.nickname} & ${bride.nickname}</h2>
        <div class="envelope-tap-hint">
          <span class="tap-icon">✉</span>
          <span>Chạm vào dấu sáp để mở thiệp</span>
        </div>
      </div>
    </div>
  </div>`} 

  <!-- 2. NỘI DUNG THIỆP CHÍNH (INVITATION MAIN BODY) -->
  <main id="invitation-main-content" class="invitation-main-content hidden">

    <!-- Thanh Điều Khiển Âm Nhạc & Chia Sẻ -->
    <header class="invitation-topbar">
      <div class="topbar-brand">
        <span class="brand-sparkle">✦</span>
        <span>LONG WEDDING E-INVITATION</span>
      </div>
      <button id="music-toggle-btn" class="music-toggle-btn" title="Bật / Tắt Nhạc Nền">
        <span class="music-icon">♫</span>
        <span id="music-status-text">Bật Nhạc</span>
      </button>
    </header>

    ${isDreamy ? `
    <!-- Khối Hero Lâu Đài Cổ Tích Ven Hồ -->
    <section class="section-hero dreamy-hero">
      <div class="dreamy-palace-banner">
        <img src="${template.coverImage || '/images/dreamy/palace.jpg'}" alt="Fairytale Palace" class="palace-hero-img" />
        <div class="palace-floral-overlay"></div>
      </div>

      <div class="dreamy-hero-content">
        <div class="royal-monogram-crest">
          <span class="monogram-initials">D & R</span>
        </div>

        <h1 class="hero-couple-calligraphy">${groom.nickname || 'Diana'} & ${bride.nickname || 'Richard'}</h1>
        
        <p class="hero-request-text">REQUEST THE PLEASURE OF YOUR COMPANY<br />TO CELEBRATE OUR WEDDING ON</p>
        
        <!-- Khung Save The Date Cổ Điển -->
        <div class="save-the-date-frame">
          <div class="std-month">JULY</div>
          <div class="std-day">23</div>
          <div class="std-year">2026</div>
          <div class="std-weekday">THURSDAY</div>
        </div>

        <div class="dreamy-venue-block">
          <span class="venue-intro">TO BE HELD AT</span>
          <h4 class="venue-palace-name">${customData.venue || 'The Peninsula Waterfront Palace'}</h4>
          <span class="venue-time-text">AT SIX O'CLOCK IN THE EVENING</span>
        </div>
      </div>
    </section>` : `
    <!-- Khối Hero Dâu Rể -->
    <section class="section-hero">
      <div class="hero-badge-pill">${template.badge || theme.badgeText}</div>
      <p class="hero-subheading">SAVE OUR SPECIAL DATE</p>
      <h1 class="hero-title">${groom.name} & ${bride.name}</h1>
      <p class="hero-solar-date">${customData.dateSolarText}</p>
      <p class="hero-lunar-date">(${customData.dateLunarText})</p>

      <!-- Khung Ảnh Cưới Tiêu Biểu -->
      <div class="hero-poster-frame">
        <img src="${template.coverImage || template.thumbnail}" alt="${groom.name} & ${bride.name}" class="hero-poster-img" />
        <div class="hero-poster-glow"></div>
      </div>
    </section>`}

    <!-- Lời Ngỏ Yêu Thương -->
    <section class="section-quote">
      <div class="quote-ornament">❝</div>
      <blockquote class="quote-content">${customData.quote}</blockquote>
      <div class="quote-ornament">❞</div>
    </section>

    <!-- Khối Đếm Ngược Ngày Cưới (Countdown) -->
    <section class="section-countdown">
      <h3 class="section-title">ĐẾM NGƯỢC NGÀY CHUNG ĐÔI</h3>
      <div class="countdown-grid" id="countdown-timer">
        <div class="countdown-box">
          <span class="count-num" id="days-val">00</span>
          <span class="count-lbl">NGÀY</span>
        </div>
        <div class="countdown-box">
          <span class="count-num" id="hours-val">00</span>
          <span class="count-lbl">GIỜ</span>
        </div>
        <div class="countdown-box">
          <span class="count-num" id="mins-val">00</span>
          <span class="count-lbl">PHÚT</span>
        </div>
        <div class="countdown-box">
          <span class="count-num" id="secs-val">00</span>
          <span class="count-lbl">GIÂY</span>
        </div>
      </div>
    </section>

    <!-- Thông Tin Gia Đình & Cặp Đôi -->
    <section class="section-couple-info">
      <div class="couple-card groom-card">
        <div class="couple-avatar-wrap">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" alt="Chú rể" class="couple-avatar" />
          <span class="couple-role-tag">CHÚ RỂ</span>
        </div>
        <h3 class="couple-fullname">${groom.name}</h3>
        <p class="couple-family-parents">Con ông bà: ${groom.parents}</p>
        <p class="couple-family-location">${groom.address}</p>
      </div>

      <div class="couple-card bride-card">
        <div class="couple-avatar-wrap">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80" alt="Cô dâu" class="couple-avatar" />
          <span class="couple-role-tag">CÔ DÂU</span>
        </div>
        <h3 class="couple-fullname">${bride.name}</h3>
        <p class="couple-family-parents">Con ông bà: ${bride.parents}</p>
        <p class="couple-family-location">${bride.address}</p>
      </div>
    </section>

    ${isDreamy ? `
    <!-- The Celebrations (Lịch Trình Minh Họa Tranh Màu Nước) -->
    <section class="section-celebrations">
      <h3 class="section-title celebration-heading">The Celebrations</h3>
      
      <div class="celebration-cards-list">
        <!-- Event 1: Welcome Cruise -->
        <div class="celebration-card">
          <div class="celebration-img-wrap">
            <img src="/images/dreamy/yacht.jpg" alt="Welcome Cruise" class="celebration-img" />
          </div>
          <div class="celebration-details">
            <span class="celebration-subtitle">WELCOME CRUISE ON THE WATERFRONT</span>
            <h4 class="celebration-title">The Peninsula Lounge Quay</h4>
            <p class="celebration-datetime">22 JULY 2026 • 8:00 PM</p>
            <a href="https://maps.google.com" target="_blank" class="celebration-map-link">
              <span>VIEW ON MAP</span> ↗
            </a>
          </div>
        </div>

        <!-- Event 2: Wedding Ceremony -->
        <div class="celebration-card">
          <div class="celebration-img-wrap">
            <img src="/images/dreamy/venue.jpg" alt="Wedding Ceremony" class="celebration-img" />
          </div>
          <div class="celebration-details">
            <span class="celebration-subtitle">WEDDING CEREMONY</span>
            <h4 class="celebration-title">The Grand Palace Waterfront Hall</h4>
            <p class="celebration-datetime">23 JULY 2026 • 6:00 PM</p>
            <a href="https://maps.google.com" target="_blank" class="celebration-map-link">
              <span>VIEW ON MAP</span> ↗
            </a>
          </div>
        </div>

        <!-- Event 3: Grand Reception -->
        <div class="celebration-card">
          <div class="celebration-img-wrap">
            <img src="/images/dreamy/palace.jpg" alt="Grand Reception" class="celebration-img" />
          </div>
          <div class="celebration-details">
            <span class="celebration-subtitle">DINNER & AFTER PARTY</span>
            <h4 class="celebration-title">The Royal Grand Ballroom & Terrace</h4>
            <p class="celebration-datetime">23 JULY 2026 • 7:30 PM</p>
            <a href="https://maps.google.com" target="_blank" class="celebration-map-link">
              <span>VIEW ON MAP</span> ↗
            </a>
          </div>
        </div>
      </div>
    </section>` : `
    <!-- Sự Kiện Hôn Lễ & Tiệc Cưới -->
    <section class="section-events">
      <h3 class="section-title">CHƯƠNG TRÌNH HÔN LỄ</h3>

      <div class="event-card highlight">
        <div class="event-badge">TIỆC MỪNG TRỌNG ĐẠI</div>
        <h4 class="event-name">${customData.venue}</h4>
        <p class="event-time">⏰ <strong>${customData.time}</strong> - ${customData.dateSolarText}</p>
        <p class="event-address">📍 ${customData.address}</p>
        <a href="https://maps.google.com" target="_blank" class="event-map-btn">
          <span>Xem Bản Đồ Chỉ Đường (Google Maps)</span> ↗
        </a>
      </div>
    </section>`}

    <!-- Mừng Cưới Chúc Phúc (VietQR 1-Chạm) -->
    <section class="section-vietqr">
      <h3 class="section-title">HỘP MỪNG CƯỚI CHÚC PHÚC</h3>
      <p class="vietqr-desc">Dành cho bạn bè, người thân ở xa muốn gửi lời chúc mừng và phong bao may mắn tới đôi uyên ương.</p>

      <div class="qr-cards-row">
        <!-- QR Chú Rể -->
        <div class="qr-account-card">
          <h4 class="qr-card-title">MỪNG CƯỚI CHÚ RỂ</h4>
          <div class="qr-image-frame">
            <img src="https://api.vietqr.io/image/${groom.bank.replace(/\\s+/g, '')}-${groom.accountNumber}-compact2.png?amount=0&accountName=${encodeURIComponent(groom.accountName)}" alt="QR Chú Rể" class="vietqr-img" />
          </div>
          <p class="qr-bank-name">${groom.bank} - ${groom.accountNumber}</p>
          <p class="qr-acc-holder">${groom.accountName}</p>
          <button class="copy-acc-btn" onclick="copyText('${groom.accountNumber}')">📋 Sao Chép Số Tài Khoản</button>
        </div>

        <!-- QR Cô Dâu -->
        <div class="qr-account-card">
          <h4 class="qr-card-title">MỪNG CƯỚI CÔ DÂU</h4>
          <div class="qr-image-frame">
            <img src="https://api.vietqr.io/image/${bride.bank.replace(/\\s+/g, '')}-${bride.accountNumber}-compact2.png?amount=0&accountName=${encodeURIComponent(bride.accountName)}" alt="QR Cô Dâu" class="vietqr-img" />
          </div>
          <p class="qr-bank-name">${bride.bank} - ${bride.accountNumber}</p>
          <p class="qr-acc-holder">${bride.accountName}</p>
          <button class="copy-acc-btn" onclick="copyText('${bride.accountNumber}')">📋 Sao Chép Số Tài Khoản</button>
        </div>
      </div>
    </section>

    <!-- Xác Nhận Tham Dự (RSVP) -->
    <section class="section-rsvp">
      <h3 class="section-title">XÁC NHẬN THAM DỰ (RSVP)</h3>
      <p class="rsvp-sub">Sự hiện diện của bạn là niềm vinh hạnh to lớn cho gia đình chúng mình!</p>
      
      <form id="rsvp-form" class="rsvp-form">
        <div class="form-group">
          <label>Họ và Tên của bạn:</label>
          <input type="text" id="rsvp-name" required placeholder="Ví dụ: Anh Nam & Gia đình..." />
        </div>
        <div class="form-group">
          <label>Số điện thoại liên hệ:</label>
          <input type="tel" id="rsvp-phone" placeholder="09xxxxxxxx" />
        </div>
        <div class="form-group">
          <label>Bạn sẽ đến chung vui chứ?</label>
          <select id="rsvp-attending">
            <option value="yes">Chắc chắn mình sẽ đến chung vui!</option>
            <option value="no">Tiếc quá, mình có việc bận không thể đến</option>
          </select>
        </div>
        <button type="submit" class="rsvp-submit-btn">Gửi Xác Nhận Tham Dự 💌</button>
        <div id="rsvp-success-msg" class="success-msg hidden">✓ Cảm ơn bạn! Đã gửi xác nhận thành công.</div>
      </form>
    </section>

    <!-- Sổ Lưu Bút & Lời Chúc (Guestbook) -->
    <section class="section-guestbook">
      <h3 class="section-title">SỔ LƯU BÚT CHÚC PHÚC</h3>
      
      <form id="wish-form" class="wish-form">
        <input type="text" id="wish-sender" required placeholder="Tên của bạn..." />
        <textarea id="wish-message" required rows="3" placeholder="Gửi gắm lời chúc ý nghĩa tới cô dâu & chú rể..."></textarea>
        <button type="submit" class="wish-submit-btn">Gửi Lời Chúc Mừng ✨</button>
      </form>

      <div id="wishes-list-container" class="wishes-list-container">
        <!-- Lời chúc mẫu -->
        <div class="wish-bubble">
          <strong class="wish-sender-name">Bạn Thân Tuấn Anh</strong>
          <p class="wish-text">Chúc mừng hai bạn trăm năm hạnh phúc, đầu bạc răng long, mãi mặn nồng son sắt nhé!</p>
        </div>
      </div>
    </section>

    <!-- Footer Kỷ Niệm -->
    <footer class="invitation-footer">
      <p class="footer-thankyou">THANK YOU FOR BEING A PART OF OUR SPECIAL DAY</p>
      <p class="footer-signature">${groom.nickname} & ${bride.nickname} • Long Wedding Studio</p>
    </footer>

  </main>

  <!-- Thẻ Audio Nhạc Nền MP3 -->
  <audio id="wedding-audio-player" src="${template.musicUrl || 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-1498.mp3'}" loop preload="auto"></audio>
</div>`;
};

/**
 * 2. Sinh toàn bộ mã CSS phong cách thiết kế theo Theme
 */
export const generateCssSnippet = (template) => {
  const theme = THEME_PRESETS[template.themeId] || THEME_PRESETS['luxury-gold'];

  return `/* ======================================================== */
/* THIỆP CƯỚI ONLINE: BỘ MÃ CSS PHONG CÁCH THIẾT KẾ         */
/* Theme: ${theme.name}                                      */
/* ======================================================== */

:root {
  --primary-color: ${template.primaryColor || theme.primaryColor};
  --secondary-color: ${template.secondaryColor || theme.secondaryColor};
  --accent-color: ${theme.accentColor};
  --bg-color: ${template.backgroundColor || theme.backgroundColor};
  --text-color: ${template.textColor || theme.textColor};
  --text-muted: ${theme.textMuted};
  --seal-color: ${theme.envelopeSealColor};
  --font-heading: ${theme.fontHeading};
  --font-body: ${theme.fontBody};
  --font-script: ${theme.fontScript};
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: var(--font-body);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.wedding-invitation-wrapper {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: var(--bg-color);
  position: relative;
  overflow-x: hidden;
  box-shadow: 0 0 50px rgba(0,0,0,0.3);
}

/* --- 1. BÌ THƯ SÁP NIÊM PHONG (WAX SEAL) --- */
.wax-envelope-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: radial-gradient(circle at center, #1f1f1f 0%, #0a0a0a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: opacity 0.8s ease, visibility 0.8s ease;
}

.wax-envelope-screen.opened {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.envelope-card {
  width: 100%;
  max-width: 380px;
  background: #fbf7ee;
  border-radius: 18px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.6);
  padding: 40px 24px;
  text-align: center;
  position: relative;
  border: 1px solid rgba(212, 175, 55, 0.4);
}

.envelope-wax-seal {
  width: 90px;
  height: 90px;
  background: radial-gradient(circle, var(--seal-color) 0%, #7d1515 100%);
  border-radius: 50%;
  margin: -65px auto 20px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.4);
  cursor: pointer;
  border: 3px solid #ffde7b;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.envelope-wax-seal:hover {
  transform: scale(1.08) rotate(5deg);
}

.wax-seal-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}

.wax-monogram {
  font-family: var(--font-script);
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}

.wax-subtext {
  font-size: 8px;
  letter-spacing: 2px;
  margin-top: 4px;
  opacity: 0.9;
}

.envelope-notice {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #78716c;
  margin-bottom: 8px;
}

.envelope-couple-names {
  font-family: var(--font-heading);
  font-size: 26px;
  color: #292524;
  margin-bottom: 24px;
}

.envelope-tap-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(212, 175, 55, 0.15);
  color: #854d0e;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 600;
  animation: pulseHint 2s infinite;
}

@keyframes pulseHint {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* Song Hỷ Emerald Envelope Screen */
.songhy-envelope-screen {
  background: radial-gradient(ellipse at 50% 50%, #152d1f 0%, #0d1e15 55%, #07130c 100%) !important;
}
.songhy-ambient-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}
.songhy-ambient-xi {
  position: absolute;
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  color: #5d826a;
  user-select: none;
  pointer-events: none;
  animation: songhy-ambient-breathe 7s ease-in-out infinite alternate;
  text-shadow: 0 0 10px rgba(93, 130, 106, 0.4);
}
@keyframes songhy-ambient-breathe {
  0% { transform: translateY(0) scale(1); opacity: var(--base-op, 0.3); }
  50% { transform: translateY(-4px) scale(1.04); opacity: calc(var(--base-op, 0.3) + 0.08); }
  100% { transform: translateY(2px) scale(0.98); opacity: var(--base-op, 0.3); }
}
.songhy-envelope-card-wrap {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 530px;
}
.songhy-envelope-card {
  width: 100%;
  background: radial-gradient(ellipse at 50% 20%, #1e3f2d 0%, #152f21 55%, #0f2218 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 34px 28px 32px 28px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.7), 0 0 1px rgba(255, 255, 255, 0.18);
  position: relative;
  overflow: hidden;
  text-align: center;
  color: #ffffff;
  box-sizing: border-box;
}
.songhy-card-watermark {
  position: absolute;
  pointer-events: none;
  z-index: 1;
}
.songhy-card-watermark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.14;
  filter: brightness(0.95);
}
.songhy-card-watermark.top-left {
  top: -30px;
  left: -35px;
  width: 165px;
  height: 165px;
  transform: rotate(-22deg);
}
.songhy-card-watermark.bottom-right {
  bottom: -35px;
  right: -30px;
  width: 175px;
  height: 175px;
  transform: rotate(24deg);
}
.songhy-envelope-card-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.songhy-seal-crest-btn {
  position: relative;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  margin: 0 auto 16px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}
.songhy-seal-crest-btn:hover { transform: scale(1.06); }
.songhy-round-seal-img {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 32px 8px rgba(220, 245, 235, 0.38), 0 0 12px 2px rgba(220, 245, 235, 0.25);
  background: #f4f8f5;
  transition: all 0.3s ease;
}
.songhy-envelope-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.25;
}
.songhy-envelope-title .person-name { color: #ffffff; letter-spacing: 0.5px; }
.songhy-envelope-title .ampersand {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-style: italic;
  font-weight: 400;
  color: #e5eee8;
  margin: 3px 0 2px 0;
}
.songhy-flourish-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 8px auto 12px auto;
  color: rgba(230, 245, 235, 0.55);
}
.songhy-flourish-divider .f-line { width: 36px; height: 1px; background: currentColor; opacity: 0.5; }
.songhy-flourish-divider .f-icon { font-size: 14px; line-height: 1; color: rgba(230, 245, 235, 0.75); }
.songhy-envelope-date-text {
  font-family: 'Playfair Display', serif;
  font-size: 15px;
  color: #e5eee8;
  margin-bottom: 12px;
}
.songhy-envelope-invitee-text {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  color: #d1dfd4;
  margin-bottom: 22px;
}
.songhy-open-envelope-btn {
  background: #ffffff;
  color: #142c1f;
  border: none;
  padding: 10px 38px;
  border-radius: 9999px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25), 0 0 22px rgba(255, 255, 255, 0.25);
  transition: all 0.3s ease;
}
.songhy-open-envelope-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 26px rgba(255, 255, 255, 0.4);
}

/* --- 2. THANH ĐIỀU KHIỂN ĐẦU TRANG --- */
.invitation-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: rgba(15, 15, 15, 0.85);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.topbar-brand {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--primary-color);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.music-toggle-btn {
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

/* --- 3. SECTION HERO & POSTER --- */
.section-hero {
  padding: 40px 20px 20px 20px;
  text-align: center;
}

.hero-badge-pill {
  display: inline-block;
  background: linear-gradient(135deg, var(--primary-color) 0%, #b8860b 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  padding: 4px 14px;
  border-radius: 20px;
  margin-bottom: 14px;
}

.hero-subheading {
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.hero-title {
  font-family: var(--font-heading);
  font-size: 32px;
  color: var(--primary-color);
  margin-bottom: 8px;
  line-height: 1.2;
}

.hero-solar-date {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
}

.hero-lunar-date {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.hero-poster-frame {
  width: 100%;
  height: 480px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 15px 35px rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.1);
}

.hero-poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* --- 4. LỜI NGỎ & TRÍCH DẪN --- */
.section-quote {
  padding: 30px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  margin: 20px 16px;
  border-radius: 16px;
  border: 1px dashed rgba(212, 175, 55, 0.3);
}

.quote-ornament {
  font-family: var(--font-heading);
  font-size: 28px;
  color: var(--primary-color);
}

.quote-content {
  font-family: var(--font-heading);
  font-style: italic;
  font-size: 16px;
  color: var(--text-color);
  margin: 10px 0;
  line-height: 1.8;
}

/* --- 5. ĐẾM NGƯỢC COUNTDOWN --- */
.section-countdown {
  padding: 24px 20px;
  text-align: center;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 18px;
  letter-spacing: 2px;
  color: var(--primary-color);
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: var(--primary-color);
}

.countdown-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.countdown-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 12px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.count-num {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.count-lbl {
  font-size: 9px;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* --- 6. KHỐI CẶP ĐÔI DÂU - RỂ --- */
.section-couple-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  padding: 20px;
}

.couple-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 18px 12px;
  text-align: center;
}

.couple-avatar-wrap {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin: 0 auto 12px auto;
  position: relative;
  border: 2px solid var(--primary-color);
  padding: 3px;
}

.couple-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.couple-role-tag {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-color);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

.couple-fullname {
  font-family: var(--font-heading);
  font-size: 17px;
  color: var(--text-color);
  margin-bottom: 4px;
}

.couple-family-parents, .couple-family-location {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
}

/* --- 7. SỰ KIỆN TIỆC CƯỚI --- */
.section-events {
  padding: 20px;
  text-align: center;
}

.event-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 16px;
  padding: 24px 18px;
  text-align: center;
}

.event-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.event-name {
  font-family: var(--font-heading);
  font-size: 20px;
  color: var(--text-color);
  margin-bottom: 8px;
}

.event-time, .event-address {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.event-map-btn {
  display: inline-block;
  margin-top: 14px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #b8860b 100%);
  color: #fff;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 25px;
  transition: transform 0.2s;
}

/* --- 8. VIETQR MỪNG CƯỚI --- */
.section-vietqr {
  padding: 24px 20px;
  text-align: center;
}

.vietqr-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.qr-cards-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.qr-account-card {
  background: #ffffff;
  color: #1a1a1a;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.qr-card-title {
  font-size: 13px;
  font-weight: 700;
  color: #854d0e;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.qr-image-frame {
  width: 170px;
  height: 170px;
  margin: 0 auto 12px auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.vietqr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-bank-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.qr-acc-holder {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 10px;
}

.copy-acc-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* --- 9. RSVP & GUESTBOOK --- */
.section-rsvp, .section-guestbook {
  padding: 24px 20px;
  text-align: center;
}

.rsvp-form, .wish-form {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 14px;
  text-align: left;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.rsvp-form input, .rsvp-form select, .wish-form input, .wish-form textarea {
  width: 100%;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  font-family: inherit;
}

.rsvp-submit-btn, .wish-submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #b8860b 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}

.success-msg {
  color: #4ade80;
  font-size: 13px;
  text-align: center;
  margin-top: 10px;
}

.wishes-list-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wish-bubble {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px 16px;
  border-radius: 12px;
  border-left: 3px solid var(--primary-color);
  text-align: left;
}

.wish-sender-name {
  font-size: 13px;
  color: var(--primary-color);
  display: block;
  margin-bottom: 4px;
}

.wish-text {
  font-size: 13px;
  color: var(--text-color);
}

/* --- 10. FOOTER --- */
.invitation-footer {
  padding: 40px 20px 50px 20px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-thankyou {
  font-size: 10px;
  letter-spacing: 3px;
  color: var(--primary-color);
  margin-bottom: 8px;
}


/* --- BÌ THƯ NƠ LỤA SATIN HỒNG (DREAMY FAIRYTALE ENVELOPE) --- */
.ribbon-bow-screen {
  background: radial-gradient(circle at center, #FDF2F4 0%, #F5D5DD 100%) !important;
}

.ribbon-envelope-card {
  background: #FFF5F7 !important;
  border: 1px solid #F5CAD3 !important;
  box-shadow: 0 25px 60px rgba(183, 110, 121, 0.25) !important;
  padding: 50px 24px 36px 24px !important;
  position: relative;
  overflow: visible;
  cursor: pointer;
}

.envelope-calligraphy-sub {
  font-family: 'Great Vibes', cursive;
  font-size: 24px;
  color: #8C656E;
  margin-bottom: 6px;
}

.dreamy-font {
  font-family: 'Cormorant Garamond', serif !important;
  font-style: italic;
  font-size: 32px !important;
  color: #4A2E35 !important;
  letter-spacing: 1px;
}

.envelope-floral-arch {
  position: absolute;
  top: -45px;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  height: 90px;
  background-image: radial-gradient(ellipse at center, rgba(232, 165, 176, 0.3) 0%, transparent 70%);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.satin-ribbon-bow-wrap {
  position: relative;
  width: 140px;
  height: 80px;
  margin: -60px auto 20px auto;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.satin-ribbon-bow-wrap:hover {
  transform: scale(1.08);
}

.satin-ribbon-band {
  position: absolute;
  top: 36px;
  left: -120px;
  right: -120px;
  height: 18px;
  background: linear-gradient(180deg, #FBE0E5 0%, #E8A5B0 50%, #D48997 100%);
  box-shadow: 0 4px 10px rgba(196, 120, 133, 0.3);
  z-index: 1;
}

.satin-bow-knot {
  position: relative;
  width: 120px;
  height: 80px;
  margin: 0 auto;
  z-index: 2;
}

.satin-center-knot {
  position: absolute;
  top: 26px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 38px;
  background: linear-gradient(135deg, #FBE0E5 0%, #E29CA8 60%, #B76E79 100%);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(183, 110, 121, 0.45);
  z-index: 5;
}

.satin-loop {
  position: absolute;
  top: 20px;
  width: 54px;
  height: 50px;
  background: linear-gradient(135deg, #FFF0F3 0%, #F5CAD3 40%, #E29CA8 100%);
  border-radius: 50% 50% 30% 50%;
  box-shadow: inset 0 2px 6px rgba(255,255,255,0.8), 0 6px 14px rgba(183, 110, 121, 0.35);
  z-index: 3;
}

.satin-loop.loop-left {
  left: 10px;
  transform: rotate(-15deg);
}

.satin-loop.loop-right {
  right: 10px;
  transform: scaleX(-1) rotate(-15deg);
}

.satin-tail {
  position: absolute;
  top: 50px;
  width: 22px;
  height: 60px;
  background: linear-gradient(180deg, #E29CA8 0%, #F5CAD3 70%, #FFF0F3 100%);
  box-shadow: 0 6px 12px rgba(183, 110, 121, 0.25);
  z-index: 2;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%);
}

.satin-tail.tail-left {
  left: 36px;
  transform: rotate(18deg);
}

.satin-tail.tail-right {
  right: 36px;
  transform: rotate(-18deg);
}

.ribbon-untied .satin-loop.loop-left {
  animation: untieLeft 0.6s forwards ease-out;
}
.ribbon-untied .satin-loop.loop-right {
  animation: untieRight 0.6s forwards ease-out;
}
.ribbon-untied .satin-center-knot {
  animation: fadeOutKnot 0.5s forwards;
}

@keyframes untieLeft {
  0% { transform: rotate(-15deg) scale(1); }
  100% { transform: translate(-40px, -20px) rotate(-60deg) scale(0.2); opacity: 0; }
}
@keyframes untieRight {
  0% { transform: scaleX(-1) rotate(-15deg) scale(1); }
  100% { transform: translate(40px, -20px) scaleX(-1) rotate(-60deg) scale(0.2); opacity: 0; }
}
@keyframes fadeOutKnot {
  0% { transform: translateX(-50%) scale(1); opacity: 1; }
  100% { transform: translateX(-50%) scale(0.3); opacity: 0; }
}

/* --- HERO LÂU ĐÀI CỔ TÍCH VEN HỒ --- */
.dreamy-hero {
  position: relative;
  padding: 0 0 30px 0;
  text-align: center;
}

.dreamy-palace-banner {
  width: 100%;
  height: 380px;
  position: relative;
  overflow: hidden;
  border-bottom: 2px solid #F5CAD3;
}

.palace-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.palace-floral-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 245, 247, 0.1) 0%, rgba(255, 245, 247, 0.4) 70%, #FFF5F7 100%);
}

.dreamy-hero-content {
  padding: 20px 24px 0 24px;
}

.royal-monogram-crest {
  width: 64px;
  height: 64px;
  border: 1.5px solid #B76E79;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -32px auto 16px auto;
  background: #FFF5F7;
  box-shadow: 0 4px 15px rgba(183, 110, 121, 0.25);
  position: relative;
  z-index: 2;
}

.monogram-initials {
  font-family: 'Great Vibes', cursive;
  font-size: 26px;
  color: #B76E79;
  font-weight: 700;
}

.hero-couple-calligraphy {
  font-family: 'Great Vibes', cursive;
  font-size: 46px;
  color: #4A2E35;
  margin: 0 0 12px 0;
  line-height: 1.15;
}

.hero-request-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13px;
  letter-spacing: 2.5px;
  color: #8C656E;
  margin-bottom: 20px;
  line-height: 1.6;
}

.save-the-date-frame {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 10px 24px;
  border-top: 1px solid #E8A5B0;
  border-bottom: 1px solid #E8A5B0;
  margin-bottom: 24px;
}

.std-month {
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  letter-spacing: 3px;
  color: #4A2E35;
  font-weight: 600;
}

.std-day {
  font-family: 'Cormorant Garamond', serif;
  font-size: 38px;
  color: #B76E79;
  font-weight: 700;
  line-height: 1;
  padding: 0 6px;
}

.std-year {
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  letter-spacing: 3px;
  color: #4A2E35;
  font-weight: 600;
}

.std-weekday {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13px;
  letter-spacing: 2px;
  color: #8C656E;
}

.venue-intro {
  font-family: 'Cormorant Garamond', serif;
  font-size: 12px;
  letter-spacing: 2.5px;
  color: #8C656E;
  display: block;
  margin-bottom: 4px;
}

.venue-palace-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-style: italic;
  color: #4A2E35;
  margin: 0 0 4px 0;
}

.venue-time-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13px;
  letter-spacing: 2px;
  color: #B76E79;
  font-weight: 600;
}

/* --- CELEBRATIONS TIMELINE TRANH MÀU NƯỚC --- */
.section-celebrations {
  padding: 30px 20px;
  background: #FFF9FA;
}

.celebration-heading {
  font-family: 'Great Vibes', cursive !important;
  font-size: 38px !important;
  color: #4A2E35 !important;
  letter-spacing: 1px !important;
  margin-bottom: 24px !important;
  display: block;
  text-align: center;
}

.celebration-cards-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.celebration-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(183, 110, 121, 0.12);
  border: 1px solid #F8E2E6;
  text-align: center;
  transition: transform 0.3s;
}

.celebration-card:hover {
  transform: translateY(-4px);
}

.celebration-img-wrap {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
}

.celebration-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.celebration-subtitle {
  font-family: 'Cormorant Garamond', serif;
  font-size: 11px;
  letter-spacing: 2px;
  color: #8C656E;
  text-transform: uppercase;
  display: block;
  margin-bottom: 6px;
}

.celebration-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-style: italic;
  color: #4A2E35;
  margin: 0 0 6px 0;
}

.celebration-datetime {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #B76E79;
  font-weight: 600;
  margin-bottom: 14px;
}

.celebration-map-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 18px;
  background: #FFF0F3;
  color: #B76E79;
  border: 1px solid #F5CAD3;
  border-radius: 20px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 12px;
  letter-spacing: 2px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}

.celebration-map-link:hover {
  background: #B76E79;
  color: #fff;
}

.footer-signature {
  font-size: 12px;
  color: var(--text-muted);
}

.hidden {
  display: none !important;
}
`;
};

/**
 * 3. Sinh toàn bộ mã JavaScript tương tác
 */
export const generateJsSnippet = (template, customData = SAMPLE_WEDDING_DATA) => {
  const targetDate = customData.dateSolar || '2026-11-20';
  const targetTime = customData.time || '17:30';

  return `// ========================================================
// THIỆP CƯỚI ONLINE: BỘ MÃ JAVASCRIPT ĐIỀU KHIỂN TƯƠNG TÁC
// Long Wedding Studio
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. MỞ NẮP BÌ THƯ SÁP NIÊM PHONG (WAX SEAL)
  const waxTrigger = document.getElementById('open-envelope-trigger');
  const envelopeScreen = document.getElementById('wax-envelope-screen');
  const mainContent = document.getElementById('invitation-main-content');
  const audioPlayer = document.getElementById('wedding-audio-player');
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicStatusText = document.getElementById('music-status-text');

  const openBtn2 = document.getElementById('open-envelope-btn-2');
  const bowBox = document.getElementById('satin-bow-knot-box');

  const handleOpenEnvelopeAction = () => {
    if (bowBox) {
      bowBox.classList.add('ribbon-untied');
      setTimeout(() => {
        if (envelopeScreen) envelopeScreen.classList.add('opened');
        if (mainContent) mainContent.classList.remove('hidden');
      }, 500);
    } else {
      if (envelopeScreen) envelopeScreen.classList.add('opened');
      if (mainContent) mainContent.classList.remove('hidden');
    }

    // Tự động phát nhạc nền cưới khi mở thiệp
    if (audioPlayer) {
      audioPlayer.play().then(() => {
        if (musicStatusText) musicStatusText.textContent = 'Tắt Nhạc';
      }).catch((err) => {
        console.warn('Trình duyệt yêu cầu người dùng chạm để phát âm thanh:', err);
      });
    }
  };

  if (waxTrigger) waxTrigger.addEventListener('click', handleOpenEnvelopeAction);
  if (openBtn2) openBtn2.addEventListener('click', handleOpenEnvelopeAction);

  // 2. BẬT / TẮT NHẠC NỀN
  if (musicToggleBtn && audioPlayer) {
    musicToggleBtn.addEventListener('click', () => {
      if (audioPlayer.paused) {
        audioPlayer.play().then(() => {
          if (musicStatusText) musicStatusText.textContent = 'Tắt Nhạc';
        });
      } else {
        audioPlayer.pause();
        if (musicStatusText) musicStatusText.textContent = 'Bật Nhạc';
      }
    });
  }

  // 3. ĐẾM NGƯỢC NGÀY CƯỚI THỜI GIAN THỰC
  const targetDateTime = new Date('${targetDate}T${targetTime}:00').getTime();
  const daysEl = document.getElementById('days-val');
  const hoursEl = document.getElementById('hours-val');
  const minsEl = document.getElementById('mins-val');
  const secsEl = document.getElementById('secs-val');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDateTime - now;

    if (distance > 0) {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
    } else {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 4. SAO CHÉP SỐ TÀI KHOẢN NGÂN HÀNG (CLIPBOARD)
  window.copyText = function(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert('Đã sao chép số tài khoản: ' + text);
    }).catch(() => {
      prompt('Hãy sao chép số tài khoản bên dưới:', text);
    });
  };

  // 5. XÁC NHẬN THAM DỰ RSVP
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpSuccessMsg = document.getElementById('rsvp-success-msg');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvp-name').value;
      const phone = document.getElementById('rsvp-phone').value;
      const attending = document.getElementById('rsvp-attending').value;
      
      const rsvpData = { name, phone, attending, submittedAt: new Date().toISOString() };
      localStorage.setItem('wedding_rsvp_' + Date.now(), JSON.stringify(rsvpData));

      if (rsvpSuccessMsg) {
        rsvpSuccessMsg.classList.remove('hidden');
        setTimeout(() => rsvpSuccessMsg.classList.add('hidden'), 5000);
      }
      rsvpForm.reset();
    });
  }

  // 6. GỬI LỜI CHÚC MỪNG (GUESTBOOK)
  const wishForm = document.getElementById('wish-form');
  const wishesContainer = document.getElementById('wishes-list-container');
  if (wishForm && wishesContainer) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sender = document.getElementById('wish-sender').value;
      const message = document.getElementById('wish-message').value;

      if (!sender || !message) return;

      const newBubble = document.createElement('div');
      newBubble.className = 'wish-bubble';
      newBubble.innerHTML = \`<strong class="wish-sender-name">\${sender}</strong><p class="wish-text">\${message}</p>\`;

      wishesContainer.prepend(newBubble);
      wishForm.reset();
    });
  }
});`;
};

/**
 * 4. Sinh file HTML hoàn chỉnh độc lập (Standalone Single-File Web)
 * Người dùng có thể lưu file .html này và mở trực tiếp trong bất kỳ trình duyệt nào!
 */
export const generateStandaloneHtml = (template, customData = SAMPLE_WEDDING_DATA) => {
  if (template.customHtml && template.customHtml.includes('<!DOCTYPE html>')) {
    return template.customHtml;
  }
  const htmlSnippet = generateHtmlSnippet(template, customData);
  const cssSnippet = generateCssSnippet(template);
  const jsSnippet = generateJsSnippet(template, customData);
  const tplName = template.name || 'Thiệp Cưới Online';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${tplName} - ${customData.groom.nickname} & ${customData.bride.nickname}</title>
  <meta name="description" content="Thiệp cưới điện tử cao cấp thiết kế bởi Long Wedding Studio" />

  <!-- Google Fonts Nghệ Thuật -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel+Decorative:wght@700&family=Cinzel:wght@600;700&family=Cormorant+Garamond:ital,wght@0,500;0,700;1,400&family=Great+Vibes&family=Inter:wght@400;500;600&family=Montserrat:wght@300;400;500;600;700&family=Nunito:wght@400;600&family=Parisienne&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet" />

  <!-- CSS Thiết Kế Mẫu Thiệp -->
  <style>
${cssSnippet}
  </style>
</head>
<body>

${htmlSnippet}

  <!-- JavaScript Điều Khiển Tương Tác -->
  <script>
${jsSnippet}
  </script>
</body>
</html>`;
};

/**
 * 5. Sinh dữ liệu JSON cấu hình thiết kế (Design Style & Layout)
 */
export const generateDesignJson = (template) => {
  const theme = THEME_PRESETS[template.themeId] || THEME_PRESETS['luxury-gold'];

  return {
    schema: 'longwedding.invitation.design/v1',
    exportedAt: new Date().toISOString(),
    generator: 'Long Wedding Studio Admin v2.0',
    type: 'single-template',
    template: {
      id: template.id || template._id || `tpl-${Date.now()}`,
      code: template.code || 'TPL-CUSTOM',
      name: template.name || 'Mẫu Thiệp Cưới',
      category: template.category || 'Hoàng Gia',
      accessType: template.accessType || 'free',
      badge: template.badge || (template.accessType === 'free' ? 'MIỄN PHÍ' : 'ĐẶC QUYỀN VIP'),
      price: template.price || '0đ (Miễn Phí)',
      requiredPackage: template.requiredPackage || 'Mọi Khách Hàng',
      description: template.description || '',
      thumbnail: template.thumbnail || '',
      coverImage: template.coverImage || template.thumbnail || '',
      musicUrl: template.musicUrl || 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-1498.mp3',
      musicTitle: template.musicTitle || 'Wedding Waltz',
      isActive: template.isActive !== undefined ? template.isActive : true,
      
      // Phong cách thiết kế chi tiết
      designStyle: {
        themeId: template.themeId || 'luxury-gold',
        primaryColor: template.primaryColor || theme.primaryColor,
        secondaryColor: template.secondaryColor || theme.secondaryColor,
        accentColor: theme.accentColor,
        backgroundColor: template.backgroundColor || theme.backgroundColor,
        textColor: template.textColor || theme.textColor,
        typography: {
          fontHeading: theme.fontHeading,
          fontBody: theme.fontBody,
          fontScript: theme.fontScript
        },
        effectType: template.effectType || theme.effectType
      },

      // Bố cục Layout
      layout: {
        envelopeStyle: template.envelopeStyle || template.layout?.envelopeStyle || 'wax-seal',
        galleryLayout: template.galleryLayout || template.layout?.galleryLayout || 'grid-2col',
        enabledSections: template.layout?.enabledSections || {
          envelope: true,
          hero: true,
          quote: true,
          countdown: true,
          couple: true,
          events: true,
          vietQr: true,
          rsvp: true,
          guestbook: true
        }
      }
    }
  };
};

/**
 * 6. Tiện ích kích hoạt tải file về máy tính (Hỗ trợ String và Blob)
 */
export const downloadFile = (filename, content, mimeType = 'text/plain') => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 7. Xuất 1 Mẫu Thiệp thành file ZIP trọn gói (.ZIP)
 * Chứa: index.html, style.css, script.js, template.json, README.txt
 */
export const exportTemplateToZip = async (template, customData = SAMPLE_WEDDING_DATA) => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const safeCode = (template.code || 'TPL').replace(/\s+/g, '_');
  const safeName = (template.name || 'thiep_cuoi').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');

  // 1. index.html: File web độc lập chạy ngay
  const standaloneHtml = generateStandaloneHtml(template, customData);
  zip.file('index.html', standaloneHtml);

  // 2. template.html: Đoạn mã HTML cấu trúc layout
  const htmlSnippet = generateHtmlSnippet(template, customData);
  zip.file('template.html', htmlSnippet);

  // 3. style.css: Toàn bộ CSS phong cách thiết kế
  const cssSnippet = generateCssSnippet(template);
  zip.file('style.css', cssSnippet);

  // 4. script.js: Bộ mã JS tương tác
  const jsSnippet = generateJsSnippet(template, customData);
  zip.file('script.js', jsSnippet);

  // 5. template.json: Bản vẽ thiết kế & bố cục layout chuẩn Studio
  const designJson = generateDesignJson(template);
  zip.file('template.json', JSON.stringify(designJson, null, 2));

  // 6. README.txt: Hướng dẫn sử dụng
  const readme = `=======================================================
LONG WEDDING STUDIO - GÓI THIẾT KẾ THIỆP CƯỚI ONLINE (.ZIP)
Mẫu thiệp: ${template.name}
Mã code: ${template.code}
Danh mục: ${template.category}
Ngày xuất: ${new Date().toLocaleString('vi-VN')}
=======================================================

NỘI DUNG TỆP NÉN:
1. 'index.html': Trang web thiệp cưới độc lập hoàn chỉnh.
   -> Nhấp đúp chuột để mở trực tiếp trong bất kỳ trình duyệt nào (Chrome, Safari, Cốc Cốc, Edge, Điện thoại).
   -> Có thể tải lên máy chủ hosting hoặc gửi thẳng cho khách hàng.
2. 'style.css': Toàn bộ màu sắc, typography Google Fonts và hiệu ứng chuyển động.
3. 'script.js': Mã JS xử lý mở nắp bì thư sáp, đếm ngược ngày cưới, nhạc nền MP3, RSVP.
4. 'template.json': File cấu hình dữ liệu chuẩn của Long Wedding Studio.
   -> Dùng để IMPORT lại mẫu thiệp vào trang Quản trị bất cứ lúc nào!

Bản quyền thiết kế © Long Wedding Studio (longwedding.vn).`;
  zip.file('README.txt', readme);

  // Nén và tải về
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadFile(`${safeCode}_${safeName}.zip`, zipBlob, 'application/zip');
};

/**
 * 8. Xuất Toàn Bộ Kho Mẫu Thiệp thành 1 file ZIP tổng hợp (.ZIP)
 * Chứa: templates.json (manifest tổng), thư mục templates/ với từng mẫu con và README.txt
 */
export const exportAllTemplatesToZip = async (templates) => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const dateStr = new Date().toISOString().split('T')[0];

  // 1. File tổng templates.json
  const manifest = {
    schema: 'longwedding.invitation.templates-package/v1',
    exportedAt: new Date().toISOString(),
    generator: 'Long Wedding Studio Admin v2.0',
    type: 'template-package',
    count: templates.length,
    templates: templates.map(t => generateDesignJson(t).template)
  };
  zip.file('templates.json', JSON.stringify(manifest, null, 2));

  // 2. Thư mục con cho từng mẫu thiệp
  const templatesFolder = zip.folder('templates');
  templates.forEach((tpl) => {
    const safeCode = (tpl.code || 'TPL').replace(/\s+/g, '_');
    const tplFolder = templatesFolder.folder(safeCode);
    tplFolder.file('index.html', generateStandaloneHtml(tpl));
    tplFolder.file('style.css', generateCssSnippet(tpl));
    tplFolder.file('script.js', generateJsSnippet(tpl));
    tplFolder.file('template.json', JSON.stringify(generateDesignJson(tpl), null, 2));
  });

  // 3. README.txt
  const readme = `=======================================================
LONG WEDDING STUDIO - TOÀN BỘ KHO MẪU THIỆP CƯỚI (.ZIP)
Số lượng mẫu: ${templates.length} mẫu thiệp
Ngày đóng gói: ${dateStr}
=======================================================

Gói lưu trữ này đóng gói toàn vẹn kho mẫu thiệp cưới điện tử của Studio.
Bao gồm:
- 'templates.json': Bản vẽ dữ liệu của toàn bộ ${templates.length} mẫu thiệp.
- Thư mục 'templates/': Chứa từng mẫu thiệp độc lập kèm HTML, CSS, JS.

HƯỚNG DẪN IMPORT VÀO HỆ THỐNG:
Tại trang quản trị 'Quản Lý Mẫu Thiệp Cưới Online':
1. Bấm nút 'Import File ZIP / JSON'.
2. Chọn thẳng file ZIP này.
3. Hệ thống sẽ tự động giải nén và nạp toàn bộ các mẫu thiệp vào cơ sở dữ liệu!`;
  zip.file('README.txt', readme);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadFile(`longwedding_kho_mau_thiep_${dateStr}.zip`, zipBlob, 'application/zip');
};

/**
 * 9. Đọc và giải nén dữ liệu từ file ZIP khi người dùng Import (.ZIP)
 */
export const parseZipTemplateFile = async (file) => {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(file);
  let itemsToImport = [];

  // 1. Đọc kèm các file mã nguồn độc lập nếu có trong ZIP
  let htmlContent = null;
  if (zip.file('index.html')) {
    try { htmlContent = await zip.file('index.html').async('string'); } catch (e) {}
  }
  let cssContent = null;
  if (zip.file('style.css')) {
    try { cssContent = await zip.file('style.css').async('string'); } catch (e) {}
  }
  let jsContent = null;
  if (zip.file('script.js')) {
    try { jsContent = await zip.file('script.js').async('string'); } catch (e) {}
  }

  // 2. Kiểm tra file templates.json (gói nhiều mẫu)
  if (zip.file('templates.json')) {
    const manifestStr = await zip.file('templates.json').async('string');
    const manifest = JSON.parse(manifestStr);
    if (Array.isArray(manifest.templates)) {
      itemsToImport = manifest.templates;
    } else if (Array.isArray(manifest)) {
      itemsToImport = manifest;
    }
  } 
  // 3. Kiểm tra file template.json (mẫu đơn lẻ)
  else if (zip.file('template.json')) {
    const tplStr = await zip.file('template.json').async('string');
    const parsed = JSON.parse(tplStr);
    itemsToImport = [parsed.template || parsed];
  } 
  // 4. Quét tất cả các file .json trong các thư mục con
  else {
    const jsonFiles = Object.keys(zip.files).filter(f => f.endsWith('.json') && !zip.files[f].dir);
    for (const jsonPath of jsonFiles) {
      try {
        const content = await zip.file(jsonPath).async('string');
        const parsed = JSON.parse(content);
        if (parsed.template) itemsToImport.push(parsed.template);
        else if (parsed.name && parsed.code) itemsToImport.push(parsed);
        else if (Array.isArray(parsed.templates)) itemsToImport.push(...parsed.templates);
      } catch (e) {}
    }
  }

  // 5. Fallback: Nếu không tìm thấy JSON, nhưng có index.html
  if (itemsToImport.length === 0 && htmlContent) {
    itemsToImport = [{
      name: file.name.replace('.zip', '').replace(/_/g, ' '),
      code: `TPL-ZIP-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Hoàng Gia',
      themeId: 'luxury-gold',
      accessType: 'vip',
      badge: 'ĐẶC QUYỀN VIP',
      price: '299.000đ',
      description: 'Mẫu thiệp nhập từ gói nén ZIP.',
      thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      customHtml: htmlContent,
      customCss: cssContent,
      customJs: jsContent,
      isActive: true
    }];
  } else if (itemsToImport.length > 0) {
    itemsToImport.forEach(item => {
      if (htmlContent && !item.customHtml) item.customHtml = htmlContent;
      if (cssContent && !item.customCss) item.customCss = cssContent;
      if (jsContent && !item.customJs) item.customJs = jsContent;
    });
  }

  return itemsToImport;
};

