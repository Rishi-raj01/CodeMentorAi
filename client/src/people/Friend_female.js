import React from "react";
import ChatInterface from "../ChatInterface";
import Navbar from "../Navbar";

const Friend_female = () => {
  return (
    <div  className="vh-100 w-100 d-flex flex-column">
      {/* <Navbar /> */}
      <ChatInterface role="friend_female" />
    </div>
  );
};

export default Friend_female;