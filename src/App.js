import React, { useState, useEffect } from 'react';
import submitIcon from './assets/images/submit-arrow.png';
import userIcon from './assets/images/user-icon.png';
import botIcon from './assets/images/bot-icon.png';

const backendUrl = 'http://localhost:8000'

const App = () => {

  const [value, setValue]=useState("");
  const [message, setMessage]=useState("");
  const [previousChats, setPreviousChats]=useState([]);
  const [currentTitle, setCurrentTitle]=useState("");
  const [inputHeight, setInputHeight] = useState('auto');

  const handleInputChange = (e) => {
    setValue(e.target.value);
    setInputHeight('auto'); // Reset height to auto when input changes
  };

  const createNewChat = () => {
    setValue("");
    setMessage("");
    setCurrentTitle("");
  }

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setValue("");
    setMessage("");
  }

  const getMessages = async () => {

    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: value
      }),
    }

    try {
      const response = await fetch(`${backendUrl}/completions`, options);
      const data = await response.json();
      setMessage(data.choices[0].message);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
    if(!currentTitle && value && message) {
      setCurrentTitle(value)
    }
    if(currentTitle && value && message) {
      setPreviousChats(prevChats => (
        [...prevChats, {
          title: currentTitle,
          role: "user",
          content: value
        }, {
          title: currentTitle,
          role: message.role,
          content: message.content
        }]
      ))
    }
  },[message,currentTitle])

const currentChat = previousChats.filter(previousChat => previousChat.title === currentTitle);
const uniqueTitles = Array.from(new Set(previousChats.map(previousChat => previousChat.title)));

  return (
    <div className="appContainer">
      <section className="sideBar">
        <button className="chatBtn" onClick={createNewChat} style={{cursor:'pointer'}}>+ New chat</button>
        <ul className="historyList">
          {uniqueTitles?.map((uniqueTitle,index)=>(
            <li key={index} className="historyItem" onClick={()=>handleClick(uniqueTitle)}>{uniqueTitle}</li>
          ))}
        </ul>
        <nav className="footerContent">
          <p>© MCG.AI {new Date().getFullYear()}</p>
        </nav>
      </section>
      <section className="main">
        {!currentTitle && <h1>MCG TravelGPT LLM</h1>}
        <ul className="feedList">
          {currentChat?.map((chatMessage, index) => (
            <li key={index} className="feedItem">
              <p className="role"><img src={chatMessage.role === "user" ? userIcon : botIcon} alt="role icon"/></p>
              <p className="message">{chatMessage.content}</p>
            </li>
          ))}
        </ul>
        <div className="bottomSection">
          <div className="inputContainer">
          <textarea
            rows="1"  // Initially show only one row
            style={{ height: inputHeight }} // Set the dynamic height
            value={value}
            onChange={handleInputChange}
          />
            <div id="submit" onClick={getMessages}><img src={submitIcon} alt="submit icon" /></div>
          </div>
          <p className="info">
            Free Demo Research Preview.
            Our vision is to improve our AI models more innate and secure to interact with.
          </p>
        </div>

      </section>
    </div>
  )
}

export default App