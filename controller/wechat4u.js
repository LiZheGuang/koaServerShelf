
const Wechat = require('wechat4u')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const request = require('request')

let wechatData = {
    UserName: ""
}
module.exports.test = async () => {
    let bot
    /**
     * 尝试获取本地登录数据，免扫码
     * 这里演示从本地文件中获取数据
     */
    try {
        bot = new Wechat(require('./sync-data.json'))
    } catch (e) {
        bot = new Wechat()
    }
    /**
     * 启动机器人
     */
    if (bot.PROP.uin) {
        // 存在登录数据时，可以随时调用restart进行重启
        bot.restart()
    } else {
        bot.start()
    }
    /**
     * uuid事件，参数为uuid，根据uuid生成二维码
     */
    bot.on('uuid', uuid => {
        qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
            small: true
        })
        console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
    })

    /**
     * 登录成功事件
     */
    bot.on('login', () => {
        console.log('登录成功')
        // 保存数据，将数据序列化之后保存到任意位置
        fs.writeFileSync('./sync-data.json', JSON.stringify(bot.botData))
        console.log('要延时发送消息')
        setInterval(() => {
            let ToUserName = wechatData.UserName
    
            /**
             * 发送文本消息，可以包含emoji(😒)和QQ表情([坏笑])
             */
            console.log(ToUserName)
            bot.sendMsg('我是机器人我是机器人赵秋贞坏人！', ToUserName)
                .catch(err => {
                    bot.emit('error', err)
                })
        }, 5000)
    })

    /**
 * 联系人更新事件，参数为被更新的联系人列表
 */
    bot.on('contacts-updated', contacts => {
        console.log(contacts)
        console.log('联系人数量：', Object.keys(bot.contacts).length)
        contacts.map((res) => {
            if (res.NickName === '李哲广测试') {
                wechatData = res
            }
        })
        console.log('李哲广的测试群为' + wechatData.UserName)
    })
}



module.exports.test()