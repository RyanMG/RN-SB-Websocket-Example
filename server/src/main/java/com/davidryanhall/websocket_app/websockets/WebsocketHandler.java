package com.davidryanhall.websocket_app.websockets;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

public class WebsocketHandler extends AbstractWebSocketHandler {
    Set<WebSocketSession> connections = new HashSet<WebSocketSession>();

    public WebsocketHandler() {}

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        System.out.println("----- Websocket session opened");
        connections.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus){
        System.out.println("----- Websocket session closed");
        connections.remove(session);

    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        System.out.printf("----- Websocket message received %s%n", message);
        connections.forEach(conn -> {
            try {
                if (!conn.getId().equals(session.getId())) {
                    conn.sendMessage(message);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
    }
}
