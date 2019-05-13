const fs = require('fs');
const base='https://api.weixin.qq.com/cgi-bin/';
const request=require('request-promise');

const api={
    accessToken:base+'token?grant_type=client_credential',
    temporary: {
        upload: base + 'media/upload?',
        fetch: base + 'media/get?'
    },
    permanent: {
        upload: base + 'material/add_material?',  //新增其他类型永久素材
        uploadNews: base + 'material/add_news?',  //新增永久图文素材
        uploadNewsPic: base + 'media/uploadimg?', //上传图文消息内的图片获取URL
        fetch: base + 'material/get_material?',  //获取永久素材
        del: base + 'material/del_material?',    //删除永久素材
        update: base + 'material/update_news?',   //修改永久图文素材
        count: base + 'material/get_materialcount?', //获取素材总数
        batch: base + 'material/batchget_material?'
    },
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

    uploadMaterial(token, type, material, permanent = false){
        let form = {};
        let url = api.temporary.upload;
        // 永久素材 form 是个 obj，继承外面传入的新对象
        if (permanent) {
            url = api.permanent.upload;
            form = Object.assign(form, permanent)
        }

        // 上传图文消息的图片素材
        if (type === 'pic') {
            url = api.permanent.uploadNewsPic
        }

        // 图文非图文的素材提交表单的切换
        if (type === 'news') {
            url = api.permanent.uploadNews;
            form = material
        } else {
            form.media = fs.createReadStream(material)
        }

        let uploadUrl = `${url}access_token=${token}`;

        // 根据素材永久性填充 token
        if (!permanent) {
            uploadUrl += `&type=${type}`
        } else {
            if (type !== 'news') {
                form.access_token = token
            }
        }

        const options = {
            method: 'POST',
            url: uploadUrl,
            json: true
        };
        // 图文和非图文在 request 提交主体判断
        if (type === 'news') {
            options.body = form
        } else {
            options.formData = form
        }

        console.log(options);
        return options;
    }
    // 封装用来请求接口的入口方法
    async handle (operation, ...args) {
        const tokenData = await this.fetchAccessToken();
        const options = this[operation](tokenData.access_token, ...args);
        const data = await this.request(options);

        return data
    }

    // 获取素材本身
    fetchMaterial (token, mediaId, type, permanent) {
        let form = {};
        let fetchUrl = api.temporary.fetch;

        if (permanent) {
            fetchUrl = api.permanent.fetch
        }
        let url = fetchUrl + 'access_token=' + token;
        let options = { method: 'POST', url };

        if (permanent) {
            form.media_id = mediaId;
            form.access_token = token;
            options.body = form
        } else {
            if (type === 'video') {
                url = url.replace('https:', 'http:')
            }

            url += '&media_id=' + mediaId
        }

        return options
    }

    // 删除素材
    deleteMaterial (token, mediaId) {
        const form = {
            media_id: mediaId
        };
        const url = `${api.permanent.del}access_token=${token}&media_id=${mediaId}`;

        return { method: 'POST', url, body: form }
    }

    // 更新素材
    updateMaterial (token, mediaId, news) {
        let form = {
            media_id: mediaId
        };
        form = Object.assign(form, news);

        const url = `${api.permanent.update}access_token=${token}&media_id=${mediaId}`;

        return { method: 'POST', url, body: form }
    }

    // 获取素材总数
    countMaterial (token) {
        const url = `${api.permanent.count}access_token=${token}`;

        return { method: 'POST', url }
    }

    // 获取素材列表
    batchMaterial (token, options) {
        options.type = options.type || 'image';
        options.offset = options.offset || 0;
        options.count = options.count || 10;

        const url = `${api.permanent.batch}access_token=${token}`;

        return { method: 'POST', url, body: options }
    }
};