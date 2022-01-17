const Database = require("better-sqlite3");

module.exports = {
  /**
   * Creates the necessary SQL table if it doesn't exist yet
   */
  createTable: () => {
    try {
      const conn = new Database("keyringbot.db");
      const createTableSql = conn.prepare(`CREATE TABLE IF NOT EXISTS keyring(
				id INTEGER NOT NULL PRIMARY KEY,
				body VARCHAR(500000) NOT NULL,
				last_retrieved DATETIME NULL,
				saved_on DATETIME NOT NULL,
				user NVARCHAR(256) NULL
      )`);
      const createTable = conn.transaction(() => createTableSql.run());
      createTable();
			conn.close();
    } catch (err) {
      console.error("Failed to create keyringbot SQL table", err);
    }
  },

  /**
   * Makes a new connection
   * @returns A new SQLite database connection
   */
  getNewConnection: () =>
    new Database("keyringbot.db", { verbose: console.log })
};
