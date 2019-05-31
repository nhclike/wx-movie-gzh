const { getOAuth, getWechat } = require('../../wechat/index');
const util = require('../../wechat-lib/util');

//获取签名参数用于渲染页面时做js-sdk验证
exports.getSignature = async (url) => {
    const client = getWechat();
    const data = await client.fetchAccessToken();
    const token = data.access_token;
    const ticketData = await client.fetchTicket(token);
    const ticket = ticketData.ticket;

    let params = util.sign(ticket, url);
    params.appId = client.appID;

    return params
};


//网页授权拼接二次跳转地址
exports.getAuthorizeURL = (scope, target, state) => {
    const oauth = getOAuth();
    const url = oauth.getAuthorizeURL(scope, target, state);

    return url
};

//用授权后返回的地址上的code换取access_token和openid并且获取用户信息
exports.getUserinfoByCode = async (code) => {
    const oauth = getOAuth();
    const data = await oauth.fetchAccessToken(code);
    const userData = await oauth.getUserInfo(data.access_token, data.openid);

    return userData
};