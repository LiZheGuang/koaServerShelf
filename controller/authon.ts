const axios = require('axios')
const config = require('../staticConfigs.js')

/**
 * 调试地址 code :
 * https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx85750f65a88e8afd&redirect_uri=https://lzg.mynatapp.cc/&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect
 */
module.exports.authonUserInfo = async ({ code }: any) => {
    let apiUrl: String = 'https://api.weixin.qq.com/sns/oauth2/access_token'
    let actoken = await axios.get(apiUrl,
        {
            params: {
                appid: config.wecaht.appid,
                secret: config.wecaht.secret,
                code: code,
                grant_type: "authorization_code"
            }
        })
    if(actoken.data.access_token){
        return await this.snsapiUserinfo(actoken.data.access_token,actoken.data.openid)
    }else{
        return actoken.data
    }
}

module.exports.snsapiUserinfo = async (accessToken: string, openid: string, lang: string = 'zh_CN') => {
    const apiUrl: string = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=${lang}`
    let userinfoRes = await axios.get(apiUrl)
    return userinfoRes.data
}