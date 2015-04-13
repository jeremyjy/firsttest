// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var avosExpressCookieSession = require('avos-express-cookie-session');
var Post = require('cloud/mPost.js')
var Comments = require('cloud/mComment.js')


// App 全局配置
app.set('views', 'cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

// 启用 cookieParser
app.use(express.cookieParser('Your Cookie Secure'));
// 使用 avos-express-cookie-session 记录登录信息到 cookie
app.use(avosExpressCookieSession({cookie: {maxAge: 3600000}, fetchUser: true}));
// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/', function (req, res) {

    if (req.AV.user) {

        res.render('index', {msg: null, username: req.AV.user.attributes.username})
    }
    else
        res.render('index', {msg: null, username: null});
})




//app.get('/register',function(req,res){
//    res.render('register')
//})
app.post('/register', function (req, res) {
    if (req.body.password != req.body.password_confirm) {
        res.render('error', {title: 'password not the same!'})
    }
    else {
        var user = new AV.User();
        user.set('username', req.body.username)
        user.set('password', req.body.password)
        user.set('email', req.body.email)
        user.signUp(null, {
            success: function (user) {
                console.log('register success!')
                res.render('index', {msgType: 'alert-success', msg: 'register succeed!', username: null})
            },
            error: function (user, err) {
                console.log('register error!')
                res.render('index', {msgType: 'alert-danger', msg: 'register error!', username: null})
            }
        })

    }
})
//app.get('/login', function (req,res) {
//    res.render('login')
//})
app.post('/login', function (req, res) {

    AV.User.logIn(req.body.username, req.body.password, {

        success: function (user) {

            console.log('login success!')
            res.render('index', {msgType: 'alert-info', msg: 'login success!', username: (req.body.username)})
        },
        error: function (user, error) {
            console.log('login error!')
            res.render('index', {msgType: 'alert-danger', msg: 'login error!', username: null})
        }
    })

    // res.redirect('/updatePassword')
})


//app.get('/updatePassword', function (req, res) {
//    console.log(req.AV.user)
//    res.render('updatePassword')
//})
app.post('/updatePassword', function (req, res) {
    if (req.body.password != req.body.password_confirm) {
        res.render('error', {title: 'password not the same!'})
    }
    else {
        var user = req.AV.user
        user.updatePassword(req.body.oldPassword, req.body.password, {
            success: function (user) {
                res.render('index', {
                    msgType: 'alert-info',
                    msg: 'update password success!',
                    username: (req.AV.user.attributes.username )
                })
            },
            error: function (user, err) {
                res.render('index', {msgType: 'alert-danger', msg: 'update password error!'})
            }
        })
    }
})
app.get('/logout', function (req, res) {
    //avosExpressCookieSession将自动清除登录cookie信息
    AV.User.logOut();
    res.render('index', {msg: null, username: null});
});
app.get('/writePost', function (req, res) {
    if(!req.AV.user)
        res.render('index', {msgType: 'alert-warning', msg: 'please login first!', username: null})
    res.render('writePost', {username: req.AV.user.attributes.username})
    console.log(req.AV.user)
})
app.post('/writePost', function (req, res) {
    var Post = AV.Object.extend('Post')
    var post = new Post()
    post.set('title', req.body.title)
    post.set('tag1', req.body.tag1)
    post.set('body', req.body.body)
    console.log("xxxx", req.AV.user)
    post.set('author', req.AV.user.attributes.username)
    post.set('user', req.AV.user)
    post.set('visitable', req.body.visitable)
    post.save(null, {
        success: function (post) {
            console.log('post success!')
            res.send('msg', {msgType: 'alert-info', msg: 'post success!'})
        },
        error: function (post, err) {
            res.send('msg', {msgType: 'alert-danger', msg: 'post success!'})
        }
    })

})
app.get('/user/:name', function (req, res) {
    if(req.params.name=='null')
        res.render('index', {msgType: 'alert-warning', msg: 'please login first!', username: null})
    Post.findByAuthor(req.params.name).then(function (posts) {
        Comments.findByPost(posts[0]).then(function (comments) {
            console.log(comments)
            res.render('user', {posts: posts, postSelected: posts[0], username: req.params.name, comments: comments})
        })
    })
})
app.get('/userHome', function (req, res) {
    Post.findByUser(req.AV.user).then(function (posts) {
        res.render('userHome', {posts: posts})
    })
})
//app.get('/user/:name/:postId', function (req, res) {
//    Post.findById(req.params.postId).then(function (post) {
//        Comments.findByPost(post).then(function (comments) {
//            //console.log(comments[0].attributes.user.attributes)
//            res.send({ comments: comments})
//        })
//
//    })
//})
app.post('/user/:name/:postId', function (req, res) {
    var Comment = AV.Object.extend('Comment')
    var comment = new Comment()
    comment.set('text', req.body.text)
    comment.set('user', req.AV.user)
    comment.set('author', req.AV.user.attributes.username)
    console.log('user:' + req.AV.user)
    Post.findById(req.params.postId).then(function (post) {
        //console.log('post:' + post)
        comment.set('post', post)
        comment.set('postName', post.title)

        comment.save({
            success: function (commnet) {
                console.log('comment succeed!')
                Comments.findByPost(post).then(function (comments) {
                    console.log(comments)
                    res.send('msg', {comments: comments})
                })
            },
            error: function (comment, err) {
                res.send(err)
            }
        })
    })

})
app.get('/userHome/:postId', function (req, res) {
    Post.findById(req.params.postId).then(function (post) {
        res.render('post', {post: post})
        console.log(post)
    })
})
app.post('/findPost', function (req, res) {
    Post.findById(req.body.postId).then(function (post) {
        Comments.findByPost(post).then(function (comments) {
            console.log('finding post')
            console.log(comments)
            res.send('msg', {post: post, comments: comments})
            //console.log(post)
        })
    })
})
app.post('/findNewest', function (req, res) {
    Post.findNewest(10).then(function (posts) {
            res.send('msg', {posts: posts})
            //console.log(post)
    })
})
app.post('/findNewest2', function (req, res) {
    Post.findNewest(10).then(function (posts) {
        res.send('msg2', {posts: posts})
        //console.log(post)
    })
})
app.post('/findNewest3', function (req, res) {
    Post.findNewest(10).then(function (posts) {
        res.send('msg3', {posts: posts})
        //console.log(post)
    })
})
app.post('/likes', function (req, res) {
    console.log('like back')
    var user = req.AV.user
    var relation = user.relation('likes')
    Post.findById(req.body.postId).then(function (post) {
        console.log(req.body.postId)
        relation.add(post)
        user.save()
        // console.log(post)
        res.send({msg: 'done'})
    })
})

app.listen();