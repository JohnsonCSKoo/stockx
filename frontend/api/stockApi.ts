import { Client } from "@stomp/stompjs";
import SockJS from 'sockjs-client';

export function getDashboardStockUpdates(clientMessage: string, onUpdate: (data: any) => void) {
    const client = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        // brokerURL: "ws://localhost:8080/ws",
        connectHeaders: {},
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
            console.log("Connected to WebSocket server");

            client.subscribe("/topic/dashboard", message => {
                try {
                    const data = JSON.parse(message.body);
                    console.log("Stock update received:", data);

                    // Pass the update to the callback
                    onUpdate(data);
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            });

            client.publish({
                destination: "/app/subscribe/dashboard",
                body: JSON.stringify(clientMessage),
            })
        },
        onStompError: error => {
            console.error("STOMP error:", error);
        }
    });

    client.activate();

    return () => {
        client.deactivate();
    };
}