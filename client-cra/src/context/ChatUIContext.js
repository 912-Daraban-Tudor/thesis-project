import { createContext, useContext } from 'react';

export const ChatUIContext = createContext({
    openChat: () => { },
    closeChat: () => { },
});

export const useChatUI = () => useContext(ChatUIContext);
