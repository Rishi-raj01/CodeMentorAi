/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Route, Routes } from "react-router-dom";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import "./App.css"; // Keep your existing styles if needed
import Homepage1 from "./Homepage1";
import FlyingCards from "./FlyingCards";
import Therapist from "./people/Therapist";
import Friend_male from "./people/Friend_male";
import Friend_female from "./people/Friend_female";
import Deepika from "./people/Deepika";
import GPT from "./people/GPT";
import Girlfriend from "./people/Girlfriend";
function App() {
  return(
    <>
    <Routes>
    <Route path="/" element={<Homepage1 />} />
    <Route path="/fly" element={<FlyingCards />} />
    <Route path="/therapist" element={<Therapist />} />
    <Route path="/male" element={<Friend_male />} />
    <Route path="/female" element={<Friend_female />} />
    <Route path="/deepika" element={<Deepika />} />
    <Route path="/gpt" element={<GPT />} />
    <Route path="/girlfriend" element={<Girlfriend />} />
    
    {/* <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} /> */}

    </Routes>
    </>
  );
//     const [code, setCode] = useState(`function sum() {
//   return 1 + 1;
// }`);
//     const [review, setReview] = useState(``);
//     const [loading, setLoading] = useState(false);
//     const [message, setMessages] = useState("");
//     const [isRecording, setIsRecording] = useState(false);
//     const [selectedVoice, setSelectedVoice] = useState(null);
//     const [voices, setVoices] = useState([]);
//     const recognition = useRef(null);
//     const [isSpeaking, setIsSpeaking] = useState(false);

//     useEffect(() => {
//         prism.highlightAll();
//     }, [code]);

//     useEffect(() => {
//         // Initialize SpeechRecognition only once
//         if (!recognition.current) {
//             const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//             recognition.current = new SpeechRecognition();
//             recognition.current.continuous = false;
//             recognition.current.lang = 'en-US';

//             recognition.current.onresult = (event) => {
//                 const transcript = event.results[0][0].transcript;
//                 setCode((prevCode) => prevCode + transcript + " ");  // Append to existing code
//             };

//             recognition.current.onend = () => {
//                 setIsRecording(false);
//                 console.log("Speech recognition ended.");
//             };

//             recognition.current.onerror = (event) => {
//                 console.error("Speech recognition error:", event.error);
//                 setIsRecording(false);
//             };
//         }
//     }, []);

//     useEffect(() => {
//       const loadVoices = () => {
//           const allowedVoices = [
//               "Microsoft Madhur Online (Natural) - Hindi (India)",
//               "Microsoft Swara Online (Natural) - Hindi (India)",
//               "Microsoft Neerja Online (Natural) - English (India)",
//               "Microsoft Prabhat Online (Natural) - English (India)"
//           ];
  
//           const allVoices = window.speechSynthesis.getVoices();
//           const filteredVoices = allVoices
//               .filter(voice => allowedVoices.includes(voice.name)) // Only keep selected voices
//               .map(voice => ({
//                   name: voice.name, 
//                   shortName: voice.name.split(" Online")[0].replace("Microsoft ", ""), // Auto-shortens
//                   lang: voice.lang,
//                   voiceObj: voice
//               }));
  
//           setVoices(filteredVoices);
//           if (filteredVoices.length > 0) setSelectedVoice(filteredVoices[0].voiceObj);
//       };
  
//       loadVoices();
//       window.speechSynthesis.onvoiceschanged = loadVoices;
//   }, []);
  
  

//   const emojiMap = {
//     "😄": "haha laughing",
//     "😭": "crying sound",
//     "😡": "angry tone",
//     "😍": "excited voice",
//     "🤔": "thinking sound",
//     // Add more as needed
// };

// const cleanText = (text) => {
//     return text
//         .replace(/[^\w\s]/g, '') // Remove special characters
//         .replace(/[\u{1F600}-\u{1F64F}]/gu, (match) => emojiMap[match] || ""); // Replace emojis
// };


//   // Text-to-speech function
// const speak = (text) => {
//   if (!selectedVoice) return;
//   window.speechSynthesis.cancel(); // Stop any ongoing speech
//   const utterance = new SpeechSynthesisUtterance(cleanText(text));
//   utterance.voice = selectedVoice;

//   utterance.onstart = () => setIsSpeaking(true);
//   utterance.onend = () => setIsSpeaking(false);

//   window.speechSynthesis.speak(utterance);
// };

// // Stop speaking function
// const stopSpeaking = () => {
//   window.speechSynthesis.cancel(); // Immediately stops speech
//   setIsSpeaking(false);
// };


//     async function reviewCode() {
//         setLoading(true);
//         try {
//             const response = await axios.post("/api/v1/ai/get-review", {
//                 code,
//                 role: "developer", // Pass the role here
//             });

//             setReview(response.data);
//             speak(response.data);  // Speak the review
//         } catch (error) {
//             setReview("Error fetching review. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     }

//     async function writeCode() {
//         setLoading(true);
//         try {
//             const response = await axios.post("/api/v1/ai/get-review", {
//                 code,
//                 role: "expert", // Pass the role here
//             });

//             setReview(response.data);
//             speak(response.data);  // Speak the solved code
//         } catch (error) {
//             setReview("Error fetching review. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     }

//     async function help() {
//         setLoading(true);
//         try {
//             const response = await axios.post("/api/v1/ai/chat", {
//                 code,
//                 role: "therapist", 
//             });
//             setReview(response.data);
//             speak(response.data);  
//             setMessages((prev) => [...prev, { sender: "AI", text: response.data.reply }]);
//         } catch (error) {
//             console.error("Error chatting with AI:", error);
//         } finally {
//             setLoading(false);
//         }
//     }

//     const startRecording = () => {
//       setCode("");
//       console.log(window.speechSynthesis.getVoices());

//         setIsRecording(true);
//         try {
//             recognition.current.start();
//         } catch (error) {
//             console.error("Error starting recording:", error);
//             setIsRecording(false);
//             alert("Failed to start recording.  Make sure your browser supports speech recognition and you've granted microphone access.");
//         }
//     };

//     const stopRecording = () => {
//         setIsRecording(false);
//         recognition.current.stop();
//     };

//     function copyToClipboard() {
//         navigator.clipboard.writeText(review);
//         alert("Code copied to clipboard!");
//     }

//     return (
      
//         <div className="container-fluid  vh-100"> 
//             <main className="d-flex"> 
//                 <div className="left col-md-6  h-100"> 
//                     <div className="code">
//                         <Editor
//                             value={code}
//                             onValueChange={setCode}
//                             highlight={(code) =>
//                                 prism.highlight(code, prism.languages.javascript, "javascript")
//                             }
//                             padding={10}
//                             className="code-editor"
//                         />
                        

//                     </div>
//                     <div className="main-buttons d-flex justify-content-around mt-3"> {/* Bootstrap spacing */}
//                     <select onChange={(e) => setSelectedVoice(voices.find(v => v.name === e.target.value).voiceObj)}  style={{background:"gray",borderRadius:"1em"}}>
//     {voices.map((voice, index) => (
//         <option key={index} value={voice.name}>{voice.shortName} ({voice.lang})</option>
//     ))}
// </select>
//                         <button onClick={help} className="btn btn-info">
//                             Therapist
//                         </button>
//                         <button onClick={writeCode} className="btn btn-primary">
//                             Solve
//                         </button>
//                         <button onClick={reviewCode} className="btn btn-success">
//                             Review
//                         </button>
//                         <button
//                             id="startButton"
//                             className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'} me-2`}
//                             onClick={isRecording ? stopRecording : startRecording}
//                             disabled={loading}
//                         >
//                             {isRecording ? 'Stop Recording' : 'Start Recording'}
//                         </button>
//                     </div>
//                 </div>
                  
                  



//                 <div className="right col-md-6"> {/* Adjust column size as needed */}
//                     {loading ? (
//                         <div className="spinner"></div>
//                     ) : (
//                         <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
//                     )}
//                     {isSpeaking && (
//     <button onClick={stopSpeaking} className="btn btn-danger">Stop Speaking</button>
// )}

//                 </div>
//             </main>
//         </div>
      
    // );


}

export default App;