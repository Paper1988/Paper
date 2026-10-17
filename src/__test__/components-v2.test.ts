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
        const component = payloadComponent(buildComponentsV2Prototype().components)
        const container = JSON.parse(JSON.stringify(component)) as {
            type: number
            components: Array<{ type: number }>
        }

        expect(container.type).to.equal(17)
        expect(container.components.some((item) => item.type === 10)).to.be.true
        expect(container.components.some((item) => item.type === 14)).to.be.true

        const serialized = JSON.stringify(container)
        expect(serialized).to.include('paper-v2-prototype:primary')
        expect(serialized).to.include('paper-v2-prototype:secondary')
        expect(container.components.filter((item) => item.type === 10)).to.have.length(3)
        expect(container.components.filter((item) => item.type === 1)).to.have.length(1)
    })
})

function payloadComponent(components: ReturnType<typeof buildComponentsV2Prototype>['components']) {
    const component = components?.[0]
    if (!component) throw new Error('Expected a Components V2 container')
    return component
}
