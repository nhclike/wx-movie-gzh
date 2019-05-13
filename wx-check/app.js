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

        app.use(weChat(config,reply));

        app.listen(config.port);

        console.log("listen :"+config.port);
    }
)();
