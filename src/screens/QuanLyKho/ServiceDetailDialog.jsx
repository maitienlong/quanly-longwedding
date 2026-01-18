import AppDialog from "../../components/AppDialog";

const ServiceDetailDialog = ({ open, onClose, service }) => {
    if (!service) return null;

    return (
        <AppDialog
            isOpen={open}
            onClose={onClose}
            title="Chi tiết dịch vụ"
            width={600}
        >
            <div className="service-detail">
                <p><b>Mã dịch vụ:</b> {service.maDichVu}</p>
                <p><b>Tên dịch vụ:</b> {service.tenDichVu}</p>

                <p><b>Tồn kho:</b> {service.tonKho}</p>
                <p><b>Mô tả:</b></p>
                <p>{service.moTa}</p>

                {service.hinhAnh && (
                    <img
                        src={typeof service.hinhAnh === "string"
                            ? service.hinhAnh
                            : URL.createObjectURL(service.hinhAnh)}
                        alt=""
                        style={{ width: "100%", borderRadius: 8, marginTop: 12 }}
                    />
                )}
            </div>
        </AppDialog>
    );
};

export default ServiceDetailDialog;
