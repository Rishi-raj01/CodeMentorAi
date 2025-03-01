const {generateContent} = require("../services/ai.service")


module.exports.getReview = async (req, res) => {

    const { code, role } = req.body;

    if (!code) {
        return res.status(400).send("Prompt is required");
    }
    console.log("Received role:", role); 

    const response = await generateContent(code,role);


    res.send(response);

}

module.exports.getchat=async (req, res) => {
    const { code, role } = req.body;

    // if (role !== "therapist") {
    //     return res.status(403).json({ error: "Chat is only allowed for the therapist role." });
    // }

    console.log("User Message:", code);
    if (!code) {
        return res.status(400).send("Prompt is required");
    }
    console.log("Received role:", role); 

    const response = await generateContent(code,role);
    res.send(response);


}