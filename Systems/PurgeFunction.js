async function results(deletedMessages, interaction) {
  const results = {};
  for (const [, deleted] of deletedMessages) {
    const user = `${deleted.author.username}#${deleted.author.discriminator}`;
    if (!results[user]) results[user] = 0;
    results[user]++;
  }

  const userMessageMap = Object.entries(results);

  const finalResult = `> 成功移除`${deletedMessages.size}`則訊息!\n\n${userMessageMap
    .map(([user, messages]) => `**${user}** : ${messages}`)
    .join("\n")}`;

  const msg = await interaction.reply({
    content: `${finalResult}`,
    fetchReply: true,
  });
  setTimeout(() => {
    msg.delete();
  }, 3000);
}
module.exports = { results };