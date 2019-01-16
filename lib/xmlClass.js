var xml2js = require('xml2js');
var ejs = require('ejs');
var getRawBody = require('raw-body');
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
var wrapTpl = '<xml>' +
    '<Encrypt><![CDATA[<%-encrypt%>]]></Encrypt>' +
    '<MsgSignature><![CDATA[<%-signature%>]]></MsgSignature>' +
    '<TimeStamp><%-timestamp%></TimeStamp>' +
    '<Nonce><![CDATA[<%-nonce%>]]></Nonce>' +
    '</xml>';
var compiled = ejs.compile(tpl);
var encryptWrap = ejs.compile(wrapTpl);
var xmlComment = (function () {
    function xmlComment() {
    }
    xmlComment.prototype.parseXML = function (xml) {
        return new Promise(function (resolve, reject) {
            xml2js.parseString(xml, { trim: true }, function (err, obj) {
                if (err) {
                    return reject(err);
                }
                resolve(obj);
            });
        });
    };
    xmlComment.prototype.formatMessage = function (result) {
        var message = {};
        if (typeof result === 'object') {
            for (var key in result) {
                if (!(result[key] instanceof Array) || result[key].length === 0) {
                    continue;
                }
                if (result[key].length === 1) {
                    var val = result[key][0];
                    if (typeof val === 'object') {
                        message[key] = this.formatMessage(val);
                    }
                    else {
                        message[key] = (val || '').trim();
                    }
                }
                else {
                    message[key] = result[key].map(function (item) {
                        return this.formatMessage(item);
                    });
                }
            }
        }
        return message;
    };
    xmlComment.prototype.reply2CustomerService = function (fromUsername, toUsername, kfAccount) {
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
    };
    xmlComment.prototype.reply = function (content, fromUsername, toUsername) {
        var info = {};
        var type = 'text';
        info.content = content || '';
        if (Array.isArray(content)) {
            type = 'news';
        }
        else if (typeof content === 'object') {
            if (content.hasOwnProperty('type')) {
                if (content.type === 'customerService') {
                    return this.reply2CustomerService(fromUsername, toUsername, content.kfAccount);
                }
                type = content.type;
                info.content = content.content;
            }
            else {
                type = 'music';
            }
        }
        info.msgType = type;
        info.createTime = new Date().getTime();
        info.toUsername = toUsername;
        info.fromUsername = fromUsername;
        return compiled(info);
    };
    return xmlComment;
}());
var msgWechat = new xmlComment();
module.exports = msgWechat;
