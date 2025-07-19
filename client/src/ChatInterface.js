// import React, { useState, useEffect, useRef } from "react";
// import "prismjs/themes/prism-tomorrow.css";
// import Editor from "react-simple-code-editor";
// import prism from "prismjs";
// import Markdown from "react-markdown";
// import rehypeHighlight from "rehype-highlight";
// import "highlight.js/styles/github-dark.css";
// import axios from "axios";
// import "./App.css";
// import Navbar from "./Navbar";

// const ChatInterface = ({ role }) => {
//     const textareaRef = useRef(null);
//     const [code, setCode] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState("");
//     const [isRecording, setIsRecording] = useState(false);
//     const [selectedVoice, setSelectedVoice] = useState(null);
//     const [voices, setVoices] = useState([]);
//     const recognition = useRef(null);
//     const [isSpeaking, setIsSpeaking] = useState(false);
//     const [hearResponse, setHearResponse] = useState(true);
//     const messagesEndRef = useRef(null);
//     const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
//     const [voiceReady, setVoiceReady] = useState(false);
//     const messageHistoryLength = 7;
//     const [userMessageHistory, setUserMessageHistory] = useState([]);
//     const [selectedLanguage, setSelectedLanguage] = useState("en-US"); // Default to English


//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     };

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages]);

//     useEffect(() => {
//         prism.highlightAll();
//     }, [code]);

//     useEffect(() => {
//         if (!recognition.current) {
//             const SpeechRecognition =
//                 window.SpeechRecognition || window.webkitSpeechRecognition;
//             recognition.current = new SpeechRecognition();
//             recognition.current.continuous = true;
//             recognition.current.interimResults = false;

//             // **ADD THIS LINE: Set the language**
//             recognition.current.lang = selectedLanguage; // Use the state variable

//             recognition.current.onresult = async (event) => {
//                 const transcript =
//                     event.results[event.results.length - 1][0].transcript;
//                 setNewMessage((prev) => prev + transcript + " ");
//                 processAndSend(transcript, true);
//             };

//             recognition.current.onend = () => {
//                 setIsRecording(false);
//                 console.log("Speech recognition ended.");
//             };

//             recognition.current.onerror = (event) => {
//                 console.error("Speech recognition error:", event.error);
//                 setIsRecording(false);
//                 alert("Speech recognition error: " + event.error);
//             };
//         }
//     }, [selectedLanguage]); // Add selectedLanguage as a dependency. Re-init the recognition when language changes

//     useEffect(() => {
//         if (recognition.current) {
//             if (isRecording) {
//                 startRecordingImpl();
//             } else {
//                 stopRecordingImpl();
//             }
//         }
//     }, [isRecording, recognition.current]);

//     const processAndSend = async (transcript, isVoice = false) => {
//         if (isAwaitingResponse) return;

//         const userMessage = { sender: "user", text: transcript };
//         setMessages((prev) => [...prev, userMessage]);
//         updateUserMessageHistory(transcript);

//         setLoading(true);
//         setIsAwaitingResponse(true);

//         try {
//             const response = await axios.post("/api/v1/ai/chat", {
//                 code: transcript,
//                 role: role,
//                 context: userMessageHistory,
//             });

//             const aiText = response.data;
//             const aiMessage = { sender: "AI", text: aiText };
//             setMessages((prev) => [...prev, aiMessage]);

//             // **Critical:  Await the voice to be ready BEFORE speaking**
//             if (isVoice && hearResponse) {
//                 if (voiceReady && selectedVoice) {
//                     await speak(aiText);  // Await the speak function
//                 } else {
//                     console.warn("Voice not ready or no voice selected.  Response will not be spoken.");
//                 }
//             }

//             setNewMessage("");
//         } catch (error) {
//             console.error("Error sending message:", error);
//             setMessages((prev) => [
//                 ...prev,
//                 { sender: "AI", text: "Error processing your request." },
//             ]);
//         } finally {
//             setLoading(false);
//             setIsAwaitingResponse(false);

//             if (isRecording) {
//                 startRecordingImpl();
//             }
//         }
//     };

//     useEffect(() => {
//         const loadVoices = () => {
//             const allVoices = window.speechSynthesis.getVoices();
//             setVoices(allVoices);

