const mongoose = require('mongoose');
const User = mongoose.model('User');
const md5=require('md5-node');

// 1. 实现一个注册页面的控制   showSignup
exports.showSignup = async (ctx, next) => {
    await ctx.render('pages/signup', {
        title: '注册页面'
    })
};

// 2. 增加一个的登录页面的控制 showSignin
exports.showSignin = async (ctx, next) => {
    await ctx.render('pages/signin', {
        title: '登录页面'
    })
};

// 3. 用户数据的持久化 signup
exports.signup = async (ctx, next) => {
    console.log("用户注册");
    const {
        email,
        password,
        nickname
    } = ctx.request.body.user;

    console.log(email,password,nickname);

    let user = await User.findOne({ email });

    console.log("user in db");
    console.log(user);

    //注册的用户已经有记录直接重定向到登录页面
    if (user) return ctx.redirect('/user/signin');

    user = new User({
        email,
        nickname,
        password
    });

    ctx.session.user = {
        _id: user._id,
        role: user.role,
        nickname: user.nickname
    };
    console.log("new user");
    console.log(user);

    user = await user.save();
    console.log(user);
    ctx.redirect('/')
};

// 4. 增加一个登录的校验/判断 signin

exports.signin = async (ctx, next) => {

    console.log("用户登录");

    const { email, password } = ctx.request.body.user;
    //通过邮箱查找用户
    const user = await User.findOne({ email });

    //用户不存在重定向到注册页面
    if (!user) return ctx.redirect('/user/signup');

    const isMatch = await user.comparePassword(md5(password), user.password);
    console.log(isMatch+"isMatch");

    //登录验证成功重定向到主页面
    if (isMatch) {
        ctx.session.user = {
            _id: user._id,
            role: user.role,
            nickname: user.nickname
        };

        ctx.redirect('/')
    } else {
        //否则留在登录页面
        ctx.redirect('/user/signin')
    }
};

//登出session置空，重定义到主页面
exports.logout = async (ctx, next) => {
    ctx.session.user = {};

    ctx.redirect('/')
};
// 5. 增加路由规则
// 6. 增加两个 Pug 页面，注册和登录
// 7. koa-bodyparser

// 用户列表页面
exports.list = async (ctx, next) => {
    const users = await User.find({}).sort('meta.updatedAt');

    await ctx.render('pages/userlist', {
        title: '用户列表页面',
        users
    })
};

// 需要登录的路由中间件校验
exports.signinRequired = async (ctx, next) => {
    const user = ctx.session.user;

    if (!user || !user._id) {
        return ctx.redirect('/user/signin')
    }

    await next()
};

// 需要管理员身份的路由中间件校验
exports.adminRequired = async (ctx, next) => {
    const user = ctx.session.user;

    if (user.role !== 'admin') {
        return ctx.redirect('/user/signin')
    }

    await next()
};

exports.del = async (ctx, next) => {
    const id = ctx.query.id;

    try {
        await User.remove({ _id: id });
        ctx.body = { success: true }
    } catch (err) {
        ctx.body = { success: false }
    }
};
