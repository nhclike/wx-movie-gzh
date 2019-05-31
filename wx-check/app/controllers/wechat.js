const { reply } = require('../../wechat/reply');
const config = require('../../config/config');
//const api = require('../api/index');
const wechatMiddle = require('../../wechat-lib/middleware');
const { getOAuth } = require('../../wechat/index');

// 接入微信消息中间件
exports.hear = async (ctx, next) => {
    const middle = wechatMiddle(config.wechat, reply);

    await middle(ctx, next)
};

//网页授权
exports.oauth = async (ctx, next) => {
    const oauth = getOAuth();
    const target = config.baseUrl + 'userinfo';
    const scope = 'snsapi_userinfo';

    const state = ctx.query.id;
    const url = oauth.getAuthorizeURL(scope, target, state);
    console.log('网页授权url');
    console.log(url);
    ctx.redirect(url)
};

//用授权后返回的地址上的code换取access_token和openid并且获取用户信息
exports.userinfo = async (ctx, next) => {
    const oauth = getOAuth();
    const code=ctx.query.code;
    const data = await oauth.fetchAccessToken(code);
    console.log(data);
    const userData = await oauth.getUserInfo(data.access_token, data.openid);
    ctx.body = userData
};
