import React, { useContext, useEffect, useState } from 'react';
import './RightSidebar.css';
import assets from '../../assets/assets';
import { logout } from '../../config/firebase';


import { AppContext } from '../../context/AppContext';


const RightSidebar = () => {
  const { chatUser, messages } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);
  const [msgVideos, setMsgVideos] = useState([]);
  const [msgPdfs, setMsgPdfs] = useState([]);
  const [msgGifs, setMsgGifs] = useState([]);
  const [activeTab, setActiveTab] = useState('images');

  const { rightSideBarShow,setRightSideBarShow ,chatVisible, setChatVisible, bgSet} = useContext(AppContext)

  useEffect(() => {
    let images = [];
    let videos = [];
    let pdfs = [];
    let gifs = [];

    messages.forEach((msg) => {
      if (msg.image) {
        if (msg.image.endsWith('.pdf')) {
          pdfs.push(msg.image);
        } else if (msg.image.endsWith('.gif')) {
          gifs.push(msg.image);
        } else if (msg.image.startsWith('http') && msg.image.includes('mp4')) {
          videos.push(msg.image);
        } else {
          images.push(msg.image);
        }
      }
    });

    setMsgImages(images);
    setMsgVideos(videos);
    setMsgPdfs(pdfs);
    setMsgGifs(gifs);
  }, [messages]);

  return chatUser ? (
    <div className= {`rs ${rightSideBarShow ? 'show' : ""} ${bgSet ? 'n' : 'd'}` } >
   
      <div className='rs-profile'>
        
        <img onClick={()=> { setChatVisible(true); setRightSideBarShow(false) } } src={chatUser.userData.avatar} alt="" />
        <h3>
          {Date.now() - chatUser.userData.lastSeen <= 70000 && (
            <img className='dot' src={assets.green_dot} alt='' />
          )}
          {chatUser.userData.name}
        </h3>
        <p>{chatUser.userData.bio}</p>
      </div>
      <hr />

      <div className="tabs">
        <button className={activeTab === 'images' ? 'active' : ''} onClick={() => setActiveTab('images')}>Images</button>
        <button className={activeTab === 'videos' ? 'active' : ''} onClick={() => setActiveTab('videos')}>Videos</button>
        <button className={activeTab === 'pdfs' ? 'active' : ''} onClick={() => setActiveTab('pdfs')}>PDFs</button>
        <button className={activeTab === 'gifs' ? 'active' : ''} onClick={() => setActiveTab('gifs')}>GIFs</button>
      </div>

      <div className="rs-media">
        <div className="media-section">
          {activeTab === 'images' && msgImages.map((url, index) => (
            <img key={index} src={url} alt={`image-${index}`} onClick={() => window.open(url)} />
          ))}

          {activeTab === 'videos' && msgVideos.map((url, index) => (
            <video key={index} src={url}  onClick={() => window.open(url)} />
          ))}

          {activeTab === 'gifs' && msgGifs.map((url, index) => (
            <img key={index} src={url} alt={`gif-${index}`} onClick={() => window.open(url)} />
          ))}
        </div>

        {/* PDF Section */}
        {activeTab === 'pdfs' && msgPdfs.length > 0 && (
          <div className="pdf-list">
            {msgPdfs.map((url, index) => {
              const fileName = decodeURIComponent(url.split('/').pop());
              return (
                <div key={index} className="pdf-item">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="pdf-link">
                    <img className="pdf-icon" src={assets.pdf_icon} alt="PDF" />
                  </a>
                  <span className="pdf-name">{fileName}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={logout}>Logout</button>
    </div>
  ) : (
    <div className={`rs ${bgSet ? 'n' : 'd'}`}>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default RightSidebar;