//             // Set default voice *only* if voices are loaded and *none* is selected yet
//             if (allVoices.length > 0 && !selectedVoice) {
//                 setSelectedVoice(allVoices[0].voiceURI);
//             }

//             setVoiceReady(allVoices.length > 0);
//         };

//         loadVoices();
//         window.speechSynthesis.onvoiceschanged = loadVoices;

//         return () => {
//             window.speechSynthesis.onvoiceschanged = null;
//         };
//     }, [selectedVoice]);


//     const emojiMap = {
//         "😄": "haha laughing",
//         "😭": "crying sound",
//         "😡": "angry tone",
//         "😍": "excited voice",
//         "🤔": "thinking sound",
//     };

//     const cleanText = (text) => {
//         return text
//             .replace(/[^\w\s]/g, "")
//             .replace(/[\u{1F600}-\u{1F64F}]/gu, (match) => emojiMap[match] || "");
//     };

//     const speak = (text) => new Promise((resolve, reject) => {  // Return a promise
//         if (!selectedVoice || !voiceReady) {
//             console.warn("Voice not ready or no voice selected.");
//             reject("Voice not ready");  // Reject the promise
//             return;
//         }
//         window.speechSynthesis.cancel();
//         const utterance = new SpeechSynthesisUtterance(cleanText(text));
//         const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoice);

//         if (voice) {
//             utterance.voice = voice;
//         } else {
//             console.warn("Selected voice not found. Using default.");
//         }

//         utterance.onstart = () => setIsSpeaking(true);
//         utterance.onend = () => {
//             setIsSpeaking(false);
//             resolve();  // Resolve the promise when speaking is done
//         };
//         utterance.onerror = (event) => {
//             console.error("Speech synthesis error:", event.error);
//             setIsSpeaking(false);
//             reject(event.error);  // Reject the promise on error
//         };
//         window.speechSynthesis.speak(utterance);
//     });

//     const stopSpeaking = () => {
//         window.speechSynthesis.cancel();
//         setIsSpeaking(false);
//     };

//     const updateUserMessageHistory = (newMessage) => {
//         setUserMessageHistory(prevHistory => {
//             const newHistory = [...prevHistory, newMessage];
//             return newHistory.slice(-messageHistoryLength);
//         });
//     };



//     const startRecordingImpl = () => {
//         try {
//             recognition.current.start();
//             console.log("Recording started");
//         } catch (error) {
//             console.error("Error starting recording:", error);
//             setIsRecording(false);
//             alert(
//                 "Failed to start recording. Ensure browser supports speech recognition and microphone access is granted."
//             );
//         }
//     };

//     const stopRecordingImpl = () => {
//         if (recognition.current) {
//             recognition.current.stop();
//             console.log("Recording stopped");
//         }
//         setIsRecording(false);
//     };

//     const startRecording = () => {
//         setIsRecording(true);
//     };

//     const stopRecording = () => {
//         setIsRecording(false);
//     };

//     const handleSendMessage = async () => {
//         if (newMessage.trim() === "") return;

//         const userMessage = { sender: "user", text: newMessage };
//         setMessages((prev) => [...prev, userMessage]);
//         updateUserMessageHistory(newMessage);
//         setNewMessage("");
//         setLoading(true);
//         setIsAwaitingResponse(true);

//         if (textareaRef.current) {
//             textareaRef.current.style.height = "2rem";
//         }

//         try {
//             const response = await axios.post("/api/v1/ai/chat", {
//                 code: newMessage,
//                 role: role,
//                 context: userMessageHistory,
//             });
//             const aiText = response.data;

//             const aiMessage = { sender: "AI", text: aiText };
//             setMessages((prev) => [...prev, aiMessage]);



//             setNewMessage("");
//         } catch (error) {
//             console.error("Error sending message:", error);
//             setMessages((prev) => [
//                 ...prev,
//                 { sender: "AI", text: "Error processing your request." },
//             ]);
//         } finally {
//             setLoading(false);
//             setIsAwaitingResponse(false);


//         }
//     };

//     const toggleHearResponse = () => {
//         if (isSpeaking) {
//             stopSpeaking();
//         }
//         setHearResponse((prevHearResponse) => !prevHearResponse);
//     };

