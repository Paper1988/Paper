import { Player } from 'moonlink.js'

export class MusicStateManager {
    static getControllerMessageId(player: Player) {
        return player.data.musicControllerMsgId as string
    }

    static setControllerMessageId(player: Player, messageId: string) {
        player.set('musicControllerMsgId', messageId)
    }

    static resetControllerMessageId(player: Player) {
        player.set('musicControllerMsgId', undefined)
    }
}
