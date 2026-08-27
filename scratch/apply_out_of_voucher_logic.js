const fs = require('fs');
const path = require('path');

const BACKEND_SERVICE_PATH = path.resolve('..', 'backend-quantri-longwedding', 'backend-admin-longwedding', 'src', 'services', 'website.service.js');
const FRONTEND_API_PATH = path.resolve('..', 'websiite-longwedding', 'website-longwedding', 'src', 'api.js');
const FRONTEND_QUOCKHANH_PATH = path.resolve('..', 'websiite-longwedding', 'website-longwedding', 'src', 'pages', 'QuocKhanh.js');

console.log("Checking file existence...");
console.log("Backend:", fs.existsSync(BACKEND_SERVICE_PATH));
console.log("Frontend API:", fs.existsSync(FRONTEND_API_PATH));
console.log("Frontend QuocKhanh:", fs.existsSync(FRONTEND_QUOCKHANH_PATH));

// 1. UPDATE BACKEND website.service.js
if (fs.existsSync(BACKEND_SERVICE_PATH)) {
  let backendContent = fs.readFileSync(BACKEND_SERVICE_PATH, 'utf8');

  // Replace fallback voucher logic in addQuocKhanhTribute
  const targetBackendRegex = /\/\/ Fallback nếu không có voucher trong DB[\s\S]*?return res\.status\(200\)\.json\({\s*success: true,\s*message: "Gửi lời tri ân và nhận Voucher tri ân thành công! 🇻🇳",\s*data: newTribute,\s*voucher: selectedVoucher,\s*flagCount: currentCount\s*}\);/;

  const newBackendReplacement = `// Gán thông tin người nhận và lưu nhật ký nếu có voucher được cấp
    if (selectedVoucher) {
      selectedVoucher.userName = cleanName;
      selectedVoucher.userPhone = cleanPhone;
      selectedVoucher.userLocation = cleanLocation;
      selectedVoucher.claimedAt = new Date().toISOString();

      // 2. Ghi nhận nhận voucher vào voucher_claims
      try {
        let claimsDoc = await WEBSITE.findOne({ section: 'voucher_claims' });
        if (!claimsDoc) {
          claimsDoc = new WEBSITE({ section: 'voucher_claims', data: [] });
        }
        claimsDoc.data.push({
          id: Date.now(),
          voucherId: selectedVoucher._id || selectedVoucher.id,
          voucherCode: selectedVoucher.code,
          voucherTitle: selectedVoucher.title,
          voucherValue: selectedVoucher.value,
          name: cleanName,
          phone: cleanPhone,
          location: cleanLocation,
          source: 'quoc_khanh_tribute',
          claimedAt: new Date().toISOString()
        });
        claimsDoc.markModified('data');
        await claimsDoc.save();
      } catch (e) {}
    }

    // 3. Tự động thêm vào danh sách Bookings (Leads) nếu có SĐT
    if (cleanPhone) {
      try {
        let bookingsDoc = await WEBSITE.findOne({ section: 'bookings' });
        if (!bookingsDoc) {
          bookingsDoc = new WEBSITE({ section: 'bookings', data: [] });
        }
        bookingsDoc.data.unshift({
          id: Date.now() + 1,
          name: cleanName,
          phone: cleanPhone,
          service: selectedVoucher 
            ? \`[TRI ÂN QUỐC KHÁNH 2/9] \${selectedVoucher.title} (\${selectedVoucher.code})\`
            : \`[TRI ÂN QUỐC KHÁNH 2/9] Khách gửi lời tri ân\`,
          promoCode: selectedVoucher ? selectedVoucher.code : 'QUOCKHANH2026',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          note: \`[LỜI TRI ÂN 2/9]: "\${text.trim().substring(0, 150)}" | Địa chỉ: \${cleanLocation}\`,
          status: 'chua_lien_he',
          source: 'quoc_khanh_tribute_voucher',
          createdAt: new Date().toISOString()
        });
        bookingsDoc.markModified('data');
        await bookingsDoc.save();
      } catch (e) {}
    }

    // 4. Thêm lời chúc vào mục quoc_khanh_messages
    let messagesDoc = await WEBSITE.findOne({ section: 'quoc_khanh_messages' });
    if (!messagesDoc) {
      messagesDoc = new WEBSITE({ section: 'quoc_khanh_messages', data: [...DEFAULT_QUOC_KHANH_MESSAGES] });
    }

    const newTribute = {
      id: Date.now(),
      name: cleanName,
      phone: cleanPhone,
      province: province || '',
      commune: commune || '',
      hamlet: hamlet || '',
      location: cleanLocation,
      text: text.trim(),
      voucherCode: selectedVoucher ? selectedVoucher.code : null,
      voucherTitle: selectedVoucher ? selectedVoucher.title : null,
      voucherValue: selectedVoucher ? selectedVoucher.value : null,
      time: 'Vừa xong',
      createdAt: new Date().toISOString()
    };

    messagesDoc.data.unshift(newTribute);
    if (messagesDoc.data.length > 500) {
      messagesDoc.data = messagesDoc.data.slice(0, 500);
    }
    messagesDoc.markModified('data');
    await messagesDoc.save();

    // 5. Lưu vào feedback
    try {
      let feedbackDoc = await WEBSITE.findOne({ section: 'feedback' });
      if (!feedbackDoc) {
        feedbackDoc = new WEBSITE({ section: 'feedback', data: [] });
      }
      feedbackDoc.data.unshift({
        id: Date.now() + 2,
        type: 'quoc_khanh_tribute',
        name: cleanName,
        phone: cleanPhone,
        location: cleanLocation,
        text: text.trim(),
        voucherCode: selectedVoucher ? selectedVoucher.code : null,
        voucherTitle: selectedVoucher ? selectedVoucher.title : null,
        createdAt: new Date().toISOString()
      });
      if (feedbackDoc.data.length > 500) {
        feedbackDoc.data = feedbackDoc.data.slice(0, 500);
      }
      feedbackDoc.markModified('data');
      await feedbackDoc.save();
    } catch (e) {}

    // 6. Tự động tăng số lượt thắp sáng cờ Tổ quốc (+1)
    let flagsDoc = await WEBSITE.findOne({ section: 'quoc_khanh_flags' });
    let currentCount = DEFAULT_QUOC_KHANH_FLAGS;
    if (!flagsDoc) {
      currentCount = DEFAULT_QUOC_KHANH_FLAGS + 1;
      flagsDoc = new WEBSITE({ section: 'quoc_khanh_flags', data: { count: currentCount } });
    } else {
      if (typeof flagsDoc.data === 'number') {
        currentCount = flagsDoc.data + 1;
        flagsDoc.data = { count: currentCount };
      } else if (flagsDoc.data && typeof flagsDoc.data.count === 'number') {
        currentCount = flagsDoc.data.count + 1;
        flagsDoc.data.count = currentCount;
      } else {
        currentCount = DEFAULT_QUOC_KHANH_FLAGS + 1;
        flagsDoc.data = { count: currentCount };
      }
      flagsDoc.markModified('data');
    }
    await flagsDoc.save();

    if (!selectedVoucher) {
      return res.status(200).json({
        success: true,
        isOutOfVouchers: true,
        message: "Voucher đã hết, cảm ơn quý khách đã quan tâm đến sự kiện. Hẹn quý khách vào sự kiện tiếp theo",
        data: newTribute,
        voucher: null,
        flagCount: currentCount
      });
    }

    return res.status(200).json({
      success: true,
      isOutOfVouchers: false,
      message: "Gửi lời tri ân và nhận Voucher tri ân thành công! 🇻🇳",
      data: newTribute,
      voucher: selectedVoucher,
      flagCount: currentCount
    });`;

  if (targetBackendRegex.test(backendContent)) {
    backendContent = backendContent.replace(targetBackendRegex, newBackendReplacement);
    fs.writeFileSync(BACKEND_SERVICE_PATH, backendContent, 'utf8');
    console.log("Successfully updated Backend website.service.js!");
  } else {
    console.log("Regex did not match backend service content. Checking alternate replacement...");
  }
}

