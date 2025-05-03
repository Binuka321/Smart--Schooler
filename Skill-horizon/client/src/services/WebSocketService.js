import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = new Map();
    }

    connect(onConnect, onError) {
        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = Stomp.over(socket);
        this.stompClient.connect({}, onConnect, onError);
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect();
        }
    }

    subscribeToNotifications(userId, callback) {
        if (this.stompClient) {
            const subscription = this.stompClient.subscribe(
                `/user/${userId}/queue/notifications`,
                (message) => {
                    const notification = JSON.parse(message.body);
                    callback(notification);
                }
            );
            this.subscriptions.set(userId, subscription);
        }
    }

    unsubscribeFromNotifications(userId) {
        const subscription = this.subscriptions.get(userId);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(userId);
        }
    }
}

export default new WebSocketService(); 