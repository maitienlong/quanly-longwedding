import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8386';

let socketInstance = null;

export const getPaymentSocket = () => {
    if (!socketInstance) {
        socketInstance = io(API_URL, {
            auth: (cb) => {
                const token = localStorage.getItem("access_token");
                cb({ token });
            },
            transports: ['websocket', 'polling'],
            autoConnect: false, // Kết nối khi bắt đầu thanh toán
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000
        });

        socketInstance.on('connect', () => {
            console.log('⚡ [PaymentSocket] Connected to backend WebSocket:', socketInstance.id);
        });

        socketInstance.on('disconnect', () => {
            console.log('🔌 [PaymentSocket] Disconnected from backend WebSocket');
        });
    }
    return socketInstance;
};

export default getPaymentSocket;
