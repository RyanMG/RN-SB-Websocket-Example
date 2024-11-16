import uuid from 'react-native-uuid';
import {MessageResponseType} from "../providers/WebsocketProvider";

export default function createWebsocketMessage(messageType: string, message: string, userId: string): MessageResponseType {
  return {
    type: messageType,
    message: message,
    meta: {
      userId: userId,
      messageId: uuid.v4(),
      createDate: new Date()
    }
  };
}
