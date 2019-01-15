const KoaRouter = require('koa-router');
const wechat = require('../controller/wechat')

const xml2js = require('xml2js');


let router = new KoaRouter();

router.get('/setting', async (ctx, next) => {
    let query = ctx.request.query
    // ctx.body = {code:200}

    console.log('11')

    ctx.body = await wechat.setting(query)
    //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr   
})


router.post('/setting', async (ctx, next) => {
    let buffer = [];
    let that = this

    ctx.res.setHeader('Content-Type', 'application/xml')
    ctx.req.on('data', (chunk) => {

        buffer.push(chunk);

        const parseString = xml2js.parseString
        parseString(chunk, (err, res) => {
            console.log(res)
            ctx.wecahtXmla = res
            buf = res
        })
    })
    ctx.req.on('end', () => {
        console.log('end')

        var msgXml = Buffer.concat(buffer).toString('utf-8');

        const parseString = xml2js.parseString
        function jsonToXml (obj) {
            const builder = new xml2js.Builder()
            return builder.buildObject(obj)
        }
        //解析xml
        parseString(msgXml, { explicitArray: false }, function (err, result) {
            if (!err) {
                result = result.xml;
                var toUser = result.ToUserName; //接收方微信
                var fromUser = result.FromUserName;//发送仿微信
                console.log('推送')

                let xml = jsonToXml({
                    xml: {
                        ToUserName: toUser,
                        FromUserName: fromUser,
                        CreateTime: Date.now(),
                        MsgType: 'text',
                        Content: 'content'
                    }
                })
                console.log(xml)
                ctx.res.end(xml)

                //判断事件类型
                // switch (result.Event.toLowerCase()) {
                //     case 'subscribe':
                //         //回复消息
                //         break;
                // }
            }
        })
        // 
        // next()
    })
    // ctx.body = {ok:200}
    // console.log(wecahtXmla.xml.Event.toLowerCase())
})


router.get('/accessToken', async (ctx, next) => {
    ctx.body = await wechat.accessToken()
})


router.post('/createButton', async (ctx, next) => {
    ctx.body = await wechat.createButton()
})

module.exports = router;