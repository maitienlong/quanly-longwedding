const fs = require('fs');
const path = require('path');

const FRONTEND_QUOCKHANH_PATH = path.resolve('..', 'websiite-longwedding', 'website-longwedding', 'src', 'pages', 'QuocKhanh.js');

if (fs.existsSync(FRONTEND_QUOCKHANH_PATH)) {
  let content = fs.readFileSync(FRONTEND_QUOCKHANH_PATH, 'utf8');

  // 1. Add outOfVouchersModalOpen state
  if (!content.includes('outOfVouchersModalOpen')) {
    content = content.replace(
      "const [luckyGifts, setLuckyGifts] = useState(NATIONAL_DAY_TRIBUTE_VOUCHERS);",
      "const [luckyGifts, setLuckyGifts] = useState(NATIONAL_DAY_TRIBUTE_VOUCHERS);\n  const [outOfVouchersModalOpen, setOutOfVouchersModalOpen] = useState(false);"
    );
  }

  // 2. Update handleSendTribute
  const oldTributeLogicRegex = /\/\/ Xử lý gửi Lời Tri Ân & Thắp sáng Cờ Tổ Quốc[\s\S]*?\/\/ Chuyển từ Màn Cào Thẻ sang Màn Chúc Mừng/;

  const newTributeLogic = `// Xử lý gửi Lời Tri Ân & Thắp sáng Cờ Tổ Quốc (Backend xử lý chọn & cấp Voucher Code từ Database)
  const handleSendTribute = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmittingTribute) return;

    setIsSubmittingTribute(true);

    // Định dạng địa chỉ đầy đủ phân cấp (Xóm/Thôn, Xã/Phường, Tỉnh/Thành)
    const addressParts = [
      inputHamlet.trim(),
      selectedCommune.trim(),
      selectedProvinceName.trim()
    ].filter(Boolean);
    const locationFull = addressParts.join(', ') || selectedProvinceName || 'Việt Nam';

    const tributePayload = {
      name: inputName.trim() || 'Người con Đất Việt',
      phone: inputPhone.trim(),
      provinceCode: selectedProvinceCode,
      province: selectedProvinceName,
      commune: selectedCommune.trim(),
      hamlet: inputHamlet.trim(),
      location: locationFull,
      text: inputText.trim()
    };

    let selectedVoucher = null;
    let isOutOfStock = false;
    let newFlagCount = flagCount + 1;

    try {
      // 1. Gửi lên Backend để Backend xử lý cấp Voucher và lưu dữ liệu
      const res = await submitNationalDayTribute(tributePayload);

      if (res && res.success) {
        if (res.voucher && !res.isOutOfVouchers) {
          selectedVoucher = res.voucher;
        } else if (res.isOutOfVouchers) {
          selectedVoucher = null;
          isOutOfStock = true;
        }
        if (typeof res.flagCount === 'number') {
          newFlagCount = res.flagCount;
        }
      }
    } catch (err) {
      console.error("Lỗi gửi lời tri ân lên backend:", err);
    }

    // 2. Fallback rút ngẫu nhiên nếu backend offline (chỉ thực hiện khi chưa xác định hết hàng)
    if (!selectedVoucher && !isOutOfStock) {
      const fallbackResult = await claimRandomEventVoucher({
        name: inputName.trim() || 'Người con Đất Việt',
        phone: inputPhone.trim(),
        location: locationFull
      });
      if (fallbackResult && !fallbackResult.isOutOfVouchers && !fallbackResult.outOfStock && fallbackResult.code) {
        selectedVoucher = fallbackResult;
      } else {
        selectedVoucher = null;
        isOutOfStock = true;
      }
    }

    const newMsg = {
      id: Date.now(),
      name: inputName.trim() || 'Người con Đất Việt',
      phone: inputPhone.trim(),
      provinceCode: selectedProvinceCode,
      province: selectedProvinceName,
      commune: selectedCommune.trim(),
      hamlet: inputHamlet.trim(),
      location: locationFull,
      text: inputText.trim(),
      voucherCode: selectedVoucher ? selectedVoucher.code : null,
      voucherTitle: selectedVoucher ? selectedVoucher.title : null,
      voucherValue: selectedVoucher ? selectedVoucher.value : null,
      time: 'Vừa xong',
      createdAt: new Date().toISOString()
    };

    // Cập nhật UI và LocalStorage
    const updatedMessages = [newMsg, ...messages];
    setMessages(updatedMessages);
    localStorage.setItem('quoc_khanh_messages', JSON.stringify(updatedMessages));

    setFlagCount(newFlagCount);
    setHasFlagged(true);
    localStorage.setItem('quoc_khanh_flag_count', String(newFlagCount));
    localStorage.setItem('quoc_khanh_has_flagged', 'true');

    setInputText('');
    setInputHamlet('');
    setShowFlagSuccess(true);
    setTimeout(() => setShowFlagSuccess(false), 4000);

    if (selectedVoucher) {
      // Lưu voucher được cấp từ Backend vào state & localStorage
      setAwardedVoucher(selectedVoucher);
      setSavedUserVoucher(selectedVoucher);
      localStorage.setItem('quoc_khanh_user_voucher', JSON.stringify(selectedVoucher));

      // Mở Modal Cào Thẻ may mắn trước
      setIsScratchRevealed(false);
      setScratchModalOpen(true);
      setTributeVoucherModalOpen(false);
      setCopiedVoucher(false);
    } else {
      // Khi đã hết số lượng Voucher: Hiển thị thông báo chính thức cho khách hàng
      setOutOfVouchersModalOpen(true);
    }

    setIsSubmittingTribute(false);
  };

  // Chuyển từ Màn Cào Thẻ sang Màn Chúc Mừng`;

  if (oldTributeLogicRegex.test(content)) {
    content = content.replace(oldTributeLogicRegex, newTributeLogic);
    console.log("Successfully replaced handleSendTribute in QuocKhanh.js!");
  } else {
    console.log("Could not match oldTributeLogicRegex");
  }

  // 3. Add Dialog for outOfVouchersModal before </Dialog>\n    </div>\n  );
  if (!content.includes('MODAL 3: THÔNG BÁO HẾT VOUCHER')) {
    const dialogInsertionTarget = "</Dialog>\n    </div>\n  );";
    const modalJSX = `</Dialog>

      {/* =========================================================================
          MODAL 3: THÔNG BÁO HẾT VOUCHER
          ========================================================================= */}
      <Dialog
        open={outOfVouchersModalOpen}
        onClose={() => setOutOfVouchersModalOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'transparent !important',
            boxShadow: 'none !important',
            backgroundImage: 'none !important',
            overflow: 'visible !important',
            margin: { xs: '16px', sm: '24px' }
          }
        }}
      >
        <motion.div 
          className="tribute-voucher-modal glass-dark"
          style={{ textAlign: 'center', padding: '32px 24px' }}
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        >
          <button 
            type="button" 
            className="voucher-modal-close-btn"
            onClick={() => setOutOfVouchersModalOpen(false)}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>

          <div style={{ fontSize: '46px', marginBottom: '10px' }}>🎁</div>

          <div className="voucher-event-tag" style={{ marginBottom: '12px' }}>
            <span>ĐẠI LỄ QUỐC KHÁNH 2/9 • 81 NĂM TỰ HÀO</span>
          </div>

          <h3 style={{ color: '#ffd700', fontSize: '20px', fontWeight: 800, margin: '0 0 12px 0', textTransform: 'uppercase' }}>
            CẢM ƠN BẠN ĐÃ GỬI LỜI TRI ÂN! 🇻🇳
          </h3>

          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 215, 0, 0.35)',
            borderRadius: '14px',
            padding: '20px 18px',
            margin: '18px 0',
            color: '#ffffff',
            fontSize: '15px',
            lineHeight: '1.6',
            fontWeight: 600
          }}>
            Voucher đã hết, cảm ơn quý khách đã quan tâm đến sự kiện. Hẹn quý khách vào sự kiện tiếp theo
          </div>

          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 22px 0', lineHeight: 1.5 }}>
            Lời chúc và lượt thắp sáng Cờ Tổ quốc của bạn đã được ghi nhận trang trọng trên bảng tin Đại Lễ!
          </p>

          <button 
            type="button"
            className="voucher-finish-btn btn-shine"
            style={{ width: '100%', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
            onClick={() => setOutOfVouchersModalOpen(false)}
          >
            <span>ĐÃ HIỂU & TIẾP TỤC ➔</span>
          </button>
        </motion.div>
      </Dialog>
    </div>
  );`;

    content = content.replace(dialogInsertionTarget, modalJSX);
    console.log("Successfully inserted outOfVouchersModal Dialog in QuocKhanh.js!");
  }

  fs.writeFileSync(FRONTEND_QUOCKHANH_PATH, content, 'utf8');
  console.log("Finished updating QuocKhanh.js!");
}
