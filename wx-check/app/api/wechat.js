const mongoose = require('mongoose');
const User = mongoose.model('User');
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

//保存微信用户数据
exports.saveWechatUser = async (userData) => {
    let query = {
        openid: userData.openid
    };

    if (userData.unionid) {
        query = {
            unionid: userData.unionid
        }
    }

    let user = await User.findOne(query);

    if (!user) {
        user = new User({
            openid: [userData.openid],
            unionid: userData.unionid,
            nickname: userData.nickname,
            email: (userData.unionid || userData.openid) + '@wx.com',
            province: userData.province,
            country: userData.country,
            city: userData.city,
            gender: userData.gender || userData.sex
        });
        console.log('api.wechat.saveWechatUser');
        console.log(user);

        user = await user.save()
    }

    return user
};

// 持久化用户
// 对用户打标签和统计
exports.saveMPUser = async (message, from = '') => {
    let sceneId = message.EventKey;
    let openid = message.FromUserName;
    let count = 0;

    if (sceneId && sceneId.indexOf('qrscene_') > -1) { //扫码
        sceneId = sceneId.replace('qrscene_', '')
    }

    //看微信关注的人员信息在数据库里是否已经存在
    let user = await User.findOne({
        openid: openid
    });

    let mp = require('../../wechat/index');
    let client = mp.getWechat();   //拿到微信对象
    let userInfo = await client.handle('getUserInfo', openid); //微信拿到用户信息

    if (sceneId === 'imooc') {
        from = 'imooc'
    }
    //如果不存在就将此用户存入数据库
    if (!user) {
        let userData = {
            from: from,
            openid: [userInfo.openid],
            unionid: userInfo.unionid,
            nickname: userInfo.nickname,
            email: (userInfo.unionid || userInfo.openid) + '@wx.com',
            province: userInfo.province,
            country: userInfo.country,
            city: userInfo.city,
            gender: userInfo.gender || userInfo.sex
        };

        console.log(userData);

        user = new User(userData);
        user = await user.save()
    }

    if (from === 'imooc') {
        let tagid;

        count = await User.count({
            from: 'imooc'
        });

        try {
            let tagsData = await client.handle('fetchTags');

            tagsData = tagsData || {};
            const tags = tagsData.tags || [];
            const tag = tags.filter(tag => {
                return tag.name === 'imooc'
            });

            if (tag && tag.length > 0) {
                tagid = tag[0].id;
                count = tag[0].count || 0
            } else {
                let res = await client.handle('createTag', 'imooc');

                tagid = res.tag.id
            }

            //给用户打标签
            if (tagid) {
                await client.handle('batchTag', [openid], tagid)
            }
        } catch (err) {
            console.log(err)
        }
    }

    return {
        user,
        count
    }
};
