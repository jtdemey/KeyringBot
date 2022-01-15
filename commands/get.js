const db = require("../db.js");
const { MessageAttachment } = require("discord.js");
const temp = require("temp").track();

const DISCORD_CHAR_LIMIT = 2000;

/**
 * Attempts to retrieve the user's public key from the database
 * @param {Message} message Discord Message object
 */
module.exports = async message => {
	const userToQuery = message.content.split(" ")[1];
	if (!userToQuery) {
		await message.reply({
			content: `Please specify the user whose key I should find like "!kbsave KeyringBot".`
		});
	}

	//Retrieve key for user
	let keyringResult;
	try {
		const conn = db.getNewConnection();
		const userQuery = "SELECT body, last_retrieved, user FROM keyring WHERE user = ?";
		keyringResult = conn.prepare(userQuery).get(userToQuery);
		console.log(keyringResult);
		conn.close();
	} catch (err) {
		console.error(`Error saving key input: ${err.toString()}`);
		await message.reply({
			content: `Sorry, something went wrong; are you sure your PGP key is in a valid format?`,
			ephemeral: true
		});
		return;
	}

	//Check for result
	if (!keyringResult.body) {
		await message.reply({
			content: `Hmm... I couldn't find a key for ${userToQuery}.`,
			ephemeral: true
		});
		return;
	}

	//If key doesn't exceed Discord character limit, send as message
	if (keyringResult.body.length < DISCORD_CHAR_LIMIT) {
		await message.reply({
			content: keyringResult.body,
			ephemeral: true
		});
		return;
	}

	//Send as attachment
	const tempStream = temp.createWriteStream();
	tempStream.write(keyringResult.body);
	tempStream.end();
	const fileAttachment = new MessageAttachment(tempStream, `${message.author?.username}.asc`);
	await message.reply({
		content: `Ah, here's the key I have for ${message.author?.username}`,
		files: [fileAttachment],
		ephemeral: true
	});
};