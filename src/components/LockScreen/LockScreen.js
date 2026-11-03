import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faLock, 
    faShieldAlt, 
    faDeleteLeft, 
    faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/logo/BETA-1 VANG.png';
import { toast } from 'sonner';
import {
    getSavedPinUser,
    verifyPinAndGetSession,
    checkPinLock
} from '../../utils/pinAuthUtils';
import './LockScreen.css';

const PIN_LENGTH = 6;

const LockScreen = ({ 
    isOpen, 
    onUnlock, 
    currentUser, 
    userNameDisplay, 
    userRoleDisplay, 
    onLogout 
}) => {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [lockoutSeconds, setLockoutSeconds] = useState(0);
    const [savedUser, setSavedUser] = useState(null);

    const hiddenInputRef = useRef(null);
    const overlayRef = useRef(null);

    // 1. Kiểm tra thông tin PIN đã lưu khi mở LockScreen
    useEffect(() => {
        if (!isOpen) return;

        const pinUser = getSavedPinUser();
        setSavedUser(pinUser);
        setPin('');
        setErrorMessage('');

        // Kiểm tra xem có đang bị tạm khóa không
        const lock = checkPinLock();
        if (lock.isLocked) {
            setLockoutSeconds(lock.remainingSeconds);
        }

        // Focus vào hidden input
        setTimeout(() => {
            if (hiddenInputRef.current) {
                hiddenInputRef.current.focus();
            }
        }, 100);
    }, [isOpen]);

    // 2. Bộ đếm ngược thời gian khóa (lockout timer)
    useEffect(() => {
        if (lockoutSeconds <= 0) return;
        const timer = setInterval(() => {
            setLockoutSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [lockoutSeconds]);

    // 3. Xử lý mở khóa bằng mã PIN
    const handleVerifyPin = useCallback(async (pinToVerify) => {
        if (loading || lockoutSeconds > 0) return;

        setLoading(true);
        setErrorMessage('');

        try {
            const sessionData = await verifyPinAndGetSession(pinToVerify);
            toast.success("Mở khóa màn hình thành công!");
            setPin('');
            if (onUnlock) {
                onUnlock(sessionData);
            }
        } catch (err) {
            console.error("Lỗi xác thực PIN:", err);
            const msg = err.message || "Mã PIN không chính xác!";
            setErrorMessage(msg);
            setPin(''); // Reset để nhập lại

            const lock = checkPinLock();
            if (lock.isLocked) {
                setLockoutSeconds(lock.remainingSeconds);
            }
        } finally {
            setLoading(false);
        }
    }, [loading, lockoutSeconds, onUnlock]);

    // 4. Nhấn phím số trên bàn phím ảo hoặc bàn phím vật lý
    const handleInputDigit = useCallback((val) => {
        if (loading || lockoutSeconds > 0) return;
        if (errorMessage) setErrorMessage('');

        setPin(prev => {
            if (prev.length >= PIN_LENGTH) return prev;
            const updated = prev + val;
            if (updated.length === PIN_LENGTH) {
                setTimeout(() => handleVerifyPin(updated), 50);
            }
            return updated;
        });
    }, [loading, lockoutSeconds, errorMessage, handleVerifyPin]);

    const handleBackspace = useCallback(() => {
        if (loading || lockoutSeconds > 0) return;
        if (errorMessage) setErrorMessage('');
        setPin(prev => prev.slice(0, -1));
    }, [loading, lockoutSeconds, errorMessage]);

    const handleClear = useCallback(() => {
        if (loading || lockoutSeconds > 0) return;
        setPin('');
        setErrorMessage('');
    }, [loading, lockoutSeconds]);

    const handleKeypadPress = (val) => {
        if (val === 'backspace') {
            handleBackspace();
        } else if (val === 'clear') {
            handleClear();
        } else {
            handleInputDigit(val);
        }
    };

    // 5. Bắt phím bàn phím vật lý toàn cục (Window Capture Phase)
    // Đảm bảo bấm phím số/Numpad luôn ăn 100% dù con trỏ focus ở bất cứ đâu
    useEffect(() => {
        if (!isOpen) return;

        const onGlobalKeyDown = (e) => {
            if (loading || lockoutSeconds > 0) return;

            // Bắt phím số 0-9 từ bàn phím chính hoặc Numpad
            let digit = null;
            if (e.key >= '0' && e.key <= '9') {
                digit = e.key;
            } else if (e.code && e.code.startsWith('Numpad') && e.key >= '0' && e.key <= '9') {
                digit = e.key;
            }

            if (digit !== null) {
                e.preventDefault();
                e.stopPropagation();
                handleInputDigit(digit);
                return;
            }

            if (e.key === 'Backspace') {
                e.preventDefault();
                e.stopPropagation();
                handleBackspace();
                return;
            }

            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                handleClear();
                return;
            }
        };

        window.addEventListener('keydown', onGlobalKeyDown, true);
        return () => {
            window.removeEventListener('keydown', onGlobalKeyDown, true);
        };
    }, [isOpen, loading, lockoutSeconds, handleInputDigit, handleBackspace, handleClear]);

    const handleBoxClick = () => {
        if (hiddenInputRef.current) {
            hiddenInputRef.current.focus();
        }
    };

    if (!isOpen) return null;

    // 1. Tên tài khoản / Username
    const currentUsername = currentUser?.username || savedUser?.username || '';

    // 2. Chức vụ (Position / Role)
    const isManager = (currentUser?.permission === 1) || 
                      (currentUser?.positon === 'Quản lý') || 
                      (currentUser?.chucVu === 'Quản lý') || 
                      (userRoleDisplay === 'Quản lý') || 
                      (currentUsername === 'along') || 
                      (currentUsername === 'dev') ||
                      (savedUser?.role === 'Quản lý');

    const displayRole = isManager ? 'Quản lý' : (userRoleDisplay || currentUser?.positon || currentUser?.chucVu || savedUser?.role || 'Nhân viên');

    // 3. Tên hiển thị (Họ và tên / Tên tài khoản)
    const displayFullName = userNameDisplay || 
                            currentUser?.fullname || 
                            currentUser?.hoTen || 
                            currentUser?.tenNhanVien || 
                            savedUser?.fullname || 
                            savedUser?.displayName || 
                            (currentUsername === 'along' ? 'Mai Tiến Long' : currentUsername) || 
                            'Người dùng';

    const displayAvatar = currentUser?.avatar || savedUser?.avatar || '';

    return (
        <div 
            ref={overlayRef}
            className="lw-lockscreen-overlay"
            tabIndex="0"
        >
            <div className="lw-lockscreen-card">
                {/* Header Logo */}
                <div className="lw-lock-header">
                    <img src={logo} alt="Long Wedding" className="lw-lock-logo" />
                    <div>
                        <span className="lw-lock-status-badge">
                            <span className="lw-lock-pulse-dot" />
                            Màn hình đang khóa
                        </span>
                    </div>
                </div>

                {/* User Info Badge */}
                <div className="lw-lock-user-badge">
                    <div className="lw-lock-avatar">
                        {displayAvatar ? (
                            <img src={displayAvatar} alt="Avatar" />
                        ) : (
                            (displayFullName || currentUsername || 'U').charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="lw-lock-user-info">
                        <div className="lw-lock-user-name">
                            {displayFullName}
                        </div>
                        <div className="lw-lock-user-meta">
                            <span className="lw-lock-role-chip">{displayRole}</span>
                            {currentUsername && (
                                <span className="lw-lock-username-tag">@{currentUsername}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="lw-lock-error">
                        {errorMessage}
                    </div>
                )}

                {/* PIN KEYPAD & UNLOCK */}
                {lockoutSeconds > 0 ? (
                    <div style={{ padding: '16px 0', color: '#fca5a5' }}>
                        <FontAwesomeIcon icon={faShieldAlt} style={{ fontSize: '2.5rem', marginBottom: '8px' }} />
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>Tạm khóa chức năng mã PIN</div>
                        <div style={{ fontSize: '12px', marginTop: '4px', color: '#cbd5e1' }}>
                            Thử sai quá nhiều lần. Vui lòng thử lại sau <strong>{lockoutSeconds}s</strong>.
                        </div>
                    </div>
                ) : (
                    <>
                        <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '13px', margin: '0 0 10px', fontWeight: 600 }}>
                            Nhập mã PIN {PIN_LENGTH} số để mở khóa:
                        </p>

                        {/* PIN Display Dots */}
                        <div className="lw-pin-row" onClick={handleBoxClick}>
                            {Array.from({ length: PIN_LENGTH }).map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`lw-pin-box ${pin.length > idx ? 'filled' : ''} ${pin.length === idx ? 'active' : ''}`}
                                >
                                    {pin.length > idx && <div className="lw-pin-dot" />}
                                </div>
                            ))}
                        </div>

                        {/* Hidden input for physical keyboard */}
                        <input
                            ref={hiddenInputRef}
                            type="password"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            value={pin}
                            onChange={(e) => {
                                const cleanVal = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
                                setPin(cleanVal);
                                if (cleanVal.length === PIN_LENGTH) {
                                    handleVerifyPin(cleanVal);
                                }
                            }}
                            className="lw-hidden-input"
                            autoFocus
                        />

                        {/* Virtual Numeric Keypad */}
                        <div className="lw-pin-keypad">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    className="lw-key-btn"
                                    onClick={() => handleKeypadPress(num.toString())}
                                    disabled={loading}
                                >
                                    {num}
                                </button>
                            ))}
                            <button
                                type="button"
                                className="lw-key-btn action"
                                onClick={() => handleKeypadPress('clear')}
                                disabled={loading || pin.length === 0}
                            >
                                Xóa hết
                            </button>
                            <button
                                type="button"
                                className="lw-key-btn"
                                onClick={() => handleKeypadPress('0')}
                                disabled={loading}
                            >
                                0
                            </button>
                            <button
                                type="button"
                                className="lw-key-btn action"
                                onClick={() => handleKeypadPress('backspace')}
                                disabled={loading || pin.length === 0}
                            >
                                <FontAwesomeIcon icon={faDeleteLeft} />
                            </button>
                        </div>
                    </>
                )}

                {/* Footer Switch Account / Logout */}
                <div className="lw-lock-actions" style={{ justifyContent: 'center' }}>
                    <button
                        type="button"
                        className="lw-lock-link-btn"
                        onClick={() => {
                            if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?")) {
                                if (onLogout) onLogout();
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} />
                        Đổi tài khoản
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LockScreen;
