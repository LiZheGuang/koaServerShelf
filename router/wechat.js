const KoaRouter = require('koa-router');
const wechat = require('../controller/wechat')
const xml2js = require('xml2js');
const coWechat = require('co-wechat');
const ejs = require('ejs');
const getRawBody = require('raw-body');


let router = new KoaRouter();
const config = {
    token: 'helloWordxixi',
    appid: 'wx095e8396de8a99f4',
    encodingAESKey: '6QdAw3ud1Nx9MVcryQSP1WxIq6OXPFx8YT2vBqbZ0Cc'
};




// router.use()
router.get('/setting', async (ctx, next) => {
    let query = ctx.request.query
    // ctx.body = {code:200}

    console.log('11')

    ctx.body = await wechat.setting(query)
    //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr   
})

// router.post('/',   coWechat(config).middleware(async (message, ctx) => {
//     // 微信输入信息就是这个 message
//     console.log(message)
//     if (message.FromUserName === 'diaosi') {
//       // 回复屌丝(普通回复)
//       return 'hehe';
//     } else if (message.FromUserName === 'text') {
//       //你也可以这样回复text类型的信息
//       return {
//         content: 'text object',
//         type: 'text'
//       };
//     } else if (message.FromUserName === 'hehe') {
//       // 回复一段音乐
//       return {
//         type: "music",
//         content: {
//           title: "来段音乐吧",
//           description: "一无所有",
//           musicUrl: "http://mp3.com/xx.mp3",
//           hqMusicUrl: "http://mp3.com/xx.mp3"
//         }
//       };
//     } else if (message.FromUserName === 'kf') {
//       // 转发到客服接口
//       return {
//         type: "customerService",
//         kfAccount: "test1@test"
//       };
//     } else {
//       // 回复高富帅(图文回复)
//       return [
//         {
//           title: '你来我家接我吧',
//           description: '这是女神与高富帅之间的对话',
//           picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
//           url: 'http://nodeapi.cloudfoundry.com/'
//         }
//       ];
//     }
//   }),async (ctx, next) => {

// })

// const config = {
//     token: 'helloWord',
//     appid: 'wx85750f65a88e8afd',
//     encodingAESKey: ''
//   };

function parseXML(xml) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, { trim: true }, function (err, obj) {
            if (err) {
                return reject(err);
            }

            resolve(obj);
        });
    });
}
/*!
 * 将xml2js解析出来的对象转换成直接可访问的对象
 */
function formatMessage(result) {
    var message = {};
    if (typeof result === 'object') {
        for (var key in result) {
            if (!(result[key] instanceof Array) || result[key].length === 0) {
                continue;
            }
            if (result[key].length === 1) {
                var val = result[key][0];
                if (typeof val === 'object') {
                    message[key] = formatMessage(val);
                } else {
                    message[key] = (val || '').trim();
                }
            } else {
                message[key] = result[key].map(function (item) {
                    return formatMessage(item);
                });
            }
        }
    }
    return message;
}


/*!
* 响应模版
*/
/* eslint-disable indent */
var tpl = ['<xml>',
    '<ToUserName><![CDATA[<%-toUsername%>]]></ToUserName>',
    '<FromUserName><![CDATA[<%-fromUsername%>]]></FromUserName>',
    '<CreateTime><%=createTime%></CreateTime>',
    '<MsgType><![CDATA[<%=msgType%>]]></MsgType>',
    '<% if (msgType === "news") { %>',
    '<ArticleCount><%=content.length%></ArticleCount>',
    '<Articles>',
    '<% content.forEach(function(item){ %>',
    '<item>',
    '<Title><![CDATA[<%-item.title%>]]></Title>',
    '<Description><![CDATA[<%-item.description%>]]></Description>',
    '<PicUrl><![CDATA[<%-item.picUrl || item.picurl || item.pic || item.thumb_url %>]]></PicUrl>',
    '<Url><![CDATA[<%-item.url%>]]></Url>',
    '</item>',
    '<% }); %>',
    '</Articles>',
    '<% } else if (msgType === "music") { %>',
    '<Music>',
    '<Title><![CDATA[<%-content.title%>]]></Title>',
    '<Description><![CDATA[<%-content.description%>]]></Description>',
    '<MusicUrl><![CDATA[<%-content.musicUrl || content.url %>]]></MusicUrl>',
    '<HQMusicUrl><![CDATA[<%-content.hqMusicUrl || content.hqUrl %>]]></HQMusicUrl>',
    '</Music>',
    '<% } else if (msgType === "voice") { %>',
    '<Voice>',
    '<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>',
    '</Voice>',
    '<% } else if (msgType === "image") { %>',
    '<Image>',
    '<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>',
    '</Image>',
    '<% } else if (msgType === "video") { %>',
    '<Video>',
    '<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>',
    '<Title><![CDATA[<%-content.title%>]]></Title>',
    '<Description><![CDATA[<%-content.description%>]]></Description>',
    '</Video>',
    '<% } else if (msgType === "transfer_customer_service") { %>',
    '<% if (content && content.kfAccount) { %>',
    '<TransInfo>',
    '<KfAccount><![CDATA[<%-content.kfAccount%>]]></KfAccount>',
    '</TransInfo>',
    '<% } %>',
    '<% } else { %>',
    '<Content><![CDATA[<%-content%>]]></Content>',
    '<% } %>',
    '</xml>'].join('');
