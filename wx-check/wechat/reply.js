const { resolve } = require('path');
const {commonMenu,movieMenu}=require("./menu");

const config = require('../config/config');
const api = require('../app/api/index');


const help = '亲爱的，欢迎关注\n' +
    '回复 1-3，测试文字回复\n' +
    '回复 4，测试图文消息回复\n' +
    '回复 5-11，测试素材上传并获取素材数据\n' +
    '回复 12，测试用户信息数据\n'+
    '回复 13，测试菜单数据\n'+
    '回复 14，测试临时二维码生成\n'+
    '回复 15，测试永久二维码生成\n'+
    '回复 16，测试长链接转短链接\n'+
    '回复 17，测试智能语义转换服务\n'+
    '回复 18，测试智能翻译服务\n'+
    '回复 更新菜单，更新成与电影有关的菜单\n';

//回复策略
exports.reply=async (ctx,next)=>{
    const message=ctx.weixin;

    let { getWechat } = require('./index');
    let client = getWechat();
    let content=message.Content;

    let reply='Oh,你说的'+content+'太复杂了，无法解析';

    //文本回复
    if(message.MsgType==='text'){
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
                },
                {
                    "openid": "oAL5G58txuYKsBMbzsOz1CCucwec",
                    "lang": "zh_CN"
                }];

            let batchUserList = await client.handle('fetchBatchUsers',openids);
            console.log("批量获取用户详细信息");
            console.log(batchUserList);

            reply=info.nickname+"欢迎您！  共有"+userList.total+"个关注者";
            console.log(info);
        }
        else if (content === '13') {  //测试菜单
            try {
                let delData = await client.handle('deleteMenu');
                console.log("删除菜单返回结果");
                console.log(delData);


                let createData = await client.handle('createMenu', commonMenu);
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
        else if (content === '14') { //测试获取临时二维码
            let tempQrData = {
              expire_seconds: 400000,
              action_name: 'QR_SCENE',
              action_info: {
                scene: {
                  scene_id: 101
                }
              }
            };
            let tempTicketData = await client.handle('createQrcode', tempQrData);
            console.log(tempTicketData);
            let tempQr = client.showQrcode(tempTicketData.ticket);
            reply = tempQr;
        }
        else if (content === '15') { //测试获取永久二维码

            let qrData = {
                action_name: 'QR_SCENE',
                action_info: {
                    scene: {
                        scene_id: 99
                    }
                }
            };
            let ticketData = await client.handle('createQrcode', qrData);
            console.log(ticketData);
            let qr = client.showQrcode(ticketData.ticket);
            reply = qr
        }
        else if (content === '16') {  //测试长链接转短链接
            let longurl = 'https://coding.imooc.com/class/178.html?a=1';
            let shortData = await client.handle('createShortUrl', 'long2short', longurl);
            console.log("短链接数据");
            console.log(shortData);

            reply = shortData.short_url;
        }
        else if(content==='17'){  //测试语意理解
            let semanticData={
                "query":"查一下明天从北京到上海的南航机票",
                "city":"北京",
                "category": "flight,hotel",
                "appid":config.wechat.appID,
                "uid":message.FromUserName
            };
            let searchData = await client.handle('semantic', semanticData);
            console.log(searchData);

            reply = JSON.stringify(searchData);
        }else if (content === '18') { //测试ai翻译接口
            let body = '编程语言难学么';
            let aiData = await client.handle('aiTranslate', body, 'zh_CN', 'en_US');

            console.log(aiData);

            reply = JSON.stringify(aiData)
        }
        //更新菜单
        else if (content === '更新菜单') {
            try {
                await client.handle('deleteMenu');
                await client.handle('createMenu', movieMenu)
            } catch (e) {
                console.log(e)
            }

            reply = '菜单创建成功，请等 5 分钟，或者先取消关注，再重新关注就可以看到新菜单'
        }
        else if (content === '首页') {
            reply = [{
                title: '时光的预热',
                description: '匆匆岁月时光去，总有一款你最爱',
                picUrl: 'https://imoocday7.oss-cn-beijing.aliyuncs.com/WX20180701-224844.png',
                url: config.baseUrl
            }]
        }
        else {
            //如果用户输入的信息与前面都不匹配
            //导数据库模糊匹配电影
            let movies = await api.movie.searchByKeyword(content);
            reply = [];

            //没有匹配到的话
            if (!movies || movies.length === 0) {
                //查找分类
                let catData = await api.movie.findMoviesByCat(content);

                if (catData) {
                    movies = catData.movies
                }
            }
            //没有匹配到分类也没有匹配到电影就到豆瓣上去匹配---豆瓣模糊查询
            if (!movies || movies.length === 0) {
                movies = await api.movie.searchByDouban(content)
            }

            if (movies && movies.length) {
                movies = movies.slice(0, 4);
                console.log("reply中豆瓣匹配到的电影数据");
                console.log(movies);
                movies.forEach(movie => {
                    reply.push({
                        title: movie.title,
                        description: movie.summary?movie.summary:'暂且没有获取到描述',
                        picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
                        url: config.baseUrl + 'movie/' + movie._id
                    })
                })
            } else {
                reply = '没有查询到与 ' + content + ' 相关的电影，要不要换一个名字试试看哦！'
            }
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

            if (message.EventKey === 'help') {
                reply = help
            } else if (message.EventKey === 'movie_hot') {
                let movies = await api.movie.findHotMovies(-1, 4);
                reply = [];

                movies.forEach(movie => {
                    reply.push({
                        title: movie.title,
                        description: movie.summary,
                        picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + 'upload/' + movie.poster),
                        url: config.baseUrl + 'movie/' + movie._id
                    })
                })
            } else if (message.EventKey === 'movie_cold') {
                let movies = await api.movie.findHotMovies(1, 4);
                reply = [];

                movies.forEach(movie => {
                    reply.push({
                        title: movie.title,
                        description: movie.summary,
                        picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + 'upload/' + movie.poster),
                        url: config.baseUrl + 'movie/' + movie._id
                    })
                })
            } else if (message.EventKey === 'movie_sci') {
                let catData = await api.movie.findMoviesByCat('科幻');
                let movies = catData.movies || [];
                reply = [];

                movies = movies.slice(0, 6);
                movies.forEach(movie => {
                    reply.push({
                        title: movie.title,
                        description: movie.summary,
                        picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + 'upload/' + movie.poster),
                        url: config.baseUrl + 'movie/' + movie._id
                    })
                })
            } else if (message.EventKey === 'movie_love') {
                let catData = await api.movie.findMoviesByCat('爱情');
                let movies = catData.movies || [];
                reply = [];

                movies.forEach(movie => {
                    reply.push({
                        title: movie.title,
                        description: movie.summary,
                        picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + 'upload/' + movie.poster),
                        url: config.baseUrl + 'movie/' + movie._id
                    })
                })
            }
            console.log('你点击了菜单的： ' + message.EventKey)


        }
        //扫描
        else if (message.Event === 'SCAN') {
            console.log('关注后扫二维码' + '！ 扫码参数' + message.EventKey + '_' + message.ticket);
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