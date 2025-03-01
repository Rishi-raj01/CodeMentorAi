import React from "react";
import ChatInterface from "../ChatInterface";
import Navbar from "../Navbar";

const Girlfriend = () => {
  return (
    <div  className="vh-100 w-100 d-flex flex-column">
      
      <ChatInterface role="girlfriend" />
    </div>
  );
};

export default Girlfriend;