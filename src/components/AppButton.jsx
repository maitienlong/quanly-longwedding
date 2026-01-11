import "./comon.css";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AppButton = ({
    children,
    onClick,
    type = "button",
    variant = "primary", // primary | secondary | outline | danger
    icon,
    disabled = false,
    loading = false,
    size = "md", // sm | md | lg
    width
}) => {
    return (
        <button
            type={type}
            className={`app-btn app-btn-${variant} app-btn-${size}`}
            onClick={onClick}
            disabled={disabled || loading}
            style={{ width }}
        >
            {loading ? (
                <span className="app-btn-spinner" />
            ) : (
                <>
                    {icon && <FontAwesomeIcon icon={icon} />}
                    <span>{children}</span>
                </>
            )}
        </button>
    );
};

export default AppButton;
