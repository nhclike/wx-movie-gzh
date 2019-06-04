
const Wechat = require('../app/controllers/wechat');
const User = require('../app/controllers/user');
const Index = require('../app/controllers/index');
const Category = require('../app/controllers/category');

module.exports= router =>{
    router.get('/', Index.homePage);

    router.get('/sdk', Wechat.sdk);

    // 进入微信消息中间件
    router.get('/wx-hear', Wechat.hear);
    router.post('/wx-hear', Wechat.hear);

    // 跳到授权中间服务页面
    router.get('/wx-oauth', Wechat.oauth);
    // 通过 code 获取用户信息
    router.get('/userinfo', Wechat.userinfo)

    // 用户的注册登录路由
    router.get('/user/signup', User.showSignup);
    router.get('/user/signin', User.showSignin);
    router.post('/user/signup', User.signup);
    router.post('/user/signin', User.signin);
    router.get('/logout', User.logout);

    // 后台的用户列表页面
    router.get('/admin/user/list', User.signinRequired, User.adminRequired, User.list);
    //删除用户
    router.delete('/admin/user', User.signinRequired, User.adminRequired, User.del);


    // 后台的分类管理页面
    //显示后台分类录入页面
    router.get('/admin/category', User.signinRequired, User.adminRequired, Category.show);
    //后台分类录入表单提交地址
    router.post('/admin/category', User.signinRequired, User.adminRequired, Category.new);
    //获取分类列表
    router.get('/admin/category/list', User.signinRequired, User.adminRequired, Category.list);
    //更新分类
    router.get('/admin/category/update/:_id', User.signinRequired, User.adminRequired, Category.show);
    //删除分类
    router.delete('/admin/category', User.signinRequired, User.adminRequired, Category.del)

};