const {generateContent} = require("../services/ai.service")


module.exports.getReview = async (req, res) => {
    const { code, role } = req.body;

    if (!code) {
        return res.status(400).send("Code is required");
    }

    console.log("Received role:", role);

    try {
        const response = await generateContent(code, role);
        res.send(response);
    } catch (error) {
        console.error("Error in getReview:", error); // Log the error for debugging
        res.status(500).send("Failed to generate content. Please check the server logs."); // Send a meaningful error response to the client
    }
};


module.exports.getchat = async (req, res) => {
    const { code, role, context } = req.body;  // Extract context from request body
  
    console.log("User Message:", code);
    if (!code) {
      return res.status(400).send("Prompt is required");
    }
    console.log("Received role:", role);
    console.log("Received context:", context);  // Log the context
  
    try {
      const response = await generateContent(code, role, context); // Pass context to generateContent
      res.send(response); // Send the AI's text response
    } catch (error) {
      console.error("Error in getchat:", error);
      res.status(500).send("Error processing your request."); // Send an error response to the client
    }
  };