// 2. UPDATE FRONTEND api.js
if (fs.existsSync(FRONTEND_API_PATH)) {
  let apiContent = fs.readFileSync(FRONTEND_API_PATH, 'utf8');

  const oldClaimFnRegex = /\/\/ Rút \/ Claim ngẫu nhiên 1 Voucher[\s\S]*?export const submitNationalDayTribute/;

  const newClaimFnReplacement = `// Rút / Claim ngẫu nhiên 1 Voucher từ kho còn số lượng và tự động trừ số lượng (-1)
export const claimRandomEventVoucher = async (userData) => {
  try {
    const currentVouchers = await getEventVouchers();
    // Lọc các voucher đang hoạt động và còn tồn kho (usageLimit > usedCount hoặc quantity > claimedCount)
    const available = (currentVouchers || []).filter(v => {
      if (v.isActive === false) return false;
      const limit = Number(v.usageLimit !== undefined ? v.usageLimit : (v.quantity || 0));
      const used = Number(v.usedCount !== undefined ? v.usedCount : (v.claimedCount || 0));
      if (limit > 0 && used >= limit) return false;
      return true;
    });

    if (!available || available.length === 0) {
      return {
        isOutOfVouchers: true,
        outOfStock: true,
        message: "Voucher đã hết, cảm ơn quý khách đã quan tâm đến sự kiện. Hẹn quý khách vào sự kiện tiếp theo"
      };
    }

    const chosen = available[Math.floor(Math.random() * available.length)];

    // Tăng số lượng đã nhận lên 1
    const updatedVoucher = {
      ...chosen,
      claimedCount: Number(chosen.claimedCount || 0) + 1
    };

    // 1. Đồng bộ claim lên backend
    try {
      await axios.post(\`\${API_BASE_URL}/vouchers/claim\`, {
        voucherCode: chosen.code,
        voucherId: chosen._id || chosen.id,
        name: userData?.name || 'Người con Đất Việt',
        phone: userData?.phone || '',
        address: userData?.location || ''
      }, { timeout: 3000 });
    } catch (err) {}

    // 2. Ghi nhật ký vào danh sách voucher_claims
    try {
      await axios.post(\`\${API_BASE_URL}/voucher_claims/public-item\`, {
        item: {
          id: Date.now(),
          voucherCode: chosen.code,
          voucherTitle: chosen.title,
          voucherValue: chosen.value,
          name: userData?.name || 'Người con Đất Việt',
          phone: userData?.phone || '',
          location: userData?.location || '',
          source: 'quoc_khanh_tribute',
          claimedAt: new Date().toISOString()
        }
      }, { timeout: 3000 });
    } catch (claimErr) {}

    return {
      ...chosen,
      isOutOfVouchers: false,
      userName: userData?.name || 'Người con Đất Việt',
      userPhone: userData?.phone || '',
      userLocation: userData?.location || '',
      claimedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Lỗi khi claim voucher:", error);
    return {
      isOutOfVouchers: true,
      outOfStock: true,
      message: "Voucher đã hết, cảm ơn quý khách đã quan tâm đến sự kiện. Hẹn quý khách vào sự kiện tiếp theo"
    };
  }
};

export const submitNationalDayTribute`;

  if (oldClaimFnRegex.test(apiContent)) {
    apiContent = apiContent.replace(oldClaimFnRegex, newClaimFnReplacement);
    fs.writeFileSync(FRONTEND_API_PATH, apiContent, 'utf8');
    console.log("Successfully updated Frontend api.js!");
  } else {
    console.log("Could not find oldClaimFnRegex in api.js");
  }
}

console.log("Done preparing updates.");
