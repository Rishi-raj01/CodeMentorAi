import React from "react";
import ChatInterface from "../ChatInterface";
import Navbar from "../Navbar";

const Friend_male = () => {
  return (
    <div  className="vh-100 w-100 d-flex flex-column">
     
      <ChatInterface role="friend_male" />
    </div>
  );
};

export default Friend_male;