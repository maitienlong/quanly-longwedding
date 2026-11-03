/**
 * Adapter và Helper quản lý Thông số Chi tiết Gói Dịch vụ (Schema v2) cho Frontend
 * - Chuyển đổi dữ liệu Legacy sang Schema v2 (Idempotent)
 * - Kiểm tra hợp lệ dữ liệu (validation client-side)
 * - Tự động tổng hợp các thông số lượt chụp, makeup, số lượng ảnh
 * - Lưu draft an toàn vào localStorage phòng mất kết nối
 */

export function isMeaningful(str) {
  if (!str) return false;
  const s = String(str).trim().toLowerCase();
  return s !== '' && s !== 'không' && s !== 'không có' && s !== 'khong' && s !== 'khong co' && s !== '0';
}

export function parseWardrobeText(text, defaultKind = 'ao_dai', defaultOccasion = 'engagement', defaultRecipient = 'bride') {
  if (!text || !isMeaningful(text)) return null;

  const raw = String(text).trim();
  let quantity = 0;
  let unit = 'bộ';
  let itemType = defaultKind;
  let maxValueVnd = 0;
  let legacyNote = '';

  const digitsOnly = raw.replace(/[^0-9]/g, '');
  const isPureNumber = /^[0-9.,\s]+$/.test(raw) && digitsOnly.length >= 5;

  if (isPureNumber) {
    maxValueVnd = parseInt(digitsOnly, 10) || 0;
    quantity = 0; // AC-07: Không tự suy đoán số lượng váy nếu chỉ có giá trị
    return {
      occasion: defaultOccasion,
      recipient: defaultRecipient,
      itemType,
      quantity,
      unit,
      maxValueVnd,
      legacyNote: '',
      note: `Giá trị cam kết: ${raw} VNĐ`
    };
  }

  const qtyMatch = raw.match(/^(\d+)\s*([a-zA-ZÀ-ỹ]+)?\s*(.*)$/i);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1], 10) || 1;
    const rawUnit = (qtyMatch[2] || '').toLowerCase();
    if (['bộ', 'bo', 'chiếc', 'chiec', 'cái', 'cai'].includes(rawUnit)) {
      unit = rawUnit === 'bo' ? 'bộ' : (rawUnit === 'chiec' ? 'chiếc' : (rawUnit === 'cai' ? 'cái' : rawUnit));
    }

    const remainingText = (qtyMatch[3] || '').trim().toLowerCase();
    if (remainingText.includes('áo dài') || remainingText.includes('ao dai')) {
      itemType = 'ao_dai';
    } else if (remainingText.includes('vest')) {
      itemType = 'vest';
    } else if (remainingText.includes('váy') || remainingText.includes('vay')) {
      itemType = 'wedding_dress';
    } else if (defaultKind) {
      itemType = defaultKind;
    }

    const priceInMatch = remainingText.match(/(\d[\d.,\s]{3,})/);
    if (priceInMatch) {
      const priceDigits = priceInMatch[1].replace(/[^0-9]/g, '');
      if (priceDigits.length >= 5) {
        maxValueVnd = parseInt(priceDigits, 10) || 0;
      }
    }
  } else {
    // Parser không chắc chắn -> fallback lưu nguyên văn vào legacyNote (AC-07)
    legacyNote = raw;
    quantity = 1;
  }

  return {
    occasion: defaultOccasion,
    recipient: defaultRecipient,
    itemType,
    quantity,
    unit,
    maxValueVnd,
    legacyNote,
    note: ''
  };
}

export function createDefaultPackageDetails(pkgCode = 'NEW_PKG') {
  return {
    photoRetouch: {
      editedFileCount: 10,
      rawFileStatus: 'unset',
      deliveryDays: 7,
      note: ''
    },
    photoSchedules: [
      {
        id: `sch_${pkgCode}_1`,
        occasion: 'studio',
        sessionCount: 1,
        dayCount: 1,
        location: 'Studio Long Wedding',
        staff: 'Ekip Studio (1 Photo + 1 Makeup + 1 Hỗ trợ)',
        note: ''
      }
    ],
    deliverables: [
      {
        id: `del_${pkgCode}_20x30`,
        kind: 'photo_print',
        name: 'Ảnh để bàn 20x30',
        widthCm: 20,
        heightCm: 30,
        quantity: 2,
        material: 'Mika / Pha lê để bàn',
        note: '',
        sortOrder: 1
      },
      {
        id: `del_${pkgCode}_60x90`,
        kind: 'photo_print',
        name: 'Ảnh cổng cưới 60x90',
        widthCm: 60,
        heightCm: 90,
        quantity: 1,
        material: 'Mika HD bo viền Hàn Quốc',
        note: '',
        sortOrder: 2
      }
    ],
    makeupSessions: [
      {
        id: `mk_${pkgCode}_1`,
        occasion: 'engagement',
        recipient: 'bride',
        sessionCount: 1,
        location: 'Studio Long Wedding',
        note: ''
      }
    ],
    wardrobe: [
      {
        id: `wd_${pkgCode}_1`,
        occasion: 'engagement',
        recipient: 'bride',
        itemType: 'ao_dai',
        quantity: 1,
        unit: 'bộ',
        maxValueVnd: 0,
        legacyNote: '',
        note: ''
      }
    ],
    extras: [],
    terms: []
  };
}

