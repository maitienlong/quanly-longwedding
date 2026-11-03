const fs = require('fs');
const path = require('path');

function replaceNormalized(filePath, target, replacement) {
    let content = fs.readFileSync(filePath, 'utf8');
    const isCRLF = content.includes('\r\n');
    const normContent = content.replace(/\r\n/g, '\n');
    const normTarget = target.replace(/\r\n/g, '\n');
    const normReplacement = replacement.replace(/\r\n/g, '\n');

    if (!normContent.includes(normTarget)) {
        console.error(`Target not found in ${filePath}`);
        return false;
    }

    let updated = normContent.replace(normTarget, normReplacement);
    if (isCRLF) {
        updated = updated.replace(/\n/g, '\r\n');
    }
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Successfully updated ${filePath}`);
    return true;
}

const lchPath = path.resolve('src/screens/LichCuaHang/LichCuaHang.js');

// 1. Declare state for Makeup tab & Google Calendar tab
const targetState = `    const [confirmThoChupHinh, setConfirmThoChupHinh] = useState("");
    const [confirmThoMakeUp, setConfirmThoMakeUp] = useState("");
    const [chupHinhSchedules, setChupHinhSchedules] = useState([]);`;

const replState = `    const [confirmThoChupHinh, setConfirmThoChupHinh] = useState("");
    const [confirmThoMakeUp, setConfirmThoMakeUp] = useState("");
    const [chupHinhSchedules, setChupHinhSchedules] = useState([]);

    // Tab Makeup & Phân công trang điểm
    const [openMakeUpDialog, setOpenMakeUpDialog] = useState(false);
    const [selectedMakeUpContract, setSelectedMakeUpContract] = useState(null);
    const [confirmMakeUpDate, setConfirmMakeUpDate] = useState("");
    const [confirmMakeUpGio, setConfirmMakeUpGio] = useState("");
    const [confirmMakeUpLocation, setConfirmMakeUpLocation] = useState("");
    const [confirmMakeUpStaff, setConfirmMakeUpStaff] = useState("");
    const [confirmMakeUpNote, setConfirmMakeUpNote] = useState("");
    const [makeUpScheduleItems, setMakeUpScheduleItems] = useState([]);

    // Tab Lịch tổng hợp (Google Calendar)
    const [allLichSoanDo, setAllLichSoanDo] = useState([]);
    const [calendarCategoryFilter, setCalendarCategoryFilter] = useState('all');
    const [selectedDayModal, setSelectedDayModal] = useState(null);`;

replaceNormalized(lchPath, targetState, replState);

// 2. Update loadHopDong for makeUp & tongHop
const targetLoadHD = `        if (tabVal === 'hauKy') {
            dateField = 'cacNgay.ngayChinhAnh';
            targetStage = [2, 3];
        } else if (tabVal === 'inAnh') {
            dateField = 'cacNgay.ngayTraAnh';
            targetStage = [3, 4];
        } else if (tabVal === 'anHoiVaCuoi') {
            dateField = 'anHoiVaCuoi';
            targetStage = 'all';
        }`;

const replLoadHD = `        if (tabVal === 'makeUp') {
            dateField = 'makeUp';
            targetStage = 'all';
        } else if (tabVal === 'hauKy') {
            dateField = 'cacNgay.ngayChinhAnh';
            targetStage = [2, 3];
        } else if (tabVal === 'inAnh') {
            dateField = 'cacNgay.ngayTraAnh';
            targetStage = [3, 4];
        } else if (tabVal === 'anHoiVaCuoi') {
            dateField = 'anHoiVaCuoi';
            targetStage = 'all';
        } else if (tabVal === 'tongHop') {
            dateField = 'tongHop';
            targetStage = 'all';
            otherService.findAllLichSoanDo({})
                .then(res => {
                    if (res.data?.lichSoanDo) setAllLichSoanDo(res.data.lichSoanDo);
                })
                .catch(() => {});
        }`;

replaceNormalized(lchPath, targetLoadHD, replLoadHD);

// 3. Update filteredHopDong for makeUp tab
const targetFiltered = `        if (activeTab === 'hauKy' && hauKyStatusFilter !== 'all') {
            rawList = rawList.filter(hd => {
                const info = getContractStatusInfo(hd);
                return info.subStage === hauKyStatusFilter;
            });
        }
        return rawList;`;

const replFiltered = `        if (activeTab === 'hauKy' && hauKyStatusFilter !== 'all') {
            rawList = rawList.filter(hd => {
                const info = getContractStatusInfo(hd);
                return info.subStage === hauKyStatusFilter;
            });
        }
        if (activeTab === 'makeUp') {
            rawList = rawList.filter(hd => {
                const hasScheduleMake = (hd.serviceSchedules || []).some(s => s.serviceType === 'makeup');
                const hasLichMake = (hd.lichTrangDiem || []).length > 0;
                const hasNgayMake = !!hd.cacNgay?.ngayTrangDiem;
                const hasThoMake = !!hd.nguoiPhucVu?.thoMakeUp;
                return hasScheduleMake || hasLichMake || hasNgayMake || hasThoMake;
            });
        }
        return rawList;`;

replaceNormalized(lchPath, targetFiltered, replFiltered);

// 4. Update handleRowClick for makeUp tab
const targetRowClickMake = `            setOpenChupHinhDialog(true);
        } else if (activeTab === 'hauKy') {`;

const replRowClickMake = `            setOpenChupHinhDialog(true);
        } else if (activeTab === 'makeUp') {
            setSelectedMakeUpContract(hd);
            setConfirmMakeUpStaff(hd.nguoiPhucVu?.thoMakeUp || "");
            setConfirmMakeUpLocation(hd.cacNgay?.diaDiemTrangDiem || "Tại Studio");
            setConfirmMakeUpDate(formatDateTimeInput(hd.cacNgay?.ngayTrangDiem) || "");
            setConfirmMakeUpGio(hd.cacNgay?.gioTrangDiem || "");
            setConfirmMakeUpNote(hd.ghiChu || "");

            let makeItems = [];
            if (Array.isArray(hd.serviceSchedules) && hd.serviceSchedules.length > 0) {
                makeItems = hd.serviceSchedules.filter(s => s.serviceType === 'makeup').map((s, idx) => ({ ...s, luot: s.luot || idx + 1 }));
            } else if (Array.isArray(hd.lichTrangDiem) && hd.lichTrangDiem.length > 0) {
                makeItems = hd.lichTrangDiem.map((mk, idx) => ({
                    id: mk.id || \`mk-\${idx}-\${Date.now()}\`,
                    serviceId: mk.dichVuId || 'MANUAL_MAKEUP',
                    serviceName: mk.tenDichVu || 'Trang điểm',
                    serviceType: 'makeup',
                    luot: idx + 1,
                    ngayGio: mk.ngayTrangDiem || mk.ngay,
                    diaDiem: mk.diaDiem || hd.cacNgay?.diaDiemTrangDiem || 'Tại Studio',
                    nhanVien: mk.thoMakeUp || hd.nguoiPhucVu?.thoMakeUp || '',
                    ghiChu: mk.ghiChu || ''
                }));
            }
            if (makeItems.length === 0 && (hd.cacNgay?.ngayTrangDiem || hd.nguoiPhucVu?.thoMakeUp)) {
                makeItems = [{
                    id: \`mk-single-\${Date.now()}\`,
                    serviceId: 'MANUAL_MAKEUP',
                    serviceName: 'Trang điểm',
                    serviceType: 'makeup',
                    luot: 1,
                    ngayGio: hd.cacNgay?.ngayTrangDiem,
                    diaDiem: hd.cacNgay?.diaDiemTrangDiem || 'Tại Studio',
                    nhanVien: hd.nguoiPhucVu?.thoMakeUp || '',
                    ghiChu: ''
                }];
            }
            setMakeUpScheduleItems(makeItems);
            setOpenMakeUpDialog(true);
        } else if (activeTab === 'hauKy') {`;

replaceNormalized(lchPath, targetRowClickMake, replRowClickMake);

// 5. Add handleUpdateMakeUp handler
const targetMakeHandler = `    const handleUpdateChupHinh = (shouldTransitionToHauKy = false) => {`;

const replMakeHandler = `    const handleUpdateMakeUp = () => {
        if (!selectedMakeUpContract) return;
        showLoading("Đang cập nhật lịch makeup...");

        let updatedServiceSchedules = [...(selectedMakeUpContract.serviceSchedules || [])];
        updatedServiceSchedules = updatedServiceSchedules.filter(s => s.serviceType !== 'makeup');
        updatedServiceSchedules = [...updatedServiceSchedules, ...makeUpScheduleItems];

        const firstMake = makeUpScheduleItems[0] || null;
        const newNgayTrangDiem = firstMake ? (firstMake.ngayGio ? new Date(firstMake.ngayGio).toISOString() : null) : (confirmMakeUpDate ? new Date(confirmMakeUpDate).toISOString() : null);
        const newThoMakeUp = firstMake ? (firstMake.nhanVien || confirmMakeUpStaff) : confirmMakeUpStaff;
        const newDiaDiemTrangDiem = firstMake ? (firstMake.diaDiem || confirmMakeUpLocation) : confirmMakeUpLocation;

        const payload = {
            _id: selectedMakeUpContract._id,
            maHopDong: selectedMakeUpContract.maHopDong,
            serviceSchedules: updatedServiceSchedules,
            lichTrangDiem: makeUpScheduleItems.map((mk, idx) => ({
                id: mk.id,
                dichVuId: mk.serviceId || "",
                tenDichVu: mk.serviceName || \`Trang điểm lượt \${idx + 1}\`,
                luot: mk.luot || idx + 1,
                ngayTrangDiem: mk.ngayGio ? new Date(mk.ngayGio).toISOString() : null,
                diaDiem: mk.diaDiem || "Tại Studio",
                thoMakeUp: mk.nhanVien || "",
                ghiChu: mk.ghiChu || ""
            })),
            cacNgay: {
                ...selectedMakeUpContract.cacNgay,
                ngayTrangDiem: newNgayTrangDiem,
                diaDiemTrangDiem: newDiaDiemTrangDiem
            },
            nguoiPhucVu: {
                ...selectedMakeUpContract.nguoiPhucVu,
                thoMakeUp: newThoMakeUp
            },
            newAuditEntry: {
                action: "Cập nhật & Phân công lịch makeup",
                reason: \`Phân công thợ makeup: \${newThoMakeUp || 'Chưa gán'}. Gồm \${makeUpScheduleItems.length} ca makeup.\`,
                performedBy: user?.tenNhanVien || user?.fullname || user?.username || "Nhân viên",
                timestamp: new Date().toISOString()
            }
        };

        otherService.UPDATE_HOPDONG(payload)
            .then(() => {
                toast.success("Cập nhật lịch makeup thành công!");
                setOpenMakeUpDialog(false);
                setSelectedMakeUpContract(null);
                loadHopDong(activeTab, selectedTime?.id, searchInput);
                hideLoading();
            })
            .catch((err) => {
                console.error(err);
                toast.error("Lỗi cập nhật lịch makeup: " + (err.response?.data?.message || err.message));
                hideLoading();
            });
    };

    const handleUpdateChupHinh = (shouldTransitionToHauKy = false) => {`;

replaceNormalized(lchPath, targetMakeHandler, replMakeHandler);

console.log('Finished Step 1 updates for LichCuaHang.js');

