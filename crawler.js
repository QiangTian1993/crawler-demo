function crawler(num) {
    const cheerio = require('cheerio')
    const axios = require('axios')
    const mongoose = require('mongoose')
    const urlAll = []
    const n = num;

    mongoose.connect('mongodb://localhost/doubanData')

    const db = mongoose.connection

    db.on('error', function (err) {
        console.log("数据库连接失败：" + err);
    });
    db.once('open', function () {
        console.log("数据库连接成功");
    });
    db.once('disconnected', function () {
        console.log("数据库连接断开");
    });

    const Schema = mongoose.Schema
    const articleSchema = new Schema({
        type: String,
        index: Number,
        title: {
            type: String,
            index: true,
            unique: true
        },
        author: String,
        time: String,
        content: Array
    })
    const modelSchema = new Schema({
        index: {
            type: Number,
            index: true,
            unique: true
        },
        content: Array
    })

    const articlesModel = mongoose.model('articles', articleSchema)
    const Model = mongoose.model('Model', modelSchema)

    !(async function getURL() {
        const request = await axios.get(`https://www.douban.com/group/explore?start=${n}`)
        const document = request.data

        const $ = cheerio.load(document)

        const list = $('.channel-item h3>a')

        for (let i = 0; i < list.length; i++) {
            const url = $(list[i]).attr('href')
            urlAll.push(url)
        }
        return urlAll

    })()
        .then(r => {
            getArticles()
        })
        .catch(e => {
            console.log('失败啦')
        })


    async function getArticles() {
        const contentArrAll = []

        for (let i = 0; i < urlAll.length; i++) {

            const request = await axios.get(urlAll[i])

            const document = request.data

            const $ = cheerio.load(document)

            const contentArr = []
            const title = $('#content h1').text()
            const author = $('.from a').text()
            const time = $('.color-green').text()
            const childern = $('.topic-richtext').children()
            for (let i = 0; i < childern.length; i++) {
                if (childern[i].name === 'p') {
                    let text = $(childern[i]).text()
                    contentArr.push(text)
                }

                if ($(childern[i]).children().length) {
                    let img = $(childern[i]).find('img').attr('src')
                    contentArr.push(img)
                }
            }
            contentArrAll.push(contentArr)

            articlesModel.create({
                type: 'selected',
                index: i + n,
                title: title,
                time: time,
                author: author,
                content: contentArrAll[i]
            }, function (err) {
                if (err) console.log('保存错误')
            })
        }

        Model.create({ index: 0, content: contentArrAll }, function (err) {
            if (err) console.log('保存错误')
        })

        console.log('保存完毕')

    }
}

crawler(0)



