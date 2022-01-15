const db = require("../db.js");
const fs = require("fs");
const https = require("https");
const temp = require("temp").track();

/**
 * Downloads a text file using HTTPS
 * @param {string} hostname Base host name
 * @param {string} attachmentPath URI to file
 * @returns Promise resolving to file contents as string
 */
const downloadTextFile = async (hostname, attachmentPath) => {
  return new Promise((resolve, reject) => {
    const fileData = [];
    const tempPath = temp.createWriteStream();
    const fileRequest = https.request(
      {
        hostname,
        method: "GET",
        path: attachmentPath,
        port: 443
      },
      res => {
        if (res.statusCode !== 200) {
          console.error(`Error fetching file: ${res.statusCode}`);
          reject(res.statusCode);
        }
        res.on("data", data => fileData.push(data.toString()));
        res.pipe(tempPath);
      }
    );
    tempPath.on("finish", () => {
      tempPath.end();
      resolve(fileData.join(""));
    });
    fileRequest.on("error", err => {
      console.error(err);
      reject(err);
    });
    fileRequest.end();
  });
};

/**
 * Attempts to save the attached public key in the SQLite database
 * @param {Message} message Discord Message object
 */
module.exports = async message => {
  //If attachments are present
  if (message && message.attachments) {
    //Too many files
    if (message.attachments.size > 1) {
      await message.reply({
        content: "Please attach only the public key as a .txt or .asc file.",
        ephemeral: true
      });
      return;
    }

    const attachment = message.attachments.first();

    //Check file format
    if (!attachment.url.endsWith(".txt") && !attachment.url.endsWith(".asc")) {
      await message.reply({
        content: "Please attach the public key as a .txt or .asc file.",
        ephemeral: true
      });
      return;
    }

    const splitUri = attachment.url.split("/").slice(2);
    const hostname = splitUri[0];
    const reqPath = "/" + splitUri.slice(1).join("/");
    const txtFile = await downloadTextFile(hostname, reqPath);

    //Save record to db
		try {
			const conn = db.getNewConnection();
			const insertSql = conn.prepare(
				"INSERT INTO keyring (body, saved_on, user) VALUES (?, ?, ?)"
			);
			const currentTime = new Date().toISOString();
			const keyholder = message.author?.username ?? "unknown";
			console.log(currentTime, keyholder)
			const saveKey = conn.transaction(() =>
				insertSql.run(txtFile, currentTime, keyholder)
			);
			saveKey();
			conn.close();
		} catch (err) {
			console.error(`Error saving key input: ${err.toString()}`);
			await message.reply({
				content: `Sorry, something went wrong; are you sure your PGP key is in a valid format?`,
				ephemeral: true
			});
			return;
		}

    await message.reply({
      content: `Thanks ${keyholder}, I've saved your key.`,
      ephemeral: true
    });
  }
};