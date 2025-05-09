const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pdf = require("html-pdf");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/api/rewrite", async (req, res) => {
  const { resume, job } = req.body;
  const prompt = `Rewrite this resume to match the following job description.

Resume:
${resume}

Job Description:
${job}`;
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });
  res.json({ rewritten: response.data.choices[0].message.content });
});

app.post("/api/chat", async (req, res) => {
  const { input, context } = req.body;
  const prompt = `You are helping improve this resume:
${context}

User input: ${input}`;
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });
  res.json({ reply: response.data.choices[0].message.content });
});

app.post("/api/download", (req, res) => {
  const { content } = req.body;
  pdf.create(content).toStream((err, stream) => {
    if (err) return res.status(500).send(err);
    res.setHeader("Content-type", "application/pdf");
    stream.pipe(res);
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
