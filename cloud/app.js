// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var avosExpressCookieSession = require('avos-express-cookie-session');
var Post = require('cloud/mPost.js')

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件
// 启用 cookieParser
app.use(express.cookieParser('Your Cookie Secure'));
// 使用 avos-express-cookie-session 记录登录信息到 cookie
app.use(avosExpressCookieSession({ cookie: { maxAge: 3600000 }, fetchUser: true}));
// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
    res.render('hello', { message: 'Congrats, you just set up your app!' });
});
app.get('/register',function(req,res){
    res.render('register')
})
app.post('/register', function (req,res) {
    if(req.body.password!=req.body.password_confirm){
        res.render('error',{title:'password not the same!'})
    }
    else{ var user=new AV.User();
        user.set('username',req.body.username)
        user.set('password',req.body.password)
        user.set('email',req.body.email)
        user.signUp(null,{
            success:function(user){
                console.log('register success!')
            },
            error:function(user,err){
                console.log(err)
            }})
        res.redirect('/')}
})
app.get('/login', function (req,res) {
    res.render('login')
})
app.post('/login', function (req,res) {
    AV.User.logIn(req.body.username,req.body.password,{
        success: function (user) {

            console.log('login success!')
        },
        error:function(user,error){
            console.log('login error!')
        }
    })

    res.redirect('/updatePassword')
})


app.get('/updatePassword', function (req,res) {
    console.log(req.AV.user)
    res.render('updatePassword')
})
app.post('/updatePassword', function (req,res) {
    if(req.body.password!=req.body.password_confirm){
        res.render('error',{title:'password not the same!'})
    }
    else{
        var user=req.AV.user
        user.updatePassword(req.body.oldPassword,req.body.password,{
            success: function (user) {
                res.reder('success',{title:"update password success!"})
                res.redirect('/')
            },
            error: function (user,err) {
                console.log(err)
            }
        })
    }
})
app.get('/logout', function(req, res) {
    //avosExpressCookieSession将自动清除登录cookie信息
    AV.User.logOut();
    res.redirect('/profile');
});
app.get('/writePost',function(req,res){
    res.render('writePost')
    console.log(req.AV.user)
})
app.post('/writePost',function(req,res){
    var Post = AV.Object.extend('Post')
    var post = new Post()
    post.set('title',req.body.title)
    post.set('tag1',req.body.tag1)
    post.set('tag2',req.body.tag2)
    post.set('tag3',req.body.tag3)
    post.set('body',req.body.body)
    post.set('author',req.AV.user.username)
    post.set('user',req.AV.user)
    post.set('visitable',req.body.visitable)
    post.save(null,{
        success:function(post){
            console.log('post success!')
            res.redirect('/writePost')
        },
        error:function(post,err){
            console.log(err)
            return
        }
    })
})
app.get('/user/:name',function(req,res){
    Post.findByAuthor(req.params.name).then(function(posts){
        console.log(posts)
        res.render('user',{posts:posts})
    })
})

app.listen();