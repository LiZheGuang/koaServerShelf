const crypto = require('crypto') //引入加密模块
const config = require('../staticConfigs')
const getRawBody = require('raw-body');
const axios = require('axios')
const msgWechat = require('../lib/xmlClass')
const mongoose = require('mongoose');
const accesstoken = mongoose.model('accesstoken')
// xml2js中间件
module.exports.msgResponse = async (ctx, next) => {
    // 取原始数据
    let xml = await getRawBody(ctx.req, {
        length: ctx.request.length,
        limit: '1mb',
        encoding: ctx.request.charset || 'utf-8'
    });

    // 保存原始xml
    ctx.weixin_xml = xml;
    let result = await msgWechat.parseXML(xml);
    var formatted = msgWechat.formatMessage(result.xml);
    let body = '我是自动回复功能，你回复我什么我都会只回复你这句话'
    var replyMessageXml = msgWechat.reply(body, formatted.ToUserName, formatted.FromUserName);
    ctx.replyMessageXml = replyMessageXml
    ctx.body = replyMessageXml
    ctx.type = 'application/xml';
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
// 创建公众平台底部按钮
module.exports.createButton = async () => {
    let token = await this.findToken()
    let createButtonApi = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + token
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

module.exports.findToken = async () => {
    let tokenRes = await accesstoken.findOne({accessName:"accesstoken"})
    return tokenRes.access_token
}
class axiosHttp {
    async wechatToken() {
        let wechatToken = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.wecaht.appid}&secret=${config.wecaht.secret}`
        return new Promise((resove, reject) => {

            axios.get(wechatToken).then((res) => {
                resove(res.data)
                if (res.data.access_token) {
                    this.uptoken(res.data.access_token, res.data.expires_in)
                    setInterval(() => {
                        this.wechatToken()
                    }, res.data.expires_in * 1000);
                }
            }).catch((err) => {
                reject(err)
            })
        })
    }
    async uptoken(access_token, expires_in) {

        await accesstoken.updateOne({ accessName: "accesstoken" }, {
            $set: {
                access_token: access_token,
                expires_in: expires_in,
            }
        }, { upsert: true })
        // console.log(res)
    }
}



const wechatClass = new axiosHttp()