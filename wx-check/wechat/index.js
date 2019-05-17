const config=require('./../config/config');
const Wechat=require('../wechat-lib/index');

const mongoose=require('mongoose');
const Token=mongoose.model('Token');
const Ticket = mongoose.model('Ticket');

const wechatCfg = {
    wechat: {
        appID: config.wechat.appID,
        appSecret: config.wechat.appSecret,
        token: config.wechat.token,
        getAccessToken:async ()=>{
            const res=await Token.getAccessToken();
            return res;
        },
        saveAccessToken:async (data)=>{
            const res=await Token.saveAccessToken(data);
            console.log("保存token的返回值saveAccessToken");
            console.log(res);
            return res;
        },
        getTicket: async () => {
            const res = await Ticket.getTicket();

            return res
        },
        saveTicket: async (data) => {
            const res = await Ticket.saveTicket(data);

            return res
        }
    }
};

/*(async()=>{
    const client=new Wechat(wechatCfg.wechat);
})();*/

exports.test=async()=>{
    const client=new Wechat(wechatCfg.wechat);
    const data=await client.fetchAccessToken();
    console.log("test中获取的token数据");
    console.log(data);
    var ticketData=await client.fetchTicket(data.access_token);
    var ticket=ticketData.ticket;
    console.log('test中获取的ticket数据');
    console.log(ticket);

};
exports.getWechat = () => new Wechat(wechatCfg.wechat);



