/**
 * @deprecated 此檔案已遷移至 MusicUtils, MusicRenderer, MusicController, 與 MusicRepository。
 * 請盡快將專案中的引入改為對應的新模組。
 * 此檔案僅作為向後兼容的橋接層存在，未來版本將會被移除。
 */
import MusicController from '@/Systems/Music/MusicController.js'
import MusicRenderer from '@/Systems/Music/MusicRenderer.js'
import {
    deleteMessageAfter as _deleteMessageAfter,
    MusicUtils
} from '@/Systems/Music/MusicUtils.js'
import MusicRepository from '@/Systems/Music/MusicRepository.js'

export const deleteMessageAfter = _deleteMessageAfter

// Named re-exports for backward compatibility
export const clearPlayer = MusicController.clearPlayer.bind(MusicController)
export const generateMusicPlayerStatus = MusicRenderer.buildPlayerStatus.bind(MusicRenderer)
export const generateMusicStatusButtons = MusicRenderer.buildButtons.bind(MusicRenderer)
export const generateProgressBar = MusicUtils.generateProgressBar.bind(MusicUtils)
export const millisToDuration = MusicUtils.millisToDuration.bind(MusicUtils)
export const MusicDbFetch = MusicRepository.fetchGuildSettings.bind(MusicRepository)
export const resetPlayer = MusicController.resetPlayer.bind(MusicController)
export const secondsToDuration = MusicUtils.secondsToDuration.bind(MusicUtils)
export const startProgressUpdater = MusicController.startProgressUpdater.bind(MusicController)
export const stopProgressUpdater = MusicController.stopProgressUpdater.bind(MusicController)
export const updateMusicPlayerStatus = MusicController.updatePlayerStatus.bind(MusicController)
export const validateVoiceChannel = MusicController.validateVoiceChannel.bind(MusicController)
export const validateDJRole = MusicController.validateDJRole.bind(MusicController)
