const KoaRouter = require('koa-router');
const parseString = require('xml2js').parseString;
const wechat = require('../controller/wechat')
let router = new KoaRouter();

router.get('/setting', async (ctx, next) => {
    let query = ctx.request.query
    // ctx.body = {code:200}
    ctx.body = await wechat.setting(query)
    //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr   
})


router.post('/setting', wechat.xml2js, async (ctx, next) => {
    ctx.body = { ok: true }
})



module.exports = router;