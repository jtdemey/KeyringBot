const { Client, Intents } = require("discord.js");
const dotenv = require("dotenv").config();
const fs = require("fs");

const BOT_TOKEN = process.env.BOT_TOKEN;
const PREFIX = "!kb";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ]
});

const commands = {};
const commandDir = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));
for (const file of commandDir) {
  const command = require(`./commands/${file}`);
  commands[file.replace(".js", "")] = command;
}

client.once("ready", () => {
  console.log("KeyringBot is active!");
});

client.on("messageCreate", async message => {
  if (!message || !message.content.startsWith(PREFIX)) return;

  const trimmedMessage = message.content.replace(PREFIX, "");
  const command = commands[trimmedMessage];
  if (!command) return;

  try {
    await command(message);
  } catch (err) {
    console.error(err);
    await interaction.reply(
      `An error occurred during the request: ${err.toString()}`
    );
  }
});

process.on("SIGTERM", () => client.destroy());

client.login(BOT_TOKEN);