//     const speakLastResponse = () => {
//         const lastAiMessage = messages.filter((m) => m.sender === "AI").pop();
//         if (lastAiMessage) {
//             speak(lastAiMessage.text);
//         }
//     };

//     const handleLanguageChange = (event) => {
//         setSelectedLanguage(event.target.value);
//         // You might want to re-initialize recognition here.  Important!!
//         if (recognition.current) {
//             recognition.current.stop(); // Stop the old one
//         }
//         recognition.current = null; // Clear the ref
//         setIsRecording(false); // Stop any recording
//     };

//     return (
//         <div
//             className="d-flex flex-column"
//             style={{ backgroundColor: "#212121", height: "100vh" }}
//         >
//             <Navbar />
//             <div
//                 className="flex-grow-1 overflow-auto p-1"
//                 style={{ backgroundColor: "#212121" }}
//             >
//                 {messages.map((message, index) => (
//                     <div
//                         key={index}
//                         className={`message ${message.sender === "user" ? "user" : "ai"
//                             }`}
//                         style={{
//                             textAlign: message.sender === "user" ? "left" : "left",
//                             padding: "2px 2px",
//                             borderRadius: "8px",
//                             marginBottom: "4px",
//                             maxWidth: window.innerWidth > 768 ? "70%" : "95%",
//                             backgroundColor:
//                                 message.sender === "user" ? "#404040" : "#212121",
//                             marginRight: message.sender === "user" ? "2em" : "auto",
//                             marginLeft: message.sender === "AI" ? "3rem" : "auto",
//                             wordBreak: "break-word",
//                             color: "white",
//                         }}
//                     >
//                         {typeof message.text === 'string' ? (
//                             <Markdown rehypePlugins={[rehypeHighlight]} children={message.text} />
//                         ) : (
//                             <div>Error: Invalid message format</div>
//                         )}
//                     </div>
//                 ))}
//                 {loading && (
//                     <div className="text-center text-white">Loading...</div>
//                 )}
//                 <div ref={messagesEndRef} />
//             </div>

//             <div
//                 className="d-flex flex-column  mx-auto mb-3"
//                 style={{ backgroundColor: "#212121", width: "95%", maxWidth: "1200px" }}
//             >
//                 <textarea
//                     ref={textareaRef}
//                     style={{
//                         backgroundColor: "#1a1a1a",
//                         color: "white",
//                         minHeight: "1.5rem",
//                         maxHeight: "10rem",
//                         wordBreak: "break-word",
//                         overflowY: "auto",
//                         border: "none",
//                         borderRadius: "0.5em 0.5em 0 0",
//                         outline: 'none !important',
//                         width: "100%",
//                         resize: "none",
//                         padding: "0.5em",
//                         fontSize: "0.9rem",
//                         boxShadow: 'none !important',
//                         WebkitBoxShadow: 'none !important',
//                         '&:focus': {
//                             outline: 'none !important',
//                             boxShadow: 'none !important',
//                         },


//                     }}
//                     className="form-control"
//                     placeholder="Type your message..."
//                     value={newMessage}
//                     onChange={(e) => {
//                         setNewMessage(e.target.value);
//                         e.target.style.height = "auto";
//                         e.target.style.height =
//                             Math.min(Math.max(e.target.scrollHeight, 24), 160) + "px";
//                     }}
//                     onKeyDown={(e) => {
//                         if (e.key === "Enter" && !e.shiftKey) {
//                             e.preventDefault();
//                             handleSendMessage();
//                         }
//                     }}
//                 />

//                 <div className="d-flex align-items-center justify-content-between " style={{ padding: '0.3rem', backgroundColor: "rgb(26,26,26)", borderRadius: "0 0 0.5em 0.5em" }}>

//                     {/* Language Select */}
//                     <div className="d-flex align-item-center">
//                     <select
//                         value={selectedLanguage}
//                         onChange={handleLanguageChange}
//                         style={{
//                             background: "gray",
//                             borderRadius: "0.4em",
//                             marginRight: "8px",
//                             minWidth: "80px", // Increased width for language codes
//                             maxWidth: "120px",
//                             width: "100%",
//                             color: "white",
//                             height: "2rem",
//                             fontSize: "0.8rem"
//                         }}
//                     >
//                         <option value="en-US">English (US)</option>
//                         <option value="hi-IN">Hindi (India)</option>
//                         <option value="es-ES">Spanish (Spain)</option>
//                         <option value="fr-FR">French (France)</option>
//                         {/* Add other language options as needed */}
//                     </select>

