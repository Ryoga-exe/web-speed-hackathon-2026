import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Router } from "express";
import httpErrors from "http-errors";

import { QaSuggestion } from "@web-speed-hackathon-2026/server/src/models";
import { searchCrokSuggestions } from "@web-speed-hackathon-2026/server/src/utils/crok_suggestions";

export const crokRouter = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const response = fs.readFileSync(path.join(__dirname, "crok-response.md"), "utf-8");

crokRouter.get("/crok/suggestions", async (req, res) => {
  const queryValue = req.query["q"];
  const query = typeof queryValue === "string" ? queryValue : "";
  if (query.trim() !== "") {
    res.json(await searchCrokSuggestions(query));
    return;
  }

  const suggestions = await QaSuggestion.findAll({
    attributes: ["question"],
    logging: false,
  });
  res.json({
    queryTokens: [],
    suggestions: suggestions.map((suggestion) => suggestion.question),
  });
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const INITIAL_STREAM_DELAY_MS = 75;
const STREAM_CHUNK_DELAY_MS = 12;
const STREAM_CHUNK_SIZE = 256;

function chunkResponse(text: string): string[] {
  const chars = Array.from(text);
  const chunks: string[] = [];

  for (let i = 0; i < chars.length; i += STREAM_CHUNK_SIZE) {
    chunks.push(chars.slice(i, i + STREAM_CHUNK_SIZE).join(""));
  }

  return chunks;
}

crokRouter.get("/crok", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let messageId = 0;
  const chunks = chunkResponse(response);

  await sleep(INITIAL_STREAM_DELAY_MS);

  for (const chunk of chunks) {
    if (res.closed) break;

    const data = JSON.stringify({ text: chunk, done: false });
    res.write(`event: message\nid: ${messageId++}\ndata: ${data}\n\n`);

    if (messageId < chunks.length) {
      await sleep(STREAM_CHUNK_DELAY_MS);
    }
  }

  if (!res.closed) {
    const data = JSON.stringify({ text: "", done: true });
    res.write(`event: message\nid: ${messageId}\ndata: ${data}\n\n`);
  }

  res.end();
});
