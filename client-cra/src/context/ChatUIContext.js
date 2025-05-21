import { createContext, useContext } from 'react';

export const ChatUIContext = createContext({
    openChat: () => { },
});

export const useChatUI = () => useContext(ChatUIContext);
