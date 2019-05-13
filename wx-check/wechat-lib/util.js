const xml2js=require('xml2js');
const template = require('./tpl');

//将原始的xml数据转成js对象
exports.parseXML= xml =>{
    return new Promise((resolve,reject)=>{
        xml2js.parseString(xml,{trim:true},(err,content)=>{
            if(err) reject(err)
            else resolve(content)
        })
    })
};

//将xml数据转化成的js对象，进一步格式化去掉外层的xml标识，里面的属性值由数组转成字符串
const formatMessage= result=>{
    let message={};

    if(typeof message==='object'){
        const keys=Object.keys(result);
        for(let i=0;i<keys.length;i++){
            let  item=result[keys[i]];
            let key=keys[i];

            if(!(item instanceof Array) || item.length===0){
                continue
            }

            if(item.length===1){
                let val=item[0];
                if(typeof val ==='object'){
                    message[key]=formatMessage(val)
                }
                else{
                    message[key]=(val || '').trim()
                }
            }

            if(item.length>1){
                message[key]=[];
                for(let j=0;j<item.length;j++){
                    message[key].push(formatMessage(item[j]))
                }
            }

        }
    }
    return message;
};

//定义微信消息回复的模版类型和回复的对象结构
exports.tpl=(content,message)=>{
    let type='text';
    if(Array.isArray(content)){
        type='news'
    }
    if(!content){
        content='Empty News'
    }

    if(content && content.type){
        type=content.type;
    }

    let info=Object.assign({},{
        content:content,
        msgType:type,
        createTime:new Date().getTime(),
        toUserName:message.FromUserName,
        fromUserName:message.ToUserName
    });

    return template(info);
};


exports.formatMessage=formatMessage;
