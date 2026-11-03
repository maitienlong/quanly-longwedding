/**
 * pinAuthUtils.js
 * Tiện ích mã hóa bảo mật mã PIN và lưu trữ phiên đăng nhập nhanh trên thiết bị
 */

const STORAGE_KEYS = {
    PIN_PROFILE: 'lw_saved_pin_profile',
    REMEMBER_USER: 'lw_remembered_username',
    PIN_LOCK: 'lw_pin_lock_status',
    SAVED_CREDENTIALS: 'lw_saved_user_credentials'
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 60 * 1000; // 60 giây khóa nếu sai quá 5 lần

/**
 * Tạo chuỗi ngẫu nhiên làm Salt
 */
function generateSalt(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Mã hóa chuỗi bằng SHA-256 (sử dụng SubtleCrypto hoặc Fallback)
 */
async function sha256(message) {
    if (window.crypto && window.crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
        // Fallback đơn giản nếu không có crypto.subtle
        let hash = 0;
        for (let i = 0; i < message.length; i++) {
            const char = message.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash).toString(16);
    }
}

/**
 * Mã hóa/Giải mã dữ liệu session cơ bản với PIN
 */
function obfuscateSession(data, pin) {
    try {
        const jsonStr = JSON.stringify(data);
        const pinCode = pin.split('').reduce((acc, c) => acc + c.charCodeAt(0), 17);
        let result = '';
        for (let i = 0; i < jsonStr.length; i++) {
            result += String.fromCharCode(jsonStr.charCodeAt(i) ^ (pinCode % 255));
        }
        return btoa(unescape(encodeURIComponent(result)));
    } catch (e) {
        console.error("Lỗi obfuscate session:", e);
        return null;
    }
}

function deobfuscateSession(encodedStr, pin) {
    try {
        const rawStr = decodeURIComponent(escape(atob(encodedStr)));
        const pinCode = pin.split('').reduce((acc, c) => acc + c.charCodeAt(0), 17);
        let result = '';
        for (let i = 0; i < rawStr.length; i++) {
            result += String.fromCharCode(rawStr.charCodeAt(i) ^ (pinCode % 255));
        }
        return JSON.parse(result);
    } catch (e) {
        console.error("Lỗi deobfuscate session:", e);
        return null;
    }
}

/**
 * Lưu thông tin người dùng và mã PIN đã mã hóa
 */
export async function savePinSession(username, pin, userData) {
    try {
        const salt = generateSalt();
        const pinHash = await sha256(pin + salt);
        const encryptedSession = obfuscateSession(userData, pin);

        const u = userData?.user || {};
        const isManager = u.permission === 1 || u.positon === 'Quản lý' || u.chucVu === 'Quản lý' || username.trim() === 'along' || username.trim() === 'dev';
        const resolvedRole = u.positon || u.chucVu || (isManager ? 'Quản lý' : (u.role || 'Nhân viên'));
        const resolvedName = u.fullname || u.hoTen || u.tenNhanVien || u.name || (username.trim() === 'along' ? 'Mai Tiến Long' : username.trim());

        const profile = {
            username: username.trim(),
            displayName: resolvedName,
            fullname: resolvedName,
            role: resolvedRole,
            avatar: u.avatar || '',
            pinLength: pin.length,
            salt,
            pinHash,
            encryptedSession,
            savedAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEYS.PIN_PROFILE, JSON.stringify(profile));
        localStorage.setItem('lw_remember_login', 'true');
        localStorage.setItem('remember_me', 'true');
        resetFailedAttempts();
        return true;
    } catch (e) {
        console.error("Lỗi lưu PIN session:", e);
        return false;
    }
}

/**
 * Lấy thông tin tài khoản đã cài đặt mã PIN
 */
export function getSavedPinUser() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.PIN_PROFILE);
        if (!raw) return null;
        const profile = JSON.parse(raw);
        if (!profile.pinHash || !profile.salt) return null;

        // Tự động chuẩn hóa chức vụ cho Quản lý / along
        const isManager = profile.role === 'Quản lý' || profile.username === 'along' || profile.username === 'dev';
        const role = isManager ? 'Quản lý' : (profile.role || 'Nhân viên');
        const displayName = profile.displayName || profile.fullname || (profile.username === 'along' ? 'Mai Tiến Long' : profile.username);

        return {
            username: profile.username,
            displayName: displayName,
            fullname: profile.fullname || displayName,
            role: role,
            avatar: profile.avatar,
            pinLength: profile.pinLength || 6,
            savedAt: profile.savedAt
        };
    } catch (e) {
        console.error("Lỗi đọc PIN user:", e);
        return null;
    }
}

/**
 * Xác thực mã PIN và lấy lại dữ liệu phiên đăng nhập
 */
