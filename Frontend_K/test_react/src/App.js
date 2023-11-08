
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate} from 'react-router-dom';
import './css/reset.css';
import './css/bottom.css';
import './css/top.css';
import './css/center copy.css';
import './css/styles.css';




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

function TryJudiAI() {
  function toggleChatbox() {
    var chatbox = document.getElementById("chatbox");
    chatbox.classList.toggle("active");
    if(chatbox.classList.contains("active")){
      chatbox.classList.remove("hidden"); // 숨김 해제
    }else{
      setTimeout(function(){ chatbox.classList.add("hidden"); }, 500); // 애니메이션 후 숨김
    }
  }
  function submitResponse() {
    var input = document.getElementById("userInput");
    var userText = input.value.trim();
  
    if(userText !== "") {
      // 사용자의 응답을 화면에 표시
      var userBubble = document.createElement("div");
      userBubble.textContent = userText;
      userBubble.classList.add("bubble", "user");
      document.getElementById("chatbox").appendChild(userBubble);
  
      // 말풍선 스크롤을 맨 아래로
      var chatbox = document.getElementById("chatbox");
      chatbox.scrollTop = chatbox.scrollHeight;
  
      input.value = ""; // 입력 필드 초기화
  
      // 여기에 변호사의 답변 로직을 구현하실 수 있습니다.
      // 예를 들면, setTimeout과 함께 미리 정의된 답변을 사용하거나,
      // 더 복잡한 로직으로 서버에 요청을 보내고 응답을 받을 수도 있습니다.
    }
  }
  // 초기 질문 로딩
  useEffect(() => {
    const lawyerBubble = document.createElement("div");
    lawyerBubble.textContent = "안녕하세요, 어떤 도움이 필요하신가요?";
    lawyerBubble.classList.add("bubble", "lawyer");
    document.getElementById("chatbox").appendChild(lawyerBubble);
  }, []);
  // React 코드는 JSX 형식으로 작성되며, HTML과 유사하게 보입니다.
  const navigate = useNavigate();
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
        <div className="lawyer-image-container" onClick={toggleChatbox}>
          <img
            className="lawyer-image"
            src="/images/Judi_desk.png" // 이미지 경로를 업데이트하세요
            alt="변호사"
          />
          <div className="bubble lawyer-bubble hidden">
            안녕하세요, 어떤 도움이 필요하신가요?
          </div>
        </div>

        <div id="chatbox" className="hidden">
          <input type="text" id="userInput" placeholder="여기에 답변을 입력하세요..." />
          <button onClick={submitResponse}>전송</button>
        </div>

        <div id="open-chatbox-button">
          <img
            src="/images/chat_icon.png" // 이미지 경로를 업데이트하세요
            alt="Chat Icon"
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


