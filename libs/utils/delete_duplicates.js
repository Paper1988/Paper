const { MongoClient } = require('mongodb')

async function removeDuplicates() {
    const uri = 'mongodb+srv://Paper:13345627@dclvl.62oke.mongodb.net'
    const client = new MongoClient(uri)

    try {
        await client.connect()
        const db = client.db('Js')
        const collection = db.collection('musics')

        const duplicates = await collection
            .aggregate([
                { $sort: { _id: 1 } },
                { $group: { _id: '$GuildID', ids: { $push: '$_id' } } },
                { $project: { _id: 0, toRemove: { $slice: ['$ids', 1, { $size: '$ids' }] } } }
            ])
            .toArray()

        for (let doc of duplicates) {
            await collection.deleteMany({ _id: { $in: doc.toRemove } })
        }

        console.log('重複資料已清理完畢！')
    } finally {
        await client.close()
    }
}

removeDuplicates().catch(console.error)
