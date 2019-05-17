const fs = require('fs');
const base='https://api.weixin.qq.com/cgi-bin/';
const mpBase = 'https://mp.weixin.qq.com/cgi-bin/';
const semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?';

const request=require('request-promise');

const api={
    semanticUrl,
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
    user: {
        fetch: base + 'user/get?',                //获取用户列表
        remark: base + 'user/info/updateremark?', //重命名（需要在认证的服务号上使用）
        info: base + 'user/info?',                //获取用户基本信息（包括UnionID机制）
        batch: base + 'user/info/batchget?'       //批量获取用户基本信息
    },
    menu: {
        create: base + 'menu/create?',
        del: base + 'menu/delete?',
        custom: base + 'menu/addconditional?',
        fetch: base + 'menu/get?'
    },
    qrcode: {
        create: base + 'qrcode/create?',
        show: mpBase + 'showqrcode?'
    },
    shortUrl: {
        create: base + 'shorturl?'
    },
    ticket: {
        get: base + 'ticket/getticket?'
    }
};

module.exports=class Wechat{
    constructor(opts){
        this.opts=Object.assign({},opts);
        this.appID=opts.appID;
        this.appSercret=opts.appSecret;
        this.getAccessToken=opts.getAccessToken;
        this.saveAccessToken=opts.saveAccessToken;
        this.getTicket = opts.getTicket;
        this.saveTicket = opts.saveTicket;
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

        if(!this.isValid(data, 'access_token')){
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
    //获取ticket
    async fetchTicket (token) {
        let data = await this.getTicket();

        if (!this.isValid(data, 'ticket')) {
            data = await this.updateTicket(token)
        }

        await this.saveTicket(data);

        return data
    }
    //更新ticket
    async updateTicket (token) {
        const url = `${api.ticket.get}access_token=${token}&type=jsapi`;

        const data = await this.request({ url });
        const now = new Date().getTime();
        const expiresIn = now + (data.expires_in - 20) * 1000;

        data.expires_in = expiresIn;

        return data
    }
    isValid(data, name){
        if (!data || !data[name].expires_in) {
            return false
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


    // 给用户设置别名 服务号专用接口
    remarkUser (token, openId, remark) {
        const body = {
            openid: openId,
            remark
        };

        const url = api.user.remark + 'access_token=' + token;

        return { method: 'POST', url, body }
    }

    // 获取粉丝列表
    fetchUserList (token, openId) {
        const url = api.user.fetch + 'access_token=' + token + '&next_openid=' + (openId || '');

        return { url }
    }

    // 获取用户的详细信息
    getUserInfo (token, openId, lan = 'zh_CN') {
        const url = api.user.info + 'access_token=' + token + '&openid=' + openId + '&lang=' + lan;

        return { url }
    }

    // 批量获取用户详细信息
    fetchBatchUsers (token, openIdList) {
        const body = {
            user_list: openIdList
        };

        const url = api.user.batch + 'access_token=' + token;

        return { method: 'POST', url, body }
    }

    // 创建菜单和自定义菜单
    createMenu (token, menu, rules) {
        let url = api.menu.create + 'access_token=' + token;

        if (rules) {
            url = api.menu.custom + 'access_token=' + token;
            menu.matchrule = rules
        }

        return { method: 'POST', url, body: menu }
    }

    // 删除菜单
    deleteMenu (token) {
        const url = api.menu.del + 'access_token=' + token;

        return { url }
    }

    // 获取菜单
    fetchMenu (token) {
        const url = api.menu.fetch + 'access_token=' + token;

        return { url }
    }

    // 创建二维码 Ticket
    createQrcode (token, qr) {
        const url = api.qrcode.create + 'access_token=' + token;
        const body = qr;

        return { method: 'POST', url, body }
    }

    // 通过 Ticket 换取二维码
    showQrcode (ticket) {
        const url = api.qrcode.show + 'ticket=' + encodeURI(ticket);

        return url
    }

    // 长链接转短链接
    createShortUrl (token, action = 'long2short', longurl) {
        const url = api.shortUrl.create + 'access_token=' + token;
        const body = {
            action,
            long_url: longurl
        };

        return { method: 'POST', url, body }
    }

    // 语义理解-查询特定的语句进行分析
    semantic (token, semanticData) {
        const url = api.semanticUrl + 'access_token=' + token;
        semanticData.appid = this.appID;

        return { method: 'POST', url, body: semanticData }
    }
};