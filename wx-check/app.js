const Koa=require('koa');
const weChat=require('./wechat-lib/middleware');
const config=require('./config/config');
const {reply}=require('./wechat/reply');
const {initSchemas,connect} =require('./app/database/init');
const {sign} =require("./wechat-lib/util");
const ejs=require('ejs');
const heredoc=require('heredoc');

var tpl= heredoc(function () {/*
 <!DOCTYPE html>
 <html>
        <head lang="zh-cn">
                <title>猜电影</title>
                <meta name="viewport" content="initial-scale=1,maximum-scale=1,minimum-scale=1">

        </head>
        <body>
                <h1>点击标题开始录音翻译</h1>

                <p id="title"></p>
                <div id="poster"></div>

                <script src="http://code.jquery.com/jquery-1.11.3.min.js"></script>
                <script src="http://res.wx.qq.com/open/js/jweixin-1.4.0.js"></script>
                <script>
                        wx.config({
                            debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                            appId: 'wxd46b7a729709996a', // 必填，公众号的唯一标识
                            timestamp: '<%= timestamp %>', // 必填，生成签名的时间戳
                            nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
                            signature:  '<%= signature %>',// 必填，签名
                            jsApiList: [
                                'startRecord',
                                'stopRecord',
                                'onVoiceRecordEnd',
                                'translateVoice'
                            ] // 必填，需要使用的JS接口列表
                        });

                </script>
        </body>
 </html>
*/});





(async()=>{
        //连接数据库
        await connect(config.db);

        initSchemas();

       //测试token数据库存储
        /*const {test}=require('./wechat/index');

        await test();*/



       //生成服务器实例
        const app=new Koa();

        //实现与微信服务交互（通过微信服务验证请求的标签是否合法）
        //app.use(weChat(config,reply));

        //测试浏览器访问
        app.use(async (ctx,next)=> {
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
        });


        app.listen(config.port);

        console.log("listen :"+config.port);
    }
)();
