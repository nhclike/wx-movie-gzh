const util=require('./util');
const sha1=require('sha1');
const getRawBody=require('raw-body');
module.exports=(config,reply)=>{
    return async(ctx,next)=>{
        const {
            signature,
            timestamp,
            nonce,
            echostr
        }=ctx.query;

        const token=config.wechat.token;
        let str=[token,timestamp,nonce].sort().join('');
        console.log("微信原始的查询请求数据");
        console.log(ctx.query);
        const sha=sha1(str);
        if(ctx.method==="GET"){
            //判断签名是否合法
            if(sha===signature){
                ctx.body=echostr
            }
            else{
                ctx.body="Failed"
            }
        }else if(ctx.method==="POST"){
            //判断签名是否合法
            if(sha!=signature){
                return (ctx.body="Failed")
            }

            //通过raw-body拿到原始的xml数据
            const data=await getRawBody(ctx.req,{
                length:ctx.length,
                limit:'1mb',
                encoding:ctx.charset
            });
            console.log("微信响应的原始xml数据");
            console.log(data);

            const content=await util.parseXML(data);
            console.log('解析过的xml数据content');
            console.log(content);

            const message=util.formatMessage(content.xml);
            ctx.weixin=message;
            console.log('将xml数据格式化成数组message');
            console.log(message);

            //定义回复内容
            await reply.apply(ctx,[ctx,next]);

            let replyBody=ctx.body;
            let msg=ctx.weixin;

            //将回复内容转成微信能识别的xml数据
            const xml=util.tpl(replyBody,msg);
            console.log("回复响应的xml数据");
            console.log(xml);

            ctx.status=200;
            ctx.type='application/xml';
            ctx.body=xml
        }

    }
};