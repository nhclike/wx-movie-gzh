const Koa=require('koa');
const sha1=require('sha1');
const config={
	wechat:{
		appID:'wxd46b7a729709996a',
		appSecret:'54cac499c4ad92e5185697e36d516533',
		token:'nhclike'
	}
}

const app=new Koa();
app.use(async(ctx,next)=>{
	const {
		signature,
		timestamp,
		nonce,
		echostr
	}=ctx.query
	console.log(ctx);
	const token=config.wechat.token
	let str=[token,timestamp,nonce].sort().join('');

	const sha=sha1(str);
	if(sha===signature){
		ctx.body=echostr
	}
	else{
		ctx.body="hello koa"
	}
})

app.listen(3008)

console.log("listen :3008")