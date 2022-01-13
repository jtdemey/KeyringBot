module.exports = async message => {
  const helpText = `I'm a bot that remembers public encryption keys; my commands are:
		**!kbdelete**		Removes your saved public key
		**!kbget**			Requests the public key for the given Discord username
		**!kbhelp**			Displays this message
		**!kbping**			Replies with "pong!"
		**!kbsave**			Saves your public key so others can request it. If the public key exceeds Discord's 2000 character limit, an attached text file with the ASCII-encoded key is required.`;
  await message.reply({
    content: helpText,
    ephemeral: true
  });
};