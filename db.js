const Database = require("better-sqlite3");

module.exports = () => new Database("keyringbot.db", { verbose: console.log });