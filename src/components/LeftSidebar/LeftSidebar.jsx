import React, { useContext, useEffect, useState } from 'react';
import './LeftSidebar.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { db, logout } from '../../config/firebase';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const LeftSidebar = () => {
  const {
    chatData,
    userData,
    chatUser,
    setChatUser,
    setMessagesId,
    messagesId,
    chatVisible,
    setChatVisible,
    rightSideBarShow,
    bgSet
  } = useContext(AppContext);

  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  const inputHandler = async (e) => {
    try {
      const input = e.target.value.trim();

      if (input) {
        setShowSearch(true);
        const userRef = collection(db, 'users');
        const q = query(userRef, where('username', '==', input.toLowerCase()));
        const querySnap = await getDocs(q);

        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          const searchedUser = querySnap.docs[0].data();
          const userExist = chatData.some((chat) => chat.rId === searchedUser.id);

          if (!userExist) {
            setUser(searchedUser);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addChat = async () => {
    if (!user || user.id === userData.id) return;

    const messagesRef = collection(db, 'messages');
    const chatsRef = collection(db, 'chats');

    try {
      const newMessageRef = doc(messagesRef);

      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: []
      });

      const chatDataPayload = {
        messageId: newMessageRef.id,
        lastMessage: '',
        rId: userData.id,
        updatedAt: Date.now(),
        messageSeen: true
      };

      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion(chatDataPayload)
      });

      const ownChatData = {
        messageId: newMessageRef.id,
        lastMessage: '',
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true
      };

      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion(ownChatData)
      });

      const uSnap = await getDoc(doc(db, 'users', user.id));
      const uData = uSnap.data();

      setChat({
        ...ownChatData,
        userData: uData
      });

      setShowSearch(false);
      setChatVisible(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const setChat = async (item) => {
    setMessagesId(item.messageId);
    setChatUser(item);

    try {
      const userChatsRef = doc(db, 'chats', userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chatsData.findIndex(
          (c) => c.messageId === item.messageId
        );

        if (chatIndex !== -1) {
          userChatsData.chatsData[chatIndex].messageSeen = true;

          await updateDoc(userChatsRef, {
            chatsData: userChatsData.chatsData
          });
        }
      }
    } catch (error) {
      toast.error(error.message);
    }

    setChatVisible(true);
  };

  useEffect(() => {
    const updateChatUserData = async () => {
      if (
        chatUser &&
        chatUser.userData?.id &&
        chatUser.userData.id !== userData.id // prevent updating the current user
      ) {
        try {
          const userRef = doc(db, 'users', chatUser.userData.id);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const updatedUserData = userSnap.data();
            setChatUser((prev) => ({ ...prev, userData: updatedUserData }));
          }
        } catch (error) {
          toast.error(error.message);
        }
      }
    };

    updateChatUserData();
  }, [chatData]); // this will trigger whenever chatData changes

  return (
    <div className={`ls ${chatVisible ? 'hidden' : '' || rightSideBarShow ? 'hidden' : ''} ${bgSet ? 'night' : 'day'} `}>
      <div className='ls-top'>
        <div className='ls-nav'>
          <img className='logo' src={assets.logo} alt='Logo' />
          <div className='menu'>
            <img src={assets.menu_icon} alt='Menu' />
            <div className='sub-menu'>
              <p onClick={() => navigate('/profile')}>Edit Profile</p>
              <hr />
              <p onClick={() => logout()}>Logout</p>
            </div>
          </div>
        </div>
        <div className={`ls-search ${bgSet ? 'nightsearch' : 'daysearch'}`}>
          <img src={assets.search_icon} alt='Search' />
          <input onChange={inputHandler} type='text' placeholder='Search here...' />
        </div>
      </div>

      <div className='ls-list'>
        {showSearch && user ? (
          <div onClick={addChat} className='friends add-user'>
            <img src={user.avatar} alt={user.name} />
            <p>{user.name}</p>
          </div>
        ) : (
          chatData.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              key={index}
              className={`friends ${
                item.messageSeen || item.messageId === messagesId ? '' : 'border'
              }`}
            >
              <img src={item.userData.avatar} alt={item.userData.name} />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage.slice(0, 30)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
