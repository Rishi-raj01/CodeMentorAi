import React from "react";
import ChatInterface from "../ChatInterface";
import Navbar from "../Navbar";

const GPT = () => {
  return (
    <div  className="vh-100 w-100 d-flex flex-column ">
     
      <ChatInterface role="default" />
    </div>
  );
};

export default GPT;