const db = require("../db.js");
const fs = require("fs");
const https = require("https");
const temp = require("temp").track();

const downloadTextFile = async (hostname, attachmentPath) => {
	return new Promise((resolve, reject) => {
		const tempPath = temp.createWriteStream();
		const fileRequest = https.request({
			hostname,
			method: "GET",
			path: attachmentPath,
			port: 443
		}, res => {
			console.log(res.statusCode)
			res.on("data", data => process.stdout.write(data));
			res.pipe(tempPath);
		});
		tempPath.on("finish", () => {
			tempPath.end();
			resolve()
			console.log("completed download")
		});
		fileRequest.on("error", err => console.error(err));
		fileRequest.end();
	});
};

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

    const attachment = message.attachments.first();
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

		const splitUri = attachment.url.split("/").slice(2);
		const hostname = splitUri[0];
		const reqPath = splitUri.slice(1).join("");
		console.log(splitUri, hostname, reqPath)
		const txtFile = await downloadTextFile(hostname, reqPath);
  }

  await message.reply({ content: response, ephemeral: true });
};