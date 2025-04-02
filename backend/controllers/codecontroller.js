// const { spawn } = require('child_process');

// const languageExecutables = {
//     'javascript': 'node',
//     'python': 'python3', // or 'python' depending on the system
//     'cpp': 'g++',
//     'java': 'java' // Requires pre-compilation.  See notes below.
// };

// module.exports.execute = async (req, res) => {
//     const language = req.body.language; // e.g., "python", "javascript", "cpp"
//     const code = req.body.code;

//     console.log("Language from backend: ", language);
//     console.log("Code from backend:\n", code);

//     const executable = languageExecutables[language];

//     if (!executable) {
//         return res.status(400).json({ error: `Unsupported language: ${language}` });
//     }

//     try {
//         let child;

//         if (language === 'cpp') {
//             // Compile C++ code
//             const executableName = 'my_program'; // Or generate a unique name
//             child = spawn(executable, ['-o', executableName, '-x', 'c++', '-', '-std=c++14']);
           

//              let compileError = '';
//             child.stderr.on('data', (data) => {
//                 compileError += data.toString();
//             });

//             child.stdin.write(code);
//             child.stdin.end();
//              await new Promise((resolve) => {
//                 child.on('close', (code) => {
//                     if (code !== 0) {
//                          return res.status(400).json({ error: `Compilation error: ${compileError}`,output : '',exitCode : code });
//                     }
//                      const executionChild = spawn(`./${executableName}`);
//                      let output = '';
//                      let error = '';
//                     executionChild.stdout.on('data', (data) => {
//                     output += data.toString();
//                     });

//                     executionChild.stderr.on('data', (data) => {
//                          error += data.toString();
//                     });

//                      executionChild.on('close', (code) => {
//                           res.json({ output: output, error: error, exitCode: code });
//                            resolve();
//                     });
                    
//                   });

//               });
//         } else if(language === 'java'){
//              // Compile Java code
//             const className = 'Main'; // Assuming the class name is Main
//             child = spawn('javac', ['-']);
//             let compileError = '';

//             child.stderr.on('data', (data) => {
//                 compileError += data.toString();
//             });

//             child.stdin.write(code);
//             child.stdin.end();

//             await new Promise((resolve) => {
//                 child.on('close', (code) => {
//                     if (code !== 0) {
//                         return res.status(400).json({ error: `Compilation error: ${compileError}`,output : '',exitCode : code });
//                     }
//                    const executionChild = spawn('java', [className]);
//                     let output = '';
//                     let error = '';

//                     executionChild.stdout.on('data', (data) => {
//                          output += data.toString();
//                     });

//                     executionChild.stderr.on('data', (data) => {
//                          error += data.toString();
//                     });

//                     executionChild.on('close', (code) => {
//                          res.json({ output: output, error: error, exitCode: code });
//                          resolve();
//                     });
//                 });
//             });
//         }

//         else {
//             // Execute interpreted languages (JavaScript, Python)
//             child = spawn(executable, ['-e', code]); // Or pass code via stdin

//             let output = '';
//             let error = '';

//             child.stdout.on('data', (data) => {
//                 output += data.toString();
//             });

//             child.stderr.on('data', (data) => {
//                 error += data.toString();
//             });

//             child.on('close', (code) => {
//                 res.json({ output: output, error: error, exitCode: code });
//             });
//         }

//         // Handle potential errors during spawn
//     } catch (err) {
//         console.error("Error spawning child process:", err);
//         return res.status(500).json({ error: "Internal server error", output: '',exitCode : -1 });
//     }
// };



// const { spawn } = require('child_process');
// const util = require('util');
// const fs = require('fs');
// const unlink = util.promisify(fs.unlink);

// const languageExecutables = {
//     'javascript': 'node',
//     'python': 'python3',
//     'cpp': 'g++',
//     'java': 'java'
// };

// module.exports.execute = async (req, res) => {
//     const language = req.body.language;
//     const code = req.body.code;
//     const input = req.body.input || ''; // Get input from request body

