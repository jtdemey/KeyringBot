# KeyringBot 
A Discord bot that saves users' public encryption keys on a server-wide basis so others on the server can request them with a simple command.

## Add KeyringBot to your server
An invite link will be available on v1.0!

## Commands
#### [] = required, {} = optional
-	**!kbdelete {user}**		Removes your saved public key
-	**!kbget [user]**				Requests the public key for the given Discord username
-	**!kbhelp**							Displays this message
-	**!kbping**							Replies with "pong!"
-	**!kbsave {user}**			Saves your public key so others can request it. If the public key exceeds Discord's 2000 character limit, an attached text file with the ASCII-encoded key is required.

## Why?
Any closed-source program that promises to encrypt your data cannot be trusted.

True end-to-end (E2E) encryption must be done by you: your computer, your encryption program, and your private key.

KeyringBot doesn't do much besides store and retrieve **public** encryption keys so anyone on your Discord server can fetch one and use a program like the GNU Privacy Guard (gpg) to encrypt messages before they're sent over Discord.

It's ideal for DMs of sensitive nature that contain compromising or identifying data like addresses, phone numbers, or other private information.

> *Only **you** can be trusted to encrypt your data.*

## How?
KeyringBot is built using [Discord.js](https://discord.js.org/#/), which leverages the [Node.js](https://nodejs.org/en/) runtime.

Keys are stored in a local SQLite database. This means that deleting KeyringBot's root directory will delete the stored keys as well (keyringbot.db).

Keys that are longer than Discord's 2000 character limit need to be sent as attachments - KeyringBot uses temporary, self-cleaning disk storage for these files.