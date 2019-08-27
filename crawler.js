const cheerio = require('cheerio')
const axios = require('axios')
const urlAll = []

!(async function getURL() {
    const request = await axios.get('https://www.douban.com/group/explore')

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
        console.log(r)
        page()
    })
    .catch(e => {
        console.log('失败啦')
    })


async function page() {
    const contentArrAll = []

    for (let i = 0; i < urlAll.length; i++) {
        const request = await axios.get(urlAll[i])

        const document = request.data

        const $ = cheerio.load(document)

        const contentArr = []

        let childern = $('.topic-richtext').children()

        for (let i = 0; i < childern.length; i++) {
            if (childern[i].name === 'p') {
                let text = $(childern[i]).text()
                contentArr.push(text)
            }

            if ($(childern[i]).children().length) {
                let img = $(childern[i]).find('img').attr('src')
                contentArr.push(img)
            } else {

            }
        }
        contentArrAll.push(contentArr)
    }
    console.log(contentArrAll)

}