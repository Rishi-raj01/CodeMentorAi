import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";



const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark w-100  ">
      <div className="container">
        <Link className="navbar-brand" to="/">CODEMENTOR-AI</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/therapist">Therapist</Link>
            </li>


            <li className="nav-item dropdown">
  <Link
    className="nav-link dropdown-toggle"
    to="#"
    id="navbarDropdown"
    role="button"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    Friend 
  </Link>
  <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
    <li>
      <Link className="dropdown-item" to="/male">
        Male 
      </Link>
    </li>
    <li>
      <Link className="dropdown-item" to="/female">
        Female
      </Link>
    </li>
  </ul>
</li>



            <li className="nav-item">
              <Link className="nav-link" to="/gpt">GPT</Link>
            </li>
          </ul>
        </div>
      </div>
   
    </nav>
  );
};
export default Navbar;