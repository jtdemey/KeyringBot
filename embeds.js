const { MessageEmbed } = require("discord.js");

/**
 * Creates a branded Discord MessageEmbed with the provided properties
 * @param {string} title Embed title
 * @param {string} description Embed description
 * @param {Array} fields Array of objects with 'name' and 'value' string properties
 * @param {string} color Hex color code
 * @returns A configuration object for discord.js' message.channel.send
 */
const createEmbed = (title, description, fields, color = "#588157") => {
  const embed = new MessageEmbed()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: "~ KeyringBot v1.0" });
  if (fields && fields.length > 0) {
    fields.forEach(field => {
      //Discord embeds enforce a 1024-character field value limit
      if (field?.value?.length > 1024) {
        field.value = field.value.substring(0, 1023);
      }
    });
    embed.setFields(fields);
  }
  return { embeds: [embed] };
};

module.exports = {
  createEmbed,
  /**
   * Creates a MessageEmbed for displaying an error
   * @param {string} description Embed description
   * @returns MessageEmbed formatted for displaying an error
   */
  createErrorEmbed: description =>
    createEmbed("⚠ An error occurred:", description, [], "#701010")
};