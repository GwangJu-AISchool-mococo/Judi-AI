import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition"; //음성 입력용
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
} from "react-router-dom";
import "../css/reset.css";
import "../css/bottom.css";
import "../css/top.css";
import "../css/center.css";
import "../css/judi_chat.css";
import "../css/dashboard.css";
import LookAhead from "../gifs/judi_look_ahead_sample.gif"; // 애니매이션 gif(정면보기)
import Loading from "../gifs/loading.gif"; // 애니매이션 gif(채팅 로딩)
import { Howl } from "howler";
import Graph1 from "../graph1";
import Graph2 from "../graph2";

// 솔빈 작업 구역
// 대화 저장을 위한 구역
function downloadToFile(content, filename, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });

  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
}

// 주디의 대화를 위한 구역
function Dashboard() {
  const [isChatboxActive, setIsChatboxActive] = useState(false);
  const [messages, setMessages] = useState([
    { text: "안녕하세요, 어떤 도움이 필요하신가요?", sender: "lawyer" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [answerState, setAnswerState] = useState(false);
  const navigate = useNavigate();
  const [graphdata, setGraphdata] = useState({
    전체:{},
    징역: {
      "2년": 10,
      "5년": 20,
      "3년": 10,
      "4년": 20,
      "6년": 22,
    },
    전체_징역: {},
    금고: { "2년": 10, "5년": 20 },
    벌금: {},
    집행유예: {},
    사회봉사: {},
    성폭력_치료프로그램: {},
    피고인_정보공개: {},
    아동_청소년_장애인복지시설_취업제한: {},
    준법운전강의: {},
    results: "",
  }); //그래프 끝

  const messagesEndRef = useRef(null); // 새로운 ref. 채팅창 스크롤 자동 최신화 위함.
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  // 현호 작업구역
  // 검색 test

  // 서버로 데이터를 전송하고 받는 함수
  const chatbotChat = async (userinput) => {
    setIsLoading(true); // (주의) 로딩 표시 관련 기능 시작
    const chatdata = { chat: userinput };

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatdata),
      });
      const data = await response.json();

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data["results"], sender: "lawyer" },
      ]);
      console.log("입력문은");
      console.log(userinput);
      console.log("응답은");
      console.log(data);
      setAnswerState(!answerState);

      // 그래프 시작
      setGraphdata(data); // 서버에서 받아온 데이터 중 'graph' 키의 값을 그래프 데이터로 설정
      // 그래프 끝

      setIsLoading(false); // (주의) 로딩 표시 관련 기능, 로딩 종료
    } catch (error) {
      console.error(error);
      setIsLoading(false); // (주의) 로딩 표시 관련 기능, 에러 시 로딩 종료
    }
  };

  // messages에 새로운 답변이 추가될 때마다 음성 파일 재생
  useEffect(() => {
    const sound = new Howl({
      src: ["/answer.mp3"],
      autoplay: true,
      loop: false,
    });

    sound.play();
    return () => {
      sound.unload();
    };
  }, [answerState]);

  // 메시지 배열이 변경될 때마다 스크롤을 맨 아래로 이동시키는 useEffect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // messages 배열이 변경될 때마다 실행

  // 채팅 박스 활성화/비활성화 부분
  const toggleChatbox = () => {
    setIsChatboxActive(!isChatboxActive);
  };

  // 채팅의 응답을 제출하는 부분. 이곳을 변경해서 변호사의 응답 부분을 화면에 표시되게 했습니다.
  const submitResponse = () => {
    if (userInput.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: userInput, sender: "user" },
      ]);
      chatbotChat(userInput);
      setUserInput("".replace('\n', '')); // 사용자 입력을 초기화
    }
  };

  // input 값 변경 처리
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  // 메시지 배열을 기반으로 UI 렌더링
  const renderMessages = messages.map((message, index) => (
    <div key={index} className={`message-container ${message.sender}-container`}>
      <div className={`bubble ${message.sender}`}>
        {message.text.split('\n').map((line, index) => <React.Fragment key={index}>{line}<br /></React.Fragment>)}
      </div>
    </div>
  ));

  //저장 버튼을 누르면 저장되는 부분을 위한 수정.
  const saveChatHistory = () => {
    const messagesAsString = messages
      .map((m) => `${m.sender}: ${m.text}`)
      .join("\n");
    downloadToFile(messagesAsString, "chat_history.txt", "text/plain");
  };

  // 음성 인식을 위한 state와 함수들
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  // 음성 인식을 시작하는 함수
  const startListening = () => {
    resetTranscript(); // 음성 인식 텍스트 초기화
    setUserInput(""); // 입력 필드 초기화
    SpeechRecognition.startListening({ continuous: true });
  };
  // 음성 인식을 중지하는 함수
  const stopListening = () => {
    SpeechRecognition.stopListening();
    setUserInput(transcript); // 음성 인식 결과를 userInput에 설정
  };

  const resetMessages = () => {
    setMessages([
      { text: "안녕하세요, 어떤 도움이 필요하신가요?", sender: "lawyer" },
    ]);
  };

  //리턴 영역 시작
  return (
    <div>
      {/* Top */}
      <div className="top">
        <div className="logo" onClick={() => navigate("/")}>
          <p>JudiAI</p>
        </div>
      </div>

      {/* 대쉬보드 전체를 담고 있는 컨테이너 입니다. */}
      <div className="app-container">
        {/* 대쉬보드 밖 상단의 내용입니다. */}
        <div className="app-header">
          <div className="app-header-left">
            <span className="app-icon"></span>
            <p className="app-name">Portfolio</p>
          </div>
          <div className="app-header-right">
            <button className="profile-btn">
              {/* 이 버튼은 오른쪽 상단의 로그인한 사람 이미지 버튼입니다. */}
              <span>Judi.Wexler</span>
            </button>
          </div>
        </div>

        {/* //대쉬보드 판 영역입니다. */}
        <div className="app-content">
          {/* 대쉬보드 왼쪽 옆의 사이드 바 부분입니다. */}
          <div className="app-sidebar">
            <a href="" className="app-sidebar-link active">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="feather feather-home"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </a>
            <a href="" className="app-sidebar-link">
              <svg
                className="link-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <defs />
                <path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z" />
              </svg>
            </a>
            <a href="" className="app-sidebar-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="feather feather-calendar"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </a>
            <a href="" className="app-sidebar-link">
              <svg
                className="link-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <defs />
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </a>
          </div>
          {/* 대쉬보드 안의 내용을 담는 영역입니다. */}
          <div className="projects-section">
            {/* 대쉬보드 안쪽 상단 영역입니다. */}
            <div className="projects-section-header">
              <p>It's our tasks for you</p>
              <p className="time">December, 5</p>
            </div>
            <div className="projects-section-line">
              <div className="projects-status">
                <div className="item-status">
                  <span className="status-number">45</span>
                  <span className="status-type">수정 가능 1</span>
                </div>
                <div className="item-status">
                  <span className="status-number">24</span>
                  <span className="status-type">수정 가능 2</span>
                </div>
                <div className="item-status">
                  <span className="status-number">62</span>
                  <span className="status-type">수정 가능 3</span>
                </div>
              </div>
            </div>

            {/* Chat Simulator */}
            <div
              className={`chat-container ${isChatboxActive ? "expanded" : ""}`}
            >
              {/* 주디 이미지 */}
              <img
                className="lawyer-image"
                src={LookAhead}
                alt="변호사"
                onClick={toggleChatbox} // 이벤트 핸들러
              />
              <img
                id="open-chatbox-button"
                onClick={toggleChatbox}
                src="/images/chat_icon3.png"
                alt="Chat Icon"
                style={{ cursor: "pointer", width: "60px", height: "auto" }}
              />
              {/* 음성 인식 & 전송 저장 버튼 */}
              {listening ? (
                <img
                  className="voice-button"
                  src="/images/stop_icon.png"
                  alt="녹음 중지"
                  onClick={stopListening}
                  style={{ width: "30px", height: "30px" }}
                />
              ) : (
                <img
                  className="voice-button"
                  src="/images/record_icon.png"
                  alt="녹음 시작"
                  onClick={startListening}
                  style={{ width: "30px", height: "30px" }}
                />
              )}

              {/* // 챗 박스 관련 구역 */}
              <div
                id="chatbox"
                className={`chatbox ${isChatboxActive ? "active" : "hidden"}`}
              >
                {/* 채팅 메시지를 표시하는 부분 */}
                <div className="chat-messages">
                  {renderMessages}
                  {isLoading ? (
                    <div className={'bubble lawyer'}>
                      <img className='loading-chat-image' src={Loading} alt='로딩이미지' />
                    </div>
                  ) : (<></>)}
                  <div ref={messagesEndRef} />{" "}
                  {/* 스크롤 조정을 위한 빈 div 추가 */}
                </div>

                {/* 입력창 및 버튼 관련 구역 */}
                <div className="chat-input-area">
                  <textarea
                    id="input-area"
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="여기에 상담 내용을 입력해주세요."
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        submitResponse();
                      }
                    }}
                  ></textarea>

                  <div className="voice-control-buttons">
                    <img
                      src="/images/reset_icon.png"
                      alt="리셋"
                      onClick={resetMessages}
                      className="voice-control-button"
                    />
                    <img
                      src="/images/save_icon.png"
                      alt="저장"
                      onClick={saveChatHistory}
                      className="voice-control-button"
                    />
                    <img
                      src="/images/send_icon.png"
                      alt="전송"
                      onClick={submitResponse}
                      className="voice-control-button"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 음성 인식 텍스트 표시 */}
            {listening && (
              <div className="transcript">상담 내용 확인: {transcript}</div>
            )}

            {/* 대쉬보드 안의 프로젝트들을 담을 수 있는 Box입니다. */}
            <div className="project-boxes jsGridView">
              <div className="project-box-wrapper">
                <div
                  className="project-box"
                  style={{ backgroundcolor: "#fee4cb" }}
                >
                  <div className="project-box-header">
                    <span>December 10, 2020</span>
                  </div>

                  {/* 전체 그래프 */}
                  <div className="graph_content_container">
                    {graphdata["전체"] && Object.keys(graphdata["전체"]).length > 0 && (
                        <>
                          전체
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph1
                              graphdata={graphdata["전체"]}
                              graphType="전체"
                            />
                          </div>
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph2
                              graphdata={graphdata["전체"]}
                              graphType="전체"
                            />
                          </div>
                        </>
                      )}
                  </div>

                  {/* 징역 그래프 */}
                  <div className="graph_content_container">
                  {graphdata["전체_징역"] && (
                        <>
                          징역
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph1
                              graphdata={graphdata["징역"]}
                              graphType="징역"
                            />
                          </div>
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph2
                              graphdata={graphdata["징역"]}
                              graphType="징역"
                            />
                          </div>
                        </>
                      )}
                  </div>

                  {/* 징역_실형 그래프 */}
                  <div className="graph_content_container">
                    {graphdata["징역_실형"] &&
                      Object.keys(graphdata["징역_실형"]).length > 0 && (
                        <>
                          징역_실형
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph1
                              graphdata={graphdata["징역_실형"]}
                              graphType="징역_실형"
                            />
                          </div>
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph2
                              graphdata={graphdata["징역_실형"]}
                              graphType="징역_실형"
                            />
                          </div>
                        </>
                      )}
                  </div>

                  {/* 금고 그래프 */}
                  <div className="graph_content_container">
                    {graphdata["전체_금고"] && (
                        <>
                          금고
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph1
                              graphdata={graphdata["금고"]}
                              graphType="금고"
                            />
                          </div>
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph2
                              graphdata={graphdata["금고"]}
                              graphType="금고"
                            />
                          </div>
                        </>
                      )}
                  </div>

                  {/* 금고_실형 그래프 */}
                  <div className="graph_content_container">
                    {graphdata["금고_실형"] &&
                      Object.keys(graphdata["금고_실형"]).length > 0 && (
                        <>
                          금고_실형
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph1
                              graphdata={graphdata["금고_실형"]}
                              graphType="금고_실형"
                            />
                          </div>
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph2
                              graphdata={graphdata["금고_실형"]}
                              graphType="금고_실형"
                            />
                          </div>
                        </>
                      )}
                  </div>

                  {/* 벌금 그래프 */}
                  <div className="graph_content_container">
                    {graphdata["벌금"] &&
                      Object.keys(graphdata["벌금"]).length > 0 && (
                        <>
                          벌금
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph1
                              graphdata={graphdata["벌금"]}
                              graphType="벌금"
                            />
                          </div>
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph2
                              graphdata={graphdata["벌금"]}
                              graphType="벌금"
                            />
                          </div>
                        </>
                      )}
                  </div>        

                  {/* 보호관찰 그래프 */}
                  <div className="graph_content_container">
                    {graphdata["보호관찰"] && Object.values(graphdata["보호관찰"]).reduce((acc, curr) => acc + curr, 0) > 0 && (
                        <>
                          보호관찰
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph1
                              graphdata={graphdata["보호관찰"]}
                              graphType="보호관찰"
                            />
                          </div>
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph2
                              graphdata={graphdata["보호관찰"]}
                              graphType="보호관찰"
                            />
                          </div>
                        </>
                      )}
                  </div>

                  {/* 사회봉사 그래프 */}
                  <div className="graph_content_container">
                    {graphdata["사회봉사"] &&
                      Object.keys(graphdata["사회봉사"]).length > 0 && (
                        <>
                          사회봉사
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph1
                              graphdata={graphdata["사회봉사"]}
                              graphType="사회봉사"
                            />
                          </div>
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph2
                              graphdata={graphdata["사회봉사"]}
                              graphType="사회봉사"
                            />
                          </div>
                        </>
                      )}
                  </div>

                  {/* 성폭력_치료프로그램 그래프 */}
                  <div className="graph_content_container">
                    {graphdata["성폭력_치료프로그램"] &&
                      Object.keys(graphdata["성폭력_치료프로그램"]).length > 0 && (
                        <>
                          성폭력_치료프로그램
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph1
                              graphdata={graphdata["성폭력_치료프로그램"]}
                              graphType="성폭력_치료프로그램"
                            />
                          </div>
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph2
                              graphdata={graphdata["성폭력_치료프로그램"]}
                              graphType="성폭력_치료프로그램"
                            />
                          </div>
                        </>
                      )}
                  </div>

                  {/* 피고인_정보공개 그래프 */}
                  <div className="graph_content_container">
                    {graphdata["피고인_정보공개"] &&
                      Object.keys(graphdata["피고인_정보공개"]).length > 0 && (
                        <>
                          피고인_정보공개
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph1
                              graphdata={graphdata["피고인_정보공개"]}
                              graphType="피고인_정보공개"
                            />
                          </div>
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph2
                              graphdata={graphdata["피고인_정보공개"]}
                              graphType="피고인_정보공개"
                            />
                          </div>
                        </>
                      )}
                  </div>

                  {/* 아동_청소년_장애인복지시설_취업제한 그래프 */}
                  <div className="graph_content_container">
                    {graphdata["아동_청소년_장애인복지시설_취업제한"] &&
                      Object.keys(graphdata["아동_청소년_장애인복지시설_취업제한"]).length > 0 && (
                        <>
                          아동_청소년_장애인복지시설_취업제한
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph1
                              graphdata={graphdata["아동_청소년_장애인복지시설_취업제한"]}
                              graphType="아동_청소년_장애인복지시설_취업제한"
                            />
                          </div>
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph2
                              graphdata={graphdata["아동_청소년_장애인복지시설_취업제한"]}
                              graphType="아동_청소년_장애인복지시설_취업제한"
                            />
                          </div>
                        </>
                      )}
                  </div>

                  {/* 준법운전강의 그래프 */}
                  <div className="graph_content_container">
                    {graphdata["준법운전강의"] &&
                      Object.keys(graphdata["준법운전강의"]).length > 0 && (
                        <>
                          준법운전강의
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph1
                              graphdata={graphdata["준법운전강의"]}
                              graphType="준법운전강의"
                            />
                          </div>
                          <div
                            style={{
                              height: "200px",
                              width: "300px",
                              marginLeft: "50px",
                            }}
                          >
                            <Graph2
                              graphdata={graphdata["준법운전강의"]}
                              graphType="준법운전강의"
                            />
                          </div>
                        </>
                      )}
                  </div>

                  <div className="project-box-content-header">
                    <p className="box-content-header">Web Designing</p>
                    <p className="box-content-subheader">Prototyping</p>
                  </div>
                  <div className="box-progress-wrapper">
                    <p className="box-progress-header">Progress</p>
                    <div className="box-progress-bar">
                      <span
                        className="box-progress"
                        style={{ width: "60%", backgroundcolor: "#ff942e" }}
                      ></span>
                    </div>
                    <p className="box-progress-percentage">60%</p>
                  </div>

                  <div className="project-box-footer">
                    <div className="participants">
                      <button
                        className="add-participant"
                        style={{ color: "#ff942e" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          className="feather feather-plus"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>
                    <div className="days-left" style={{ color: "#ff942e" }}>
                      2 Days Left
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* //대쉬보드 판 옆의 다른 박스 부분입니다. */}
        <div className="messages-section">
          <button className="messages-close">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="feather feather-x-circle"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </button>
          <div className="projects-section-header">
            <p>다른 박스입니다.</p>
          </div>

          <div className="messages">
            <div className="message-box">
              {/* <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2550&q=80" alt="profile image" /> */}
              <div className="message-content">
                <div className="message-header">
                  <div className="name">Stephanie</div>
                  <div className="star-checkbox">
                    <input type="checkbox" id="star-1" />
                    <label for="star-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="feather feather-star"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </label>
                  </div>
                </div>
                <p className="message-line">
                  우히히 뭐라는거냐. 난 대충 이래 할란다.
                </p>
                <p className="message-line time">Dec, 12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;
