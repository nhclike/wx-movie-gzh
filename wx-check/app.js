const Koa=require('koa');
const weChat=require('./wechat-lib/middleware');
const config=require('./config/config');
const {reply}=require('./wechat/reply');

const app=new Koa();
app.use(weChat(config,reply));

app.listen(config.port)

console.log("listen :"+config.port);