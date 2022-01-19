const db = require("../db.js");
const embeds = require("../embeds.js");
const https = require("https");
const temp = require("temp").track();

const ACCEPTABLE_ATTACHMENT_FORMATS = [".asc", ".gpg", ".txt"];

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
 * Saves a public key to the SQLite database
 * @returns True if successful, false if unsuccessful
 */
const saveKeyToDb = (keyholder, keyText) => {
  try {
    const conn = db.getNewConnection();
    const insertSql = conn.prepare(
      "INSERT INTO keyring (body, saved_on, user) VALUES (?, ?, ?)"
    );
    const currentTime = new Date().toISOString();
    const saveKey = conn.transaction(() =>
      insertSql.run(keyText, currentTime, keyholder)
    );
    saveKey();
    conn.close();
    return true;
  } catch (err) {
    console.error(`Error saving key input: ${err.toString()}`);
    return false;
  }
};

/**
 * Validates the presence of the proper PGP header and footer
 * @param {string} text Public key text to verify
 * @returns True if PGP header and footer are present, false otherwise
 */
const validatePgpMarkings = text =>
	text.trim().startsWith("-----BEGIN PGP PUBLIC KEY BLOCK-----")
	&& text.trim().endsWith("-----END PGP PUBLIC KEY BLOCK-----");

/**
 * Attempts to save the attached public key in the SQLite database
 * @param {Message} message Discord Message object
 */
module.exports = async message => {
  const splitContent = message.content.split(" ");
  const keyholder =
    splitContent[1] === "-----BEGIN" || splitContent.length < 2
      ? message.author?.username
      : splitContent[1];
  if (!keyholder) {
    await message.channel.send(
      embeds.createErrorEmbed(
        `Sorry, I couldn't read your username; try specifying your name like "**!kbsave KeyringBot**"`
      )
    );
    return;
  }

	//Prepare response if successful
  const successResponse = fieldValue =>
    message.channel.send(
      embeds.createEmbed(
        "Key saved",
        `🔐 Thanks **${keyholder}**, I've saved your key.`,
        [
          {
            name: `This key can now be fetched with **!kbget ${keyholder}**.`,
            value: fieldValue
          }
        ]
      )
    );

  //If attachments are present
  if (message && message.attachments && message.attachments.size > 0) {
    //Too many files
    if (message.attachments.size > 1) {
      await message.channel.send(
        embeds.createErrorEmbed(
          "Please attach only the public key as a .txt, .asc, or .gpg file."
        )
      );
      return;
    }

    const attachment = message.attachments.first();

    //Check file format
    if (!ACCEPTABLE_ATTACHMENT_FORMATS.some(suffix => attachment.name.endsWith(suffix))) {
      await message.channel.send(
        embeds.createErrorEmbed(
          "Please attach the public key as a .txt, .asc, or .gpg file."
        )
      );
      return;
    }

    const splitUri = attachment.url.split("/").slice(2);
    const hostname = splitUri[0];
    const reqPath = "/" + splitUri.slice(1).join("/");

		let txtFileContent;
		try {
			txtFileContent = await downloadTextFile(hostname, reqPath);
		} catch (err) {
			console.error(`Failed to download attachment: ${err}`);
      await message.channel.send(
        embeds.createErrorEmbed(
          `Sorry, I couldn't download the attachment; try again.`
        )
      );
			return;
		}

		//Ensure the attachment is a PGP key
		if (!validatePgpMarkings(txtFileContent)) {
      await message.channel.send(
        embeds.createErrorEmbed(
          `Sorry, something went wrong; are you sure your PGP key is in a valid format?`
        )
      );
			return;
		}

    //Save record to db
    const saveSuccessful = saveKeyToDb(keyholder, txtFileContent);
    if (!saveSuccessful) {
      await message.channel.send(
        embeds.createErrorEmbed(
          `Sorry, something went wrong; are you sure your PGP key is in a valid format?`
        )
      );
			return;
    }

    await successResponse(txtFileContent);
    return;
  }

  //Key should be plain text in the message content
  const keyStartIndex = splitContent[1] === "-----BEGIN" ? 1 : 2;
  const keyText = splitContent.slice(keyStartIndex).join(" ");

	if (!validatePgpMarkings(keyText)) {
		await message.channel.send(
			embeds.createErrorEmbed(
				`Sorry, something went wrong; are you sure your PGP key is in a valid format?`
			)
		);
		return;
	}

	//Save the record
  const saveSuccessful = saveKeyToDb(keyholder, keyText);
  if (!saveSuccessful) {
    await message.channel.send(
      embeds.createErrorEmbed(
        `Sorry, something went wrong; try uploading the public key as a .txt, .asc, or .gpg file.`
      )
    );
    return;
  }

  await successResponse(keyText);
};