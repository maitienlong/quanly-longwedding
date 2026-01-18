import React, { createContext, useContext, useState, useEffect } from "react";
import ModalPortal from "./ModalPortal";
import ModalRenderer from "./ModalRenderer";
import ModalContainer from "./ModalContainer";

const ModalContext = createContext();

export function ModalProvider({ children }) {
    const [modal, setModal] = useState({
        isOpen: false,
        type: null,
        props: null
    });

    const openModal = (type, props = {}) => {
        setModal({ isOpen: true, type, props });
    };

    const closeModal = () => {
        setModal({ isOpen: false, type: null, props: null });
    };

    /* ESC đóng modal */
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeModal();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}

            <ModalPortal>
                <ModalContainer isOpen={modal.isOpen} onClose={closeModal}>
                    <ModalRenderer
                        type={modal.type}
                        props={modal.props}
                        onClose={closeModal}
                    />
                </ModalContainer>
            </ModalPortal>
        </ModalContext.Provider>
    );
}

export const useModal = () => useContext(ModalContext);
