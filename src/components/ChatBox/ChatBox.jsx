import React, { useContext, useEffect, useRef, useState } from 'react';
import './ChatBox.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import uploadImageSupabase from '../../lib/uploadImageSupabase';
import run from '../../lib/gemini';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible ,rightSideBarShow,
    setRightSideBarShow ,bgSet } = useContext(AppContext);
  const [input, setInput] = useState('');
  const [loader ,setLoader] = useState(false)
  const scrollEnd = useRef();

  const updateLastMessage = async (content, type = 'text') => {
    const userIDs = [chatUser.rId, userData.id];

    for (const id of userIDs) {
      const userChatsRef = doc(db, 'chats', id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chatsData.findIndex(c => c.messageId === messagesId);

        if (chatIndex !== -1) {
          const updatedChats = [...userChatsData.chatsData];
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            lastMessage: type === 'text' ? content : type,
            updatedAt: Date.now(),
            messageSeen: updatedChats[chatIndex].rId === userData.id ? false : updatedChats[chatIndex].messageSeen,
          };

          await updateDoc(userChatsRef, { chatsData: updatedChats });
        }
      }
    }
  };

  const handleSend = async (text, isAI = false) => {
    if (!text || !messagesId) return;

    const messageData = {
      sId: userData.id,
      text,
      createdAt: new Date(),
    };

    await updateDoc(doc(db, 'messages', messagesId), {
      messages: arrayUnion(messageData),
    });

    await updateLastMessage(text);
    setInput('');
    setLoader(false)
  };

  const aiChatSend = async () => {
     setLoader(true)
    try {
      const aiResponse = await run(input);
      if (aiResponse) await handleSend(aiResponse, true);
    } catch (error) {
      toast.error('AI chat failed: ' + error.message);
    }
    
  };

  const sendMessage = () => handleSend(input);

  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type.includes('pdf')
      ? 'pdf'
      : file.type.startsWith('image')
      ? 'image'
      : file.type.startsWith('video')
      ? 'video'
      : 'unknown';

    try {
      const fileUrl = await uploadImageSupabase(file);

      if (fileUrl && messagesId) {
        const messageData = {
          sId: userData.id,
          image: fileUrl,
          fileType,
          createdAt: new Date(),
        };

        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion(messageData),
        });

        await updateLastMessage(fileType, fileType);
      }
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    }
  };

  const convertTimestamp = (timestamp) => {
    const date = timestamp.toDate();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!messagesId) return;

    const unsub = onSnapshot(doc(db, 'messages', messagesId), (snapshot) => {
      const data = snapshot.data();
      if (data?.messages) setMessages(data.messages.reverse());
    });

    return () => unsub();
  }, [messagesId]);

  const renderMessage = (msg, index) => {
    const isUser = msg.sId === userData.id;
    const isAI = !isUser && !msg.image;

    return (
      <div key={index} className={isUser ? 's-msg' : isAI ? 'r-msg ai-msg' : 'r-msg'}>
        {msg.image ? (
          msg.fileType === 'pdf' ? (
            <div className="pdf-message">
              <a href={msg.image} target="_blank" rel="noopener noreferrer">
                <img className="msg-pdf" src={assets.pdf_icon} alt="PDF" />
              </a>
              <span className="pdf-name">{decodeURIComponent(msg.image.split('/').pop())}</span>
            </div>
          ) : msg.fileType === 'video' ? (
            <video className="msg-img" src={msg.image} controls />
          ) : (
            <img className="msg-img" src={msg.image} alt="attachment" />
          )
        ) : (
          <div className={`msg ${isUser ? 'user-msg' : 'ai-msg'}`}>
            <ReactMarkdown
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </div>
        )}
        <div>
          <img src={isUser ? userData.avatar : chatUser.userData.avatar} alt="avatar" />
          <p>{convertTimestamp(msg.createdAt)}</p>
        </div>
      </div>
    );
  };

  if (!chatUser)
    return (
      <div className={`chat-welcome ${chatVisible ? '' : 'hidden'} ${bgSet ? 'night-box' : 'day-box'}`}>
        <img src={assets.logo_icon} alt="Logo" />
        <p>Chat anytime, anywhere</p>
      </div>
    );

  return (
    <div className={`chat-box ${chatVisible ? '' : 'hidden'} `}>
      <div className={`chat-user ${bgSet ? 'night-bg-bar' : 'day-bg-bar'}`}>
        <img onClick={()=>{setChatVisible(false); setRightSideBarShow(true)}} src={chatUser.userData.avatar || assets.profile_img} alt="User" />
        <p>
          {chatUser.userData.name}
          {Date.now() - chatUser.userData.lastSeen <= 70000 && (
            <img className="dot" src={assets.green_dot} alt="Online" />
          )}
        </p>
        <img onClick={() => setChatVisible(false) } className="arrow" src={assets.arrow_icon} alt="Back" />
        
      </div>

      <div className={`chat-msg ${bgSet ? 'night-box' :  'day-box'}`}>
        <div ref={scrollEnd} />
        {messages.map(renderMessage)}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Send a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <input
          type="file"
          id="image"
          accept="image/*,video/*,application/pdf"
          hidden
          onChange={sendImage}
        />
        <img className='aichaticon' onClick={aiChatSend} src={ loader ? assets.load : assets.ai_chat} alt="AI" />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="Upload" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="Send" />
      </div>
    </div>
  );
};

export default ChatBox;
