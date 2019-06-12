const Koa=require('koa');
const { resolve } = require('path');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const serve = require('koa-static');
const mongoose = require('mongoose');
const moment = require('moment');
const Router = require('koa-router');
const config=require('./config/config');
const {initSchemas,connect} =require('./app/database/init');

//测试代码
/*const weChat=require('./wechat-lib/middleware');
//const {reply}=require('./wechat/reply');  //此代码必须注释会导致mongoose的schame注册失败
const {sign} =require("./wechat-lib/util");
const ejs=require('ejs');
const heredoc=require('heredoc');*/


// var tpl= heredoc(function () {/*
//  <!DOCTYPE html>
//  <html>
//         <head lang="zh-cn">
//                 <title>猜电影</title>
//                 <meta name="viewport" content="initial-scale=1,maximum-scale=1,minimum-scale=1">
//
//         </head>
//         <body>
//                 <h1>点击标题开始录音翻译</h1>
//
//                 <p id="title"></p>
//                 <div id="poster"></div>
//
//                 <script src="http://code.jquery.com/jquery-1.11.3.min.js"></script>
//                 <script src="http://res.wx.qq.com/open/js/jweixin-1.4.0.js"></script>
//                 <script>
//                         wx.config({
//                             debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
//                             appId: 'wxd46b7a729709996a', // 必填，公众号的唯一标识
//                             timestamp: '<%= timestamp %>', // 必填，生成签名的时间戳
//                             nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
//                             signature:  '<%= signature %>',// 必填，签名
//                             jsApiList: [
//                                 'startRecord',
//                                 'stopRecord',
//                                 'onVoiceRecordEnd',
//                                 'translateVoice'
//                             ] // 必填，需要使用的JS接口列表
//                         });
//
//
//                         wx.ready(function(){
//                             // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
//                             wx.checkJsApi({
//                                 jsApiList: ['chooseImage'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
//                                 success: function(res) {
//                                 console.log(res);
//                                 // 以键值对的形式返回，可用的api值true，不可用为false
//                                 // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
//                                 }
//                             });
//
//                             var isRecording=false;
//                             $('h1').on('tap',function(){
//                                 if(!isRecording){
//
//                                    isRecording=true;
//                                     wx.startRecord({
//                                         cancel:function(){
//                                             window.alert("那就不能搜索了喔！");
//                                         }
//                                     });
//
//                                     return ;
//                                 }
//
//                                  isRecording=false;
//                                 wx.stopRecord({
//                                     success: function (res) {
//                                         var localId = res.localId;
//
//                                         wx.translateVoice({
//                                             localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
//                                             isShowProgressTips: 1, // 默认为1，显示进度提示
//                                             success: function (res) {
//                                                 alert(res.translateResult); // 语音识别的结果
//                                             }
//                                         });
//                                     }
//                                 });
//
//                             })
//                         });
//
//                 </script>
//         </body>
//  </html>
// */});





(async()=>{
        //连接数据库
        await connect(config.db);

        initSchemas();

       //测试token数据库存储
        /*const {test}=require('./wechat/index');

        await test();*/

       //生成服务器实例
        const app=new Koa();
        const router = new Router();
        const views = require('koa-views');

        //模版引擎渲染
        // Must be used before any router is used
        app.use(views(resolve(__dirname, './app/views'), {
            extension: 'pug',
            options: {
                moment: moment
            }
        }));
        //使得session生效，将cookie加密
        app.keys = ['nhclike'];

        //使用session保存用户会话状态
        app.use(session(app));

        //参数解析
        app.use(bodyParser());

        // 配置静态web服务的中间件
        // 使得koa可以读取js.css.html.图片，视频等静态文件
        // 使得上传的文件可以被访问到
        app.use(serve(resolve(__dirname, '../public')));

        // 植入两个中间件，做前置的微信环境检查、跳转、回调的用户数据存储和状态同步
        const wechatController = require('./app/controllers/wechat');

        app.use(wechatController.checkWechat);
        app.use(wechatController.wechatRedirect);


        //用户信息更新后传递到pug模版上进行渲染
        app.use(async (ctx, next) => {
            const User = mongoose.model('User');
            let user = ctx.session.user;

            if (user && user._id) {
                user = await User.findOne({ _id: user._id });

                if (user) {
                    ctx.session.user = {
                        _id: user._id,
                        role: user.role,
                        nickname: user.nickname
                    };
                    ctx.state = Object.assign(ctx.state, {
                        user: {
                            _id: user._id,
                            nickname: user.nickname
                        }
                    })
                }
            } else {
                ctx.session.user = null
            }

            await next()
        });


        //实现与微信服务交互（通过微信服务验证请求的标签是否合法）
        //通过路由的方式接管中间件（需要重新修改接口配置信息地址--http://nhclike.free.idcfengye.com/wx-hear）
        require('./config/routes')(router);
        //使得路由上的中间件生效
        app.use(router.routes()).use(router.allowedMethods());

        //app.use(weChat(config.wechat,reply));

        //测试浏览器访问
        /*app.use(async (ctx,next)=> {
                console.log(ctx);
            if(ctx.href.indexOf('/movie')>-1){
                let { getWechat }=require("./wechat/index");
                let client=getWechat();
                let data=await client.fetchAccessToken();
                //var access_token='21_ggNkTn-1ebhx1bkT7FD1Qjznizj7ByvfjGRlBsxti2U1qfPkRU6oViPoaHDGZisPg-yRNpBdqVPbXpsXHS_7Z8Yg823ymnfXjDlNrnW0b5Q1OEcCPnxowyjDp86nTHOWV0SZO_plwhbe-VOASLBaABAVOE';
                var access_token=data.access_token;
                var ticketData=await client.fetchTicket(access_token);
                //var ticket='LIKLckvwlJT9cWIhEQTwfCvajsjzviNucSNCVWUqFkOcPpY-5KSg9euoPxT7l_pSu6MH7GWSH3hfiQRoci9ROA';
                var ticket=ticketData.ticket;
                console.log('ticket');
                console.log(ticket);
                var url=ctx.href;
                var params=sign(ticket,url);
                console.log("params");
                console.log(params);
                var content=await ejs.render(tpl,params);
                console.log("content");
                console.log(content);
                ctx.body=content;
            }
            await next();
        });*/



        app.listen(config.port);

        console.log("listen :"+config.port);
    }
)();
