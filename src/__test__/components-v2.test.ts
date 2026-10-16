import { expect } from 'chai'
import { MessageFlags } from 'discord.js'
import { describe, it } from 'mocha'
import { buildComponentsV2Prototype } from '@/Systems/UI/ComponentsV2Prototype.js'

describe('Components V2 Prototype', function () {
    it('應該啟用 Components V2 並且只使用 components payload', function () {
        const payload = buildComponentsV2Prototype()

        expect(payload.flags).to.equal(MessageFlags.IsComponentsV2)
        expect(payload.components).to.have.length(1)
        expect(payload).to.not.have.property('content')
        expect(payload).to.not.have.property('embeds')
    })

    it('應該包含容器、文字、分隔線與兩個按鈕', function () {
        const payload = buildComponentsV2Prototype()
        const container = payload.components[0].toJSON()

        expect(container.type).to.equal(17)
        expect(container.components.some((component) => component.type === 10)).to.be.true
        expect(container.components.some((component) => component.type === 14)).to.be.true

        const actionRow = container.components.find((component) => component.type === 1)
        expect(actionRow).to.exist
        expect(actionRow!.components).to.have.length(2)
        expect(actionRow!.components.map((component) => component.custom_id)).to.deep.equal([
            'paper:v2:prototype:primary',
            'paper:v2:prototype:secondary'
        ])
    })
})
