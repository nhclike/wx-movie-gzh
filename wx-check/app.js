const Koa=require('koa');
const weChat=require('./wechat-lib/middleware');
const config=require('./config/config');
const {reply}=require('./wechat/reply');
const {initSchemas,connect} =require('./app/database/init');

(async()=>{
        //连接数据库
        await connect(config.db);

        initSchemas();

       /*//测试token数据库存储
        const {test}=require('./wechat/index');

        await test();*/



       //生成服务器实例
        const app=new Koa();

        //测试浏览器访问
        /*app.use(function *(next) {
                console.log(this);
            if(this.originalUrl.indexOf('/movie')>-1){
                    this.body='<h1>this is a test page</h1>'
            }
            return next;
        });*/


        app.use(weChat(config,reply));

        app.listen(config.port);

        console.log("listen :"+config.port);
    }
)();
