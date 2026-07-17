import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    Box, Chip, Tooltip, IconButton, Tabs, Tab, Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import { toast } from 'sonner';
import dayjs from 'dayjs';

const adminApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8386';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            style={{ padding: 0 }}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const SystemLogs = () => {
    const [tabIndex, setTabIndex] = useState(0);

    // ==================== TAB 1: NHẬT KÝ HỆ THỐNG ====================
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${adminApiUrl}/api/log`);
            if (res.data.status === 'success') {
                setLogs(res.data.data);
            }
        } catch (error) {
            toast.error("Không thể lấy danh sách nhật ký hệ thống.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // ==================== TAB 2: KHÁCH ĐANG TRUY CẬP ====================
    const [visitors, setVisitors] = useState([]);
    
    useEffect(() => {
        const fetchRealtimeVisitors = async () => {
            try {
                const res = await axios.get(`${adminApiUrl}/api/visitors/active`);
                if (res.data && res.data.status === 'success') {
                    const formattedData = res.data.data.map(v => ({
                        ...v,
                        startTime: dayjs(v.startTime).format('DD/MM/YYYY HH:mm:ss')
                    }));
                    setVisitors(formattedData);
                }
            } catch (err) {
                console.error("Lỗi lấy dữ liệu khách truy cập:", err);
            }
        };
        
        // Gọi ngay lần đầu
        if (tabIndex === 1) {
            fetchRealtimeVisitors();
        }
        
        // Polling mỗi 10 giây nếu đang ở tab Khách truy cập
        let interval;
        if (tabIndex === 1) {
            interval = setInterval(fetchRealtimeVisitors, 10000); 
        }
        
        return () => clearInterval(interval);
    }, [tabIndex]);

    // ==================== TAB 3: IP BỊ CHẶN ====================
    const [blockedIps, setBlockedIps] = useState([]);
    const fetchBlockedIps = async () => {
        try {
            const res = await axios.get(`${adminApiUrl}/api/visitors/blocked`);
            if (res.data.status === 'success') {
                setBlockedIps(res.data.data);
            }
        } catch (err) {
            console.error("Lỗi lấy danh sách IP bị chặn:", err);
        }
    };

    useEffect(() => {
        if (tabIndex === 2) {
            fetchBlockedIps();
        }
    }, [tabIndex]);

    const handleBlockIp = async (ip) => {
        try {
            await axios.post(`${adminApiUrl}/api/visitors/block`, { ip });
            toast.success(`Đã chặn truy cập từ IP ${ip}`);
            if (tabIndex === 1) {
                const res = await axios.get(`${adminApiUrl}/api/visitors/active`);
                if (res.data && res.data.status === 'success') {
                    const formattedData = res.data.data.map(v => ({
                        ...v,
                        startTime: dayjs(v.startTime).format('DD/MM/YYYY HH:mm:ss')
                    }));
                    setVisitors(formattedData);
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi chặn IP");
        }
    };

    const handleUnblockIp = async (ip) => {
        try {
            await axios.post(`${adminApiUrl}/api/visitors/unblock`, { ip });
            toast.success(`Đã gỡ chặn IP ${ip}`);
            if (tabIndex === 2) fetchBlockedIps();
            if (tabIndex === 1) {
                const res = await axios.get(`${adminApiUrl}/api/visitors/active`);
                if (res.data && res.data.status === 'success') {
                    const formattedData = res.data.data.map(v => ({
                        ...v,
                        startTime: dayjs(v.startTime).format('DD/MM/YYYY HH:mm:ss')
                    }));
                    setVisitors(formattedData);
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi gỡ chặn IP");
        }
    };

    // ================================================================

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    BẢNG ĐIỀU KHIỂN HỆ THỐNG
                </Typography>
                <IconButton color="primary" onClick={tabIndex === 0 ? fetchLogs : null} disabled={loading}>
                    <RefreshIcon />
                </IconButton>
            </Box>

            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f9fa' }}>
                    <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} aria-label="system tabs">
                        <Tab label="Nhật Ký Hoạt Động" sx={{ fontWeight: 'bold' }} />
                        <Tab 
                            label={
                                <Box display="flex" alignItems="center">
                                    Khách Đang Truy Cập
                                    <Box 
                                        sx={{ 
                                            ml: 1, width: 8, height: 8, borderRadius: '50%', 
                                            bgcolor: '#4caf50', animation: 'blink 1.5s infinite' 
                                        }} 
                                    />
                                    <Typography variant="caption" sx={{ ml: 1, bgcolor: '#e3f2fd', color: '#1976d2', px: 1, borderRadius: 2, fontWeight: 'bold' }}>
                                        {visitors.length}
                                    </Typography>
                                </Box>
                            } 
                            sx={{ fontWeight: 'bold' }} 
                        />
                        <Tab label="IP Bị Chặn" sx={{ fontWeight: 'bold' }} />
                    </Tabs>
                </Box>

                {/* TAB 1: NHẬT KÝ HỆ THỐNG */}
                <CustomTabPanel value={tabIndex} index={0}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Người thực hiện</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Thiết bị (User-Agent)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Chi tiết</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">Không có dữ liệu.</TableCell>
                                    </TableRow>
                                )}
                                {loading && logs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">Đang tải...</TableCell>
                                    </TableRow>
                                )}
                                {(rowsPerPage > 0
                                    ? logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    : logs
                                ).map((log) => (
                                    <TableRow key={log._id} hover>
                                        <TableCell>{dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}</TableCell>
                                        <TableCell>
                                            <Chip label={log.user} color="secondary" size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="500" color="textSecondary">
                                                {log.action}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Tooltip title={log.deviceInfo || 'Unknown'}>
                                                <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {log.deviceInfo || 'Unknown'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={log.details ? JSON.stringify(log.details, null, 2) : 'Không có'}>
                                                <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', color: '#1976d2' }}>
                                                    {log.details ? JSON.stringify(log.details) : 'N/A'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={logs.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Số dòng mỗi trang:"
                        />
                    </TableContainer>
                </CustomTabPanel>

                {/* TAB 2: KHÁCH ĐANG TRUY CẬP */}
                <CustomTabPanel value={tabIndex} index={1}>

                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Thời gian truy cập</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Địa chỉ IP</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Thiết bị</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Trang đang xem</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {visitors.map((v) => (
                                    <TableRow key={v.id} hover>
                                        <TableCell>
                                            <Chip label={v.isBlocked ? "Bị chặn" : "Online"} color={v.isBlocked ? "error" : "success"} size="small" />
                                        </TableCell>
                                        <TableCell>{v.startTime}</TableCell>
                                        <TableCell>{v.ip}</TableCell>
                                        <TableCell>{v.device}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
                                                {v.page}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {v.isBlocked ? (
                                                <Button size="small" variant="contained" color="success" onClick={() => handleUnblockIp(v.ip)}>Gỡ chặn</Button>
                                            ) : (
                                                <Button size="small" variant="outlined" color="error" onClick={() => handleBlockIp(v.ip)}>Chặn IP</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CustomTabPanel>

                {/* TAB 3: IP BỊ CHẶN */}
                <CustomTabPanel value={tabIndex} index={2}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ backgroundColor: '#ffebee' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Địa chỉ IP</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Ngày bị chặn</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Lý do</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {blockedIps.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">Chưa có IP nào bị chặn.</TableCell>
                                    </TableRow>
                                )}
                                {blockedIps.map((b) => (
                                    <TableRow key={b._id} hover>
                                        <TableCell>{b.ip}</TableCell>
                                        <TableCell>{dayjs(b.blockedAt).format('DD/MM/YYYY HH:mm:ss')}</TableCell>
                                        <TableCell>{b.reason}</TableCell>
                                        <TableCell>
                                            <Button size="small" variant="contained" color="success" onClick={() => handleUnblockIp(b.ip)}>Gỡ chặn</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CustomTabPanel>

            </Paper>

            <style>
                {`
                @keyframes blink {
                    0% { opacity: 0.3; }
                    50% { opacity: 1; box-shadow: 0 0 5px #4caf50; }
                    100% { opacity: 0.3; }
                }
                `}
            </style>
        </Container>
    );
};

export default SystemLogs;