/* eslint-enable indent */

/*!
* 编译过后的模版
*/
var compiled = ejs.compile(tpl);

var wrapTpl = '<xml>' +
    '<Encrypt><![CDATA[<%-encrypt%>]]></Encrypt>' +
    '<MsgSignature><![CDATA[<%-signature%>]]></MsgSignature>' +
    '<TimeStamp><%-timestamp%></TimeStamp>' +
    '<Nonce><![CDATA[<%-nonce%>]]></Nonce>' +
    '</xml>';

var encryptWrap = ejs.compile(wrapTpl);

function reply2CustomerService(fromUsername, toUsername, kfAccount) {
    var info = {};
    info.msgType = 'transfer_customer_service';
    info.createTime = new Date().getTime();
    info.toUsername = toUsername;
    info.fromUsername = fromUsername;
    info.content = {};
    if (typeof kfAccount === 'string') {
        info.content.kfAccount = kfAccount;
    }
    return compiled(info);
}

/*!
* 将内容回复给微信的封装方法
*/
function reply(content, fromUsername, toUsername) {
    var info = {};
    var type = 'text';
    info.content = content || '';
    if (Array.isArray(content)) {
        type = 'news';
    } else if (typeof content === 'object') {
        if (content.hasOwnProperty('type')) {
            if (content.type === 'customerService') {
                return reply2CustomerService(fromUsername, toUsername, content.kfAccount);
            }
            type = content.type;
            info.content = content.content;
        } else {
            type = 'music';
        }
    }
    info.msgType = type;
    info.createTime = new Date().getTime();
    info.toUsername = toUsername;
    info.fromUsername = fromUsername;
    return compiled(info);
}

function reply(content, fromUsername, toUsername) {
    var info = {};
    var type = 'text';
    info.content = content || '';
    if (Array.isArray(content)) {
        type = 'news';
    } else if (typeof content === 'object') {
        if (content.hasOwnProperty('type')) {
            if (content.type === 'customerService') {
                return reply2CustomerService(fromUsername, toUsername, content.kfAccount);
            }
            type = content.type;
            info.content = content.content;
        } else {
            type = 'music';
        }
    }
    info.msgType = type;
    info.createTime = new Date().getTime();
    info.toUsername = toUsername;
    info.fromUsername = fromUsername;
    return compiled(info);
}
router.post('/setting', async (ctx, next) => {

    console.log(ctx.request.body)

    // 取原始数据
    let xml = await getRawBody(ctx.req, {
        length: ctx.request.length,
        limit: '1mb',
        encoding: ctx.request.charset || 'utf-8'
    });

    // 保存原始xml
    ctx.weixin_xml = xml;
    let result = await parseXML(xml);
    var formatted = formatMessage(result.xml);
    let body = '123213'
    var replyMessageXml = reply(body, formatted.ToUserName, formatted.FromUserName);
    ctx.body = replyMessageXml;
    ctx.type = 'application/xml';
  
})


router.get('/accessToken', async (ctx, next) => {
    ctx.body = await wechat.accessToken()
})


router.post('/createButton', async (ctx, next) => {
    ctx.body = await wechat.createButton()
})

module.exports = router;