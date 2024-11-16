import {ReactNode} from "react";
import {Slot} from 'expo-router'
import {WebsocketProvider} from "../providers/WebsocketProvider";

export default function LayoutRoot(): ReactNode {
  return (
    <WebsocketProvider>
      <Slot />
    </WebsocketProvider>
  );
}
