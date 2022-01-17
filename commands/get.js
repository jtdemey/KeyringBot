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
      content: `Please specify the user whose key I should find like "!kbget KeyringBot".`
    });
    return;
  }

  //Retrieve key for user
  let keyringResult;
  try {
    const conn = db.getNewConnection();
    const userQuery =
      "SELECT id, body, last_retrieved, user FROM keyring WHERE user = ?";
    keyringResult = conn.prepare(userQuery).get(userToQuery);
    console.log(keyringResult);
    conn.close();
  } catch (err) {
    console.error(`Error retrieving key: ${err.toString()}`);
    await message.reply({
      content: `Sorry, something went wrong; I couldn't find a key for ${userToQuery}.`,
      ephemeral: true
    });
    return;
  }

  //Check for result
  if (!keyringResult.id || !keyringResult.body) {
    await message.reply({
      content: `Hmm... I couldn't find a key for ${userToQuery}.`,
      ephemeral: true
    });
    return;
  }

  //Update last_retrieved value
  try {
    const conn = db.getNewConnection();
    const updateQuery = `UPDATE keyring SET last_retrieved = ? WHERE id = ?`;
    const updateResult = conn
      .prepare(updateQuery)
      .run(new Date().toISOString(), keyringResult.id);
    console.log(updateResult);
    conn.close();
  } catch (err) {
    console.error(`Error updating last_retrieved value: ${err.toString()}`);
    await message.reply({
      content: `I must have done something wrong; I can't update the record for ${userToQuery}.`,
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
  console.log(tempStream);
  //const fileAttachment = new MessageAttachment(tempStream, `${message.author?.username}.asc`);
  const fileAttachment = {
    attachment: tempStream.path,
    name: `test.asc`,
    description: `The public encryption key for ${userToQuery}.`
  };
  await message.channel.send({
    content: `Ah, here's the key I have for ${userToQuery}`,
    files: [fileAttachment]
  });
};