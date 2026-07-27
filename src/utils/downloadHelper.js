/**
 * Utility helper xử lý luồng tải ảnh 100% TRỰC TIẾP từ FRONT-END cho Quản Trị:
 * 1. Tải ngầm ảnh từ Google Drive / URL.
 * 2. Lưu tạm thời tại sessionStorage & xóa sạch dữ liệu cũ ngay sau khi đọc.
 * 3. Gắn mốc thời gian EXIF mới nhất (đưa ảnh lên ĐẦU TIÊN trong Album/Thư viện).
 * 4. TỰ ĐỘNG SAO CHÉP ÁNH VÀO BỘ NHỚ TẠM (Clipboard) để dán nhanh vào Zalo/Messenger/Facebook.
 * 5. TẢI THẲNG XUỐNG MÁY QUA BLOB URL NGẦM - HOÀN TOÀN KHÔNG BẬT HỘP THOẠI CHIA SẺ (SHARE SHEET DIALOG).
 */

let isDownloading = false;

const updateJpegExifDateToNow = async (blob) => {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    const checkLength = Math.min(bytes.length, 131072);
    let headerText = '';
    for (let i = 0; i < checkLength; i++) {
      headerText += String.fromCharCode(bytes[i]);
    }
    
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const nowStr = `${now.getFullYear()}:${pad(now.getMonth() + 1)}:${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const dateRegex = /\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}/g;
    let match;
    let modified = false;

    while ((match = dateRegex.exec(headerText)) !== null) {
      const startIndex = match.index;
      for (let j = 0; j < nowStr.length; j++) {
        bytes[startIndex + j] = nowStr.charCodeAt(j);
      }
      modified = true;
    }

    if (modified) {
      return new Blob([bytes], { type: blob.type || 'image/jpeg' });
    }
  } catch (err) {
    console.log('Không thể cập nhật EXIF date:', err);
  }
  return blob;
};

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const base64ToBlob = (base64Data) => {
  const parts = base64Data.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/jpeg';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

const clearTempSessionStorage = () => {
  try {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('temp_photo_session_')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {}
};

const copyImageToClipboard = async (blob) => {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) return false;
    const type = blob.type || 'image/jpeg';
    const item = new ClipboardItem({ [type]: blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.warn('Không thể tự động ghi vào clipboard:', err);
    return false;
  }
};

export const downloadPhoto = async (photo, options = {}) => {
  const { onStart, onSuccess, onError } = options;

  const busyMessage = 'Vui lòng đợi tải ảnh vừa rồi xong rồi hãy tải tiếp!';

  if (isDownloading) {
    if (onError) onError(busyMessage);
    else if (onStart) onStart(busyMessage);
    return;
  }

  isDownloading = true;

  if (onStart) onStart('Đang tải ảnh từ Google Drive...');

  let originalName = photo?.maSoAnh || photo?.tenFile || 'Photo.jpg';
  let sanitizedName = originalName.replace(/[/\\?%*:|"<>]/g, '_');
  
  let cleanName = sanitizedName.replace(/^long_?wedding_/i, '');
  let fileName = `LongWedding_${cleanName}`;
  if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(fileName)) {
    fileName += '.jpg';
  }

  let imageUrl = photo?.urlNen || photo?.urlGoc || photo?.url;
  const tempKey = `temp_photo_session_${Date.now()}`;

  clearTempSessionStorage();

  try {
    let fetchedBlob = null;

    if (photo?.idDrive) {
      try {
        const driveUrl = `https://drive.google.com/uc?export=download&id=${photo.idDrive}`;
        const response = await fetch(driveUrl);
        if (response.ok) {
          fetchedBlob = await response.blob();
        }
      } catch (e) {}
    }

    if (!fetchedBlob && imageUrl) {
      try {
        const response = await fetch(imageUrl, { mode: 'cors' });
        if (response.ok) {
          fetchedBlob = await response.blob();
        }
      } catch (e) {}
    }

    if (!fetchedBlob && photo?.idDrive) {
      try {
        const lh3Url = `https://lh3.googleusercontent.com/d/${photo.idDrive}=w2400`;
        const response = await fetch(lh3Url, { mode: 'cors' });
        if (response.ok) {
          fetchedBlob = await response.blob();
        }
      } catch (e) {}
    }

    let base64String = '';
    if (fetchedBlob) {
      base64String = await blobToBase64(fetchedBlob);
    }

    if (base64String) {
      try {
        sessionStorage.setItem(tempKey, base64String);
      } catch (storageErr) {
        if (onError) onError(busyMessage);
        return;
      }
    }

    let storedBase64 = '';
    try {
      storedBase64 = sessionStorage.getItem(tempKey);
      if (storedBase64) {
        sessionStorage.removeItem(tempKey);
      }
    } catch (e) {}

    const finalBase64 = storedBase64 || base64String;
    let finalBlob = finalBase64 ? base64ToBlob(finalBase64) : fetchedBlob;

    if (!finalBlob) {
      const downloadLink = photo?.idDrive 
        ? `https://drive.google.com/uc?export=download&id=${photo.idDrive}`
        : imageUrl;

      if (downloadLink) {
        const a = document.createElement('a');
        a.href = downloadLink;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (onSuccess) onSuccess(`Đang tải ảnh ${fileName}...`);
        return;
      }
      throw new Error('Không thể tải ảnh từ Drive.');
    }

    finalBlob = await updateJpegExifDateToNow(finalBlob);

    const isCopied = await copyImageToClipboard(finalBlob);

    const blobUrl = window.URL.createObjectURL(finalBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    if (onSuccess) {
      if (isCopied) {
        onSuccess(`Đã tải ảnh ${fileName} & Đã sao chép vào bộ nhớ tạm!`);
      } else {
        onSuccess(`Đã tải ảnh ${fileName} về máy thành công!`);
      }
    }
  } catch (error) {
    console.error('Lỗi luồng tải ảnh:', error);
    if (onError) onError(error.message || 'Không thể tải xuống ảnh này.');
  } finally {
    clearTempSessionStorage();
    isDownloading = false;
  }
};