//                     <select
//                         onChange={(e) => setSelectedVoice(e.target.value)}
//                         style={{
//                             background: "gray",
//                             borderRadius: "0.4em",
//                             marginRight: "8px",
//                             minWidth: "60px",
//                             maxWidth: "60px",
//                             width: "100%",
//                             color: "white",
//                             height: "2rem",
//                             fontSize: "0.8rem"
//                         }}
//                         value={selectedVoice || ''}
//                         disabled={!voiceReady}
//                     >
//                         {voices.map((voice, index) => (
//                             <option key={index} value={voice.voiceURI}>
//                                 {voice.name} ({voice.lang})
//                             </option>
//                         ))}
//                     </select>

//                     </div>

//                     <div className="d-flex align-items-center" >
//                         <button
//                             id="startButton"
//                             className={`btn ${isRecording ? "btn-danger" : "btn-primary"} me-2 `}
//                             onClick={() => {
//                                 if (isRecording) {
//                                     stopRecording();
//                                 } else {
//                                     startRecording();
//                                 }
//                             }}
//                             disabled={loading}
//                             style={{ height: "2rem", fontSize: "0.8rem", padding: "0.2rem 0.6rem" }}
//                         >
//                             {isRecording ? "🚫" : "🎙"}
//                         </button>

//                         <button
//                             className="btn btn-secondary me-2"
//                             onClick={toggleHearResponse}
//                             style={{ height: "2rem", fontSize: "0.8rem", padding: "0.2rem 0.6rem" }}
//                         >
//                             {hearResponse ? "🔊 " : "🔇 "}
//                         </button>
//                         {!hearResponse && (
//                             <button className="btn btn-info   mx-2" onClick={speakLastResponse} style={{ height: "2rem", fontSize: "0.8rem", padding: "0.2rem 0.6rem" }}>
//                                 🔊
//                             </button>
//                         )}

//                         <button
//                             className="btn btn-primary"
//                             onClick={() => handleSendMessage()}
//                             style={{
//                                 backgroundColor: "#212121",
//                                 height: "2rem",
//                                 width: "2rem",
//                                 borderRadius: "50%",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 padding: 0
//                             }}
//                         >
//                             <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 width="16"
//                                 height="16"
//                                 fill="currentColor"
//                                 className="bi bi-arrow-up"
//                                 viewBox="0 0 16 16"
//                                 style={{ color: "white" }}
//                             >
//                                 <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 0 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z" />
//                             </svg>
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <style>
//                 {`
//           input::placeholder {
//             color: white !important;
//             opacity: 1;
//           }

//           .message.ai pre {
//             background-color: #282c34;
//             color: #abb2bf;
//              font-size: 1.125rem;
//             border-radius: 0.3rem;
//             overflow-x: auto;
//             white-space: pre-wrap;
//           }

//           .message.ai code {
//             font-family: 'Courier New', Courier, monospace;
//             font-size: 1.125rem;

//           }
//             @media (max-width: 768px) {
//             .message.ai pre{
//                   font-size: 0.82rem;
//               }
//        .message.ai code {
//           font-size: 0.82rem; /* Smaller font for mobile */
//          }
// }

//           .code-block {
//             position: relative;
//           }

//           textarea:focus {
//               outline: none !important;
//               box-shadow: none !important;
//           }

//         `}
//             </style>
//         </div>
//     );
// };

// export default ChatInterface;



import React, { useState, useEffect, useRef } from "react";
import "prismjs/themes/prism-tomorrow.css";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import "./App.css";
import Navbar from "./Navbar";

