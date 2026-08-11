import { useState, useEffect, useRef, Fragment } from "react";
import "./ThemHopDongDialog.css";
import AppSearchInput from "../../components/AppSearchInput";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import otherService from '../../API/services/otherService';
import TextField from '@mui/material/TextField';
import { toast } from 'sonner';
import { useLoading } from "../../context/LoadingContext";
import { useContractTypes } from "../../hooks/useContractTypes";
import { NumericFormat } from 'react-number-format';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import logoVang from '../../assets/logo/BETA-1 VANG@4x.png';
import { formatLunarDateFull } from '../../utils/lunarDateUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

function ThemHopDongKHDialog(props) {
    const { onClose, data, selectedValue, open } = props;
    const handleClose = () => {
        if (isSuccess) {
            handleCloseAndReset();
        } else {
            onClose(selectedValue);
        }
    };

    const handleCloseAndReset = () => {
        setIsSuccess(false);
        resetForm();
        onClose(true);
    };

    const generateMaHopDong = () => {
        const year = new Date().getFullYear();
        return `HD-${year}-${Math.floor(100 + Math.random() * 900)}`;
    };

    const getToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getTodayDateTime = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T09:00`;
    };


    const convertDateToISOString = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date.toISOString();
    }

    const { loaiHopDongOptions } = useContractTypes();

    const itemMethodPayment = [
        { label: 'Chuyển khoản', id: 0 },
        { label: 'Tiền mặt', id: 1 }]


    const { showLoading, hideLoading } = useLoading();
    const [listDichVu, setListDichVu] = useState([]);

    const [phoneKH1, setPhoneKH1] = useState("");
    const [phoneKH2, setPhoneKH2] = useState("");


    const [nameKH1, setNameKH1] = useState("");
    const [nameKH2, setNameKH2] = useState("");
    const [addressKH1, setAddressKH1] = useState("");
    const [addressKH2, setAddressKH2] = useState("");
    const [facebookKH1, setFacebookKH1] = useState("");
    const [facebookKH2, setFacebookKH2] = useState("");


    // DU LIEU BAN DAU CHO HOP DONG
    const [maHopDong, setMaHopDong] = useState(generateMaHopDong());
    const [ngayHopDong, setNgayHopDong] = useState(getToday());
    const [idKH1, setIDKH1] = useState("");
    const [idKH2, setIDKH2] = useState("");
    const [gioHang, setGioHang] = useState([]);
    const [thanhToan, setThanhToan] = useState("");
    const [tongTien, setTongTien] = useState(0);
    const [ngayChup, setNgayChup] = useState(getTodayDateTime());
    const [ngayAnHoi, setNgayAnHoi] = useState("");
    const [ngayCuoi, setNgayCuoi] = useState("");
    const [ngayChinhAnh, setNgayChinhAnh] = useState(getToday());
    const [ngayTraAnh, setNgayTraAnh] = useState("");
    const [giaiDoan, setGiaiDoan] = useState(1);
    const [dichVuChinh, setDichVuChinh] = useState(0);
    const [khachThanhToan, setKhachThanhToan] = useState(0);
    const [methodPayment, setMethodPayment] = useState(0);
    const [nhanVienSale, setNhanVienSale] = useState("0");

    const [diaDiemChup, setDiaDiemChup] = useState("");
    const [thoChupHinh, setThoChupHinh] = useState("");
    const [thoMakeUp, setThoMakeUp] = useState("");
    const [thoChinhAnh, setThoChinhAnh] = useState("");
    const [listStaff, setListStaff] = useState([]);
    const [chotLich, setChotLich] = useState("Chưa gọi điện");
    const [listHopDong, setListHopDong] = useState([]);
    const [isSuccess, setIsSuccess] = useState(false);

    // state cho giảm giá
    const [giamGia, setGiamGia] = useState(0);
    const [loaiGiamGia, setLoaiGiamGia] = useState(0); // "VND" hoặc "%"

    const commonHeight = 56;

    const handleListItemClick = (value) => {
        onClose(value);
    };

    useEffect(() => {
        showLoading("Đang tải các dịch vụ.");
        otherService.findDichVu()
            .then((response) => {
                setListDichVu(response.data.dichVu);
                hideLoading();
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error("Lỗi khi tải dữ liệu dịch vụ.");
                hideLoading();
            });
    }, [showLoading, hideLoading]);

    useEffect(() => {
        otherService.findUsers({})
            .then((res) => {
                if (res.data && res.data.status === 'success') {
                    setListStaff(res.data.data.users || []);
                } else if (res.status === 'success') {
                    setListStaff(res.data.users || []);
                } else {
                    setListStaff(res.data?.users || []);
                }
            })
            .catch((err) => {
                console.error("Lỗi khi tải danh sách nhân viên:", err);
            });
    }, []);


    useEffect(() => {
        if (open) {
            resetForm();
            otherService.LIST_HOPDONG({})
                .then(response => {
                    setListHopDong(response.data.hopDong || []);
                })
                .catch(error => {
                    console.error("Lỗi khi tải danh sách hợp đồng để kiểm tra trùng lịch chụp:", error);
                });
        }
    }, [open]);

    useEffect(() => {
        setTongTien(tinhTongThanhToan());
    }, [, gioHang, giamGia, loaiGiamGia]);

    const [searchTerm, setSearchTerm] = useState("");

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showSuggestionPhone1, setShowSuggestionPhone1] = useState(false);
    const [showSuggestionPhone2, setShowSuggestionPhone2] = useState(false);
    const [suggestionPhone1, setSuggestionPhone1] = useState([]);
    const [suggestionPhone2, setSuggestionPhone2] = useState([]);
    const [btnAddKHShow1, setBtnAddKHShow1] = useState(true);
    const [btnAddKHShow2, setBtnAddKHShow2] = useState(true);

    const searchRef = useRef(null);
    const [dataIsDialog, setDataIsDialog] = useState(data);

    const suggestions = listDichVu.filter(p =>
        searchTerm.trim() &&
        (p.tenDichVu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.maDichVu?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSelectProduct = (product) => {
        const isNewPreW = product.maDichVu?.toUpperCase().startsWith("PRE-W");
        const existingPreW = isNewPreW ? gioHang.find(sp => sp.maDichVu?.toUpperCase().startsWith("PRE-W")) : null;

        let updatedGioHang;

        if (existingPreW) {
            // Thay thế hoàn toàn dịch vụ PRE-W cũ bằng dịch vụ PRE-W mới
            updatedGioHang = gioHang.map(sp => {
                if (sp.maDichVu === existingPreW.maDichVu) {
                    return {
                        ...product,
                        soLuong: 1,
                        dichVu: product._id,
                        soLuongAnhChinhSua: Number(product.soLuongAnhChinhSua) || 0,
                        soLuongAnh16x21: Number(product.soLuongAnh16x21) || 0,
                        soLuongAnh20x30: Number(product.soLuongAnh20x30) || 0,
                        soLuongAnh60x90: Number(product.soLuongAnh60x90) || 0,
                        trangDiemNgayAnHoi: product.trangDiemNgayAnHoi || "",
                        trangDiemNgayCuoi: product.trangDiemNgayCuoi || "",
                        trangPhucChoDoiBeLe: product.trangPhucChoDoiBeLe || "",
                        trangPhucCoDauNgayAnHoi: product.trangPhucCoDauNgayAnHoi || "",
                        trangPhucChuReNgayAnHoi: product.trangPhucChuReNgayAnHoi || "",
                        trangPhucVayCuoiNgayCuoi: product.trangPhucVayCuoiNgayCuoi || "",
                        trangPhucVestChuReNgayCuoi: product.trangPhucVestChuReNgayCuoi || "",
                        hoaCamTay: product.hoaCamTay || ""
                    };
                }
                return sp;
            });
        } else {
            const isExisting = gioHang.find(sp => sp.maDichVu === product.maDichVu);
            if (isExisting) {
                updatedGioHang = gioHang.map(sp =>
                    sp.maDichVu === product.maDichVu
                        ? {
                            ...sp, soLuong: (sp.soLuong || 0) + 1,
                            dichVu: product._id
                          }
                        : sp
                );
            } else {
                updatedGioHang = [...gioHang, {
                    ...product,
                    soLuong: 1,
                    giamGiaDichVu: 0,
                    dichVu: product._id,
                    soLuongAnhChinhSua: Number(product.soLuongAnhChinhSua) || 0,
                    soLuongAnh16x21: Number(product.soLuongAnh16x21) || 0,
                    soLuongAnh20x30: Number(product.soLuongAnh20x30) || 0,
                    soLuongAnh60x90: Number(product.soLuongAnh60x90) || 0,
                    trangDiemNgayAnHoi: product.trangDiemNgayAnHoi || "",
                    trangDiemNgayCuoi: product.trangDiemNgayCuoi || "",
                    trangPhucChoDoiBeLe: product.trangPhucChoDoiBeLe || "",
                    trangPhucCoDauNgayAnHoi: product.trangPhucCoDauNgayAnHoi || "",
                    trangPhucChuReNgayAnHoi: product.trangPhucChuReNgayAnHoi || "",
                    trangPhucVayCuoiNgayCuoi: product.trangPhucVayCuoiNgayCuoi || "",
                    trangPhucVestChuReNgayCuoi: product.trangPhucVestChuReNgayCuoi || "",
                    hoaCamTay: product.hoaCamTay || ""
                }];
            }
        }

        // 2. Cập nhật state giỏ hàng (giữ đúng định dạng mảng)
        setGioHang(updatedGioHang);

        // 3. Tính toán tổng tiền
        const newTotal = updatedGioHang.reduce((sum, item) => {
            const price = parseFloat(item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            const discountItem = parseFloat(item.giamGiaDichVu || 0);
            return sum + Math.max(0, (price * (item.soLuong || 0)) - discountItem);
        }, 0);

        // 4. Cập nhật state tổng tiền
        setTongTien(newTotal);

        // 5. Reset các ô search
        setSearchTerm("");
        setShowSuggestions(false);
    };

    const handleParamChange = (maDichVu, field, value) => {
        const updatedCart = gioHang.map(sp => {
            if (sp.maDichVu === maDichVu) {
                return { ...sp, [field]: value };
            }
            return sp;
        });
        setGioHang(updatedCart);
    };


    const handleDiscountItemChange = (maDichVu, value) => {
        const discountVal = Math.max(0, parseFloat(value) || 0);
        const updatedCart = gioHang.map(sp => {
            if (sp.maDichVu === maDichVu) {
                return { ...sp, giamGiaDichVu: discountVal };
            }
            return sp;
        });
        updateCartAndTotal(updatedCart);
    };

    const updateCartAndTotal = (newCart) => {
        setGioHang(newCart);
        const newTotal = newCart.reduce((sum, item) => {
            const price = parseFloat(item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            const discountItem = parseFloat(item.giamGiaDichVu || 0);
            return sum + Math.max(0, (price * (item.soLuong || 0)) - discountItem);
        }, 0);
        setTongTien(newTotal);
    };

    // Hàm xóa hoàn toàn sản phẩm khỏi giỏ
    const handleDeleteProduct = (maDichVu) => {
        const updatedCart = gioHang.filter(sp => sp.maDichVu !== maDichVu);
        updateCartAndTotal(updatedCart);
        toast.info(" Đã xóa sản phẩm khỏi giỏ hàng");
    };

    // Hàm giảm số lượng sản phẩm
    const handleDecreaseQuantity = (maDichVu) => {
        const existingProduct = gioHang.find(sp => sp.maDichVu === maDichVu);

        if (existingProduct.soLuong > 1) {
            // Nếu số lượng > 1 thì giảm đi 1
            const updatedCart = gioHang.map(sp =>
                sp.maDichVu === maDichVu ? { ...sp, soLuong: sp.soLuong - 1 } : sp
            );
            updateCartAndTotal(updatedCart);
        } else {
            // Nếu số lượng bằng 1 thì hỏi người dùng có muốn xóa không (hoặc xóa luôn)
            handleDeleteProduct(maDichVu);
        }
    };

    const tinhTongThanhToan = () => {
        // Tính tổng tiền gốc từ giỏ hàng (đã khấu trừ giảm giá từng dịch vụ)
        const tongGoc = gioHang.reduce((sum, item) => {
            const price = parseFloat(item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            const discountItem = parseFloat(item.giamGiaDichVu || 0);
            return sum + Math.max(0, (price * (item.soLuong || 0)) - discountItem);
        }, 0);

        let tongSauGiam = tongGoc;
        if (loaiGiamGia === 1) {
            tongSauGiam = tongGoc - (tongGoc * (giamGia / 100));
        } else {
            tongSauGiam = tongGoc - giamGia;
        }

        return tongSauGiam < 0 ? 0 : tongSauGiam; // Đảm bảo không âm
    };


    const resetForm = () => {
        // 1. Thông tin hợp đồng cơ bản
        setMaHopDong(generateMaHopDong());
        setNgayHopDong(getToday());
        setNgayChup("");
        setNgayAnHoi("");
        setNgayCuoi("");

        setDiaDiemChup("");
        setThoChupHinh("");
        setThoMakeUp("");
        setThoChinhAnh("");
        setChotLich("Chưa gọi điện");

        // 2. Thông tin khách hàng 1
        setIDKH1("");
        setPhoneKH1("");
        setNameKH1("");
        setAddressKH1("");
        setBtnAddKHShow1(false);
        setShowSuggestionPhone1(false);

        // 3. Thông tin khách hàng 2
        setIDKH2("");
        setPhoneKH2("");
        setNameKH2("");
        setAddressKH2("");
        setBtnAddKHShow2(false);
        setShowSuggestionPhone2(false);

        // 4. Giỏ hàng và tiền bạc
        setGioHang([]);
        setTongTien(0);
        setSearchTerm("");
        setShowSuggestions(false);

        // Nếu bạn đã thêm logic giảm giá ở bước trước
        if (typeof setGiamGia === "function") setGiamGia(0);
    };

    const onChangePhoneKH1 = (e) => {

        if (e.target.value.length > 10) {
            return;
        }
        setPhoneKH1(e.target.value);
        if (e.target.value.length === 0) {
            clearPhoneKH1();
            return
        }

        otherService.findKhachHang({ soDienThoai: e.target.value })
            .then((response) => {
                setShowSuggestionPhone1(true);
                setSuggestionPhone1(response.data);
                // Hiển thị nút Tạo mới nếu không tìm thấy khách hàng nào
                setBtnAddKHShow1(response.data.length === 0);
            })
            .catch((error) => {
                clearPhoneKH1();
                setBtnAddKHShow1(true);
            });


    };

    const handleSelectProductPhone1 = (product) => {
        setIDKH1(product._id);
        setPhoneKH1(product.soDienThoai);
        setNameKH1(product.tenKhachHang);
        setAddressKH1(product.diaChi);
        setFacebookKH1(product.facebookId || "");
        setShowSuggestionPhone1(false);
        setBtnAddKHShow1(false);
    }
    const clearPhoneKH1 = () => {
        setNameKH1("");
        setAddressKH1("");
        setFacebookKH1("");
        setShowSuggestionPhone1(false);
        setBtnAddKHShow1(false);
    }

    const handleSelectProductPhone2 = (product) => {
        setIDKH2(product._id);
        setPhoneKH2(product.soDienThoai);
        setNameKH2(product.tenKhachHang);
        setAddressKH2(product.diaChi);
        setFacebookKH2(product.facebookId || "");
        setShowSuggestionPhone2(false);
        setBtnAddKHShow2(false);
    }

    const clearPhoneKH2 = () => {
        setNameKH2("");
        setAddressKH2("");
        setFacebookKH2("");
        setShowSuggestionPhone2(false);
        setBtnAddKHShow2(false);
    }

    const onChangePhoneKH2 = (e) => {
        if (e.target.value.length > 10) {
            return;
        }
        setPhoneKH2(e.target.value);
        if (e.target.value.length === 0) {
            clearPhoneKH2();
            return
        }
        otherService.findKhachHang({ soDienThoai: e.target.value })
            .then((response) => {
                setShowSuggestionPhone2(true);
                setSuggestionPhone2(response.data);
                // Hiển thị nút Tạo mới nếu không tìm thấy khách hàng nào
                setBtnAddKHShow2(response.data.length === 0);
            })
            .catch((error) => {
                clearPhoneKH2();
                setBtnAddKHShow2(true);
            });
    };

    const onCreateNewCustomer = (index, soDienThoai, ten, diaChi, facebookId) => {
        if (!ten || !ten.trim()) {
            toast.warning("Vui lòng nhập tên khách hàng!");
            return;
        }
        if ((!soDienThoai || !soDienThoai.trim()) && (!facebookId || !facebookId.trim())) {
            toast.warning("Vui lòng nhập Số điện thoại hoặc ID Facebook!");
            return;
        }
        if (!diaChi || !diaChi.trim()) {
            toast.warning("Vui lòng nhập địa chỉ khách hàng!");
            return;
        }

        otherService.createKhachHang({
            soDienThoai: soDienThoai,
            tenKhachHang: ten,
            diaChi: diaChi,
            facebookId: facebookId || undefined
        })
            .then((response) => {
                toast.success("Tạo khách hàng mới thành công!");
                if (index === 1) {
                    setIDKH1(response.data._id);
                    setPhoneKH1(response.data.soDienThoai);
                    setNameKH1(response.data.tenKhachHang);
                    setAddressKH1(response.data.diaChi);
                    setFacebookKH1(response.data.facebookId || "");
                    setShowSuggestionPhone1(false);
                    setBtnAddKHShow1(false);
                } else {
                    setIDKH2(response.data._id);
                    setPhoneKH2(response.data.soDienThoai);
                    setNameKH2(response.data.tenKhachHang);
                    setAddressKH2(response.data.diaChi);
                    setFacebookKH2(response.data.facebookId || "");
                    setShowSuggestionPhone2(false);
                    setBtnAddKHShow2(false);
                }
            })
            .catch((error) => {
                toast.error("Có lỗi xảy ra khi tạo khách hàng mới!" + error);
            });
    }

    const onChangeFacebookKH1 = (e) => {
        let originalUrl = e.target.value;
        let val = originalUrl;
        if (val.includes('facebook.com') || val.includes('fb.com')) {
            try {
                const url = new URL(val.startsWith('http') ? val : `https://${val}`);
                if (url.searchParams.has('id')) {
                    val = url.searchParams.get('id');
                } else {
                    const pathParts = url.pathname.split('/').filter(Boolean);
                    if (pathParts.length > 0) {
                        val = pathParts[0];
                    }
                }
            } catch (err) {
                const match = val.match(/(?:facebook\.com|fb\.com)\/(?:profile\.php\?id=)?([^\/?&#]+)/i);
                if (match && match[1]) {
                    val = match[1];
                }
            }
        }
        setFacebookKH1(val);
        if (val.length === 0) {
            clearPhoneKH1();
            return;
        }

        const checkCustomerExists1 = (searchId) => {
            otherService.findKhachHang({ facebookId: searchId })
                .then((response) => {
                    setShowSuggestionPhone1(true);
                    setSuggestionPhone1(response.data);
                    setBtnAddKHShow1(response.data.length === 0);
                })
                .catch((error) => {
                    clearPhoneKH1();
                    setBtnAddKHShow1(true);
                });
        };

        // Auto-fetch Facebook UID and name if it's a URL
        if (originalUrl.includes('facebook.com') || originalUrl.includes('fb.com')) {
            let fullUrl = originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`;
            otherService.getFacebookInfo({ url: fullUrl })
                .then(res => {
                    let finalId = val;
                    if (res.data) {
                        if (res.data.uid) {
                            finalId = res.data.uid;
                            setFacebookKH1(finalId);
                        }
                        if (res.data.name) {
                            setNameKH1(res.data.name);
                        }
                    }
                    checkCustomerExists1(finalId);
                })
                .catch(err => {
                    console.log("Lỗi lấy thông tin FB:", err);
                    checkCustomerExists1(val);
                });
        } else {
            checkCustomerExists1(val);
        }
    };

    const onChangeFacebookKH2 = (e) => {
        let originalUrl = e.target.value;
        let val = originalUrl;
        if (val.includes('facebook.com') || val.includes('fb.com')) {
            try {
                const url = new URL(val.startsWith('http') ? val : `https://${val}`);
                if (url.searchParams.has('id')) {
                    val = url.searchParams.get('id');
                } else {
                    const pathParts = url.pathname.split('/').filter(Boolean);
                    if (pathParts.length > 0) {
                        val = pathParts[0];
                    }
                }
            } catch (err) {
                const match = val.match(/(?:facebook\.com|fb\.com)\/(?:profile\.php\?id=)?([^\/?&#]+)/i);
                if (match && match[1]) {
                    val = match[1];
                }
            }
        }
        setFacebookKH2(val);
        if (val.length === 0) {
            clearPhoneKH2();
            return;
        }

        const checkCustomerExists2 = (searchId) => {
            otherService.findKhachHang({ facebookId: searchId })
                .then((response) => {
                    setShowSuggestionPhone2(true);
                    setSuggestionPhone2(response.data);
                    setBtnAddKHShow2(response.data.length === 0);
                })
                .catch((error) => {
                    clearPhoneKH2();
                    setBtnAddKHShow2(true);
                });
        };

        // Auto-fetch Facebook UID and name if it's a URL
        if (originalUrl.includes('facebook.com') || originalUrl.includes('fb.com')) {
            let fullUrl = originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`;
            otherService.getFacebookInfo({ url: fullUrl })
                .then(res => {
                    let finalId = val;
                    if (res.data) {
                        if (res.data.uid) {
                            finalId = res.data.uid;
                            setFacebookKH2(finalId);
                        }
                        if (res.data.name) {
                            setNameKH2(res.data.name);
                        }
                    }
                    checkCustomerExists2(finalId);
                })
                .catch(err => {
                    console.log("Lỗi lấy thông tin FB:", err);
                    checkCustomerExists2(val);
                });
        } else {
            checkCustomerExists2(val);
        }
    };

    const checkNgayChupConflict = (selectedDateTimeStr, currentContractId = null) => {
        if (!selectedDateTimeStr) return null;
        const selectedTime = new Date(selectedDateTimeStr).getTime();
        if (isNaN(selectedTime)) return null;

        const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

        for (const hd of listHopDong) {
            if (currentContractId && hd._id === currentContractId) continue;
            if (Number(hd.giaiDoan) !== 1) continue;
            if (!hd.cacNgay?.ngayChup) continue;

            const existingTime = new Date(hd.cacNgay.ngayChup).getTime();
            if (isNaN(existingTime)) continue;

            const diff = Math.abs(selectedTime - existingTime);
            if (diff <= THREE_HOURS_MS) {
                return hd;
            }
        }
        return null;
    };

    const onSaveHopDong = () => {
        // Kiểm tra trùng lịch chụp hình (khoảng cách dưới 3 tiếng)
        if (ngayChup) {
            const conflict = checkNgayChupConflict(ngayChup);
            if (conflict) {
                const conflictTime = new Date(conflict.cacNgay.ngayChup);
                const timeStr = `${String(conflictTime.getHours()).padStart(2, '0')}:${String(conflictTime.getMinutes()).padStart(2, '0')} ngày ${conflictTime.getDate()}/${conflictTime.getMonth() + 1}/${conflictTime.getFullYear()}`;
                toast.error(`Không thể lưu hợp đồng! Lịch chụp hình bị trùng hoặc quá gần (dưới 3 tiếng) với HĐ ${conflict.maHopDong} (${conflict.khachHang1?.tenKhachHang || ''}) vào lúc ${timeStr}.`);
                return;
            }
        }

        otherService.CREATE_HOPDONG({
            maHopDong,
            ngayHopDong,
            khachHang1: idKH1,
            khachHang2: idKH2,
            gioHang,
            thanhToan: {
                giamGia: giamGia,
                loaiGiamGia: loaiGiamGia,
                nhanVien: nhanVienSale,
                khachThanhToan: {
                    amount: khachThanhToan,
                    method: methodPayment
                }
            },
            cacNgay: {
                ngayChup: convertDateToISOString(ngayChup),
                ngayAnHoi: convertDateToISOString(ngayAnHoi),
                ngayCuoi: convertDateToISOString(ngayCuoi),
                ngayChinhAnh: convertDateToISOString(ngayChinhAnh),
                ngayTraAnh: convertDateToISOString(ngayTraAnh),
                gioChup: (() => {
                    if (!ngayChup) return "";
                    const date = new Date(ngayChup);
                    if (isNaN(date.getTime())) return "";
                    const hh = String(date.getHours()).padStart(2, '0');
                    const mm = String(date.getMinutes()).padStart(2, '0');
                    return `${hh}:${mm}`;
                })(),
                diaDiemChup,
                chotLich
            },
            nguoiPhucVu: {
                thoChupHinh,
                thoMakeUp,
                thoChinhAnh
            },
            nhanVienSale: nhanVienSale,
            giaiDoan: 1,
            dichVuChinh: dichVuChinh

        }).then((response) => {
            toast.success("Tạo hợp đồng mới thành công!");
            setIsSuccess(true);
        }).catch((error) => {
            toast.error("Có lỗi xảy ra khi tạo hợp đồng mới!" + error);
        });

    }



    const updateGioHangParam = (fieldName, value) => {
        if (!Array.isArray(gioHang) || gioHang.length === 0) return;
        const newGioHang = [...gioHang];
        newGioHang[0] = {
            ...newGioHang[0],
            [fieldName]: value
        };
        setGioHang(newGioHang);
    };

    const getAggregatedParams = () => {
        const totals = {
            soLuongAnhChinhSua: 0,
            soLuongAnh16x21: 0,
            soLuongAnh20x30: 0,
            soLuongAnh60x90: 0,
            trangDiemNgayAnHoi: [],
            trangDiemNgayCuoi: [],
            trangPhucChoDoiBeLe: [],
            trangPhucCoDauNgayAnHoi: [],
            trangPhucChuReNgayAnHoi: [],
            trangPhucVayCuoiNgayCuoi: [],
            trangPhucVestChuReNgayCuoi: [],
            hoaCamTay: []
        };

        if (Array.isArray(gioHang)) {
            gioHang.forEach(item => {
                const qty = item.soLuong || 1;
                totals.soLuongAnhChinhSua += (Number(item.soLuongAnhChinhSua) || 0) * qty;
                totals.soLuongAnh16x21 += (Number(item.soLuongAnh16x21) || 0) * qty;
                totals.soLuongAnh20x30 += (Number(item.soLuongAnh20x30) || 0) * qty;
                totals.soLuongAnh60x90 += (Number(item.soLuongAnh60x90) || 0) * qty;

                if (item.trangDiemNgayAnHoi) totals.trangDiemNgayAnHoi.push(item.trangDiemNgayAnHoi);
                if (item.trangDiemNgayCuoi) totals.trangDiemNgayCuoi.push(item.trangDiemNgayCuoi);
                if (item.trangPhucChoDoiBeLe) totals.trangPhucChoDoiBeLe.push(item.trangPhucChoDoiBeLe);
                if (item.trangPhucCoDauNgayAnHoi) totals.trangPhucCoDauNgayAnHoi.push(item.trangPhucCoDauNgayAnHoi);
                if (item.trangPhucChuReNgayAnHoi) totals.trangPhucChuReNgayAnHoi.push(item.trangPhucChuReNgayAnHoi);
                if (item.trangPhucVayCuoiNgayCuoi) totals.trangPhucVayCuoiNgayCuoi.push(item.trangPhucVayCuoiNgayCuoi);
                if (item.trangPhucVestChuReNgayCuoi) totals.trangPhucVestChuReNgayCuoi.push(item.trangPhucVestChuReNgayCuoi);
                if (item.hoaCamTay) totals.hoaCamTay.push(item.hoaCamTay);
            });
        }

        return {
            soLuongAnhChinhSua: totals.soLuongAnhChinhSua,
            soLuongAnh16x21: totals.soLuongAnh16x21,
            soLuongAnh20x30: totals.soLuongAnh20x30,
            soLuongAnh60x90: totals.soLuongAnh60x90,
            trangDiemNgayAnHoi: totals.trangDiemNgayAnHoi.join(", ") || "Không có",
            trangDiemNgayCuoi: totals.trangDiemNgayCuoi.join(", ") || "Không có",
            trangPhucChoDoiBeLe: totals.trangPhucChoDoiBeLe.join(", ") || "Không có",
            trangPhucCoDauNgayAnHoi: totals.trangPhucCoDauNgayAnHoi.join(", ") || "Không có",
            trangPhucChuReNgayAnHoi: totals.trangPhucChuReNgayAnHoi.join(", ") || "Không có",
            trangPhucVayCuoiNgayCuoi: totals.trangPhucVayCuoiNgayCuoi.join(", ") || "Không có",
            trangPhucVestChuReNgayCuoi: totals.trangPhucVestChuReNgayCuoi.join(", ") || "Không có",
            hoaCamTay: totals.hoaCamTay.join(", ") || "Không có"
        };
    };

    const handlePrintHopDong = () => {
        const printWindow = window.open("", "_blank");
        const ngayHDFormatted = dayjs(ngayHopDong).format('DD/MM/YYYY');
        const ngayChupFormatted = ngayChup ? dayjs(ngayChup).format('DD/MM/YYYY HH:mm') : 'Chưa xếp lịch';
        const ngayAnHoiFormatted = ngayAnHoi ? dayjs(ngayAnHoi).format('DD/MM/YYYY HH:mm') : '';
        const ngayCuoiFormatted = ngayCuoi ? dayjs(ngayCuoi).format('DD/MM/YYYY HH:mm') : '';
        
        const tongGoc = gioHang.reduce((sum, item) => {
            const price = parseFloat(item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
            return sum + (price * (item.soLuong || 0));
        }, 0);
        
        const conLai = Math.max(0, tongTien - (Number(khachThanhToan) || 0));
        const totals = getAggregatedParams();
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Hợp Đồng Dịch Vụ - ${maHopDong}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 6mm 10mm;
                    }
                    body { font-family: "Arial", "Helvetica", sans-serif; padding: 0; margin: 0; line-height: 1.25; color: #333; font-size: 11px; }
                    .header-sec { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1.5px solid #333; padding-bottom: 6px; }
                    .company-logo { font-size: 20px; font-weight: bold; color: #111; }
                    .company-info { text-align: right; font-size: 11px; color: #555; }
                    .contract-title-sec { text-align: center; margin: 8px 0; }
                    .title { font-size: 18px; font-weight: bold; margin: 0; text-transform: uppercase; color: #000; letter-spacing: 0.5px; }
                    .date-line { font-style: italic; font-size: 11px; margin-top: 3px; color: #555; }
                    .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 8px; margin-bottom: 4px; border-left: 3px solid #333; padding-left: 6px; }
                    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
                    .info-table td { padding: 3px 0; vertical-align: top; border: none; font-size: 11px; }
                    .items-table { width: 100%; border-collapse: collapse; margin-top: 4px; margin-bottom: 6px; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 5px; text-align: left; font-size: 11px; }
                    .items-table th { background-color: #f5f5f5; font-weight: bold; }
                    .items-table td.number, .items-table th.number { text-align: right; }
                    .items-table td.center, .items-table th.center { text-align: center; }
                    
                    /* Grid parameters style */
                    .params-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 6px 12px;
                        background: #f9f9f9;
                        padding: 8px 12px;
                        border: 1px solid #e0e0e0;
                        border-radius: 4px;
                        margin-top: 4px;
                        margin-bottom: 8px;
                    }
                    .param-item {
                        font-size: 10.5px;
                    }
                    .param-item strong {
                        color: #111;
                    }
                    
                    .summary-container { display: flex; justify-content: flex-end; margin-bottom: 8px; }
                    .summary-table { width: 300px; border-collapse: collapse; }
                    .summary-table td { padding: 3px 0; font-size: 11px; }
                    .summary-table td.label { text-align: left; color: #555; }
                    .summary-table td.value { text-align: right; font-weight: 500; }
                    .summary-table tr.total td { font-weight: bold; font-size: 13px; border-top: 1px solid #333; padding-top: 4px; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 15px; font-size: 11px; text-align: center; page-break-inside: avoid; }
                    .sig-box { width: 220px; }
                    .sig-title { font-weight: bold; margin-bottom: 45px; }
                    .sig-name { font-weight: bold; }
                    .terms { font-size: 9.5px; color: #666; margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 6px; }
                    .terms-title { font-weight: bold; margin-bottom: 3px; color: #444; }
                    .terms p { margin: 1px 0; }
                </style>
            </head>
            <body>
                <div class="header-sec" style="align-items: center;">
                    <div class="company-logo-sec">
                        <img src="${window.location.origin}${logoVang}" alt="LONG WEDDING" style="height: 50px; object-fit: contain;" />
                    </div>
                    <div class="company-info" style="text-align: right;">
                        <div>Website: <strong>longwedding.vn</strong></div>
                        <div>Hotline: <strong>0868.66.3637</strong></div>
                        <div>Địa chỉ: <strong>Số 129 đường 1/5, xóm Tân Hồng, xã Nghĩa Đàn, tỉnh Nghệ An</strong></div>
                    </div>
                </div>
                
                <div class="contract-title-sec">
                    <div class="title">HỢP ĐỒNG DỊCH VỤ</div>
                    <div class="date-line">Mã số HĐ: <strong>${maHopDong}</strong> - Ngày lập: ${ngayHDFormatted}</div>
                </div>

                <div class="section-title">Thông tin khách hàng</div>
                <table class="info-table">
                    <tr>
                        <td style="width: 50%;"><strong>Khách hàng A:</strong> ${nameKH1 || 'Chưa cập nhật'}</td>
                        <td style="width: 50%;"><strong>Khách hàng B:</strong> ${nameKH2 || 'Chưa cập nhật'}</td>
                    </tr>
                    <tr>
                        <td><strong>Số điện thoại:</strong> ${phoneKH1 || 'Chưa cập nhật'}</td>
                        <td><strong>Số điện thoại:</strong> ${phoneKH2 || 'Chưa cập nhật'}</td>
                    </tr>
                    <tr>
                        <td><strong>Địa chỉ:</strong> ${addressKH1 || 'Chưa cập nhật'}</td>
                        <td><strong>Địa chỉ:</strong> ${addressKH2 || 'Chưa cập nhật'}</td>
                    </tr>
                </table>

                <div class="section-title">Nội dung dịch vụ đăng ký</div>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;">STT</th>
                            <th>Tên Dịch Vụ / Sản Phẩm</th>
                            <th style="width: 60px; text-align: center;">Số lượng</th>
                            <th style="width: 110px; text-align: right;">Đơn giá</th>
                            <th style="width: 110px; text-align: right;">Giảm giá</th>
                            <th style="width: 130px; text-align: right;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${gioHang.length === 0 ? `<tr><td colspan="6" style="text-align: center; color: #999;">Chưa đăng ký dịch vụ nào</td></tr>` : 
                          gioHang.map((item, index) => {
                            const price = parseFloat(item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
                            const discountItem = parseFloat(item.giamGiaDichVu || 0);
                            const total = Math.max(0, (price * (item.soLuong || 0)) - discountItem);
                            return `
                                <tr>
                                    <td style="text-align: center;">${index + 1}</td>
                                    <td>${item.tenDichVu}</td>
                                    <td style="text-align: center;">${item.soLuong}</td>
                                    <td style="text-align: right;">${price.toLocaleString('vi-VN')} đ</td>
                                    <td style="text-align: right; color: ${discountItem > 0 ? '#dc2626' : '#666'};">${discountItem > 0 ? `-${discountItem.toLocaleString('vi-VN')} đ` : '0 đ'}</td>
                                    <td style="text-align: right; font-weight: bold;">${total.toLocaleString('vi-VN')} đ</td>
                                </tr>
                            `;
                          }).join('')}
                    </tbody>
                </table>

                <div class="section-title">Chi tiết tham số dịch vụ</div>
                <div class="params-grid">
                    <div class="param-item"><strong>SL ảnh chỉnh sửa:</strong> ${totals.soLuongAnhChinhSua}</div>
                    <div class="param-item"><strong>SL ảnh 16x21:</strong> ${totals.soLuongAnh16x21}</div>
                    <div class="param-item"><strong>SL ảnh 20x30:</strong> ${totals.soLuongAnh20x30}</div>
                    <div class="param-item"><strong>SL ảnh 60x90:</strong> ${totals.soLuongAnh60x90}</div>
                    <div class="param-item"><strong>Trang điểm ngày ăn hỏi:</strong> ${totals.trangDiemNgayAnHoi}</div>
                    <div class="param-item"><strong>Trang điểm ngày cưới:</strong> ${totals.trangDiemNgayCuoi}</div>
                    <div class="param-item"><strong>Trang phục bê lễ:</strong> ${totals.trangPhucChoDoiBeLe}</div>
                    <div class="param-item"><strong>TP cô dâu ngày ăn hỏi:</strong> ${totals.trangPhucCoDauNgayAnHoi}</div>
                    <div class="param-item"><strong>TP chú rể ngày ăn hỏi:</strong> ${totals.trangPhucChuReNgayAnHoi}</div>
                    <div class="param-item"><strong>Váy cưới ngày cưới (giá trị):</strong> ${totals.trangPhucVayCuoiNgayCuoi}</div>
                    <div class="param-item"><strong>Vest chú rể ngày cưới:</strong> ${totals.trangPhucVestChuReNgayCuoi}</div>
                    <div class="param-item"><strong>Hoa cầm tay:</strong> ${totals.hoaCamTay}</div>
                </div>

                <div class="summary-container">
                    <table class="summary-table">
                        <tr>
                            <td class="label">Tổng giá trị dịch vụ:</td>
                            <td class="value">${tongGoc.toLocaleString('vi-VN')} đ</td>
                        </tr>
                        ${gioHang.some(i => Number(i.giamGiaDichVu) > 0) ? `
                        <tr>
                            <td class="label" style="color: #dc2626;">Tổng giảm giá dịch vụ:</td>
                            <td class="value" style="color: #dc2626;">-${gioHang.reduce((s, i) => s + (Number(i.giamGiaDichVu) || 0), 0).toLocaleString('vi-VN')} đ</td>
                        </tr>
                        ` : ''}
                        ${giamGia > 0 ? `
                        <tr>
                            <td class="label" style="color: #dc2626;">Giảm giá hợp đồng:</td>
                            <td class="value" style="color: #dc2626;">-${giamGia.toLocaleString('vi-VN')}${loaiGiamGia === 1 ? '%' : ' đ'}</td>
                        </tr>
                        ` : ''}
                        <tr class="total">
                            <td class="label">Tổng cộng thanh toán:</td>
                            <td class="value">${tongTien.toLocaleString('vi-VN')} đ</td>
                        </tr>
                        <tr>
                            <td class="label" style="color: green; font-weight: bold;">Đã thanh toán:</td>
                            <td class="value" style="color: green; font-weight: bold;">${(Number(khachThanhToan) || 0).toLocaleString('vi-VN')} đ</td>
                        </tr>
                        <tr style="border-top: 1px dashed #ddd;">
                            <td class="label" style="color: red; font-weight: bold; padding-top: 8px;">Còn lại phải thanh toán:</td>
                            <td class="value" style="color: red; font-weight: bold; padding-top: 8px;">${conLai.toLocaleString('vi-VN')} đ</td>
                        </tr>
                    </table>
                </div>

                <div class="section-title">Lịch trình & Nhân sự</div>
                <table class="info-table">
                    <tr>
                        <td style="width: 50%;"><strong>Ngày chụp ảnh:</strong> ${ngayChupFormatted}</td>
                        <td style="width: 50%;"><strong>Địa điểm chụp:</strong> ${diaDiemChup || 'Chưa cập nhật'}</td>
                    </tr>
                    ${ngayAnHoiFormatted ? `
                    <tr>
                        <td><strong>Ngày ăn hỏi:</strong> ${ngayAnHoiFormatted}</td>
                        <td></td>
                    </tr>
                    ` : ''}
                    ${ngayCuoiFormatted ? `
                    <tr>
                        <td><strong>Ngày cưới:</strong> ${ngayCuoiFormatted}</td>
                        <td></td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td><strong>Thợ chụp hình:</strong> ${thoChupHinh || 'Chưa phân công'}</td>
                        <td><strong>Thợ Make-up:</strong> ${thoMakeUp || 'Chưa phân công'}</td>
                    </tr>
                </table>

                <div class="signatures">
                    <div class="sig-box">
                        <div class="sig-title">ĐẠI DIỆN KHÁCH HÀNG (BÊN A)</div>
                        <div class="sig-name">${nameKH1 || ''}</div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-title">ĐẠI DIỆN CỬA HÀNG (BÊN B)</div>
                        <div class="sig-name">LONG WEDDING</div>
                    </div>
                </div>

                <div class="terms">
                    <div class="terms-title">Điều khoản chung & Cam kết dịch vụ:</div>
                    <p>1. Bên A cam kết thanh toán đầy đủ các khoản chi phí theo tiến độ đã thoả thuận trong hợp đồng.</p>
                    <p>2. Bên B cam kết thực hiện đúng, đầy đủ các dịch vụ chất lượng đã ký kết với khách hàng.</p>
                    <p>3. Mọi thay đổi về lịch trình hoặc dịch vụ cần được thông báo trước ít nhất 3 ngày.</p>
                    <p>4. Trang phục không được để rượu vang đổ lên váy, nếu bị sẽ phải mua luôn váy.</p>
                    <p>5. Tiền cọc không được hoàn trả bất kỳ hình thức nào.</p>
                    <p>6. Hợp đồng được đồng bộ hóa trên đám mây, Quý khách có thể tra cứu trên website longwedding.vn.</p>
                    <p>7. Mọi thắc mắc xin quý khách liên hệ về số hotline: 0868 66 3637</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    };

    return (
        <Dialog onClose={handleClose} open={open}
            fullWidth={true}
            maxWidth={isSuccess ? "sm" : "xl"}
        >
            {isSuccess ? (
                <div style={{ padding: '40px 24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                    <div style={{ color: '#2e7d32', fontSize: '64px', marginBottom: '16px' }}>
                        <FontAwesomeIcon icon={faCircleCheck} />
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32', fontWeight: 'bold', fontSize: '1.6rem' }}>
                        TẠO HỢP ĐỒNG THÀNH CÔNG!
                    </h3>
                    <p style={{ margin: '0 0 24px 0', color: '#555', fontSize: '1rem' }}>
                        Hợp đồng <strong style={{ color: '#d32f2f' }}>{maHopDong}</strong> đã được lưu thành công vào hệ thống.
                    </p>
                    
                    <div style={{ 
                        backgroundColor: '#f9f9f9', 
                        borderRadius: '8px', 
                        padding: '20px', 
                        textAlign: 'left',
                        marginBottom: '32px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ marginBottom: '10px', fontSize: '0.95rem' }}>
                            <strong>Mã hợp đồng:</strong> <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{maHopDong}</span>
                        </div>
                        <div style={{ marginBottom: '10px', fontSize: '0.95rem' }}>
                            <strong>Khách hàng 1:</strong> {nameKH1 || 'Chưa cập nhật'} {phoneKH1 ? `(${phoneKH1})` : ''}
                        </div>
                        {nameKH2 && (
                            <div style={{ marginBottom: '10px', fontSize: '0.95rem' }}>
                                <strong>Khách hàng 2:</strong> {nameKH2} {phoneKH2 ? `(${phoneKH2})` : ''}
                            </div>
                        )}
                        <div style={{ marginBottom: '10px', fontSize: '0.95rem' }}>
                            <strong>Tổng tiền:</strong> <span style={{ fontWeight: 'bold' }}>{tongTien.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div style={{ fontSize: '0.95rem' }}>
                            <strong>Đã cọc:</strong> <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{Number(khachThanhToan).toLocaleString('vi-VN')} đ</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Button 
                            variant="outlined" 
                            color="inherit" 
                            onClick={handleCloseAndReset}
                            style={{ minWidth: '140px', height: '44px' }}
                        >
                            Đóng cửa sổ
                        </Button>
                        <Button 
                            variant="contained" 
                            color="success" 
                            onClick={handlePrintHopDong}
                            startIcon={<FontAwesomeIcon icon={faPrint} />}
                            style={{ minWidth: '160px', height: '44px' }}
                        >
                            In hợp đồng
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="dialog-overlay">
                    <div className="dialog large">
                    <button className="close-btn" onClick={onClose}>×</button>
                    <h3 className="dialog-title">TẠO HỢP ĐỒNG MỚI</h3>

                    <div className="dialog-content">
                        <div className="right-column">
                            <div className="dialog-section-khachhang">
                                <div className="dialog-section-khachhang-item">
                                    <h4>Thông tin khách hàng 1</h4>
                                    <div className="floating-label">
                                        <input name="phoneKH1" value={phoneKH1} onChange={onChangePhoneKH1} type="Number" maxLength={10} autoComplete="off" required />
                                        <label>Phone khách hàng 1</label>
                                    </div>

                                    <div className="floating-label">
                                        {showSuggestionPhone1 && suggestionPhone1.length > 0 && (
                                            <ul className="search-suggestions-pop">
                                                {suggestionPhone1.map(p => (
                                                    <li key={p.soDienThoai} onClick={() => handleSelectProductPhone1(p)}>
                                                        <span className="p-name">{p.tenKhachHang || "Đang cập nhật ..."}</span>
                                                        <span className="p-price">{p.soDienThoai || "Đang cập nhật ..."}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="floating-label">
                                        <input name="tenKhachHang" value={nameKH1} onChange={(e) => { setNameKH1(e.target.value) }} required />
                                        <label>Tên khách hàng</label>
                                    </div>

                                    <div className="floating-label">
                                        <input name="diaChiCodau" value={addressKH1} onChange={(e) => { setAddressKH1(e.target.value) }} autoComplete="off" required />
                                        <label>Địa chỉ</label>
                                    </div>

                                    <div className="floating-label">
                                        <input name="facebookKH1" value={facebookKH1} onChange={onChangeFacebookKH1} autoComplete="off" />
                                        <label>Link / ID Facebook 1</label>
                                    </div>

                                    {btnAddKHShow1 && (
                                        <Button
                                            onClick={() => onCreateNewCustomer(1, phoneKH1, nameKH1, addressKH1, facebookKH1)}
                                            color="success"
                                            variant="contained"
                                            sx={{
                                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                                            }}
                                        >Tạo khách hàng mới</Button>
                                    )}
                                </div>

                                <div className="dialog-section-khachhang-item">
                                    <h4>Thông tin khách hàng 2</h4>
                                    <div className="floating-label">
                                        <input name="phoneKH2" value={phoneKH2} onChange={onChangePhoneKH2} type="Number" maxLength={10} required />
                                        <label>Phone khách hàng 2</label>
                                    </div>

                                    <div className="floating-label">
                                        {showSuggestionPhone2 && suggestionPhone2.length > 0 && (
                                            <ul className="search-suggestions-pop">
                                                {suggestionPhone2.map(p => (
                                                    <li key={p.soDienThoai} onClick={() => handleSelectProductPhone2(p)}>
                                                        <span className="p-name">{p.tenKhachHang || "Đang cập nhật ..."}</span>
                                                        <span className="p-price">{p.soDienThoai || "Đang cập nhật ..."}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="floating-label">
                                        <input name="tenKhachHang" value={nameKH2} onChange={(e) => { setNameKH2(e.target.value) }} required />
                                        <label>Tên khách hàng 2</label>
                                    </div>

                                    <div className="floating-label">
                                        <input name="diaChiCodau" value={addressKH2} onChange={(e) => { setAddressKH2(e.target.value) }} required />
                                        <label>Địa chỉ khách hàng 2</label>
                                    </div>
                                    <div className="floating-label">
                                        <input name="facebookKH2" value={facebookKH2} onChange={onChangeFacebookKH2} autoComplete="off" />
                                        <label>Link / ID Facebook 2</label>
                                    </div>
                                    {btnAddKHShow2 && (
                                        <Button
                                            onClick={() => onCreateNewCustomer(2, phoneKH2, nameKH2, addressKH2, facebookKH2)}
                                            color="success"
                                            variant="contained"
                                            sx={{
                                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                                            }}
                                        >Tạo khách hàng mới</Button>
                                    )}

                                </div>

                            </div>



                            <div className="dialog-section">
                                <h4>Thông tin hợp đồng</h4>
                                <div className="two-col-grid">
                                    <div className="floating-label">
                                        <input name="maHopDong" value={maHopDong} onChange={(e) => setMaHopDong(e.target.value)} required />
                                        <label>Mã hợp đồng</label>
                                    </div>

                                    <Autocomplete
                                        disablePortal
                                        options={loaiHopDongOptions}
                                        size="small"
                                        renderInput={(params) => <TextField {...params} label="Loại hợp đồng" />}
                                        onChange={(event, newValue) => {
                                            setDichVuChinh(newValue ? newValue.id : 0);
                                        }}
                                        sx={{ marginTop: '-8px' }}
                                    />

                                    <div className="floating-label">
                                        <select name="nhanVienSale" value={nhanVienSale} onChange={(e) => setNhanVienSale(e.target.value)}>
                                            <option value="0">Chưa phân công</option>
                                            {listStaff.filter(s => s.positon === 'Nhân viên Sale').map(s => {
                                                const name = s.fullname || s.username;
                                                return <option key={s.username} value={name}>{name}</option>;
                                            })}
                                        </select>
                                        <label>Nhân viên sale</label>
                                    </div>

                                    <div className="floating-label">
                                        <select name="thoChupHinh" value={thoChupHinh} onChange={(e) => setThoChupHinh(e.target.value)}>
                                            <option value="">Chưa phân công</option>
                                            {listStaff.filter(s => s.positon === 'Thợ chụp hình').map(s => {
                                                const name = s.fullname || s.username;
                                                return <option key={s.username} value={name}>{name}</option>;
                                            })}
                                        </select>
                                        <label>Thợ chụp hình</label>
                                    </div>

                                    <div className="floating-label">
                                        <select name="thoMakeUp" value={thoMakeUp} onChange={(e) => setThoMakeUp(e.target.value)}>
                                            <option value="">Chưa phân công</option>
                                            {listStaff.filter(s => s.positon === 'Thợ trang điểm').map(s => {
                                                const name = s.fullname || s.username;
                                                return <option key={s.username} value={name}>{name}</option>;
                                            })}
                                        </select>
                                        <label>Thợ Make-up</label>
                                    </div>

                                    <div className="floating-label">
                                        <select name="chotLich" value={chotLich} onChange={(e) => setChotLich(e.target.value)}>
                                            <option value="Chưa gọi điện">Chưa gọi điện</option>
                                            <option value="Đã gọi điện xác nhận">Đã gọi điện xác nhận</option>
                                            <option value="Đã chốt lịch">Đã chốt lịch</option>
                                        </select>
                                        <label>Chốt lịch</label>
                                    </div>

                                    <div className="floating-label">
                                        <select name="thoChinhAnh" value={thoChinhAnh} onChange={(e) => setThoChinhAnh(e.target.value)}>
                                            <option value="">Chưa phân công</option>
                                            {listStaff.filter(s => s.positon === 'Thợ chỉnh ảnh').map(s => {
                                                const name = s.fullname || s.username;
                                                return <option key={s.username} value={name}>{name}</option>;
                                            })}
                                        </select>
                                        <label>Thợ chỉnh ảnh</label>
                                    </div>
                                </div>
                            </div>

                            <div className="dialog-section" style={{ marginTop: '20px' }}>
                                <h4>Thông tin chung & Lịch trình</h4>
                                <div className="two-col-grid">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                            <DateTimePicker
                                                label="Ngày chụp ảnh"
                                                value={ngayChup ? dayjs(ngayChup) : null}
                                                onChange={(newValue) => {
                                                    const formatted = newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '';
                                                    setNgayChup(formatted);
                                                    if (formatted) {
                                                        const conflict = checkNgayChupConflict(formatted);
                                                        if (conflict) {
                                                            const conflictTime = new Date(conflict.cacNgay.ngayChup);
                                                            const timeStr = `${String(conflictTime.getHours()).padStart(2, '0')}:${String(conflictTime.getMinutes()).padStart(2, '0')} ngày ${conflictTime.getDate()}/${conflictTime.getMonth() + 1}/${conflictTime.getFullYear()}`;
                                                            toast.warning(`Cảnh báo: Trùng hoặc quá gần lịch chụp với HĐ ${conflict.maHopDong} (${conflict.khachHang1?.tenKhachHang || ''}) vào lúc ${timeStr} (khoảng cách dưới 3 tiếng).`);
                                                        }
                                                    }
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        required: true,
                                                        size: 'small',
                                                    }
                                                }}
                                                format="DD/MM/YYYY HH:mm"
                                            />
                                        </LocalizationProvider>
                                        {ngayChup && (
                                            <div style={{ fontSize: '0.78rem', color: '#e67e22', marginTop: '-10px', marginLeft: '4px', fontWeight: '500' }}>
                                                Âm lịch: {formatLunarDateFull(ngayChup)}
                                            </div>
                                        )}
                                        
                                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                            <DateTimePicker
                                                label="Ngày ăn hỏi"
                                                value={ngayAnHoi ? dayjs(ngayAnHoi) : null}
                                                onChange={(newValue) => setNgayAnHoi(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        required: true,
                                                        size: 'small',
                                                    }
                                                }}
                                                format="DD/MM/YYYY HH:mm"
                                            />
                                        </LocalizationProvider>
                                        {ngayAnHoi && (
                                            <div style={{ fontSize: '0.78rem', color: '#e67e22', marginTop: '-10px', marginLeft: '4px', fontWeight: '500' }}>
                                                Âm lịch: {formatLunarDateFull(ngayAnHoi)}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                            <DateTimePicker
                                                label="Ngày cưới"
                                                value={ngayCuoi ? dayjs(ngayCuoi) : null}
                                                onChange={(newValue) => setNgayCuoi(newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '')}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        required: true,
                                                        size: 'small',
                                                    }
                                                }}
                                                format="DD/MM/YYYY HH:mm"
                                            />
                                        </LocalizationProvider>
                                        {ngayCuoi && (
                                            <div style={{ fontSize: '0.78rem', color: '#e67e22', marginTop: '-10px', marginLeft: '4px', fontWeight: '500' }}>
                                                Âm lịch: {formatLunarDateFull(ngayCuoi)}
                                            </div>
                                        )}

                                        <div className="floating-label" style={{ marginTop: '0px' }}>
                                            <input type="text" name="diaDiemChup" value={diaDiemChup} onChange={(e) => setDiaDiemChup(e.target.value)} />
                                            <label>Địa điểm chụp</label>
                                        </div>

                                        <div className="floating-label" style={{ marginTop: '5px' }}>
                                            <input type="date" name="ngayTraAnh" value={ngayTraAnh} onChange={(e) => setNgayTraAnh(e.target.value)} />
                                            <label>Ngày trả ảnh</label>
                                        </div>
                                        {ngayTraAnh && (
                                            <div style={{ fontSize: '0.78rem', color: '#e67e22', marginTop: '-10px', marginLeft: '4px', fontWeight: '500', marginBottom: '10px' }}>
                                                Âm lịch: {formatLunarDateFull(ngayTraAnh)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="left-column">
                            <h4>Sản phẩm</h4>

                            <div className="product-search-container" ref={searchRef}>
                                <AppSearchInput
                                    value={searchTerm}
                                    placeholder="Tìm tên hoặc mã sản phẩm"
                                    width="100%"
                                    autoComplete="off"
                                    onFocus={() => setShowSuggestions(true)}
                                    onChange={(e) => {
                                        const value = e.target ? e.target.value : e;
                                        setSearchTerm(value);
                                        setShowSuggestions(true);
                                    }}
                                />

                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="search-suggestions-pop">
                                        {suggestions.map(p => (
                                            <li key={p.maDichVu} onClick={() => handleSelectProduct(p)}>
                                                <span className="p-name">{p.tenDichVu} <small style={{ color: '#888', marginLeft: '5px' }}>({p.maDichVu})</small></span>
                                                <span className="p-price">{p.giaChoThueDichVu.toLocaleString("vi-VN")}đ</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* ===== TABLE ===== */}
                            <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch', maxHeight: '250px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px', marginBottom: '15px' }}>
                                <table className="product-table">
                                    <thead>
                                        <tr>
                                            <th>Tên SP</th>
                                            <th style={{ textAlign: "center" }}>Số lượng</th>
                                            <th>Đơn giá</th>
                                            <th style={{ width: '130px' }}>Giảm giá (đ)</th>
                                            <th>Thành tiền</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(gioHang) && gioHang.length > 0 ? (
                                            gioHang.map((sp) => {
                                                const price = parseFloat(sp.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
                                                const discountItem = parseFloat(sp.giamGiaDichVu || 0);
                                                const total = Math.max(0, (price * (sp.soLuong || 0)) - discountItem);

                                                return (
                                                    <Fragment key={sp.maDichVu}>
                                                        <tr style={{ backgroundColor: Number(sp.loaiDichVu) !== 1 ? '#f5f8fc' : 'transparent' }}>
                                                            <td style={{ fontWeight: Number(sp.loaiDichVu) !== 1 ? '600' : 'normal' }}>{sp.tenDichVu}</td>
                                                            <td style={{ textAlign: "center" }}>
                                                                <button className="btn-qty" onClick={() => handleDecreaseQuantity(sp.maDichVu)}>-</button>
                                                                <span style={{ margin: "0 10px" }}>{sp.soLuong}</span>
                                                                <button className="btn-qty" onClick={() => handleSelectProduct(sp)}>+</button>
                                                            </td>
                                                            <td>{price.toLocaleString("vi-VN")}đ</td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="0"
                                                                    value={sp.giamGiaDichVu !== undefined && sp.giamGiaDichVu !== null ? sp.giamGiaDichVu : ''}
                                                                    onChange={(e) => handleDiscountItemChange(sp.maDichVu, e.target.value)}
                                                                    style={{
                                                                        width: '100px',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '6px',
                                                                        border: '1px solid #cbd5e1',
                                                                        fontSize: '0.85rem'
                                                                    }}
                                                                />
                                                            </td>
                                                            <td style={{ fontWeight: 'bold', color: discountItem > 0 ? '#059669' : 'inherit' }}>
                                                                {total.toLocaleString("vi-VN")}đ
                                                                {discountItem > 0 && (
                                                                    <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '500' }}>
                                                                        (Giảm: -{discountItem.toLocaleString("vi-VN")}đ)
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td style={{ textAlign: "center" }}>
                                                                <Button
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleDeleteProduct(sp.maDichVu)}
                                                                >
                                                                    Xóa
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    </Fragment>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={6} style={{ textAlign: "center", color: "#999" }}>
                                                    Chưa sử dụng dịch vụ
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {(() => {
                                const hasItems = Array.isArray(gioHang) && gioHang.length > 0;
                                const firstItem = hasItems ? gioHang[0] : {};

                                return (
                                    <>
                                        <div className="package-parameters-title" style={{ marginTop: '25px' }}>Tổng hợp dịch vụ trong hợp đồng</div>
                                        <div className="summary-parameters-grid">
                                            <div className="form-group-summary">
                                                <label>SL ảnh chỉnh sửa</label>
                                                <input
                                                    type="number"
                                                    className="summary-value-input"
                                                    value={firstItem.soLuongAnhChinhSua ?? 0}
                                                    onChange={(e) => updateGioHangParam("soLuongAnhChinhSua", Number(e.target.value) || 0)}
                                                    disabled={!hasItems}
                                                />
                                            </div>
                                            <div className="form-group-summary">
                                                <label>SL ảnh 16x21</label>
                                                <input
                                                    type="number"
                                                    className="summary-value-input"
                                                    value={firstItem.soLuongAnh16x21 ?? 0}
                                                    onChange={(e) => updateGioHangParam("soLuongAnh16x21", Number(e.target.value) || 0)}
                                                    disabled={!hasItems}
                                                />
                                            </div>
                                            <div className="form-group-summary">
                                                <label>SL ảnh 20x30</label>
                                                <input
                                                    type="number"
                                                    className="summary-value-input"
                                                    value={firstItem.soLuongAnh20x30 ?? 0}
                                                    onChange={(e) => updateGioHangParam("soLuongAnh20x30", Number(e.target.value) || 0)}
                                                    disabled={!hasItems}
                                                />
                                            </div>
                                            <div className="form-group-summary">
                                                <label>SL ảnh 60x90</label>
                                                <input
                                                    type="number"
                                                    className="summary-value-input"
                                                    value={firstItem.soLuongAnh60x90 ?? 0}
                                                    onChange={(e) => updateGioHangParam("soLuongAnh60x90", Number(e.target.value) || 0)}
                                                    disabled={!hasItems}
                                                />
                                            </div>
                                            <div className="form-group-summary">
                                                <label>Trang điểm ngày ăn hỏi</label>
                                                <input
                                                    type="text"
                                                    className="summary-value-input"
                                                    value={firstItem.trangDiemNgayAnHoi ?? ""}
                                                    onChange={(e) => updateGioHangParam("trangDiemNgayAnHoi", e.target.value)}
                                                    disabled={!hasItems}
                                                    placeholder="Không có"
                                                />
                                            </div>
                                            <div className="form-group-summary">
                                                <label>Trang điểm ngày cưới</label>
                                                <input
                                                    type="text"
                                                    className="summary-value-input"
                                                    value={firstItem.trangDiemNgayCuoi ?? ""}
                                                    onChange={(e) => updateGioHangParam("trangDiemNgayCuoi", e.target.value)}
                                                    disabled={!hasItems}
                                                    placeholder="Không có"
                                                />
                                            </div>
                                            <div className="form-group-summary">
                                                <label>Trang phục bê lễ</label>
                                                <input
                                                    type="text"
                                                    className="summary-value-input"
                                                    value={firstItem.trangPhucChoDoiBeLe ?? ""}
                                                    onChange={(e) => updateGioHangParam("trangPhucChoDoiBeLe", e.target.value)}
                                                    disabled={!hasItems}
                                                    placeholder="Không có"
                                                />
                                            </div>
                                            <div className="form-group-summary">
                                                <label>TP cô dâu ngày ăn hỏi</label>
                                                <input
                                                    type="text"
                                                    className="summary-value-input"
                                                    value={firstItem.trangPhucCoDauNgayAnHoi ?? ""}
                                                    onChange={(e) => updateGioHangParam("trangPhucCoDauNgayAnHoi", e.target.value)}
                                                    disabled={!hasItems}
                                                    placeholder="Không có"
                                                />
                                            </div>
                                            <div className="form-group-summary">
                                                <label>TP chú rể ngày ăn hỏi</label>
                                                <input
                                                    type="text"
                                                    className="summary-value-input"
                                                    value={firstItem.trangPhucChuReNgayAnHoi ?? ""}
                                                    onChange={(e) => updateGioHangParam("trangPhucChuReNgayAnHoi", e.target.value)}
                                                    disabled={!hasItems}
                                                    placeholder="Không có"
                                                />
                                            </div>
                                            <div className="form-group-summary">
                                                <label>Váy cưới ngày cưới (giá trị)</label>
                                                <input
                                                    type="text"
                                                    className="summary-value-input"
                                                    value={firstItem.trangPhucVayCuoiNgayCuoi ?? ""}
                                                    onChange={(e) => updateGioHangParam("trangPhucVayCuoiNgayCuoi", e.target.value)}
                                                    disabled={!hasItems}
                                                    placeholder="Không có"
                                                />
                                            </div>
                                            <div className="form-group-summary">
                                                <label>Vest chú rể ngày cưới</label>
                                                <input
                                                    type="text"
                                                    className="summary-value-input"
                                                    value={firstItem.trangPhucVestChuReNgayCuoi ?? ""}
                                                    onChange={(e) => updateGioHangParam("trangPhucVestChuReNgayCuoi", e.target.value)}
                                                    disabled={!hasItems}
                                                    placeholder="Không có"
                                                />
                                            </div>
                                            <div className="form-group-summary">
                                                <label>Hoa cầm tay</label>
                                                <input
                                                    type="text"
                                                    className="summary-value-input"
                                                    value={firstItem.hoaCamTay ?? ""}
                                                    onChange={(e) => updateGioHangParam("hoaCamTay", e.target.value)}
                                                    disabled={!hasItems}
                                                    placeholder="Không có"
                                                />
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    {/* === DƯỚI CÙNG: THANH TOÁN === */}
                    <div className="dialog-section payment" style={{ padding: '8px 15px', borderTop: '2px dashed #ccc' }}>
                        <h4 style={{ fontSize: '0.85rem', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Thông tin thanh toán</h4>
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            divider={<Divider orientation={{ xs: 'horizontal', md: 'vertical' }} flexItem />}
                            spacing={2}
                        >

                            <Stack
                                direction="column"
                                spacing={1}
                                className="payment-col"
                            >

                                <div style={{ display: 'flex', gap: '5px' }}>

                                    <NumericFormat
                                        customInput={TextField}
                                        label="Giảm giá"
                                        value={giamGia}
                                        onValueChange={(e) => setGiamGia(e.floatValue)}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={2}
                                        allowNegative={false}
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            '& .MuiInputBase-root': { fontSize: '0.8rem', height: '32px' },
                                            '& .MuiFormLabel-root': { fontSize: '0.8rem', transform: 'translate(14px, 8px) scale(1)' },
                                            '& .MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75) !important' }
                                        }}
                                    />

                                    <select
                                        value={loaiGiamGia}
                                        onChange={(e) => setLoaiGiamGia(Number(e.target.value))}
                                        style={{ borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center', padding: '0 5px', width: '80px', backgroundColor: '#fff', fontSize: '0.8rem', height: '32px' }}
                                    >
                                        <option defaultChecked value={0}>VNĐ</option>
                                        <option value={1}>%</option>
                                    </select>
                                </div>

                                <NumericFormat
                                    customInput={TextField} // Sử dụng TextField của MUI làm giao diện
                                    label="Khách thanh toán"
                                    value={khachThanhToan}
                                    onValueChange={(e) => setKhachThanhToan(e.floatValue)}
                                    thousandSeparator="." // Phân cách hàng nghìn bằng dấu chấm
                                    decimalSeparator=","   // Phân cách thập phân bằng dấu phẩy
                                    decimalScale={2}       // Tối đa 2 chữ số sau dấu phẩy
                                    allowNegative={false}  // Không cho phép số âm
                                    suffix=" đ"            // Thêm đơn vị phía sau
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        '& .MuiInputBase-root': { fontSize: '0.8rem', height: '32px' },
                                        '& .MuiFormLabel-root': { fontSize: '0.8rem', transform: 'translate(14px, 8px) scale(1)' },
                                        '& .MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75) !important' }
                                    }}
                                />

                                <Autocomplete
                                    disablePortal
                                    options={itemMethodPayment}
                                    size="small"
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Hình thức thanh toán"
                                            sx={{
                                                '& .MuiInputBase-root': { fontSize: '0.8rem', height: '32px', padding: '0 8px' },
                                                '& .MuiFormLabel-root': { fontSize: '0.8rem', transform: 'translate(14px, 8px) scale(1)' },
                                                '& .MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75) !important' }
                                            }}
                                        />
                                    )}
                                    onChange={(event, newValue) => {
                                        setMethodPayment(newValue.label);
                                    }}
                                    sx={{
                                        '& .MuiAutocomplete-inputRoot': { padding: '0 8px' }
                                    }}
                                />

                            </Stack>

                            <Stack
                                direction="column"
                                spacing={0.5}
                                style={{ justifyContent: 'center', flex: 2 }}
                            >
                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '0.85rem', color: 'green', margin: '2px 0' }}>
                                    Tổng tiền đơn hàng: <b>{gioHang.reduce((sum, item) => {
                                        const price = parseFloat(item.giaChoThueDichVu?.toString().replace(/[^0-9.-]+/g, "") || 0);
                                        return sum + (price * (item.soLuong || 0));
                                    }, 0).toLocaleString("vi-VN") + " đ"} </b>
                                </p>

                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '0.85rem', color: 'green', margin: '2px 0' }}>
                                    Tổng tiền sau giảm giá: <b>{tongTien.toLocaleString("vi-VN") + " đ"}</b>
                                </p>


                                <p style={{ textAlign: 'left', fontWeight: 'inherit', fontSize: '0.85rem', color: 'red', margin: '2px 0' }}>
                                    Tổng tiền còn lại: <b> {(tongTien - khachThanhToan).toLocaleString("vi-VN")} đ</b>
                                </p>

                            </Stack>


                        </Stack>

                    </div>

                    <div className="dialog-actions payment">
                        <Button
                            onClick={onClose}
                            variant="contained"
                            color="error"
                            sx={{
                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                            }}
                        >Thoát</Button>

                        <Button
                            onClick={() => onSaveHopDong()}
                            variant="contained"
                            sx={{
                                whiteSpace: 'nowrap'  // Giữ cho text không bị rớt dòng nếu thu nhỏ màn hình
                            }}
                        >Tạo hợp đồng</Button>
                    </div>
                </div>
            </div>
            )}
        </Dialog >
    );
}

export default ThemHopDongKHDialog;
