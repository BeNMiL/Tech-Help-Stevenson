// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow JSON body data
app.use(express.json());

// Serve index.html and all other static files from this folder
app.use(express.static(__dirname));

// --- EMAIL SETUP (Nodemailer + Gmail) ---
const emailUser = process.env.GMAIL_USER;   // your Gmail address
const emailPass = process.env.GMAIL_PASS;   // your Gmail app password
const destEmail = process.env.DEST_EMAIL;   // where tickets are sent

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// --- API endpoint for ticket submission ---
app.post("/api/ticket", async (req, res) => {
  try {
    const {
      name,
      contact,
      location,
      device,
      issue,
      description,
      urgency,
      estimatedLow,
      estimatedHigh,
    } = req.body;

    if (!name || !contact || !device || !issue || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const subject = `New Tech Help Ticket from ${name}`;
    const emailBody = `
New tech help ticket submitted:

Name: ${name}
Contact: ${contact}
Location: ${location || "Not provided"}

Device: ${device}
Issue: ${issue}
Urgency: ${urgency || "flexible"}

Description:
${description}

Estimated Price Range: $${estimatedLow} – $${estimatedHigh}
`.trim();

    // Send Email
    await transporter.sendMail({
      from: `"Campus Tech Help Desk" <${emailUser}>`,
      to: destEmail,
      subject,
      text: emailBody,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error in /api/ticket:", err);
    return res.status(500).json({ error: "Failed to send ticket" });
  }
});

// Just handle the root path explicitly (no wildcard)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});