export function migrateLegacyToDetails(doc) {
  if (!doc) return createDefaultPackageDetails();

  // Đã ở Schema v2
  if (doc.schemaVersion >= 2 && doc.details) {
    return {
      photoRetouch: {
        editedFileCount: Number(doc.details.photoRetouch?.editedFileCount) || 0,
        rawFileStatus: doc.details.photoRetouch?.rawFileStatus || 'unset',
        deliveryDays: Number(doc.details.photoRetouch?.deliveryDays) || 0,
        note: doc.details.photoRetouch?.note || ''
      },
      photoSchedules: Array.isArray(doc.details.photoSchedules) ? doc.details.photoSchedules : [],
      deliverables: Array.isArray(doc.details.deliverables) ? doc.details.deliverables : [],
      makeupSessions: Array.isArray(doc.details.makeupSessions) ? doc.details.makeupSessions : [],
      wardrobe: Array.isArray(doc.details.wardrobe) ? doc.details.wardrobe : [],
      extras: Array.isArray(doc.details.extras) ? doc.details.extras : [],
      terms: Array.isArray(doc.details.terms) ? doc.details.terms : []
    };
  }

  // Chuyển từ trường phẳng sang Schema v2
  const details = {
    photoRetouch: {
      editedFileCount: Number(doc.soLuongAnhChinhSua) || 0,
      rawFileStatus: 'unset',
      deliveryDays: 0,
      note: ''
    },
    photoSchedules: [],
    deliverables: [],
    makeupSessions: [],
    wardrobe: [],
    extras: [],
    terms: []
  };

  let sortOrder = 1;
  const sl16 = Number(doc.soLuongAnh16x21) || 0;
  if (sl16 > 0) {
    details.deliverables.push({
      id: `del_${doc.maDichVu || 'pkg'}_16x21`,
      kind: 'photo_print',
      name: 'Ảnh để bàn 16x21',
      widthCm: 16,
      heightCm: 21,
      quantity: sl16,
      material: 'Ép gỗ lụa cao cấp',
      note: '',
      sortOrder: sortOrder++
    });
  }

  const sl20 = Number(doc.soLuongAnh20x30) || 0;
  if (sl20 > 0) {
    details.deliverables.push({
      id: `del_${doc.maDichVu || 'pkg'}_20x30`,
      kind: 'photo_print',
      name: 'Ảnh để bàn 20x30',
      widthCm: 20,
      heightCm: 30,
      quantity: sl20,
      material: 'Mika / Pha lê để bàn',
      note: '',
      sortOrder: sortOrder++
    });
  }

  const sl60 = Number(doc.soLuongAnh60x90) || 0;
  if (sl60 > 0) {
    details.deliverables.push({
      id: `del_${doc.maDichVu || 'pkg'}_60x90`,
      kind: 'photo_print',
      name: 'Ảnh cổng cưới 60x90',
      widthCm: 60,
      heightCm: 90,
      quantity: sl60,
      material: 'Mika HD bo viền Hàn Quốc',
      note: '',
      sortOrder: sortOrder++
    });
  }

  const sessChup = Number(doc.soLuongLichChup) || (Number(doc.loaiDichVu) === 2 ? 1 : 0);
  if (sessChup > 0) {
    details.photoSchedules.push({
      id: `sch_${doc.maDichVu || 'pkg'}_1`,
      occasion: 'studio',
      sessionCount: sessChup,
      dayCount: sessChup,
      location: 'Studio Long Wedding',
      staff: 'Ekip Studio (1 Photo + 1 Makeup + 1 Hỗ trợ)',
      note: ''
    });
  }

  let mkIdx = 1;
  if (isMeaningful(doc.trangDiemNgayAnHoi)) {
    details.makeupSessions.push({
      id: `mk_${doc.maDichVu || 'pkg'}_${mkIdx++}`,
      occasion: 'engagement',
      recipient: 'bride',
      sessionCount: 1,
      location: 'Tại studio / nhà gái',
      note: String(doc.trangDiemNgayAnHoi).trim() === 'Có' ? '' : String(doc.trangDiemNgayAnHoi).trim()
    });
  }

  if (isMeaningful(doc.trangDiemNgayCuoi)) {
    details.makeupSessions.push({
      id: `mk_${doc.maDichVu || 'pkg'}_${mkIdx++}`,
      occasion: 'wedding_day',
      recipient: 'bride',
      sessionCount: 1,
      location: 'Tại nhà gái / tiệc cưới',
      note: String(doc.trangDiemNgayCuoi).trim() === 'Có' ? '' : String(doc.trangDiemNgayCuoi).trim()
    });
  }

  if (details.makeupSessions.length === 0 && (Number(doc.soLuongLichMake) > 0 || Number(doc.loaiDichVu) === 4)) {
    details.makeupSessions.push({
      id: `mk_${doc.maDichVu || 'pkg'}_${mkIdx++}`,
      occasion: 'unspecified',
      recipient: 'bride',
      sessionCount: Number(doc.soLuongLichMake) || 1,
      location: 'Studio Long Wedding',
      note: ''
    });
  }

  let wdIdx = 1;
  const cdAnHoi = parseWardrobeText(doc.trangPhucCoDauNgayAnHoi, 'ao_dai', 'engagement', 'bride');
  if (cdAnHoi) {
    cdAnHoi.id = `wd_${doc.maDichVu || 'pkg'}_${wdIdx++}`;
    details.wardrobe.push(cdAnHoi);
  }

  const crAnHoi = parseWardrobeText(doc.trangPhucChuReNgayAnHoi, 'ao_dai', 'engagement', 'groom');
  if (crAnHoi) {
    crAnHoi.id = `wd_${doc.maDichVu || 'pkg'}_${wdIdx++}`;
    details.wardrobe.push(crAnHoi);
  }

  const beTrap = parseWardrobeText(doc.trangPhucChoDoiBeLe, 'ao_dai_be_trap', 'engagement', 'bridesmaid');
  if (beTrap) {
    beTrap.id = `wd_${doc.maDichVu || 'pkg'}_${wdIdx++}`;
    beTrap.note = 'Đội bê đỡ tráp';
    details.wardrobe.push(beTrap);
  }

  const vayCuoi = parseWardrobeText(doc.trangPhucVayCuoiNgayCuoi, 'wedding_dress', 'wedding_day', 'bride');
  if (vayCuoi) {
    vayCuoi.id = `wd_${doc.maDichVu || 'pkg'}_${wdIdx++}`;
    details.wardrobe.push(vayCuoi);
  }

  const vestCuoi = parseWardrobeText(doc.trangPhucVestChuReNgayCuoi, 'vest', 'wedding_day', 'groom');
  if (vestCuoi) {
    vestCuoi.id = `wd_${doc.maDichVu || 'pkg'}_${wdIdx++}`;
    details.wardrobe.push(vestCuoi);
  }

  let exIdx = 1;
  if (isMeaningful(doc.hoaCamTay)) {
    details.extras.push({
      id: `ex_${doc.maDichVu || 'pkg'}_${exIdx++}`,
      title: 'Hoa tươi cầm tay cô dâu + hoa cài áo chú rể',
      quantity: 1,
      included: 'included',
      estimatedValueVnd: 500000,
      note: String(doc.hoaCamTay).trim() === 'Có' ? '' : String(doc.hoaCamTay).trim()
    });
  }

  return details;
}

