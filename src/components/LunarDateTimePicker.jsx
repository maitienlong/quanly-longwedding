import React, { useMemo } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { usePickerLayout } from '@mui/x-date-pickers/PickersLayout';
import { Box, Typography, Chip } from '@mui/material';
import 'dayjs/locale/vi';
import { getLunarDate, getDetailedLunarInfo } from '../utils/lunarDateUtils';
import { evaluateWeddingDate } from '../utils/weddingDateUtils';

/**
 * Định dạng tiêu đề thứ trong tuần tiếng Việt: T2, T3, T4, T5, T6, T7, CN
 * Khắc phục cơ chế mặc định của MUI x-date-pickers lấy charAt(0) khiến các thứ chỉ hiển thị mỗi chữ "T" và "C".
 */
const defaultDayOfWeekFormatter = (date) => {
    if (!date) return '';
    const VI_WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    if (typeof date.day === 'function') {
        return VI_WEEKDAYS[date.day()];
    }
    if (typeof date.getDay === 'function') {
        return VI_WEEKDAYS[date.getDay()];
    }
    if (typeof date.format === 'function') {
        return date.format('dd');
    }
    return String(date);
};

/**
 * Component hiển thị từng ngày trong lịch: Có ngày Dương ở trên và ngày Âm ở dưới
 */
function LunarPickersDay(props) {
    const { day, outsideCurrentMonth, selected, ...other } = props;

    const lunar = useMemo(() => {
        if (!day || outsideCurrentMonth) return null;
        return getLunarDate(day.toDate());
    }, [day, outsideCurrentMonth]);

    const isSpecialLunar = lunar && (lunar.day === 1 || lunar.day === 15);

    return (
        <PickersDay
            {...other}
            day={day}
            outsideCurrentMonth={outsideCurrentMonth}
            selected={selected}
            sx={{
                width: 34,
                height: 34,
                margin: '1px',
                borderRadius: '6px',
                position: 'relative',
                transition: 'all 0.15s ease',
                '&:hover': {
                    bgcolor: '#e0f2fe'
                },
                '&.Mui-selected': {
                    bgcolor: '#0284c7 !important',
                    color: '#ffffff !important',
                    fontWeight: 700
                },
                '&.MuiPickersDay-today': {
                    borderColor: '#0284c7'
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.05 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: selected ? 800 : 600 }}>
                    {day.date()}
                </span>
                {lunar && !outsideCurrentMonth && (
                    <span
                        style={{
                            fontSize: '0.54rem',
                            fontWeight: isSpecialLunar ? 700 : 500,
                            color: selected ? '#ffffff' : (isSpecialLunar ? '#e11d48' : '#64748b'),
                            marginTop: '0.5px'
                        }}
                    >
                        {lunar.day === 1 ? `${lunar.day}/${lunar.month}` : lunar.day}
                    </span>
                )}
            </Box>
        </PickersDay>
    );
}

/**
 * Side panel hiển thị thông tin Lịch Âm & Phong thủy bên cạnh Picker
 */
function LunarSidePanel({ selectedDate }) {
    const info = useMemo(() => {
        if (!selectedDate) return null;
        const jsDate = selectedDate.toDate ? selectedDate.toDate() : new Date(selectedDate);
        if (isNaN(jsDate.getTime())) return null;

        const lunarDetails = getDetailedLunarInfo(jsDate);
        const weddingEval = evaluateWeddingDate(jsDate);

        return {
            lunarDetails,
            weddingEval
        };
    }, [selectedDate]);

    if (!info || !info.lunarDetails) {
        return (
            <Box
                sx={{
                    width: { xs: '100%', md: 210 },
                    p: 1.5,
                    bgcolor: '#f8fafc',
                    borderLeft: { md: '1px solid #e2e8f0' },
                    borderTop: { xs: '1px solid #e2e8f0', md: 'none' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#94a3b8',
                    textAlign: 'center'
                }}
            >
                <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🌙</span>
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.72rem' }}>
                    Chọn ngày trên lịch để xem Lịch Âm & Phong thủy bên cạnh
                </Typography>
            </Box>
        );
    }

    const { lunarDetails, weddingEval } = info;

    return (
        <Box
            sx={{
                width: { xs: '100%', md: 210 },
                p: 1.2,
                bgcolor: '#f8fafc',
                borderLeft: { md: '1px solid #e2e8f0' },
                borderTop: { xs: '1px solid #e2e8f0', md: 'none' },
                display: 'flex',
                flexDirection: 'column',
                gap: 0.8
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, borderBottom: '1px solid #e2e8f0', pb: 0.5 }}>
                <span style={{ fontSize: '1rem' }}>🌙</span>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.78rem' }}>
                    LỊCH ÂM BÊN CẠNH
                </Typography>
            </Box>

            <Box sx={{ bgcolor: '#ffffff', p: 0.8, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', fontSize: '0.68rem' }}>
                    Ngày Âm lịch:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#e11d48', fontSize: '0.82rem', lineHeight: 1.2 }}>
                    {lunarDetails.fullLunarStr}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, fontSize: '0.72rem' }}>
                <div style={{ color: '#334155', lineHeight: 1.25 }}>
                    <strong>Can Chi:</strong> {lunarDetails.dayName}, th.{lunarDetails.monthName}, n.{lunarDetails.yearName}
                </div>

                {weddingEval && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                        <Chip
                            size="small"
                            label={weddingEval.hoangDao?.isHoangDao ? "✨ Hoàng Đạo" : "Hắc Đạo"}
                            sx={{
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                height: 20,
                                bgcolor: weddingEval.hoangDao?.isHoangDao ? '#fef3c7' : '#f1f5f9',
                                color: weddingEval.hoangDao?.isHoangDao ? '#b45309' : '#64748b'
                            }}
                        />
                        <Chip
                            size="small"
                            label={`Trực ${weddingEval.truc?.trucName || ''}`}
                            sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20, bgcolor: '#e0f2fe', color: '#0369a1' }}
                        />
                    </div>
                )}

                {lunarDetails.solarTerm && (
                    <div style={{ color: '#059669', fontSize: '0.7rem', lineHeight: 1.2 }}>
                        🌿 Tiết khí: <strong>{lunarDetails.solarTerm}</strong>
                    </div>
                )}

                {lunarDetails.luckyHoursStr && (
                    <Box sx={{ mt: 0.2, pt: 0.4, borderTop: '1px dashed #cbd5e1' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '0.68rem' }}>
                            ⏰ Giờ Hoàng Đạo:
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600, display: 'block', lineHeight: 1.2, fontSize: '0.68rem' }}>
                            {lunarDetails.luckyHoursStr}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

/**
 * Custom Picker Layout: Hiển thị SidePanel Lịch Âm ngay bên cạnh calendar
 */
function LunarPickerLayout(props) {
    const { toolbar, tabs, content, actionBar, shortcuts } = usePickerLayout(props);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
            {toolbar}
            {tabs}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch' }}>
                <Box
                    sx={{
                        flex: 1,
                        '& .MuiDateCalendar-root': {
                            width: 270,
                            height: 'auto',
                            maxHeight: 'none',
                            overflow: 'hidden'
                        },
                        '& .MuiPickersCalendarHeader-root': {
                            minHeight: 38,
                            maxHeight: 38,
                            marginTop: 0.5,
                            marginBottom: 0.5,
                            paddingLeft: 1.5,
                            paddingRight: 1
                        },
                        '& .MuiPickersCalendarHeader-label': {
                            fontSize: '0.86rem',
                            fontWeight: 700
                        },
                        '& .MuiDayCalendar-header': {
                            justifyContent: 'center',
                            margin: '0'
                        },
                        '& .MuiDayCalendar-weekDayLabel': {
                            width: 34,
                            height: 24,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#475569',
                            margin: '0 1px'
                        },
                        '& .MuiDayCalendar-weekDayLabel:last-child': {
                            color: '#e11d48'
                        },
                        '& .MuiPickersSlideTransition-root': {
                            minHeight: 205,
                            overflow: 'hidden'
                        },
                        '& .MuiDayCalendar-monthContainer': {
                            minHeight: 'unset',
                            position: 'relative'
                        },
                        '& .MuiDayCalendar-weekContainer': {
                            margin: '1px 0',
                            justifyContent: 'center'
                        },
                        '& .MuiMultiSectionDigitalClock-root': {
                            maxHeight: 270,
                            overflowY: 'auto'
                        },
                        '& .MuiTimeClock-root': {
                            maxHeight: 270
                        }
                    }}
                >
                    {content}
                </Box>
                <LunarSidePanel selectedDate={props.value} />
            </Box>
            {shortcuts}
            {actionBar}
        </Box>
    );
}

