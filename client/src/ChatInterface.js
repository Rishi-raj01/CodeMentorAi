import React, { useState, useEffect, useRef } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
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
    const [review, setReview] = useState(``);
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
    const [isAwaitingResponse, setIsAwaitingResponse] = useState(false); // Flag to prevent AI feedback loop

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        prism.highlightAll();
    }, [code]);

    useEffect(() => {
        if (!recognition.current) {
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = true;
            recognition.current.lang = "en-US";
            recognition.current.interimResults = false;

            recognition.current.onresult = async (event) => {
                const transcript =
                    event.results[event.results.length - 1][0].transcript;
                setNewMessage((prev) => prev + transcript + " ");
                processAndSend(transcript);
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
        }
    }, []);

    useEffect(() => {
        if (recognition.current) { // Ensure recognition.current is defined
            if (isRecording) {
                startRecordingImpl();
            } else {
                stopRecordingImpl();
            }
        }
    }, [isRecording, recognition.current]);

    const processAndSend = async (transcript) => {
        if (isAwaitingResponse) return; // Prevent processing if AI response is pending

        const userMessage = { sender: "user", text: transcript };
        setMessages((prev) => [...prev, userMessage]);

        setLoading(true);
        setIsAwaitingResponse(true); // Set the flag

        try {
            const response = await axios.post("/api/v1/ai/chat", {
                code: transcript,
                role: role,
            });

            // **CRITICAL:**  Assuming your API returns JSON like { text: "markdown string" }
            // Extract the text.  If it's *already* a markdown string, just use:
            const aiText = response.data; // Or response.data.text, depending on your backend
            const aiMessage = { sender: "AI", text: aiText };
            setMessages((prev) => [...prev, aiMessage]);

            if (hearResponse) {
                speak(aiText);
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
            setIsAwaitingResponse(false); // Reset the flag
            if (isRecording) {
                startRecordingImpl();
            }
        }
    };

    useEffect(() => {
        const loadVoices = () => {
            const allowedVoices = [
                "Microsoft Madhur Online (Natural) - Hindi (India)",
                "Microsoft Swara Online (Natural) - Hindi (India)",
                "Microsoft Neerja Online (Natural) - English (India)",
                "Microsoft Prabhat Online (Natural) - English (India)",
            ];

            const allVoices = window.speechSynthesis.getVoices();
            const filteredVoices = allVoices
                .filter((voice) => allowedVoices.includes(voice.name))
                .map((voice) => ({
                    name: voice.name,
                    shortName: voice.name.split(" Online")[0].replace("Microsoft ", ""),
                    lang: voice.lang,
                    voiceObj: voice,
                }));

            setVoices(filteredVoices);
            if (filteredVoices.length > 0)
                setSelectedVoice(filteredVoices[0].voiceObj);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

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

    const speak = (text) => {
        if (!selectedVoice) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText(text));
        utterance.voice = selectedVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    async function help() {
        setLoading(true);
        try {
            const response = await axios.post("/api/v1/ai/chat", {
                code,
                role: role,
            });
            setReview(response.data);
            if (hearResponse) {
                speak(response.data);
            }
            setMessages((prev) => [
                ...prev,
                { sender: "AI", text: response.data.reply },
            ]);
        } catch (error) {
            console.error("Error chatting with AI:", error);
        } finally {
            setLoading(false);
        }
    }

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
        setNewMessage("");
        setLoading(true);
        setIsAwaitingResponse(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = "2rem";
        }

        try {
            const response = await axios.post("/api/v1/ai/chat", {
                code: newMessage,
                role: role,
            });
             const aiText = response.data; // Or response.data.text, depending on your backend

            const aiMessage = { sender: "AI", text: aiText };
            setMessages((prev) => [...prev, aiMessage]);

            if (hearResponse) {
                speak(aiText);
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

    return (
        <div
            className="vh-100 w-100 d-flex flex-column fixed-top"
            style={{ backgroundColor: "#212121" }}
        >
            <Navbar />
            <div
                className="flex-grow-1 overflow-auto p-3"
                style={{ backgroundColor: "#212121" }}
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.sender === "user" ? "user" : "ai"
                            }`}
                        style={{
                            textAlign: message.sender === "user" ? "right" : "left",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            backgroundColor:
                                message.sender === "user" ? "#404040" : "#212121",
                            maxWidth: "70%",
                            // marginLeft: message.sender === "user" ? "auto" : "0",

                            marginRight: message.sender === "user" ? "0" : "auto",
                            wordBreak: "break-word",
                            color: "white",
                        }}
                    >
                        {typeof message.text === 'string' ? (
                             <Markdown rehypePlugins={[rehypeHighlight]} children={message.text} />
                        ) : (
                            <div>Error: Invalid message format</div> // Or some other fallback
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="text-center text-white">Loading...</div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div
                className=" d-flex align-items-center h-auto mx-auto"
                style={{ backgroundColor: "#212121", width: "90%" }}
            >
                <select
                    onChange={(e) =>
                        setSelectedVoice(
                            voices.find((v) => v.name === e.target.value).voiceObj
                        )
                    }
                    style={{
                        background: "gray",
                        borderRadius: "0.4em",
                        marginRight: "8px",
                        minWidth: "70px",
                        maxWidth: "70px",
                        width: "100%",
                        color: "white",
                    }}
                >
                    {voices.map((voice, index) => (
                        <option key={index} value={voice.name}>
                            {voice.shortName} ({voice.lang})
                        </option>
                    ))}
                </select>

                <textarea
                    ref={textareaRef}
                    style={{
                        backgroundColor: "#1a1a1a",
                        color: "white",
                        minHeight: "2rem",
                        maxHeight: "20rem",
                        wordBreak: "break-word",
                        overflowY: "auto",
                        flexGrow: 1,
                        border: "none",
                        borderRadius: "0.5em",
                        outline: "none",
                        width: "100%",
                        resize: "none",
                    }}
                    className="form-control me-2"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height =
                            Math.min(Math.max(e.target.scrollHeight, 32), 320) + "px";
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(); // Send, respect hearResponse setting
                        }
                    }}
                />

                <button
                    className="btn btn-primary me-2"
                    style={{ backgroundColor: "#212121" }}
                    onClick={() => handleSendMessage()} // Send, respect hearResponse setting
                >
                    Send
                </button>

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
                >
                    {isRecording ? "🚫" : "🎙"}
                </button>

                <button
                    className="btn btn-secondary"
                    onClick={toggleHearResponse}
                >
                    {hearResponse ? "🔊 " : "🔇 "}
                </button>
                {!hearResponse && (
                    <button className="btn btn-info   mx-2" onClick={speakLastResponse}>
                        🔊
                    </button>
                )}
            </div>
            <div className="d-flex justify-content-center">

                
            </div>

            <style>
                {`
          input::placeholder {
            color: white !important;
            opacity: 1;
          }

        
          /* Style code blocks within Markdown */
          .message.ai pre {
            background-color: #282c34; /* Darker background for code blocks */
            color: #abb2bf; /* Light gray color for code text */
            padding: 0.5rem;
            border-radius: 0.3rem;
            overflow-x: auto; /* Enable horizontal scrolling for long code lines */
            white-space: pre-wrap; /* Wrap long lines of code */
          }
            

          .message.ai code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.9rem;
          }
          .code-block {
            position: relative;
          }
          
        `}
            </style>
        </div>
    );
};

export default ChatInterface;