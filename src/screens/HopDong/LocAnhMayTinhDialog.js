import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Button, Typography,
    RadioGroup, FormControlLabel, Radio, TextField, Select, MenuItem, Box,
    IconButton, LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'sonner';
import axios from 'axios';

const adminApiUrl = process.env.REACT_APP_ADMIN_API_URL || 'http://192.168.1.10:8386';

export default function LocAnhMayTinhDialog({ open, onClose, albumData }) {
    const [filterType, setFilterType] = useState('heart'); // 'manual' | 'heart' | 'comment'
    const [fileListStr, setFileListStr] = useState('');
    const [fileExtension, setFileExtension] = useState('All');
    
    const [sourceDir, setSourceDir] = useState(null);
    const [destDir, setDestDir] = useState(null);
    
    const [isFiltering, setIsFiltering] = useState(false);
    const [progress, setProgress] = useState(0);
    const [totalFiles, setTotalFiles] = useState(0);
    const [copiedFiles, setCopiedFiles] = useState(0);

    useEffect(() => {
        if (!albumData || !albumData.danhSachAnh) return;
        
        let files = [];
        if (filterType === 'heart') {
            files = albumData.danhSachAnh.filter(a => a.isHearted).map(a => a.tenFile);
        } else if (filterType === 'comment') {
            files = albumData.danhSachAnh.filter(a => a.comments && a.comments.length > 0).map(a => a.tenFile);
        }
        
        if (filterType !== 'manual') {
            const baseNames = files.map(f => {
                const lastDot = f.lastIndexOf('.');
                if (lastDot > -1) return f.substring(0, lastDot);
                return f;
            });
            setFileListStr(baseNames.join(','));
        }
    }, [filterType, albumData]);

    const handleSelectSourceDir = async () => {
        try {
            const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
            setSourceDir(dirHandle);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectDestDir = async () => {
        try {
            const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            setDestDir(dirHandle);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStartFilter = async () => {
        if (!sourceDir || !destDir) {
            toast.error("Vui lòng chọn thư mục nguồn và đích!");
            return;
        }
        if (!fileListStr.trim()) {
            toast.error("Chưa có danh sách file cần lọc!");
            return;
        }

        const requestedNames = fileListStr.split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(s => {
                const lastDot = s.lastIndexOf('.');
                return lastDot > -1 ? s.substring(0, lastDot).toLowerCase() : s.toLowerCase();
            });

        if (requestedNames.length === 0) {
            toast.error("Không có file nào hợp lệ để lọc.");
            return;
        }

        setIsFiltering(true);
        setTotalFiles(requestedNames.length);
        setCopiedFiles(0);
        setProgress(0);

        try {
            let foundCount = 0;
            for await (const entry of sourceDir.values()) {
                if (entry.kind === 'file') {
                    const fileName = entry.name;
                    const lastDot = fileName.lastIndexOf('.');
                    const baseName = lastDot > -1 ? fileName.substring(0, lastDot).toLowerCase() : fileName.toLowerCase();
                    const ext = lastDot > -1 ? fileName.substring(lastDot + 1).toLowerCase() : '';

                    if (requestedNames.includes(baseName)) {
                        if (fileExtension !== 'All') {
                            if (ext !== fileExtension.toLowerCase()) {
                                continue;
                            }
                        }

                        try {
                            const fileData = await entry.getFile();
                            const destFileHandle = await destDir.getFileHandle(fileName, { create: true });
                            const writable = await destFileHandle.createWritable();
                            await writable.write(fileData);
                            await writable.close();
                            
                            foundCount++;
                            setCopiedFiles(foundCount);
                            setProgress(Math.round((foundCount / requestedNames.length) * 100));
                        } catch (err) {
                            console.error(`Error copying ${fileName}:`, err);
                        }
                    }
                }
            }
            
            toast.success(`Đã lọc xong ${foundCount}/${requestedNames.length} file ảnh!`);
            
            // LOGGING ACTION
            try {
                const username = localStorage.getItem("username") || "Unknown User";
                await axios.post(`${adminApiUrl}/api/log`, {
                    action: "Lọc ảnh máy tính",
                    user: username,
                    details: {
                        filterType,
                        fileExtension,
                        totalRequested: requestedNames.length,
                        foundCount
                    }
                });
            } catch (logErr) {
                console.error("Failed to save log:", logErr);
            }

        } catch (err) {
            console.error(err);
            toast.error("Có lỗi xảy ra trong quá trình lọc file hoặc người dùng hủy bỏ.");
        } finally {
            setIsFiltering(false);
        }
    };

    return (
        <Dialog open={open} onClose={!isFiltering ? onClose : undefined} maxWidth="xs" fullWidth PaperProps={{ style: { borderRadius: 16 } }}>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" style={{ color: '#d32f2f', fontWeight: 'bold' }}>Lọc ảnh trên máy tính</Typography>
                    {!isFiltering && (
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" style={{ marginBottom: 10, color: '#333' }}>Vui lòng chọn mục bạn muốn lọc</Typography>
                <RadioGroup value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <FormControlLabel value="manual" control={<Radio sx={{ color: '#4caf50', '&.Mui-checked': { color: '#4caf50' } }} />} label={<Typography variant="body2">Tự nhập...</Typography>} />
                    <FormControlLabel value="heart" control={<Radio sx={{ color: '#4caf50', '&.Mui-checked': { color: '#4caf50' } }} />} label={<Typography variant="body2">Ảnh yêu thích</Typography>} />
                    <FormControlLabel value="comment" control={<Radio sx={{ color: '#4caf50', '&.Mui-checked': { color: '#4caf50' } }} />} label={<Typography variant="body2">Ảnh có bình luận</Typography>} />
                    <FormControlLabel value="tag" control={<Radio disabled />} label={<span style={{ color: '#bdbdbd', fontSize: '0.875rem' }}>Ảnh có tag</span>} />
                </RadioGroup>

                <Box mt={2} mb={2}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={fileListStr}
                        onChange={(e) => {
                            if (filterType === 'manual') setFileListStr(e.target.value);
                        }}
                        disabled={filterType !== 'manual' || isFiltering}
                        style={{ backgroundColor: '#f5f5f5', borderRadius: 8 }}
                        InputProps={{ style: { fontSize: '0.875rem', color: '#555' } }}
                    />
                </Box>

                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Định dạng file muốn lọc</Typography>
                    <Select
                        value={fileExtension}
                        onChange={(e) => setFileExtension(e.target.value)}
                        size="small"
                        disabled={isFiltering}
                        style={{ minWidth: 120, border: '1px solid #4caf50', borderRadius: 4, height: 36 }}
                        sx={{ '.MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                    >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="JPG">JPG</MenuItem>
                        <MenuItem value="JPEG">JPEG</MenuItem>
                        <MenuItem value="CR3">CR3</MenuItem>
                        <MenuItem value="CR2">CR2</MenuItem>
                        <MenuItem value="ARW">ARW</MenuItem>
                        <MenuItem value="NEF">NEF</MenuItem>
                    </Select>
                </Box>

                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Chọn thư mục chứa ảnh cần lọc</Typography>
                    <Button 
                        variant="contained" 
                        size="small" 
                        style={{ backgroundColor: '#e91e63', minWidth: 140, textTransform: 'none', borderRadius: 6 }}
                        onClick={handleSelectSourceDir}
                        disabled={isFiltering}
                    >
                        {sourceDir ? 'Đã chọn' : 'Chọn thư mục'}
                    </Button>
                </Box>

                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Chọn thư mục chứa ảnh sau khi lọc</Typography>
                    <Button 
                        variant="contained" 
                        size="small" 
                        style={{ backgroundColor: '#e91e63', minWidth: 140, textTransform: 'none', borderRadius: 6 }}
                        onClick={handleSelectDestDir}
                        disabled={isFiltering}
                    >
                        {destDir ? 'Đã chọn' : 'Chọn thư mục'}
                    </Button>
                </Box>

                {isFiltering && (
                    <Box mt={2}>
                        <Typography variant="caption" mb={1} display="block">Đang sao chép: {copiedFiles} / {totalFiles} ảnh</Typography>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                )}

                <Box mt={3} display="flex" justifyContent="center">
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleStartFilter}
                        disabled={isFiltering}
                        style={{ backgroundColor: '#3b82f6', textTransform: 'none', borderRadius: 8, padding: '8px 24px', fontSize: '0.9rem', fontWeight: 'bold' }}
                    >
                        Bắt đầu lọc
                    </Button>
                </Box>

                <Box mt={2} textAlign="center">
                    <Typography variant="caption" style={{ color: '#999' }}>
                        Tính năng này chỉ hoạt động tốt nhất trên trình duyệt Chrome và Edge
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
