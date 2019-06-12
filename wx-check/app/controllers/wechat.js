const { reply } = require('../../wechat/reply');
const config = require('../../config/config');
const api = require('../api/index');
const wechatMiddle = require('../../wechat-lib/middleware');
/*
const { getOAuth } = require('../../wechat/index');
*/

//网页拿到js-sdk签名授权数据
exports.getSDKSignature = async (ctx, next) => {
    let url = ctx.query.url;

    url = decodeURIComponent(url);
    console.log("controllers.wechat.getSDKSignature中需要获取js-sdk签名的网页地址");
    console.log(url);

    //获取签名参数用于渲染页面时做js-sdk验证
    const params = await api.wechat.getSignature(url);

    ctx.body = {
        success: true,
        data: params
    }
};

// 接入微信消息中间件--验证js-sdk
exports.sdk = async (ctx, next) => {
    //ctx.body="hello SDK";
    /*await ctx.render("wechat/sdk",{
        title:"SDK Test",
        desc:"测试 SDK"
    })*/

    const url = ctx.href;
    const params = await api.wechat.getSignature(url);

    await ctx.render('wechat/sdk', params)
};

function isWechat (ua) {  //来自微信的访问user-agent中都会包含MicroMessenger
    if (ua.indexOf('MicroMessenger') >= 0) {
        return true
    } else {
        return false
    }
}

//检查是否是微信访问并且是否授权，如果没有授权跳转授权
exports.checkWechat=async(ctx,next)=>{
    const ua = ctx.headers['user-agent'];
    const code = ctx.query.code;

    // 所有的网页请求都会流经这个中间件，包括微信的网页访问
    // 针对 POST 非 GET 请求，不走用户授权流程
    if (ctx.method === 'GET') {
        // 如果参数带 code，说明用户已经授权
        if (code) {
            await next()
            // 如果没有 code，且来自微信访问，就可以配置授权的跳转
        } else if (isWechat(ua)) {
            const target = ctx.href;
            const scope = 'snsapi_userinfo';
            const url = api.wechat.getAuthorizeURL(scope, target, 'fromWechat');

            ctx.redirect(url)
        } else {
            await next()
        }
    } else {
        await next()
    }
};
//来自微信访问并且已经授权
exports.wechatRedirect = async (ctx, next) => {
    const { code, state } = ctx.query;

    if (code && state === 'fromWechat') {
        //用授权后返回的地址上的code换取access_token和openid并且获取用户信息
        const userData = await api.wechat.getUserinfoByCode(code);
        //保存微信用户数据
        const user = await api.wechat.saveWechatUser(userData);

        //设置当前登录session
        ctx.session.user = {
            _id: user._id,
            role: user.role,
            nickname: user.nickname
        };
        //将登录信息同步到pug模版渲染变量中，将登录状态同步到页面
        ctx.state = Object.assign(ctx.state, {
            user: {
                _id: user._id,
                role: user.role,
                nickname: user.nickname
            }
        })
    }

    await next()
};

// 接入微信消息中间件
exports.hear = async (ctx, next) => {
    const middle = wechatMiddle(config.wechat, reply);

    await middle(ctx, next)
};

//网页授权拼接二次跳转地址
exports.oauth = async (ctx, next) => {

    const target = config.baseUrl + 'userinfo';
    const scope = 'snsapi_userinfo';
    const state = ctx.query.id;

    /*const oauth = getOAuth();
    const url = oauth.getAuthorizeURL(scope, target, state);*/

    const url = api.wechat.getAuthorizeURL(scope, target, state);

    console.log('网页授权url');
    console.log(url);
    ctx.redirect(url)
};

//用授权后返回的地址上的code换取access_token和openid并且获取用户信息
exports.userinfo = async (ctx, next) => {

    const code=ctx.query.code;

    /*const oauth = getOAuth();
    const data = await oauth.fetchAccessToken(code);
    console.log(data);
    const userData = await oauth.getUserInfo(data.access_token, data.openid);*/

    const userData = await api.wechat.getUserinfoByCode(ctx.query.code);

    ctx.body = userData
};
