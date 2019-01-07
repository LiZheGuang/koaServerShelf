const KoaRouter = require('koa-router');
const press = require('../controller/user')
let router = new KoaRouter();



// 创建用户
router.post('/', async (ctx, next) => {
    console.log(ctx.request.body)
    // ctx.body = {code:200}
    ctx.body = await press.creation(ctx.request.body)
})

router.get('/',async(ctx,next)=>{
    ctx.body = await press.findUser(ctx.request.query)
})

router.post('/loginAdmin',async(ctx,next)=>{
    ctx.body = await press.findOneIsAdmin(ctx.request.body)
})
module.exports = router;