/**
 * Replies to the command issuer with "pong!"
 * @param {Message} message Discord Message object
 */
module.exports = async message => {
	await message.reply("pong!");
};