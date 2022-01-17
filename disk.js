const fs = require("fs");
const temp = require("temp").track();

//KeyringBot requires one temporary directory to write public key files for message attachments
let tempDirectory = undefined;

module.exports = {
	createTempFile: fileName => {},

  /**
   * Gets temporary directory value
   * @returns {string} Temporary directory path
   */
  getTempDir: () => tempDirectory,

  /**
   * Creates the temporary directory, storing the path in memory
   */
  initTempDir: () =>
    temp.mkdir("keyringbot", (err, dirPath) => {
      if (err) {
        console.error(`Error creating temp directory: ${err}`);
      }
      tempDirectory = dirPath;
      console.log(`temp dir created: ${dirPath}`);
    })
};