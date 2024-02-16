function updateProgressBar(distube, interaction, song) {
    const progressBarLength = 20;
    const progressBarSymbol = '='; // 進度條使用的符號
    const currentProgressSymbol = '-'; // 當前進度的符號
    const interval = 5000; // 每5秒更新一次進度條
  
    const timer = setInterval(() => {
      const currentTime = distube.getQueue(interaction)?.currentTime || 0;
      const streamTime = song.duration * 1000 || 1; // 避免 streamTime 為 0
      const progress = (currentTime / streamTime) * progressBarLength;
  
      let progressBar = '[';
      for (let i = 0; i < progressBarLength; i++) {
        if (i < Math.floor(progress)) {
          progressBar += progressBarSymbol; // 進度位置
        } else {
          progressBar += currentProgressSymbol; // 非進度位置
        }
      }
      progressBar += ']';
  
      interaction.channel.send(progressBar).catch(console.error); // 處理回覆时的错误
    }, interval);
  
    // 在歌曲結束後清除定時器
    distube.on('finish', (queue) => {
      if (queue === distube.getQueue(interaction)) { // 只清除特定的定時器
        clearInterval(timer);
      }
    });
  }

module.exports = updateProgressBar;