const { resolve } = require('path');

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
        else if (content === '11') {  //获取素材列表和素材总数
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
            reply='欢迎关注!'+message.MsgId;
        }
        else if(message.Event === 'unsubscribe'){
            reply="无情取消关注"
        }
        //上报地理位置
        else if(message.Event==='LOCATION'){
            reply='您上报的位置是'+message.Latitude+'/'+message.Longitude+'/'+message.Precision
        }
        //点击菜单
        else if(message.Event==='CLICK'){
            reply='您点击了菜单'
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
        ctx.body=reply
    }


    await next();
};