import React, { useState, useEffect, useMemo } from 'react';
import submitIcon from './assets/images/submit-arrow.png';
import userIcon from './assets/images/user-icon.png';
import botIcon from './assets/images/bot-icon.png';

const backendUrl = 'http://localhost:8000'

const App = () => {

  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState("");
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

  const handleNewChat = () => {
    createNewChat();
    setCurrentTitle('');
  };

  const handleTitleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setValue('');
    setMessage('');
  };

  const handleButtonClick = async () => {
    if (value) {
      try {
        // Set currentTitle if not already set
        if (!currentTitle) {
          setCurrentTitle(value);
        }

        // Add user message first
        setPreviousChats((prevChats) => [
          ...prevChats,
          {
            title: currentTitle || value, // Use currentTitle if set, otherwise use value
            role: "user",
            content: value,
          },
        ]);

        // Clear the input value after adding the user message
        setValue("");

        // Then make API call to get bot's response
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: value,
          }),
        };

        const response = await fetch(`${backendUrl}/completions`, options);
        const data = await response.json();

        // Add bot's response to the array
        setPreviousChats((prevChats) => [
          ...prevChats,
          {
            title: currentTitle || value, // Use currentTitle if set, otherwise use value
            role: data.choices[0].message.role,
            content: data.choices[0].message.content,
          },
        ]);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (!currentTitle && value && message) {
      setCurrentTitle(value)
    }
    if (currentTitle && value && message) {
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
  }, [message, currentTitle, value])

  const currentChat = previousChats.filter(previousChat => previousChat.title === currentTitle);
  // Memoize uniqueTitles using useMemo
  const uniqueTitles = useMemo(() => {
    const titles = Array.from(new Set(previousChats.map((chat) => chat.title))).filter(Boolean);
    return titles;
  }, [previousChats]);

  return (
    <div className="appContainer">
      <section className="sideBar">
        <button className="chatBtn" onClick={handleNewChat} style={{ cursor: 'pointer' }}>+ New chat</button>
        <ul className="historyList">
          {uniqueTitles?.map((uniqueTitle, index) => (
            <li key={index} className="historyItem" onClick={() => handleTitleClick(uniqueTitle)}>{uniqueTitle}</li>
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
              <p className="role"><img src={chatMessage.role === "user" ? userIcon : botIcon} alt="role icon" /></p>
              <p className="message">
                {chatMessage.content.split('\n').map((paragraph, index) => (
                  <React.Fragment key={index}>
                    {paragraph}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </li>
          ))}
        </ul>
        <div className="bottomSection">
          <div className="inputContainer">
            <textarea
              rows="1"
              style={{ height: inputHeight }}
              value={value}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Prevent the default behavior of Enter key (e.g., newline in textarea)
                  handleButtonClick(); // Trigger the button click function
                }
              }}
            />
            <div id="submit" onClick={handleButtonClick}><img src={submitIcon} alt="submit icon" /></div>
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