//     console.log("Language from backend: ", language);
//     console.log("Code from backend:\n", code);
//     console.log("Input from backend:\n", input); // Log the input

//     const executable = languageExecutables[language];

//     if (!executable) {
//         return res.status(400).json({ error: `Unsupported language: ${language}`, output: '', exitCode: -1 });
//     }

//     try {
//         let child;
//         let output = '';
//         let error = '';
//         let exitCode = 0; // Initialize exitCode

//         if (language === 'cpp') {
//             const executableName = `temp_cpp_${Date.now()}`; // Unique name
//             const compileChild = spawn(executable, ['-o', executableName, '-x', 'c++', '-', '-std=c++14']);

//             compileChild.stderr.on('data', (data) => {
//                 error += data.toString();
//             });

//             compileChild.stdin.write(code);
//             compileChild.stdin.end();

//             exitCode = await new Promise((resolve) => {
//                 compileChild.on('close', (code) => {
//                     resolve(code);
//                 });
//             });

//             if (exitCode !== 0) {
//                 return res.status(400).json({ error: `Compilation error: ${error}`, output: '', exitCode: exitCode });
//             }

//             child = spawn(`./${executableName}`);
//             if (input) {
//                 child.stdin.write(input);
//                 child.stdin.end(); // Only end stdin if there's input
//             } else {
//                 child.stdin.end()
//             }

//             child.stdout.on('data', (data) => {
//                 output += data.toString();
//             });

//             child.stderr.on('data', (data) => {
//                 error += data.toString();
//             });

//             exitCode = await new Promise((resolve) => {
//                 child.on('close', (code) => {
//                     resolve(code);
//                 });
//             });

//             // Cleanup the executable
//             setTimeout(async () => {
//                 try {
//                     await unlink(`./${executableName}`);
//                     console.log(`Successfully deleted executable ./${executableName}`);
//                 } catch (e) {
//                     console.error("Failed to delete executable after timeout:", e);
//                     //Consider sending an error to the client, especially during debugging.
//                 }
//             }, 5 * 60 * 1000); //
//         } else if (language === 'java') {
//             const className = 'Main'; // Still assuming Main
//             //TODO: Extract classname from java file

//             const compileChild = spawn('javac', ['-']);

//             compileChild.stderr.on('data', (data) => {
//                 error += data.toString();
//             });

//             compileChild.stdin.write(code);
//             compileChild.stdin.end();

//             exitCode = await new Promise((resolve) => {
//                 compileChild.on('close', (code) => {
//                     resolve(code);
//                 });
//             });

//             if (exitCode !== 0) {
//                 return res.status(400).json({ error: `Compilation error: ${error}`, output: '', exitCode: exitCode });
//             }

//             child = spawn('java', [className]);
//             if (input) {
//                 child.stdin.write(input);
//                 child.stdin.end(); // Only end stdin if there's input
//             } else {
//                 child.stdin.end()
//             }

//             child.stdout.on('data', (data) => {
//                 output += data.toString();
//             });

//             child.stderr.on('data', (data) => {
//                 error += data.toString();
//             });

//             exitCode = await new Promise((resolve) => {
//                 child.on('close', (code) => {
//                     resolve(code);
//                 });
//             });

//         } else {
//             // Use stdin for interpreted languages
//             child = spawn(executable);
//             child.stdin.write(code); // Always write the code
//             if (input) {
//                 child.stdin.write(input);
//                 child.stdin.end(); // Only end stdin if there's input
//             } else {
//                 child.stdin.end()
//             }


//             child.stdout.on('data', (data) => {
//                 output += data.toString();
//             });

//             child.stderr.on('data', (data) => {
//                 error += data.toString();
//             });

//             exitCode = await new Promise((resolve) => {
//                 child.on('close', (code) => {
//                     resolve(code);
//                 });
//             });
//         }

//         res.json({ output: output, error: error, exitCode: exitCode });

