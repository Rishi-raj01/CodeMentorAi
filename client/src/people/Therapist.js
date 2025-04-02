import React from "react";
import ChatInterface from "../ChatInterface";
import Navbar from "../Navbar";

const Therapist = () => {
  return (
    <div  className="vh-100 w-100 d-flex flex-column">
      {/* <Navbar /> */}
      <ChatInterface role="therapist" />
    </div>
  );
};

export default Therapist;