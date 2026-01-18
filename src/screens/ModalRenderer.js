import ThemHopDongDialog from "./HopDong/ThemHopDongDialog";

export default function ModalRenderer({ type, props, onClose }) {
    switch (type) {
        case "ADD_HOP_DONG":
            return (
                <ThemHopDongDialog
                    mode="add"
                    onClose={onClose}
                    {...props}
                />
            );

        case "VIEW_HOP_DONG":
            return (
                <ThemHopDongDialog
                    mode="view"
                    data={props.data}
                    onClose={onClose}
                />
            );

        default:
            return null;
    }
}
