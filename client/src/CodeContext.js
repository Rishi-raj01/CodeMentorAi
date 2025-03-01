import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [code, setCode] = useState('');

    const addMessage = (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    const setCodeValue = (newCode) => {
        setCode(newCode);
    };

    return (
        <ChatContext.Provider value={{ messages, addMessage, code, setCodeValue }}>
            {children}
        </ChatContext.Provider>
    );
};