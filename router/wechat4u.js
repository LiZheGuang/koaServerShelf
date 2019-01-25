const KoaRouter = require('koa-router');
const ws4 = require('../controller/wechat4u')
let router = new KoaRouter();



// 创建用户
// router.post('/', async (ctx, next) => {
//     console.log(ctx.request.body)
//     // ctx.body = {code:200}
//     ctx.body = await press.creation(ctx.request.body)
// })

// router.get('/',async(ctx,next)=>{
//     ctx.body = await press.findUser(ctx.request.query)
// })

router.get('/test',async(ctx,next)=>{
    ctx.body = await ws4.test(ctx.request.query)
})
module.exports = router;