export async function verifyPinAndGetSession(pin) {
    const lockStatus = checkPinLock();
    if (lockStatus.isLocked) {
        throw new Error(`Đã thử sai quá nhiều lần. Vui lòng thử lại sau ${lockStatus.remainingSeconds} giây.`);
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEYS.PIN_PROFILE);
        if (!raw) {
            throw new Error("Chưa có thông tin mã PIN được lưu trên thiết bị.");
        }

        const profile = JSON.parse(raw);
        const inputHash = await sha256(pin + profile.salt);

        if (inputHash !== profile.pinHash) {
            recordFailedAttempt();
            const newLock = checkPinLock();
            if (newLock.isLocked) {
                throw new Error(`Mã PIN không đúng. Bạn đã nhập sai 5 lần, tạm khóa ${newLock.remainingSeconds}s.`);
            }
            throw new Error("Mã PIN không chính xác. Vui lòng thử lại!");
        }

        // Giải mã session
        const sessionData = deobfuscateSession(profile.encryptedSession, pin);
        if (!sessionData || !sessionData.token) {
            throw new Error("Dữ liệu phiên đã hết hạn. Vui lòng đăng nhập lại bằng mật khẩu!");
        }

        resetFailedAttempts();
        return sessionData;
    } catch (e) {
        throw e;
    }
}

/**
 * Xóa thông tin PIN đã lưu trên thiết bị
 */
export function clearPinSession() {
    localStorage.removeItem(STORAGE_KEYS.PIN_PROFILE);
    resetFailedAttempts();
}

/**
 * Kiểm tra trạng thái khóa do nhập sai nhiều lần
 */
export function checkPinLock() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.PIN_LOCK);
        if (!raw) return { isLocked: false, remainingSeconds: 0 };
        const data = JSON.parse(raw);
        const now = Date.now();

        if (data.lockedUntil && data.lockedUntil > now) {
            const remainingSeconds = Math.ceil((data.lockedUntil - now) / 1000);
            return { isLocked: true, remainingSeconds };
        }

        return { isLocked: false, remainingSeconds: 0 };
    } catch (e) {
        return { isLocked: false, remainingSeconds: 0 };
    }
}

/**
 * Ghi nhận lần nhập sai
 */
export function recordFailedAttempt() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.PIN_LOCK);
        let data = raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: 0 };
        data.attempts = (data.attempts || 0) + 1;

        if (data.attempts >= MAX_FAILED_ATTEMPTS) {
            data.lockedUntil = Date.now() + LOCK_DURATION_MS;
            data.attempts = 0; // reset sau khi khóa
        }

        localStorage.setItem(STORAGE_KEYS.PIN_LOCK, JSON.stringify(data));
    } catch (e) {
        console.error("Lỗi record failed attempt:", e);
    }
}

/**
 * Reset số lần nhập sai
 */
export function resetFailedAttempts() {
    localStorage.removeItem(STORAGE_KEYS.PIN_LOCK);
}

/**
 * Ghi nhớ tên tài khoản (Remember Me)
 */
export function getRememberedUsername() {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_USER) || '';
}

export function saveRememberedUsername(username) {
    if (username && username.trim()) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_USER, username.trim());
    } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_USER);
    }
}

export function clearRememberedUsername() {
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_USER);
}

const DEVICE_KEY = 'LW_DEV_SECRET_SALT_2026';

function obfuscateCredentials(data) {
    try {
        const jsonStr = JSON.stringify(data);
        const code = DEVICE_KEY.split('').reduce((acc, c) => acc + c.charCodeAt(0), 42);
        let result = '';
        for (let i = 0; i < jsonStr.length; i++) {
            result += String.fromCharCode(jsonStr.charCodeAt(i) ^ (code % 255));
        }
        return btoa(unescape(encodeURIComponent(result)));
    } catch (e) {
        return null;
    }
}

function deobfuscateCredentials(encodedStr) {
    try {
        const rawStr = decodeURIComponent(escape(atob(encodedStr)));
        const code = DEVICE_KEY.split('').reduce((acc, c) => acc + c.charCodeAt(0), 42);
        let result = '';
        for (let i = 0; i < rawStr.length; i++) {
            result += String.fromCharCode(rawStr.charCodeAt(i) ^ (code % 255));
        }
        return JSON.parse(result);
    } catch (e) {
        return null;
    }
}

/**
 * Lưu thông tin thiết bị được phép gia hạn phiên tự động (Không lưu mật khẩu gốc dưới localStorage để đảm bảo an toàn chống XSS)
 */
export function saveDeviceCredentials(username) {
    if (!username) return;
    try {
        const encoded = obfuscateCredentials({ username: username.trim(), remember: true, savedAt: Date.now() });
        if (encoded) {
            localStorage.setItem(STORAGE_KEYS.SAVED_CREDENTIALS, encoded);
        }
    } catch (e) {
        console.error("Lỗi lưu device credentials:", e);
    }
}

/**
 * Lấy thông tin đăng nhập đã lưu trên thiết bị
 */
export function getDeviceCredentials() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.SAVED_CREDENTIALS);
        if (!raw) return null;
        return deobfuscateCredentials(raw);
    } catch (e) {
        return null;
    }
}

/**
 * Xóa thông tin đăng nhập đã lưu trên thiết bị
 */
export function clearDeviceCredentials() {
    localStorage.removeItem(STORAGE_KEYS.SAVED_CREDENTIALS);
}