//     } catch (err) {
//         console.error("Error spawning child process:", err);
//         return res.status(500).json({ error: "Internal server error", output: '', exitCode: -1 });
//     }
// };
// const axios = require('axios');

// const pistonApiEndpoint = 'https://emkc.org/api/v2/piston/execute';

// module.exports.execute = async (req, res) => {
//     const language = req.body.language;
//     const code = req.body.code;
//     const input = req.body.input || '';
//     const version = "*"; // Uses the latest version by default

//     console.log("Language:", language);
//     console.log("Code:\n", code);
//     console.log("Input:\n", input);

//     // Construct execution data
//     let executionData = {
//         language: language,
//         files: [{ content: code }],
//         stdin: input,  // Input passed for all languages
//         version: version
//     };

//     try {
//         const pistonResponse = await axios.post(pistonApiEndpoint, executionData);
//         console.log("Response from Piston:", pistonResponse.data);

//         const { run, compile } = pistonResponse.data;

//         // Handle compilation and runtime errors separately
//         const compileErrors = compile?.stderr || ''; 
//         const runtimeErrors = run?.stderr || '';  

//         const output = run?.stdout || '';  
//         const errors = compileErrors + runtimeErrors;  
//         const exitCode = run?.code || -1;

//         console.log("Output:", output);
//         console.log("Errors:", errors);
//         console.log("Exit Code:", exitCode);

//         res.json({ output, error: errors, exitCode });

//     } catch (error) {
//         console.error("Error calling Piston API:", error);

//         if (error.response) {
//             console.error("API Error Response:", error.response.data);
//             return res.status(error.response.status).json({
//                 error: `Piston API Error: ${error.response.data.message || 'Unknown error'}`,
//                 output: '',
//                 exitCode: -1
//             });
//         } else if (error.request) {
//             console.error("Network Error:", error.request);
//             return res.status(500).json({ error: "Network error reaching Piston API", output: '', exitCode: -1 });
//         } else {
//             console.error("Internal Server Error:", error);
//             return res.status(500).json({ error: "Internal server error", output: '', exitCode: -1 });
//         }
//     }
// };





const axios = require('axios');

const pistonApiEndpoint = 'https://emkc.org/api/v2/piston/execute';

module.exports.execute = async (req, res) => {
    const language = req.body.language;
    const code = req.body.code;
    const input = req.body.input || '';
    const version = "*"; // Uses the latest version by default

    console.log("Language:", language);
    console.log("Code:\n", code);
    console.log("Input:\n", input);

    // Construct execution data
    let executionData = {
        language: language,
        files: [{ content: code }],
        stdin: input,  // Input passed for all languages
        version: version
    };

    try {
        const pistonResponse = await axios.post(pistonApiEndpoint, executionData);
        console.log("Response from Piston:", pistonResponse.data);

        const { run, compile } = pistonResponse.data;

        // Handle compilation and runtime errors separately
        const compileErrors = compile?.stderr || ''; 
        const runtimeErrors = run?.stderr || '';  

        const output = run?.stdout || '';  
        const errors = compileErrors + runtimeErrors;  
        const exitCode = run?.code || -1;

        console.log("Output:", output);
        console.log("Errors:", errors);
        console.log("Exit Code:", exitCode);

        res.json({ output, error: errors, exitCode });

    } catch (error) {
        console.error("Error calling Piston API:", error);

        if (error.response) {
            console.error("API Error Response:", error.response.data);
            return res.status(error.response.status).json({
                error: `Piston API Error: ${error.response.data.message || 'Unknown error'}`,
                output: '',
                exitCode: -1
            });
        } else if (error.request) {
            console.error("Network Error:", error.request);
            return res.status(500).json({ error: "Network error reaching Piston API", output: '', exitCode: -1 });
        } else {
            console.error("Internal Server Error:", error);
            return res.status(500).json({ error: "Internal server error", output: '', exitCode: -1 });
        }
    }
};