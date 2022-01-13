const db = require("../db.js");

module.exports = async message => {
  let response = "Thanks person, I saved your key.";
  console.log(message?.content, message?.attachments);

  //If attachments are present
  if (message && message.attachments) {
    console.log(message.attachments.length);

    //Too many files
    if (message.attachments.length > 1) {
      await message.reply({
        content: "Please attach only the public key as a .txt or .asc file",
        ephemeral: true
      });
      return;
    }

    const attachment = message.attachments[0];
    console.log(attachment.filename);

    //Check file format
    if (
      !attachment.fileName.endsWith(".txt") &&
      !attachment.fileName.endsWith(".asc")
    ) {
      await message.reply({
        content: "Please attach the public key as a .txt or .asc file",
        ephemeral: true
      });
      return;
    }

    console.log(attachment.url, attachment.proxy_url);
    response = "File attachments are currently in development";
  }

  await message.reply({ content: response, ephemeral: true });
};