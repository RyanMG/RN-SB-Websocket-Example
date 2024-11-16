package com.davidryanhall.websocket_app.websockets;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class WebsocketHandler extends AbstractWebSocketHandler {
    Set<WebSocketSession> connections = new HashSet<WebSocketSession>();

    private String USER_JOINED = "USER_JOINED";
    private String USER_LEFT = "USER_LEFT";

    public WebsocketHandler() {}

    private TextMessage createTextMessage(String messageType, Integer numConnections) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", messageType);
        payload.put("message", numConnections);

        return new TextMessage(objectMapper.writeValueAsString(payload));
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        System.out.println("----- Websocket session opened");
        connections.add(session);
        connections.forEach(conn -> {
            try {
                conn.sendMessage(createTextMessage(USER_JOINED, connections.size()));
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus){
        System.out.println("----- Websocket session closed");
        connections.remove(session);
        connections.forEach(conn -> {
            try {
                conn.sendMessage(createTextMessage(USER_LEFT, connections.size()));
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
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
