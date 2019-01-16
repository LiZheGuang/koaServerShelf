const KoaRouter = require('koa-router');
const wechat = require('../controller/wechat')
const authone = require('../controller/authon.js')

let router = new KoaRouter();


router.get('/setting', async (ctx, next) => {
    let query = ctx.request.query
    ctx.body = await wechat.setting(query)
    //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr   
})

router.post('/setting', async (ctx, next) => {
    await wechat.msgResponse(ctx, next)
})

router.get('/accessToken', async (ctx, next) => {
    console.log('1')
    ctx.body = await wechat.accessToken()
})
router.post('/createButton', async (ctx, next) => {
    ctx.body = await wechat.createButton()
})

router.get('/codeGetToken', async (ctx, next) => {
    ctx.body = await authone.authonUserInfo(ctx.request.query)
})

module.exports = router;