import {createContext, ReactNode, useContext, useEffect, useRef} from "react";

export interface IChannels {
  (key: string): () => void
}

type MetaData = {
  userId: string;
  messageId: string;
  createDate: Date;
}
type MessageResponseType = {
  type: keyof IChannels;
  message: string;
  meta: MetaData
}

const WebSocketContext = createContext<{
  subscribe: (channel: keyof IChannels, callback: (...args: any[]) => void) => void;
  unsubscribe: (channel: keyof IChannels) => void;
  sendMessage: (messageText: MessageResponseType) => void;
}>({
  subscribe: () => null,
  unsubscribe: () => null,
  sendMessage: () => null
});

const useWebsocket = () => {
  return useContext(WebSocketContext);
}

const WebsocketProvider = (
  {children}:
  {children: ReactNode|ReactNode[]}
): ReactNode => {
  const ws = useRef<WebSocket>({} as WebSocket);
  let socket:WebSocket = ws.current;

  const channelsRef = useRef<IChannels>({} as IChannels);
  const channels = channelsRef.current;

  const subscribe = (channel:keyof IChannels, callback: (arg1: string, arg2: MetaData) => void):void => {
    (channels[channel] as (arg1: string, arg2: MetaData) => void) = callback;
  };

  const unsubscribe = (channel: keyof IChannels):void => {
    delete channels[channel];
  };

  const sendMessage = (messageText: MessageResponseType): void => {
    socket.send(JSON.stringify(messageText));
  };

  useEffect(() => {
    socket = new WebSocket(`ws://localhost:8080/socket`);

    socket.onopen = () => {
      console.log("-- Socket open");
    }

    socket.onclose = () => {
      console.log("-- Socket closed");
    }

    socket.onerror = (err ) => {
      console.error("-- Socket error:", err);
    }

    socket.onmessage = (messageEvent) => {
      const {
        type,
        message,
        meta
      }:MessageResponseType  = JSON.parse(messageEvent.data);
      const messageChannel: keyof IChannels = type;

      if (channels[messageChannel]) {
        (channels[messageChannel] as (arg1: string, arg2: MetaData)=> void)(message, meta);
      }
    }

    return ():void => {socket.close()}
  }, []);

  return (
    <WebSocketContext.Provider
     value={{
       subscribe,
       unsubscribe,
       sendMessage
     }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export {
  WebsocketProvider,
  useWebsocket,
  MessageResponseType,
  MetaData
};
