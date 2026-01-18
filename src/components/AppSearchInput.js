import "./comon.css";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const AppSearchInput = ({
    value,
    onChange,
    placeholder = "Tìm kiếm tên hoặc mã số",
    width = "260px",
    onEnter,
    onFocus
}) => {

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            onEnter?.(value);
        }
    };

    return (
        <div
            className="search-pill"
            style={{ width }}
        >
            <FontAwesomeIcon icon={faSearch} className="search-pill-icon" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                onFocus={onFocus}
            />
        </div>
    );
};

export default AppSearchInput;
