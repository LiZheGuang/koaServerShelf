const crypto = require('crypto') //引入加密模块
const config = require('../staticConfigs')
const xml2js = require('xml2js');

// 创建
module.exports.xml2js = async (ctx, next) => { 
    console.log('中间件')
    ctx.req.on('data', (chunk) => {
        // buf += chunk
        const parseString = xml2js.parseString
        parseString(chunk,(err,res)=>{
            console.log(res)
        })
    })
    ctx.req.on('end', () => {
       console.log('end')
       next()
    })
}
module.exports.xmlToJson = () => {
    return new Promise((resolve, reject) => {
        const parseString = xml2js.parseString
        parseString(str, (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}



module.exports.setting = async (query) => {
    var signature = query.signature,//微信加密签名
        timestamp = query.timestamp,//时间戳
        nonce = query.nonce,//随机数
        echostr = query.echostr;//随机字符串

    //2.将token、timestamp、nonce三个参数进行字典序排序
    var array = [config.wecaht.token, timestamp, nonce];
    array.sort();

    //3.将三个参数字符串拼接成一个字符串进行sha1加密
    var tempStr = array.join('');
    const hashCode = crypto.createHash('sha1'); //创建加密类型 
    var resultCode = hashCode.update(tempStr, 'utf8').digest('hex'); //对传入的字符串进行加密

    //4.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if (resultCode === signature) {
        return echostr
    } else {
        return 'mismatch'
    }
}