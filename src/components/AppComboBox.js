import "./comon.css";
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronDown } from "@fortawesome/free-solid-svg-icons";

const AppComboBox = ({
    options = [], // Danh sách: [{ value: 1, label: 'Option 1' }]
    value,
    onChange,
    placeholder = "Chọn hoặc tìm kiếm...",
    width = "260px"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Lọc options dựa trên search term
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Lấy label của item đang được chọn để hiển thị vào input
    const selectedLabel = options.find(opt => opt.value === value)?.label || "";

    const handleSelect = (option) => {
        onChange(option.value);
        setSearchTerm(""); // Reset tìm kiếm sau khi chọn
        setIsOpen(false);
    };

    return (
        <div className="app-combobox" style={{ width }} ref={containerRef}>
            <div 
                className={`search-pill combobox-control ${isOpen ? "focused" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <input
                    type="text"
                    value={isOpen ? searchTerm : selectedLabel}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    onFocus={() => setIsOpen(true)}
                />
                <FontAwesomeIcon 
                    icon={faChevronDown} 
                    style={{ fontSize: '12px', color: '#ccc', marginLeft: 'auto' }} 
                />
            </div>

            {isOpen && (
                <div className="combobox-dropdown">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <div
                                key={opt.value}
                                className={`combobox-item ${value === opt.value ? "selected" : ""}`}
                                onClick={() => handleSelect(opt)}
                            >
                                {opt.label}
                            </div>
                        ))
                    ) : (
                        <div className="combobox-no-results">Không tìm thấy kết quả</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AppComboBox;