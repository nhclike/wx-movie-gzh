const { resolve } = require('path');
const help = '亲爱的，欢迎关注\n' +
    '回复 1-3，测试文字回复\n' +
    '回复 4，测试图文消息回复\n' +
    '回复 5-11，测试素材上传并获取素材数据\n' +
    '回复 12，测试用户信息数据\n'+
    '回复 13，测试菜单数据\n';
//回复策略
exports.reply=async (ctx,next)=>{
    const message=ctx.weixin;

    let { getWechat } = require('./index')
    let client = getWechat();
    //文本回复
    if(message.MsgType==='text'){
        let content=message.Content;
        let reply='Oh,你说的'+content+'太复杂了，无法解析';
        if(content==='1'){
            reply='天下第一吃大米';
        }
        else if(content==='2'){
            reply='天下第二吃豆腐';
        }
        else if(content==='3'){
            reply='天下第三吃虾米'
        }
        else if(content==='4'){//测试图文消息回复
            reply=[{
                title:'秘密巨星',
                description:'这是一个不错的电影',
                picUrl:'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2508925590.webp',
                url:'http://www.baidu.com'
            }]
        }
        else if(content==='5'){ //测试上传临时素材（图片）
            let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'));
            console.log(data);

            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        }
        else if(content==='6'){  //测试上传临时素材（视频）
            let data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../6.mp4'))

            reply = {
                type: 'video',
                title: '回复的视频标题',
                description: '打个篮球玩玩',
                mediaId: data.media_id
            }
        }
        else if(content==='7'){  //测试上传临时素材（音乐）
            let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'))

            reply = {
                type: 'music',
                title: '回复音乐内容',
                description: '来个音乐放松下',
                musicURL:'http://isure.stream.qqmusic.qq.com/C400001LWYyL4NM5Is.m4a?guid=6239507283&vkey=862B230A49768CABAC26440734B6936CA872221451D62D6166411D8976ADE28D2C34E2B413DB7A8486D20BBCF07F587D86F2A57FD96D7A9B&uin=0&fromtag=38',
                hqMusicUrl:'',
                thumbMediaId:data.media_id,
            }
        }
        else if(content==='8'){ //测试上传永久素材（图片）
            let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'), {
                type: 'image'
            });
            console.log('测试上传永久素材（图片）');
            console.log(data);

            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        }
        else if(content==='9'){  //测试上传永久素材（视频）
            let data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../6.mp4'), {
                type: 'video',
                description: '{"title": "这个地方很棒", "introduction": "好吃不如饺子"}'
            });

            reply = {
                type: 'video',
                title: '回复的永久视频标题',
                description: '打个篮球玩玩',
                mediaId: data.media_id
            }
        }
        else if(content==='10'){ //测试上传永久图文素材并且更新永久图文素材且获取永久图文素材数据
            let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'), {
                type: 'image'
            });
            let data2 = await client.handle('uploadMaterial', 'pic', resolve(__dirname, '../2.jpg'), {
                type: 'image'
            });
            console.log(data2);
            let media = {
                articles: [
                    {
                        title: '这是服务端上传的图文 1',
                        thumb_media_id: data.media_id,
                        author: 'Scott',
                        digest: '没有摘要',
                        show_cover_pic: 1,
                        content: '点击去往慕课网',
                        content_source_url: 'http://coding.imooc.com/'
                    }, {
                        title: '这是服务端上传的图文 2',
                        thumb_media_id: data.media_id,
                        author: 'Scott',
                        digest: '没有摘要',
                        show_cover_pic: 1,
                        content: '点击去往 github',
                        content_source_url: 'http://github.com/'
                    }
                ]
            };

            let uploadData = await client.handle('uploadMaterial', 'news', media, {});
            console.log("上传图文消息返回的数据");
            console.log(uploadData);


           /* let newMedia = {
                media_id: uploadData.media_id,
                index: 0,
                articles: {
                    title: '这是服务端上传的图文 1',
                    thumb_media_id: data.media_id,
                    author: 'Scott',
                    digest: '没有摘要',
                    show_cover_pic: 1,
                    content: '点击去往慕课网',
                    content_source_url: 'http://coding.imooc.com/'
                }
            };

            console.log("更新前图文的数据");
            console.log(uploadData);
            let mediaData = await client.handle('updateMaterial', uploadData.media_id, newMedia);
            console.log("更新后的图文数据");
            console.log(mediaData);*/

            let newsData = await client.handle('fetchMaterial', uploadData.media_id, 'news', true);
            console.log("获取到的素材数据");
            console.log(newsData);

            let items = newsData.news_item;
            let news = [];
            items.forEach(item => {
                news.push({
                    title: item.title,
                    description: item.description,
                    picUrl: data2.url,
                    url: item.url
                })
            });

            reply = news

        }
        else if (content === '11') {  //测试获取素材列表和素材总数
            let counts = await client.handle('countMaterial');
            console.log(JSON.stringify(counts));

            let res = await Promise.all([
                client.handle('batchMaterial', {
                    type: 'image',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial', {
                    type: 'video',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial', {
                    type: 'voice',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial', {
                    type: 'news',
                    offset: 0,
                    count: 10
                })
            ]);

            console.log(res);

            reply = `
                image: ${res[0].total_count}
                video: ${res[1].total_count}
                voice: ${res[2].total_count}
                news: ${res[3].total_count}
              `
        }
        else if(content==='12'){  //测试用户信息获取接口
            let info = await client.handle('getUserInfo',message.FromUserName);
            let userList = await client.handle('fetchUserList',message.FromUserName);

            console.log("粉丝列表");
            console.log(userList);

            let openids=[{
                "openid": message.FromUserName,
                "lang": "zh_CN"
            }];

            let batchUserList = await client.handle('fetchUserList',openids);
            console.log("批量获取用户详细信息");
            console.log(batchUserList);

            reply=info.nickname+"欢迎您！";
            console.log(info);
        }
        else if (content === '13') {  //测试菜单
            try {
                let delData = await client.handle('deleteMenu');
                console.log("删除菜单返回结果");
                console.log(delData);

                let menu = {
                    button: [
                        {
                            name: '一级菜单',
                            sub_button: [
                                {
                                    name: '跳转url',
                                    type: 'view',
                                    url:'http://www.baidu.com',
                                    key: 'view'
                                }, {
                                    name: '扫码推送',
                                    type: 'scancode_push',
                                    key: 'scancode_push'
                                }, {
                                    name: '弹出拍照或者相册',
                                    type: 'pic_photo_or_album',
                                    key: 'pic_photo_or_album'
                                }, {
                                    name: '弹出系统拍照',
                                    type: 'pic_sysphoto',
                                    key: 'pic_sysphoto'
                                }, {
                                    name: '弹出微信相册',
                                    type: 'pic_weixin',
                                    key: 'pic_weixin'
                                }
                            ]
                        },
                        {
                            name: '分类',
                            sub_button: [
                                {
                                    name: '地理位置选择',
                                    type: 'location_select',
                                    key: 'location_select'
                                }
                            ]
                        },
                        {
                            name: '其他',
                            type: 'click',
                            key: 'new_111'
                        }
                    ]
                };
                let createData = await client.handle('createMenu', menu);
                console.log("创建菜单返回结果");
                console.log(createData);

                let fetchData=await client.handle('fetchMenu');
                console.log("获取的菜单");
                console.log(JSON.stringify(fetchData));

            } catch (e) {
                console.log(e)
            }

            reply = '菜单创建成功，请等 5 分钟，或者先取消关注，再重新关注就可以看到新菜单'
        }
        else {
            reply='谢谢您的关注！'
        }
        ctx.body=reply
    }
    //事件推送处理
    else if(message.MsgType=== "event"){
        //关注和取消关注回复
        if(message.Event === 'subscribe'){
            if(message.EventKey){
                console.log("扫描二维码进来"+message.EventKey+''+message.ticket)
            }
            reply=help;
        }
        else if(message.Event === 'unsubscribe'){
            reply="无情取消关注"
        }
        //上报地理位置
        else if(message.Event==='location'){
            reply='您上报的位置是'+message.Location_X+'/'+message.Location_Y+'/'+message.Label
        }
        //点击菜单
        else if(message.Event==='CLICK'){
            reply='您点击了菜单'+message.EventKey;
        }
        //扫描
        else if (message.Event === 'SCAN') {
            console.log('关注后扫二维码' + '！ 扫码参数' + message.EventKey + '_' + message.ticket)
            reply='您扫了一下喔！'
        }
        //点击菜单跳转
        else if(message.Event==='VIEW'){
            reply='您点击的菜单地址为'+message.EventKey;
        }
        //扫码推事件的事件推送
        else if(message.Event==='scancode_push'){
            console.log("扫码推事件的事件推送");
            console.log(message.ScanCodeInfo);
            reply='您进行了扫码推事件操作';
        }
        //弹出系统拍照发图的事件推送
        else if(message.Event==='pic_sysphoto'){
            console.log("弹出系统拍照发图的事件推送,发送的图片信息");
            console.log(message.SendPicsInfo);
            reply='您进行了弹出系统拍照发图的操作';
        }
        //弹出微信相册发图器的事件推送
        else if(message.Event==='pic_weixin'){
            console.log("弹出微信相册发图器的事件推送,发送的图片信息");
            console.log(message.SendPicsInfo);
            reply='弹出微信相册发图器的事件推送';
        }
        ctx.body=reply
    }


    await next();
};