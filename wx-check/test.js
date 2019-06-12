const {initSchemas,connect} =require('./app/database/init');
const config=require('./config/config');
const Koa=require('koa');

(async()=>{
    //连接数据库
    await connect(config.db);
    initSchemas();
    const app=new Koa();
    app.listen(config.port);

    console.log("listen :"+config.port);
})();
