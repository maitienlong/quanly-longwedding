import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";


const AppDialog = ({ isOpen, onClose, title, children, width = 700 }) => {
    if (!isOpen) return null;

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div
                className="dialog-container"
                style={{ maxWidth: width }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="dialog-header">
                    <h3>{title}</h3>
                    <button className="dialog-close-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="dialog-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AppDialog;
