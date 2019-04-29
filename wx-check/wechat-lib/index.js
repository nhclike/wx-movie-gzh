const base='https://api.weixin.qq.com/cgi-bin/';
const api={
    accessToken:base+'token?grant_type=client_credential'
};
const request=require('request-promise');
module.exports=class Wechat{
    constructor(opts){
        this.opts=Object.assign({},opts);
        this.appID=opts.appID;
        this.appSercret=opts.appSecret;
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
        let  data;
        console.log(this);
        if(this.getAccessToken){
            data=await this.getAccessToken()
        }

        if(this.isValidToken(data)){
            data=await this.updateAccessToken()
        }
    }
    async updateAccessToken(){
        const url=api.accessToken+'&appid='+this.appID+'&secret='+this.appSercret;
        const data=await this.request({url});
        console.log(data);

        const now=new Date().getTime();
        const expiresIn=now+(data.expires_in-20)*1000;
        data.expires_in=expiresIn;

        console.log(data);
        return data;
    }
    isValidToken(){
        return true;
    }
}