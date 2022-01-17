const fs = require("fs");
const path = require("path");
const temp = require("temp").track();

//KeyringBot requires one temporary directory to write public key files for message attachments
let tempDirectory = undefined;

module.exports = {
  /**
   * Creates a file in the temporary directory
   * @param {string} fileName Name of file to be created
   * @param {string} data String data to write to file
   * @returns Full path of created file
   */
  createTempFile: async (fileName, data) => {
    return new Promise((resolve, reject) => {
      const filePath = path.join(tempDirectory, fileName);
      fs.writeFile(filePath, data, err => {
        if (err) {
          console.error(`Error writing temp file: ${err}`);
          reject(err);
          return;
        }
        resolve(filePath);
      });
    });
  },

  /**
   * Creates the temporary directory, storing the path in memory
   */
  createTempDir: () =>
    temp.mkdir("keyringbot", (err, dirPath) => {
      if (err) {
        console.error(`Error creating temp directory: ${err}`);
      }
      tempDirectory = dirPath;
    })
};