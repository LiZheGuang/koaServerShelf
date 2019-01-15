const crypto = require('crypto') //引入加密模块
const config = require('../staticConfigs')
const xml2js = require('xml2js');
const axios = require('axios')

// const mongoose = require('mongoose');

// const accesstoken = mongoose.model('accesstoken')

// xml2js中间件
module.exports.xml2js = async (ctx, next) => {

    let buffer = [];
    let that = this

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

        //解析xml
        parseString(msgXml, { explicitArray: false }, function (err, result) {
            if (!err) {
                result = result.xml;
                var toUser = result.ToUserName; //接收方微信
                var fromUser = result.FromUserName;//发送仿微信
                console.log(that.txtMsg(fromUser, toUser, '欢迎关注 hvkcoder 公众号，一起斗图吧'))
                ctx.body = that.txtMsg(fromUser, toUser, '欢迎关注 hvkcoder 公众号，一起斗图吧')

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
module.exports.createButton = async () => {
    let createButtonApi = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=ACCESS_TOKEN'
    let btnJson = {
        "button": [
            {
                "type": "click",
                "name": "今日歌曲",
                "key": "V1001_TODAY_MUSIC"
            },
            {
                "name": "菜单",
                "sub_button": [
                    {
                        "type": "view",
                        "name": "搜索",
                        "url": "http://www.soso.com/"
                    },
                    {
                        "type": "miniprogram",
                        "name": "wxa",
                        "url": "http://mp.weixin.qq.com",
                        "appid": "wx286b93c14bbf93aa",
                        "pagepath": "pages/lunar/index"
                    },
                    {
                        "type": "click",
                        "name": "赞一下我们",
                        "key": "V1001_GOOD"
                    }]
            }]
    }
    const postRes = await axios.post(createButtonApi, btnJson)
    return postRes.data
}

// 回复消息
module.exports.txtMsg = (toUser, fromUser, content) => {
    var xmlContent = `<xml><ToUserName><![CDATA[${toUser}]]></ToUserName><FromUserName><![CDATA[${fromUser}]]></FromUserName><CreateTime>${new Date().getTime()}</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[${content}]]></Content></xml>`
    return xmlContent;
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
                        this.access_token(res.data.access_token, res.data.expires_in)
                    }, res.data.expires_in * 1000);
                }
            }).catch((err) => {
                reject(err)
            })
        })
    }
    async uptoken(access_token, expires_in) {
        accesstoken.findOneAndUpdate({ accessName: "accesstoken" }, {
            $set: {
                access_token: access_token,
                expires_in: 3500,
            }
        }, { upsert: true })
    }
}



const wechatClass = new axiosHttp()