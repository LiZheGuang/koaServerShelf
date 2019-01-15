const crypto = require('crypto') //引入加密模块
const config = require('../staticConfigs')
const xml2js = require('xml2js');
const axios = require('axios')

const mongoose = require('mongoose');

const accesstoken = mongoose.model('accesstoken')

// xml2js中间件
module.exports.xml2js = async (ctx, next) => {
    console.log('中间件')
    ctx.req.on('data', (chunk) => {
        // buf += chunk
        const parseString = xml2js.parseString
        parseString(chunk, (err, res) => {
            console.log(res)
            ctx.wecahtXmla = res
        })
    })
    ctx.req.on('end', () => {
        console.log('end')
        next()
    })
}
// xml2jsz转成json
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
// 接入微信公众公开发
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

module.exports.accessToken = async () => {
    const tokenJson = await wechatClass.wechatToken()
    return tokenJson
}


// 17_beU-5alLhBDZAxX-T_13WSZjwAKEH2BRCA7P1ED9p7ASkSVH92DGWLGlSC2uFyD-Uiou5XOtDMbue2RqvphcbtRXagWg4Mh3NLK0n-4vnSixa6nPO1Sha5UtVLms-tY0PtRsv59vZFDVQNvkPBDiACAIUW

class axiosHttp {
    async wechatToken() {
        let wechatToken = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.wecaht.appid}&secret=${config.wecaht.secret}`
        return new Promise((resove, reject) => {
            axios.get(wechatToken).then((res) => {
                resove(res.data)
                if (res.data.access_token) {
                    setInterval(() => {
                        this.access_token(res.data.access_token,res.data.expires_in)
                    }, res.data.expires_in * 1000);
                }
            }).catch((err) => {
                reject(err)
            })
        })
    }
    async uptoken(access_token,expires_in){
        accesstoken.findOneAndUpdate({ accessName: "accesstoken" }, {
            $set: {
                access_token: access_token,
                expires_in: 3500,
            }
        }, { upsert: true })
    }
}



const wechatClass = new axiosHttp()