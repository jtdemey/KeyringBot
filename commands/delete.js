const db = require("../db.js");
const embeds = require("../embeds.js");

/**
 * Deletes the user's public key from the database
 * @param {Message} message Discord Message object
 */
module.exports = async message => {
  const splitContent = message.content.split(" ");
  const keyholder =
    splitContent.length < 2 ? message.author?.username : splitContent[1];

  //Check if a key exists for this user
  let keyringResult;
  try {
    const conn = db.getNewConnection();
    const keyringQuery =
      "SELECT body, last_retrieved, user FROM keyring WHERE user = ?";
    keyringResult = conn.prepare(keyringQuery).get(keyholder);
    conn.close();
  } catch (err) {
    console.error(`Error retrieving key: ${err.toString()}`);
    await message.channel.send(
      embeds.createErrorEmbed(
        `Sorry, something went wrong; I couldn't find a key for **${keyholder}**.`
      )
    );
    return;
  }

	//Validate public key result
  if (!keyringResult || !keyringResult.body) {
    await message.channel.send(
      embeds.createErrorEmbed(
        `🔎 Hmm... I couldn't find a key for **${keyholder}**.`
      )
    );
    return;
  }

  //Delete record
  let deleteResult;
  try {
    const conn = db.getNewConnection();
    const deleteQuery = "DELETE FROM keyring WHERE user = ?";
    deleteResult = conn.prepare(deleteQuery).run(keyholder);
    conn.close();
  } catch (err) {
    console.error(`Error deleting key: ${err.toString()}`);
    await message.channel.send(
      embeds.createErrorEmbed(
        `Sorry, something went wrong while deleting the key for **${keyholder}**.`
      )
    );
    return;
  }

	await message.channel.send(
		embeds.createEmbed(
			"Key deleted",
			`🚮 I deleted the key for **${keyholder}**.`
		)
	);
};