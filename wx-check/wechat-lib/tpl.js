const ejs=require('ejs');

const tpl=`<xml>
    <ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
    <FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName>
    <CreateTime><%= createTime %></CreateTime>
    <% if (msgType === 'text') { %>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[<%= content %>]]></Content>
    <% } else if (msgType === 'image') { %>
    <MsgType><![CDATA[image]]></MsgType>
      <Image>
        <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
      </Image>
    <% } else if (msgType === 'voice') { %>
    <MsgType><![CDATA[voice]]></MsgType>
      <Voice>
        <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
      </Voice>
      <% } else if (msgType === 'video') { %>
    <MsgType><![CDATA[video]]></MsgType>
      <Video>
        <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
        <Title><![CDATA[<%= content.title %>]]></Title>
        <Description><![CDATA[<%= content.description %>]]></Description>
      </Video>
      <% } else if (msgType === 'video') { %>
    <MsgType><![CDATA[music]]></MsgType>
      <Music>
        <Title><![CDATA[<%= content.title %>]]></Title>
        <Description><![CDATA[<%= content.description %>]]></Description>
        <MusicUrl><![CDATA[<%= content.musicURL %>]]></MusicUrl>
        <HQMusicUrl><![CDATA[<%= content.hqMusicUrl %>]]></HQMusicUrl>
        <ThumbMediaId><![CDATA[<%= content.thumbMediaId %>]]></ThumbMediaId>
      </Music>
      <% } %>
</xml>`

const compiled = ejs.compile(tpl);

module.exports = compiled