const ChatInterface = ({ role }) => {
    const textareaRef = useRef(null);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [voices, setVoices] = useState([]);
    const recognition = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [hearResponse, setHearResponse] = useState(true);
    const messagesEndRef = useRef(null);
    const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
    const [voiceReady, setVoiceReady] = useState(false);
    const messageHistoryLength = 10; // Increased to consider a mix of user/AI
    const [messageHistory, setMessageHistory] = useState([]); // Store both user and AI messages
    const [selectedLanguage, setSelectedLanguage] = useState("en-US"); // Default to English
    const aiResponseSpacerRef = useRef(null); // NEW: Ref for extra space

    //Ref for the latest user message
    const latestUserMessageRef = useRef(null);

    const scrollToTop = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: 'start' });
    };

    useEffect(() => {
        if (latestUserMessageRef.current) {
            latestUserMessageRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [messages]); // Scroll whenever 'messages' changes (new message added)

    useEffect(() => {
        prism.highlightAll();
    }, [code]);

    useEffect(() => {
        const initializeRecognition = () => {
            if (recognition.current) {
                recognition.current.onresult = null;
                recognition.current.onend = null;
                recognition.current.onerror = null;
                recognition.current = null;  // Clear the old reference.
            }

            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = true;
            recognition.current.interimResults = true; //**** Enable interim results

            // **ADD THIS LINE: Set the language**
            recognition.current.lang = selectedLanguage; // Use the state variable

            recognition.current.onresult = async (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                // Update the newMessage state with the combined interim and final transcripts
                setNewMessage(prev => finalTranscript + interimTranscript); // Append new text

                if (finalTranscript) {
                    // Only send the final transcript for processing
                    processAndSend(finalTranscript, true);
                }
            };

            recognition.current.onend = () => {
                setIsRecording(false);
                console.log("Speech recognition ended.");
            };

            recognition.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsRecording(false);
                alert("Speech recognition error: " + event.error);
            };
        };

        initializeRecognition(); // Initialize on mount and language change.

        return () => {
            // Cleanup:  Remove event listeners.  CRITICAL!
            if (recognition.current) {
                recognition.current.onresult = null;
                recognition.current.onend = null;
                recognition.current.onerror = null;
            }
        };
    }, [selectedLanguage]); // Add selectedLanguage as a dependency. Re-init the recognition when language changes

    useEffect(() => {
        if (recognition.current) {
            if (isRecording) {
                startRecordingImpl();
            } else {
                stopRecordingImpl();
            }
        }
    }, [isRecording, recognition.current]);

    const processAndSend = async (transcript, isVoice = false) => {
        if (isAwaitingResponse) return;

        const userMessage = { sender: "user", text: transcript };
        setMessages((prev) => [...prev, userMessage]);
        updateMessageHistory(userMessage); // Update history with user message

        setLoading(true);
        setIsAwaitingResponse(true);

        try {
            // Create context using messageHistory
            const context = messageHistory.slice(-messageHistoryLength).map(msg => msg.text);

            const response = await axios.post("/api/v1/ai/chat", {
                code: transcript,
                role: role,
                context: context,
            });

            const aiText = response.data;
            const aiMessage = { sender: "AI", text: aiText };
            setMessages((prev) => [...prev, aiMessage]);
            updateMessageHistory(aiMessage); // Update history with AI message

            // **Critical:  Await the voice to be ready BEFORE speaking**
            if (isVoice && hearResponse) {
                if (voiceReady && selectedVoice) {
                    await speak(aiText);  // Await the speak function
                } else {
                    console.warn("Voice not ready or no voice selected.  Response will not be spoken.");
                }
            }

            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "AI", text: "Error processing your request." },
            ]);
        } finally {
            setLoading(false);
            setIsAwaitingResponse(false);

            if (isRecording) {
                startRecordingImpl();
            }
        }
    };

    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            setVoices(allVoices);

            // Set default voice *only* if voices are loaded and *none* is selected yet
            if (allVoices.length > 0 && !selectedVoice) {
                setSelectedVoice(allVoices[0].voiceURI);
            }

            setVoiceReady(allVoices.length > 0);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [selectedVoice]);

    const emojiMap = {
        "😄": "haha laughing",
        "😭": "crying sound",
        "😡": "angry tone",
        "😍": "excited voice",
        "🤔": "thinking sound",
    };

    const cleanText = (text) => {
        return text
            .replace(/[^\w\s]/g, "")
            .replace(/[\u{1F600}-\u{1F64F}]/gu, (match) => emojiMap[match] || "");
    };

    const speak = (text) => new Promise((resolve, reject) => {  // Return a promise
        if (!selectedVoice || !voiceReady) {
            console.warn("Voice not ready or no voice selected.");
            reject("Voice not ready");  // Reject the promise
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText(text));
        const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoice);

        if (voice) {
            utterance.voice = voice;
        } else {
            console.warn("Selected voice not found. Using default.");
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            resolve();  // Resolve the promise when speaking is done
        };
        utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event.error);
            setIsSpeaking(false);
            reject(event.error);  // Reject the promise on error
        };
        window.speechSynthesis.speak(utterance);
    });

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const updateMessageHistory = (newMessage) => {
        setMessageHistory(prevHistory => {
            const newHistory = [...prevHistory, newMessage];
            return newHistory;
        });
    };

    const startRecordingImpl = () => {
        try {
            recognition.current.start();
            console.log("Recording started");
        } catch (error) {
            console.error("Error starting recording:", error);
            setIsRecording(false);
            alert(
                "Failed to start recording. Ensure browser supports speech recognition and microphone access is granted."
            );
        }
    };

    const stopRecordingImpl = () => {
        if (recognition.current) {
            recognition.current.stop();
            console.log("Recording stopped");
        }
        setIsRecording(false);
    };

    const startRecording = () => {
        setIsRecording(true);
    };

    const stopRecording = () => {
        setIsRecording(false);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === "") return;

        const userMessage = { sender: "user", text: newMessage };
        setMessages((prev) => [...prev, userMessage]);
        updateMessageHistory(userMessage);
        setNewMessage("");
        setLoading(true);
        setIsAwaitingResponse(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = "2rem";
        }

        try {
            const context = messageHistory.slice(-messageHistoryLength).map(msg => msg.text);

            const response = await axios.post("/api/v1/ai/chat", {
                code: newMessage,
                role: role,
                context: context,
            });
            const aiText = response.data;

            const aiMessage = { sender: "AI", text: aiText };
            setMessages((prev) => [...prev, aiMessage]);
            updateMessageHistory(aiMessage);

            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "AI", text: "Error processing your request." },
            ]);
        } finally {
            setLoading(false);
            setIsAwaitingResponse(false);
        }
    };

    const toggleHearResponse = () => {
        if (isSpeaking) {
            stopSpeaking();
        }
        setHearResponse((prevHearResponse) => !prevHearResponse);
    };

    const speakLastResponse = () => {
        const lastAiMessage = messages.filter((m) => m.sender === "AI").pop();
        if (lastAiMessage) {
            speak(lastAiMessage.text);
        }
    };

    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value);
    };

    return (
        <div
            className="d-flex flex-column"
            style={{ backgroundColor: "#212121", height: "100vh" }}
        >
            <Navbar />
            <div
                className="flex-grow-1 overflow-auto p-1"
                style={{ backgroundColor: "#212121" }}
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.sender === "user" ? "user" : "ai"
                            }`}
                        style={{
                            textAlign: message.sender === "user" ? "left" : "left",
                            padding: "2px 2px",
                            borderRadius: "8px",
                            marginBottom: "4px",
                            maxWidth: window.innerWidth > 768 ? "70%" : "95%",
                            backgroundColor:
                                message.sender === "user" ? "#404040" : "#212121",
                            marginRight: message.sender === "user" ? "2em" : "auto",
                            marginLeft: message.sender === "AI" ? "3rem" : "auto",
                            wordBreak: "break-word",
                            color: "white",
                        }}
                        ref={message.sender === 'user' ? latestUserMessageRef : null} // Attach ref to user messages
                    >
                        {typeof message.text === 'string' ? (
                            <Markdown rehypePlugins={[rehypeHighlight]} children={message.text} />
                        ) : (
                            <div>Error: Invalid message format</div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="text-center text-white">Loading...</div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div
                className="d-flex flex-column  mx-auto mb-3"
                style={{ backgroundColor: "#212121", width: "95%", maxWidth: "1200px" }}
            >
                <textarea
                    ref={textareaRef}
                    style={{
                        backgroundColor: "#1a1a1a",
                        color: "white",
                        minHeight: "1.5rem",
                        maxHeight: "10rem",
                        wordBreak: "break-word",
                        overflowY: "auto",
                        border: "none",
                        borderRadius: "0.5em 0.5em 0 0",
                        outline: 'none !important',
                        width: "100%",
                        resize: "none",
                        padding: "0.5em",
                        fontSize: "0.9rem",
                        boxShadow: 'none !important',
                        WebkitBoxShadow: 'none !important',
                        '&:focus': {
                            outline: 'none !important',
                            boxShadow: 'none !important',
                        },
                    }}
                    className="form-control"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height =
                            Math.min(Math.max(e.target.scrollHeight, 24), 160) + "px";
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />

                <div className="d-flex align-items-center justify-content-between " style={{ padding: '0.3rem', backgroundColor: "rgb(26,26,26)", borderRadius: "0 0 0.5em 0.5em" }}>
                    {/* Language Select */}
                    <div className="d-flex align-item-center">
                        <select
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                            style={{
                                background: "gray",
                                borderRadius: "0.4em",
                                marginRight: "8px",
                                minWidth: "80px", // Increased width for language codes
                                maxWidth: "120px",
                                width: "100%",
                                color: "white",
                                height: "2rem",
                                fontSize: "0.8rem"
                            }}
                            aria-label="Select Language"
                        >
                            <option value="en-US">English (US)</option>
                            <option value="hi-IN">Hindi (India)</option>
                            <option value="es-ES">Spanish (Spain)</option>
                            <option value="fr-FR">French (France)</option>
                            {/* Add other language options as needed */}
                        </select>

                        <select
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            style={{
                                background: "gray",
                                borderRadius: "0.4em",
                                marginRight: "8px",
                                minWidth: "60px",
                                maxWidth: "60px",
                                width: "100%",
                                color: "white",
                                height: "2rem",
                                fontSize: "0.8rem"
                            }}
                            value={selectedVoice || ''}
                            disabled={!voiceReady}
                            aria-label="Select Voice"
                        >
                            {voices.map((voice, index) => (
                                <option key={index} value={voice.voiceURI}>
                                    {voice.name} ({voice.lang})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="d-flex align-items-center" >
                        <button
                            id="startButton"
                            className={`btn ${isRecording ? "btn-danger" : "btn-primary"} me-2 `}
                            onClick={() => {
                                if (isRecording) {
                                    stopRecording();
                                } else {
                                    startRecording();
                                }
                            }}
                            disabled={loading}
                            style={{ height: "2rem", fontSize: "0.8rem", padding: "0.2rem 0.6rem" }}
                            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
                        >
                            {isRecording ? "🚫" : "🎙"}
                        </button>

                        <button
                            className="btn btn-secondary me-2"
                            onClick={toggleHearResponse}
                            style={{ height: "2rem", fontSize: "0.8rem", padding: "0.2rem 0.6rem" }}
                            aria-label={hearResponse ? "Mute Response" : "Unmute Response"}
                        >
                            {hearResponse ? "🔊 " : "🔇 "}
                        </button>
                        {!hearResponse && (
                            <button className="btn btn-info   mx-2" onClick={speakLastResponse} style={{ height: "2rem", fontSize: "0.8rem", padding: "0.2rem 0.6rem" }} aria-label="Speak Last Response">
                                🔊
                            </button>
                        )}

                        <button
                            className="btn btn-primary"
                            onClick={() => handleSendMessage()}
                            style={{
                                backgroundColor: "#212121",
                                height: "2rem",
                                width: "2rem",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 0
                            }}
                            aria-label="Send Message"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-arrow-up"
                                viewBox="0 0 16 16"
                                style={{ color: "white" }}
                            >
                                <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 0 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <style>
                {`
                  input::placeholder {
                    color: white !important;
                    opacity: 1;
                  }

                  .message.ai pre {
                    background-color: #282c34;
                    color: #abb2bf;
                     font-size: 1.125rem;
                    border-radius: 0.3rem;
                    overflow-x: auto;
                    white-space: pre-wrap;
                  }

                  .message.ai code {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 1.125rem;
                  }
                    @media (max-width: 768px) {
                    .message.ai pre{
                          font-size: 0.82rem;
                      }
               .message.ai code {
                  font-size: 0.82rem; /* Smaller font for mobile */
                 }
        }
                  .code-block {
                    position: relative;
                  }

                  textarea:focus {
                      outline: none !important;
                      box-shadow: none !important;
                  }
                `}
            </style>
        </div>
    );
};

export default ChatInterface;
