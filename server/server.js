import 'isomorphic-fetch';
import { ChatGPTAPI } from "chatgpt";
import express from "express";
import dotenv from "dotenv";
import fs from 'fs-extra';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite'
import bodyParser from 'body-parser';
import Stream from 'stream';

sqlite3.verbose();
dotenv.config();


process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});

fs.ensureFile("data.sqlite");
const db = await open({
    filename: "data.sqlite",
    driver: sqlite3.Database
});

db.run("CREATE TABLE IF NOT EXISTS conversations (email TEXT, conversationID TEXT)");
db.run("CREATE TABLE IF NOT EXISTS messages (conversationID TEXT, messageID TEXT, message TEXT)");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY,
    debug: true,
    assistantLabel: "Customer Service",
    completionParams: {
        temperature: 0.5,
    }
})

// Add headers before the routes are defined
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});

app.post("/", async (req, res) => {
    const readableStream = new Stream.Readable()
    const email = req.body.email;
    const name = req.body.name;

    const convo = await db.get("SELECT rowid, conversationID FROM conversations WHERE email = ?", [email]);
    let conversationID = convo?.conversationID;

    let customerdata = "";
    if (req.body.name) {
        customerdata = `Information about the customer:\nName: ${name}\nemail:${email}\n\n`;
    }

    let payload = {
        promptPrefix: `${req.body.instruction}\n\n${customerdata}`,
    }

    if (req.body.stream) {
        payload = {
            ...payload,
            onProgress: (progress) => {
                res.write(progress.text);
            }
        }
    }

    if (conversationID) {
        payload = {
            ...payload,
            conversationId: conversationID,
        }
    }

    let prevMessage = await db.get("SELECT rowid, messageID FROM messages WHERE conversationID = ? ORDER BY rowid DESC LIMIT 1", [conversationID]);

    if (prevMessage) {
        payload = {
            ...payload,
            parentMessageId: prevMessage.messageID,
        }
    }

    let result;
    
    while (true) {
        try {
            result = await api.sendMessage(req.body.message, payload)
            break;
        }catch(error){
            console.log(error)
            if (error.statusCode == 429) {
                continue;
            }
            return res.json({ message: error.statusText}, error.statusCode)
        }
    }

    if (!conversationID) {
        db.run("INSERT INTO conversations VALUES (?, ?)", [email, result.conversationId]);
    }

    db.run("INSERT INTO messages VALUES (?, ?, ?)", [result.conversationId, result.id, result.text]);

    if(req.body.stream){
        res.end();
    } else {
        res.json(result.text);
    }

});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
