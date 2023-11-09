
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate} from 'react-router-dom';
import './css/reset.css';
import './css/bottom.css';
import './css/top.css';
import './css/center copy.css';
import './css/judi_chat.css';




function Home() {
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 navigate 함수를 가져옵니다
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // 화면 너비 상태

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
    console.log("isDropdownVisible 상태값:", isDropdownVisible);
  };
  


  // 화면 크기가 작을 때 드롭다운 메뉴를 표시
  const showDropdown = windowWidth <= 768;

  // 브라우저 창 크기가 변경될 때 화면 너비 상태 업데이트
  window.addEventListener('resize', () => {
    setWindowWidth(window.innerWidth);
  });
  return (
    <div>
      {/* Top */}
      <div className="top">
        <div className="logo" onClick={() => navigate('/')}>
          <p>JudiAI</p>
        </div>
        <div className={`navigation_bar ${showDropdown ? 'dropdown' : ''}`}>

          <ul className={isDropdownVisible ? 'show' : ''}>
            <li><Link to="/">HOME</Link></li>
            <li><Link to="/try-judiai">Try JudiAI</Link></li>
            <li><a href="#a">Our Clients</a></li>
            <li><a href="#b">Contact us</a></li>
          </ul>
          
        </div>
        <div className="menu-toggle-background">
          <button className="menu-toggle" onClick={toggleDropdown}><i className="fa fa-bars"></i></button>
          {isDropdownVisible && (
            <ul className="menu-toggle-active">
              <a><Link to="/">HOME</Link></a>
              <a><Link to="/try-judiai">Try JudiAI</Link></a>
              <a href="#a">Our Clients</a>
              <a href="#b">Contact us</a>
            </ul>
          )}
        </div>

      </div>

      {/* Center */}
      <div className="center">

        
        <div className="content">
          <div className="center-background"><img src={process.env.PUBLIC_URL + "./images/down5.png"} alt="Legal" width={2000}/></div> {/* 이미지를 배경으로 사용할 요소 */}
          <div className="content-left">
            <p>당신의 법률 문제</p>
            <p>JudiAI와 함께</p>
            <p>해결하세요</p>
            <button className="Try_JudiAI" onClick={() => navigate('/try-judiai')}>
              Try JudiAI
            </button>
          </div>

          <div className="introducing">
            <p>JudiAI와 함께 여러분의 다양한 법률 문제를 탐색하세요.</p>
            <p>우리의 인공지능 상담 서비스는 여러분의 상황과 유사한 법률 판례를 분석하고,</p>
            <p>대략적인 결과와 안내를 제공합니다.</p>
            <p>변호사와의 상담을 고려하기 전에 JudiAI를 활용하여 법률 문제에 대한 초기 답변을 얻어보세요.</p>
            <p>당신의 법률 문제를 더 나은 방향으로 안내하는데 도움을 드릴 것입니다. </p>
          </div>          


        </div>
      </div>
 

      {/* Bottom */}
      <div className="bottom"></div>
    </div>
  );
}

// 대화 저장을 위한 부분
function downloadToFile(content, filename, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  
  a.href= URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
};

function TryJudiAI() {
  const [isChatboxActive, setIsChatboxActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 초기 변호사 메시지 설정
    setMessages([
      { text: "안녕하세요, 어떤 도움이 필요하신가요?", sender: 'lawyer' }
    ]);
  }, []);

  const toggleChatbox = () => {
    setIsChatboxActive(!isChatboxActive);
  };

  // 채팅의 응답을 제출하는 부분
  const submitResponse = () => {
    if (userInput.trim() !== "") {
      // 메시지 상태에 새로운 사용자 메시지 추가
      setMessages([...messages, { text: userInput, sender: 'user' }]);
      setUserInput("");     
      // TODO: Add logic for lawyer's response
    }
  };

  // input 값 변경 처리
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  // 메시지 배열을 기반으로 UI 렌더링
  const renderMessages = messages.map((message, index) =>
    <div key={index} className={`bubble ${message.sender}`}>
      {message.text}
    </div>
  );

  //저장 버튼을 누르면 저장되는 부분을 위한 수정.
  const saveChatHistory = () => {
    const messagesAsString = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    downloadToFile(messagesAsString, 'chat_history.txt', 'text/plain');
  };


  return (
    <div>
      {/* Top */}
      <div className="top">
        <div className="logo" onClick={() => navigate('/')}>
          <p>JudiAI</p>
        </div>

        <div className="navigation_bar">
          <ul>
            <li><Link to="/">HOME</Link></li>
            <li><Link to="/try-judiai">Try JudiAI</Link></li>
            <li><a href="#a">Our Clients</a></li>
            <li><a href="#b">Contact us</a></li>
          </ul>
        </div>
      </div>

      {/* Chat Simulator */}
      <div className="chat-container">
        <div className="lawyer-image-container">
          <img
            className="lawyer-image"
            src="/images/Judi_desk.png"
            alt="변호사"
          />
          <div className="bubble lawyer-bubble hidden">
            안녕하세요, 어떤 도움이 필요하신가요?
          </div>
        </div>

        <div id="chatbox" className={`chatbox ${isChatboxActive ? 'active' : 'hidden'}`}>
          {renderMessages}
          <input 
            type="text" 
            value={userInput}
            onChange={handleInputChange}
            placeholder="여기에 답변을 입력하세요..." 
          />
          <button onClick={submitResponse}>전송</button>
          <button onClick={saveChatHistory}>저장</button>
        </div>

        {/* Updated to trigger the chatbox */}
        <div id="open-chatbox-button" onClick={toggleChatbox}>
          <img
            src="/images/chat_icon.png"
            alt="Chat Icon"
            style={{ cursor: 'pointer' }} // Makes it clear that the image is clickable
          />
        </div>
      </div>
    </div>
  );
}


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/try-judiai" element={<TryJudiAI />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;


