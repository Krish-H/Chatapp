import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useRef, useState } from "react";
import { auth, db } from "../config/firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);
  const[rightSideBarShow,setRightSideBarShow]=useState(false)
   const[bgSet,setBgSet]=useState(false)
  const navigate = useNavigate();

  const lastSeenInterval = useRef(null);
  const pollingInterval = useRef(null);
  const unsubscribeRef = useRef(null);

  const clearAllState = () => {
    setUserData(null);
    setChatData([]);
    setMessagesId(null);
    setMessages([]);
    setChatUser(null);
    setChatVisible(false);

    // Clear any intervals or Firestore subscriptions
    if (lastSeenInterval.current) clearInterval(lastSeenInterval.current);
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    if (unsubscribeRef.current) unsubscribeRef.current();
  };

  const loadUserData = async (uid) => {
    try {
      clearAllState(); // clear previous session state

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();

      setUserData(data);

      if (data.avatar && data.name) {
        navigate("/chat");
      } else {
        navigate("/profile");
      }

      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });

      lastSeenInterval.current = setInterval(async () => {
        if (auth.currentUser) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Firestore listener
  useEffect(() => {
    if (userData?.id) {
      const chatRef = doc(db, "chats", userData.id);

      const unsubscribe = onSnapshot(chatRef, async (res) => {
        const chatItems = res.data()?.chatsData || [];
        const tempData = [];

        for (const item of chatItems) {
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);
          const otherUserData = userSnap.data();
          tempData.push({ ...item, userData: otherUserData });
        }

        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      });

      unsubscribeRef.current = unsubscribe;

      return () => {
        unsubscribe();
      };
    }
  }, [userData?.id]);



//day or night 
  useEffect(()=>{
      const hour = new Date().getHours();
          if(hour >= 6 && hour <= 18){
            setBgSet(false)
          }
          else{
            setBgSet(true)
          }
         
  },[])

  // Polling fallback every 10s
  useEffect(() => {
    if (userData?.id) {
      pollingInterval.current = setInterval(async () => {
        const chatRef = doc(db, "chats", userData.id);
        const data = await getDoc(chatRef);
        const chatItems = data.data()?.chatsData || [];
        const tempData = [];

        for (const item of chatItems) {
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);
          const otherUserData = userSnap.data();
          tempData.push({ ...item, userData: otherUserData });
        }

        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      }, 10000);

      return () => {
        clearInterval(pollingInterval.current);
      };
    }
  }, [userData?.id]);

  const value = {
    userData,
    setUserData,
    loadUserData,
    chatData,
    setChatData,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
    chatVisible,
    setChatVisible,
    messages,
    setMessages,
    clearAllState ,
    rightSideBarShow,
    setRightSideBarShow,
    bgSet, 
    setBgSet
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

export default AppContextProvider;