/**
 * Component DateTimePicker có tích hợp Lịch Âm bên cạnh và số âm trong từng ô ngày
 */
export default function LunarDateTimePicker(props) {
    const { 
        slotProps = {}, 
        slots = {}, 
        dayOfWeekFormatter = defaultDayOfWeekFormatter, 
        ...restProps 
    } = props;

    // Popper modifiers chung để đảm bảo tự động lật lên trên (top-start) khi input ở dưới
    const popperModifiers = [
        {
            name: 'flip',
            enabled: true,
            options: {
                fallbackPlacements: ['top-start', 'top', 'bottom-start', 'bottom'],
                altAxis: false, // Quan trọng: không chặn lật khi chiều rộng popper lớn hơn input
                boundary: 'viewport',
                rootBoundary: 'viewport',
                padding: 10,
            },
        },
        {
            name: 'preventOverflow',
            enabled: true,
            options: {
                boundary: 'viewport',
                rootBoundary: 'viewport',
                altAxis: true,
                tether: false,
                padding: 10,
            },
        },
    ];

    return (
        <DateTimePicker
            {...restProps}
            dayOfWeekFormatter={dayOfWeekFormatter}
            slots={{
                day: LunarPickersDay,
                layout: LunarPickerLayout,
                ...slots
            }}
            slotProps={{
                ...slotProps,
                dayCalendar: {
                    dayOfWeekFormatter,
                    ...(slotProps.dayCalendar || {})
                },
                layout: {
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden'
                    },
                    ...(slotProps.layout || {})
                },
                desktopPaper: {
                    sx: {
                        borderRadius: '14px',
                        boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
                        border: '1px solid #cbd5e1',
                        maxHeight: 'calc(100vh - 24px)',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    },
                    ...(slotProps.desktopPaper || {})
                },
                popper: {
                    placement: 'bottom-start',
                    popperOptions: {
                        strategy: 'fixed',
                        modifiers: popperModifiers,
                    },
                    modifiers: popperModifiers,
                    sx: {
                        zIndex: 99999,
                        '& .MuiPaper-root': {
                            borderRadius: '14px',
                            boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
                            border: '1px solid #cbd5e1',
                            maxHeight: 'calc(100vh - 24px)',
                            overflowY: 'auto',
                            overflowX: 'hidden'
                        }
                    },
                    ...(slotProps.popper || {})
                }
            }}
        />
    );
}