export function validatePackageDetails(details) {
  const errors = [];
  const fieldErrors = {};

  if (!details) return { isValid: true, errors, fieldErrors };

  // 1. Photo Retouch
  if (details.photoRetouch) {
    const count = Number(details.photoRetouch.editedFileCount);
    if (isNaN(count) || count < 0 || !Number.isInteger(count)) {
      errors.push("Số file ảnh chỉnh sửa phải là số nguyên không âm");
      fieldErrors['photoRetouch.editedFileCount'] = "Phải là số nguyên không âm";
    }
  }

  // 2. Schedules
  if (Array.isArray(details.photoSchedules)) {
    details.photoSchedules.forEach((sch, i) => {
      const sess = Number(sch.sessionCount);
      if (isNaN(sess) || sess < 0 || !Number.isInteger(sess)) {
        errors.push(`Lịch chụp dòng ${i + 1}: Số buổi phải là số nguyên không âm`);
        fieldErrors[`photoSchedules.${i}.sessionCount`] = "Số buổi không âm";
      }
    });
  }

  // 3. Deliverables (AC-09: Số âm / khổ 0 / lỗi input không được lưu)
  if (Array.isArray(details.deliverables)) {
    details.deliverables.forEach((del, i) => {
      const w = Number(del.widthCm);
      const h = Number(del.heightCm);
      const q = Number(del.quantity);

      if (isNaN(w) || w <= 0) {
        errors.push(`Sản phẩm dòng ${i + 1}: Chiều rộng phải > 0`);
        fieldErrors[`deliverables.${i}.widthCm`] = "Chiều rộng phải > 0";
      }
      if (isNaN(h) || h <= 0) {
        errors.push(`Sản phẩm dòng ${i + 1}: Chiều cao phải > 0`);
        fieldErrors[`deliverables.${i}.heightCm`] = "Chiều cao phải > 0";
      }
      if (isNaN(q) || q < 0 || !Number.isInteger(q)) {
        errors.push(`Sản phẩm dòng ${i + 1}: Số lượng phải >= 0`);
        fieldErrors[`deliverables.${i}.quantity`] = "Số lượng phải >= 0";
      }
    });
  }

  // 4. Makeup (AC-06)
  if (Array.isArray(details.makeupSessions)) {
    details.makeupSessions.forEach((mk, i) => {
      const sess = Number(mk.sessionCount);
      if (isNaN(sess) || sess < 0 || !Number.isInteger(sess)) {
        errors.push(`Makeup dòng ${i + 1}: Số lượt phải >= 0`);
        fieldErrors[`makeupSessions.${i}.sessionCount`] = "Số lượt không âm";
      }
    });
  }

  // 5. Wardrobe
  if (Array.isArray(details.wardrobe)) {
    details.wardrobe.forEach((wd, i) => {
      const q = Number(wd.quantity);
      const maxVal = Number(wd.maxValueVnd);
      if (isNaN(q) || q < 0 || !Number.isInteger(q)) {
        errors.push(`Trang phục dòng ${i + 1}: Số lượng phải >= 0`);
        fieldErrors[`wardrobe.${i}.quantity`] = "Số lượng không âm";
      }
      if (isNaN(maxVal) || maxVal < 0) {
        errors.push(`Trang phục dòng ${i + 1}: Giá trị không âm`);
        fieldErrors[`wardrobe.${i}.maxValueVnd`] = "Giá trị không âm";
      }
    });
  }

  // 6. Extras
  if (Array.isArray(details.extras)) {
    details.extras.forEach((ex, i) => {
      const q = Number(ex.quantity);
      const val = Number(ex.estimatedValueVnd);
      if (isNaN(q) || q < 0) {
        errors.push(`Quà tặng dòng ${i + 1}: Số lượng không âm`);
        fieldErrors[`extras.${i}.quantity`] = "Số lượng không âm";
      }
      if (isNaN(val) || val < 0) {
        errors.push(`Quà tặng dòng ${i + 1}: Trị giá không âm`);
        fieldErrors[`extras.${i}.estimatedValueVnd`] = "Trị giá không âm";
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  };
}

export function calculatePackageTotals(details) {
  if (!details) {
    return {
      totalLichChup: 0,
      totalLichMake: 0,
      totalAnhChinhSua: 0,
      total16x21: 0,
      total20x30: 0,
      total60x90: 0,
      totalDeliverablesCount: 0
    };
  }

  const totalLichChup = (details.photoSchedules || []).reduce((sum, item) => sum + (Number(item.sessionCount) || 0), 0);
  const totalLichMake = (details.makeupSessions || []).reduce((sum, item) => sum + (Number(item.sessionCount) || 0), 0);
  const totalAnhChinhSua = Number(details.photoRetouch?.editedFileCount) || 0;

  let total16x21 = 0;
  let total20x30 = 0;
  let total60x90 = 0;
  let totalDeliverablesCount = 0;

  (details.deliverables || []).forEach(d => {
    const w = Number(d.widthCm);
    const h = Number(d.heightCm);
    const qty = Number(d.quantity) || 0;
    totalDeliverablesCount += qty;

    if ((w === 16 && h === 21) || (w === 21 && h === 16)) total16x21 += qty;
    if ((w === 20 && h === 30) || (w === 30 && h === 20)) total20x30 += qty;
    if ((w === 60 && h === 90) || (w === 90 && h === 60)) total60x90 += qty;
  });

  return {
    totalLichChup,
    totalLichMake,
    totalAnhChinhSua,
    total16x21,
    total20x30,
    total60x90,
    totalDeliverablesCount
  };
}

// Local draft preservation (AC-10: Lỗi mạng giữ draft, không lưu một phần)
export function savePackageDraft(pkgKey, details) {
  try {
    if (!pkgKey || !details) return;
    localStorage.setItem(`longwedding_pkg_draft_${pkgKey}`, JSON.stringify({
      timestamp: Date.now(),
      details
    }));
  } catch (e) {
    console.warn("Could not save package draft to localStorage:", e);
  }
}

export function loadPackageDraft(pkgKey) {
  try {
    if (!pkgKey) return null;
    const raw = localStorage.getItem(`longwedding_pkg_draft_${pkgKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.details;
  } catch (e) {
    return null;
  }
}

export function clearPackageDraft(pkgKey) {
  try {
    if (!pkgKey) return;
    localStorage.removeItem(`longwedding_pkg_draft_${pkgKey}`);
  } catch (e) {}
}

