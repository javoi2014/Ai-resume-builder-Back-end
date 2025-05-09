const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pdf = require("html-pdf");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/rewrite", async (req, res) => {
  const { resume, job } = req.body;
  const prompt = `Rewrite this resume to match the following job description.

Resume:
${resume}

Job Description:
${job}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    res.json({ rewritten: response.choices[0].message.content });
  } catch (err) {
    res.status(500).send("Error rewriting resume");
  }
});

app.post("/api/chat", async (req, res) => {
  const { input, context } = req.body;
  const prompt = `You are helping improve this resume:
${context}

User input: ${input}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    res.status(500).send("Error generating response");
  }
});

app.post("/api/download", (req, res) => {
  const { content } = req.body;
  pdf.create(content).toStream((err, stream) => {
    if (err) return res.status(500).send(err);
    res.setHeader("Content-type", "application/pdf");
    stream.pipe(res);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
