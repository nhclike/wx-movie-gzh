const base='https://api.weixin.qq.com/cgi-bin/';
const request=require('request-promise');
const api={
    accessToken:base+'token?grant_type=client_credential'
};

module.exports=class Wechat{
    constructor(opts){
        this.opts=Object.assign({},opts);
        this.appID=opts.appID;
        this.appSercret=opts.appSecret;
        this.getAccessToken=opts.getAccessToken;
        this.saveAccessToken=opts.saveAccessToken;
        this.fetchAccessToken();
    }
    async request(options){
        options=Object.assign({},options,{json:true});
        try{
            const res=await request(options);
            return res;
        }catch(err) {
            console.log(err);
        }
    }
    // 1. 首先检查数据库里的 token 是否过期
    // 2. 过期则刷新
    // 3. token 入库
    async fetchAccessToken(){
        let  data=await this.getAccessToken();

        if(!this.isValidToken(data)){
            data=await this.updateAccessToken()
        }


        await this.saveAccessToken(data);

        return data;
    }
    //更新token
    async updateAccessToken(){
        const url=api.accessToken+'&appid='+this.appID+'&secret='+this.appSercret;
        const data=await this.request({url});
        console.log("根据accessToken接口请求获取到的token数据");
        console.log(data);

        const now=new Date().getTime();
        const expiresIn=now+(data.expires_in-20)*1000;
        data.expires_in=expiresIn;

        return data;
    }
    isValidToken(data){
        if(!data || !data.expires_in){
            return false;
        }

        const expiresIn=data.expires_in;
        const now=new Date().getTime();
        if(now<expiresIn){ //还没到达失效时间
            return true;
        }
        else{
            return false
        }
        return true;
    }
};