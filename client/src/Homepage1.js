import React, { useState, useEffect, useRef } from "react";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import "./App.css";
import Navbar from "./Navbar";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import MonacoEditor from "@monaco-editor/react";

const defaultCode = {
  javascript: `function sum() {\n  return 1 + 1;\n}`,
  python: `def sum():\n  return 1 + 1`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, World!" << endl;\n  return 0;\n}`,
  java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`,
  csharp: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        Console.WriteLine("Hello, World!");\n    }\n}`,
  golang: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
  ruby: `puts "Hello, World!"`,
};


//Valid Monaco themes
const monacoThemes = [
  { value: "vs-dark", label: "VS Dark" },
  { value: "vs", label: "VS Light" },
  { value: "hc-black", label: "HC Black" },

];

const Homepage = () => {
  const [code, setCode] = useState(defaultCode.javascript);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const messagesEndRef = useRef(null);
  const [language, setLanguage] = useState("javascript");
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState("vs-dark"); // Default to 'vs-dark'
  const [fontSize, setFontSize] = useState(16);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Initial width of the left panel in percentage
  const resizerRef = useRef(null);

  useEffect(() => {
    setCode(defaultCode[language]);
  }, [language]);

  const fetchDataFromAI = async (endpoint, role) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/v1/ai/${endpoint}`, {
        code,
        role,
      });
      setReview(response.data);
    } catch (error) {
      setReview(
        Error `fetching ${endpoint}. Please try again. Details: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  async function reviewCode() {
    await fetchDataFromAI("get-review", "developer");
  }
  async function checkCode() {
    await fetchDataFromAI("get-review", "errorChecker");
  }

  async function writeCode() {
    await fetchDataFromAI("get-review", "expert");
  }

  async function executeCode() {
    setLoading(true);
    setReview("");
    try {
      const response = await axios.post("/api/v1/code/execute", {
        code: code,
        language: language,
        input: input,
      });

      if (response.data.error) {
        setOutput(Error `${response.data.error}`);
      } else {
        setOutput(response.data.output || "No output");
      }
    } catch (error) {
      setOutput(
        Error `executing code. Check console for details: ${error.message}`
      );
      console.error("Execution error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const onChange = (newValue) => {
    setCode(newValue);
  };

  const getMonacoLanguage = () => {
    switch (language) {
      case "javascript":
        return "javascript";
      case "python":
        return "python";
      case "cpp":
        return "cpp";
      case "java":
        return "java";
      case "csharp":
        return "csharp";
      case "golang":
        return "go";
      case "ruby":
        return "ruby";
      default:
        return "javascript";
    }
  };

  const handlePanelResize = (e) => {
    const newLeftPanelWidth = (e.clientX / window.innerWidth) * 100;
    if (newLeftPanelWidth > 8 && newLeftPanelWidth < 90) {
      setLeftPanelWidth(newLeftPanelWidth);
    }
  };
  const handleTouchResize = (e) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      const newLeftPanelWidth = (touch.clientX / window.innerWidth) * 100;
      if (newLeftPanelWidth > 8 && newLeftPanelWidth < 90) {
        setLeftPanelWidth(newLeftPanelWidth);
      }
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handlePanelResize);
    document.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("touchmove", handleTouchResize); // Remove touchmove listener
    document.removeEventListener("touchend", handleMouseUp);
  };

  const handleMouseDown = (e) => {
    document.addEventListener("mousemove", handlePanelResize);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchResize); // Add touchmove listener
    document.addEventListener("touchend", handleMouseUp); // Use the same mouseup handler for touchend
  };
  const monacoOptions = {
    selectOnLineNumbers: true,
    roundedSelection: true,
    cursorStyle: "line",
    automaticLayout: true,
    fontSize: fontSize,
    wordWrap: "on",

    suggestOnTrigger: true, // Enable globally
    snippetSuggestions: "inline", // Enable snippets
    wordBasedSuggestions: true, // Enable word-based suggestions
    showUnused: false,
    showDeprecated: false,
  };


  return (
    <div className="vh-100 w-100">
      <Navbar />
      <div className="w-100" style={{ height: "92vh" }}>
        <main
          className="grid-container"
          style={{
            height: "100%",
            display: "grid",
            gridTemplateColumns: `${leftPanelWidth}% ${
              100 - leftPanelWidth
            }%`, // Use state for grid columns
          }}
        >
          <div
            className="left"
            style={{
              position: "relative",
            }}
          >
            {/* Resizer */}
            <div
              ref={resizerRef}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "5px",
                backgroundColor: "#3498db",
                height: "100%",
                cursor: "col-resize",
                zIndex: 10, // Ensure it's above other elements
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown} // Add touch start listener
            ></div>
            <div className="code " style={{ padding: "0px" }}>
              <div className="d-flex justify-content-around">
                <div
                  className="d-flex"
                  style={{
                    backgroundColor: "#212121",
                    color: "wheat",
                    width: "100%",
                    height: "2em",
                    marginTop: "0px",
                    padding: "2px",
                    alignItems: "center",
                  }}
                >
                  <label htmlFor="fontSize" style={{ marginRight: "5px" }}>
                    Font
                  </label>
                  <select
                    id="fontSize"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    style={{
                      backgroundColor: "#333",
                      color: "wheat",
                      marginRight: "2px",
                      padding: "1px",
                    }}
                  >
                    <option value="12">12px</option>
                    <option value="14">14px</option>
                    <option value="16">16px</option>
                    <option value="18">18px</option>
                    <option value="20">20px</option>
                    <option value="24">24px</option>
                  </select>

                  <select
                    onChange={(e) => setTheme(e.target.value)}
                    style={{
                      backgroundColor: "#333",
                      color: "wheat",
                      padding: "1px",
                      margin: "2px"
                    }}
                  >
                    {monacoThemes.map((theme) => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label}
                      </option>
                    ))}
                  </select>



                  <select
                    className="form-control"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                      backgroundColor: "#333",
                      color: "wheat",
                      width: "5em",
                      margin: "1px",

                      padding: "1px"
                    }}
                  >
                    <option value="javascript">JavaScript </option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="csharp">C#</option>
                    <option value="golang">Go</option>
                    <option value="ruby">Ruby</option>
                  </select>
                </div>
              </div>

              <MonacoEditor
                height="100vh"
                width="100%"
                language={getMonacoLanguage()}
                theme={theme}
                value={code}
                options={monacoOptions}
                onChange={onChange}
              />
            </div>
            <div className="d-flex justify-content-around mt-1 mb-1">
              <button onClick={executeCode} className="btn btn-info">
                Run
              </button>
              <button
                onClick={writeCode}
                className="btn btn-primary"
                style={{ backgroundColor: "#003d4d" }}
              >
                Solve
              </button>
              <button
                onClick={reviewCode}
                className="btn btn-success"
                style={{ backgroundColor: "#006680" }}
              >
                Review
              </button>

              <button
                className="btn"
                onClick={checkCode}
                style={{ backgroundColor: "#234565", color: "white" }}
              >
                check
              </button>
            </div>
            <div>
              <textarea
                className="input-box"
                value={input}
                onChange={handleInputChange}
                placeholder="Enter input here before running the code ..."
              />
            </div>
          </div>

          <div
            className="right ai-review-panel"
            style={{
              height: "100%",
              backgroundColor: "#212121",
              overflow: "auto",
            }}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
            )}
            <div>
              {!review && !loading && (
                <textarea
                  className="output-box"
                  style={{ backgroundColor: "#212121" }}
                  value={output}
                  readOnly
                  placeholder={`Code output/review/solution will appear here ... 
                    


                  INSTRUCTIONS:

                  Check – To check for syntax errors and logical mistakes.   

                  Review – To review your code (DSA/Development), identify errors, and 
                           get a better-optimized version.   

                  Solve – Write any coding problem in text form, and you will get a solution or copy paste a soultion and you'll get correct solution.   

                  Run – To execute the code you provide. `}
                />
              )}
            </div>
          </div>
        </main>
      </div>
      <style>
        {`
        textarea::placeholder {
          white-space: pre-line;
        }

        .ai-review-panel pre {
          background-color: #0d0d0d; /* Slightly darker background */
          padding: 5px;
          border-radius: 5px;
          overflow-x: auto;
          color: #f8f8f2; /* Dracula color palette */
          border: 1px solid #444;
        }

        .ai-review-panel code {
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }

        .input-box {
          background-color: #212121;
          color: #abb2bf;
          width: 100%;
          height: auto;
          min-height: 5em;
          overflow-x: auto;
          resize: vertical;
        }

        .output-box {
          background-color: #212121;
          color: #abb2bf;
          border-color: transparent;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          margin-top: 10px;
          width: 100%;
          height: 100vh;
          resize: vertical;
        }

        .grid-container {
          display: grid;
        }
         
      `}
      </style>
    </div>
  );
};

export default Homepage;
