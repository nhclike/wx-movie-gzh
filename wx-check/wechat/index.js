const config=require('./../config/config');
const Wechat=require('../wechat-lib/index');
const wechatCfg = {
    wechat: {
        appID: config.wechat.appID,
        appSecret: config.wechat.appSecret,
        token: config.wechat.token,

    }
}

const client=new Wechat(wechatCfg.wechat);

    (async function () {
        const client=new Wechat(wechatCfg.wechat);

    })()