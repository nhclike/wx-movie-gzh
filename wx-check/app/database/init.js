const mongoose=require('mongoose');
const { resolve } = require('path');
const glob = require('glob');

mongoose.Promise = global.Promise;

//数据模型导入
exports.initSchemas = () => {
    glob.sync(resolve(__dirname, './schema', '**/*.js')).forEach(require)
};

exports.connect=(db)=>{
    //最大连接次数
    let maxConnectTimes = 0;

    return new Promise((resolve) =>{
        if (process.env.NODE_ENV !== 'production') {
            mongoose.set('debug', true)
        }
        mongoose.connect(db);
        mongoose.connection.on('disconnect', () => {
            maxConnectTimes++;

            if (maxConnectTimes < 5) {
                mongoose.connect(db)
            } else {
                throw new Error('数据库挂了吧少年')
            }
        });
        mongoose.connection.on('error',err=>{
            console.log(err)
        });
        mongoose.connection.on('open',()=>{
           resolve();
           console.log("mongodb connected 本地数据库连接成功")
        })
    } )
}