import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import  Alert  from './components/Alert';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import { useState } from 'react';
function App() {
  const [alert, setAlert] = useState(null);
  const showAlert = (message, type)=>{
    setAlert({
      msg: message,
      type: type
    })
    setTimeout(() => {
        setAlert(null);
    }, 1500);
}
  return (
    <>
    <Router> 
    
    <Alert alert={alert}/>
    <div className="container">
     <Routes>
     <Route exact path="/" element ={<Home showAlert={showAlert}/>}/>
          <Route exact path="/login" element ={<Login showAlert={showAlert}/>}/>
          <Route exact path="/signup" element ={<Signup showAlert={showAlert}/>}/>
          </Routes>
    </div>
        </Router>
    </>
  );
}

export default App;