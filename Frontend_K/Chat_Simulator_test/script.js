function showMessage(message) {
    let bubble = document.querySelector('.lawyer-bubble');
    
    // 기존의 hidden을 제거하고 fade-in 클래스를 추가
    bubble.classList.remove('hidden');
    bubble.classList.add('fade-in');
    
    // 메시지를 한 글자씩 출력
    let i = 0;
    bubble.textContent = '';
    let typing = setInterval(function() {
      if (i < message.length) {
        bubble.textContent += message.charAt(i);
        i++;
      } else {
        clearInterval(typing); // 메시지 전체가 출력되면 타이핑 중지
        
        // 2초간 머무르기
        setTimeout(function() {
          bubble.classList.remove('fade-in');
          bubble.classList.add('fade-out');
          
          // fade-out 애니메이션 후에 hidden 클래스 추가
          setTimeout(function() {
            bubble.classList.add('hidden');
            bubble.classList.remove('fade-out');
          }, 2000);
          
        }, 2000); // 메시지가 2초간 머물러 있어야 함
      }
    }, 50); // 글자 타이핑 속도 조절
  }
  
  // 클릭 이벤트를 처리하는 함수
  function handleClick() {
    let message = "안녕하세요, 어떤 도움이 필요하신가요?";
    showMessage(message);
  }
  
  // 이미지나 버튼에 대한 클릭 이벤트 리스너 추가
  document.querySelector('.lawyer-image-container').addEventListener('click', handleClick);

function toggleChatbox() {
    var chatbox = document.getElementById("chatbox");
    chatbox.classList.toggle("active");
    if(chatbox.classList.contains("active")){
      chatbox.classList.remove("hidden"); // 숨김 해제
    }else{
      setTimeout(function(){ chatbox.classList.add("hidden"); }, 500); // 애니메이션 후 숨김
    }
  }

  document.getElementById('open-chatbox-button').addEventListener('click', function() {
    var chatbox = document.getElementById('chatbox');
    chatbox.classList.toggle('hidden');
  });


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
  window.onload = function() {
    var lawyerBubble = document.createElement("div");
    lawyerBubble.textContent = "안녕하세요, 어떤 도움이 필요하신가요?";
    lawyerBubble.classList.add("bubble", "lawyer");
    document.getElementById("chatbox").appendChild(lawyerBubble);
  }
  
  