import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate} from 'react-router-dom';
import './css/reset.css';
import './css/bottom copy.css';
import './css/top.css';
import './css/center copy.css';



function Home() {
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 navigate 함수를 가져옵니다
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
            <li><a href = "#a">Our Clients</a></li>
            <li><a href = "#b">Contact us</a></li>

          </ul>
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
            <p>우리의 인공지능 상담 서비스는 여러분의 상황과 유사한 법률 판례를 분석하고, 대략적인 결과와 안내를 제공합니다.</p>
            <p>변호사와의 상담을 고려하기 전에 JudiAI를 활용하여 법률 문제에 대한 초기 답변을 얻어보세요.</p>
            <p>당신의 법률 문제를 더 나은 방향으로 안내하는데 도움을 드릴 것입니다. </p>
          </div>          


        </div>
      </div>


 

      {/* Bottom */}
      <div className="bottom">
        
        
      </div>
    

      <div className="container-fluid bg-primary text-white-50 py-5 px-sm-3 px-md-5" style={{ marginTop: '90px' }}>
        <div className="row pt-5">
          <div className="col-lg-3 col-md-6 mb-5">
            <a href="index.html" className="navbar-brand">
              <h1 className="m-0 mt-n2 text-white display-4">JudiAI</h1>
            </a>
            <p>JudiAI는 인공지능 법률 상담 서비스입니다. 여러분의 상황과 유사한 법률 판례를 분석하고, 대략적인 결과를 제공합니다.</p>
            <h6 className="text-uppercase text-white py-2">Follow Us</h6>
            <div className="d-flex justify-content-start">
              <a className="btn btn-lg btn-primary btn-lg-square mr-2" href="#"><i className="fab fa-twitter"></i></a>
              <a className="btn btn-lg btn-primary btn-lg-square mr-2" href="#"><i className="fab fa-facebook-f"></i></a>
              <a className="btn btn-lg btn-primary btn-lg-square mr-2" href="#"><i className="fab fa-linkedin-in"></i></a>
              <a className="btn btn-lg btn-primary btn-lg-square" href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-5">
            <h4 className="text-uppercase text-white mb-4">Get In Touch</h4>
            <p>Volup amet magna clita tempor. Tempor sea eos vero ipsum. Lorem lorem sit sed elitr sed kasd et</p>
            <p><i className="fa fa-map-marker-alt text-white mr-2"></i>광주광역시 동구 제봉로 92 (대성학원 1-3층)</p>
            <p><i className="fa fa-phone-alt text-white mr-2"></i>+82 123 4567</p>
            <p><i className="fa fa-envelope text-white mr-2"></i>mococo@gjaischool.com</p>
          </div>
          <div className="col-lg-3 col-md-6 mb-5">
            <h4 className="text-uppercase text-white mb-4">Quick Links</h4>
            <div className="d-flex flex-column justify-content-start">
              <a className="text-white-50 mb-2" href="#"><i className="fa fa-angle-right text-white mr-2"></i>Home</a>
              <a className="text-white-50 mb-2" href="#"><i className="fa fa-angle-right text-white mr-2"></i>Try JudiAI</a>
              <a className="text-white-50 mb-2" href="#"><i className="fa fa-angle-right text-white mr-2"></i>Our Services</a>
              <a className="text-white-50 mb-2" href="#"><i className="fa fa-angle-right text-white mr-2"></i>Contact us</a>
              
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-5">
            <h4 className="text-uppercase text-white mb-4">Newsletter</h4>
            <p className="mb-4">Volup amet magna clita tempor. Tempor sea eos vero ipsum. Lorem lorem sit sed elitr sed kasd et</p>
            <div className="w-100 mb-3">
              <div className="input-group">
                <input type="text" className="form-control border-light" style={{ padding: '25px' }} placeholder="Your Email" />
                <div className="input-group-append">
                  <button className="btn btn-primary text-uppercase px-3">Sign Up</button>
                </div>
              </div>
            </div>
            <i>Lorem sit sed elitr sed kasd et</i>
          </div>
        </div>
      </div>

    </div>


  );
}

function TryJudiAI() {
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
            <li><a href = "#a">Our Clients</a></li>
            <li><a href = "#b">Contact us</a></li>

          </ul>
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




