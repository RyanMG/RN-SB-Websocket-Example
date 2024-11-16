import {ReactNode, useEffect, useRef, useState} from "react";
import {FlatList, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';
import createWebsocketMessage from "../../utilities/createWebsocketMessage";
import {useWebsocket, MessageResponseType, IChannels, MetaData} from "../../providers/WebsocketProvider";
import {
  CHAT_MESSAGE,
  USER_JOINED,
  USER_LEFT
} from '../../constants/websocketConstants';

type ChatMessageLine = {
  message: string;
  id: string;
};

const ChatMessageLine = ({
  message
}: {
  message: string
}): ReactNode => {
  return (
    <Text style={{marginBottom: 5, color: '#777777'}}>{message}</Text>
  );
};

export default function Home():ReactNode {
  const USER_ID = useRef<string>(uuid.v4());
  const [messageText, setMessageText] = useState<string>('');
  const [usersActive, setUsersActive] = useState<number>(0);
  const [messageList, setMessageList] = useState<ChatMessageLine[]>([]);
  const {subscribe, unsubscribe, sendMessage} = useWebsocket();

  const sendWebsocketMessage = ():void => {
    if (messageText.length === 0) {
      return;
    }

    sendMessage(createWebsocketMessage(CHAT_MESSAGE, messageText, USER_ID.current) as MessageResponseType);
    setMessageText('');
  }

  useEffect(() => {
    subscribe(USER_JOINED as keyof IChannels, (message:string) => {
      setUsersActive(Number(message));
    });

    subscribe(USER_LEFT as keyof IChannels, (message:string) => {
      setUsersActive(Number(message));
    });

    subscribe(CHAT_MESSAGE as keyof IChannels, (message:string, metaData: MetaData) => {
      setMessageList([
        ...messageList,
        {
          id: metaData.messageId,
          message
        }
      ])
    });

    return () => {
      unsubscribe(USER_JOINED as keyof IChannels);
      unsubscribe(USER_LEFT as keyof IChannels);
    }
  }, [subscribe, unsubscribe, messageList, usersActive]);

  const updateMessageText = (val: string): void => {
    setMessageText(val);
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.pageWrapper}>
        <Text style={styles.pageHeader}>Socket test client</Text>
        <TextInput
          onChangeText={updateMessageText}
          style={styles.messageInput}
          value={messageText}
        />
        <View style={styles.elementPadding}></View>
        <Pressable
          style={styles.messageBtn}
          onPress={sendWebsocketMessage}
        >
          <Text style={styles.btnText}>Send a message</Text>
        </Pressable>
        <View style={styles.elementPadding}></View>
        <View style={styles.usersInChatWrap}>
          <Text style={styles.usersInChatText}>Users in chat: {usersActive}</Text>
        </View>
        <View style={styles.elementPadding}></View>
        <View
          style={styles.chatLogWrapper}
        >
          <Text style={styles.chatLogHeader}>Chat Log</Text>
          <FlatList
            style={styles.messageListWrapper}
            data={messageList}
            renderItem={({item}) => <ChatMessageLine message={item.message} />}
            keyExtractor={item => item.id}
           />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    margin: 20
  },
  elementPadding: {
    marginTop: 10,
    marginBottom: 10
  },
  pageHeader: {
    fontWeight: 'bold',
    fontSize: 30,
    color: 'grey'
  },
  messageInput: {
    height: 40,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'grey',
    width: '100%'
  },
  messageBtn: {
    height: 30,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  btnText: {
    fontSize: 14,
    color: 'white'
  },
  usersInChatWrap: {
    marginTop: 10
  },
  usersInChatText: {
    fontSize: 14,
    color: 'grey'
  },
  chatLogWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 10,
    width: 300,
    minHeight: 300
  },
  chatLogHeader: {
    fontSize: 18,
    textAlign: 'center',
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    width: '90%',
    marginBottom: 10,
    paddingBottom: 4
  },
  messageListWrapper: {
    width: '90%'
  }
})
