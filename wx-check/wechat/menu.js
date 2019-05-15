
module.exports={
    button: [
        {
            name: '一级菜单',
            sub_button: [
                {
                    name: '跳转url',
                    type: 'view',
                    url:'http://www.baidu.com',
                    key: 'view'
                }, {
                    name: '扫码推送',
                    type: 'scancode_push',
                    key: 'scancode_push'
                }, {
                    name: '弹出拍照或者相册',
                    type: 'pic_photo_or_album',
                    key: 'pic_photo_or_album'
                }, {
                    name: '弹出系统拍照',
                    type: 'pic_sysphoto',
                    key: 'pic_sysphoto'
                }, {
                    name: '弹出微信相册',
                    type: 'pic_weixin',
                    key: 'pic_weixin'
                }
            ]
        },
        {
            name: '分类',
            sub_button: [
                {
                    name: '地理位置选择',
                    type: 'location_select',
                    key: 'location_select'
                }
            ]
        },
        {
            name: '其他',
            type: 'click',
            key: 'new_111'
        }
    ]
};