let express = require('express')
const ejs = require('ejs')

let app = express()
let port = 3000
var bodyParser = require('body-parser')
var session= require('express-session')

require('dotenv').config()

const mysql = require('mysql2')
// Create the connection to the database
const connection = mysql.createConnection(process.env.DATABASE_URL)
console.log("Connect database!")
connection.query("SET time_zone='Asia/Seoul'")
app.set('view engine','ejs')
app.set('views','./views')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname+"/public")) 

app.use(session({
  secret: 'junyoung',
  cookie: { maxAge: 60000 },
  resave:true,
  saveUninitialized:true
}))

app.use((req, res, next)=>{

  res.locals.user_id =""
  res.locals.name =""
  if(req.session.member){
    res.locals.user_id = req.session.member.user_id
    res.locals.name = req.session.member.name
  }
  next()
})

//라우팅
app.get('/',(req,res) => {

  console.log(req.session.member);

  res.render('index') // ./views/index.ejs
})

app.get('/profile', (req,res) => {
  res.render('profile')
})

app.get('/map', (req,res) => {
  res.render('map')
})

app.get('/contact', (req,res) => {
  res.render('contact')
})

app.post('/contactProc', (req,res) => {
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  const memo = req.body.memo;

  var sql = `insert into contact(name,phone,email,memo,regdate)
  values(?,?,?,?,now() )`

  var values = [name,phone,email,memo] 

  connection.query(sql, values, function (err, result){
    if(err) throw err; 
    console.log('자료 1개를 삽입하였습니다.');
    res.send("<script> alert('문의사항이 등록되었습니다.'); location.href='/';</script>"); 
  })
})

app.get('/contactDelete', (req,res) => {
  var idx = req.query.idx
  var sql = `delete from contact where idx='${idx}' `
  connection.query(sql, function (err, result){
    if(err) throw err; 

    res.send("<script> alert('삭제되었습니다.'); location.href='/contactList';</script>"); 
  })
})


app.get('/contactList', (req,res) => {

  var sql = `select * from contact order by idx desc `
   connection.query(sql, function (err, results, fields){
      if(err) throw err;
      res.render('contactList',{lists:results})
   })
})

app.get('/login', (req,res) => {
  res.render('login')
})

app.get('/logout', (req,res) => {
  req.session.member = null;
  res.send("<script> alert('로그아웃되었습니다.'); location.href='/';</script>"); 
})

app.get('/signup', (req,res) => {
  res.render('signup')
})
app.post('/signupProc', (req,res) => {
  const user_id = req.body.user_id;
  const pw = req.body.pw;
  const name = req.body.name;

  //중복 아이디 확인
  connection.query('SELECT * FROM member WHERE user_id = ?', [user_id], (err, results) => {
    if (err) throw err;

    if(results.length > 0){
      //아이디가 있다면
      res.send("<script> alert('이미 사용중인 아이디입니다.'); location.href='/signup';</script>");
    }
  // 데이터베이스에 회원 정보를 삽입하는 SQL 쿼리
    else{
      const sql = `INSERT INTO member (user_id, pw, name) VALUES (?, ?, ?)`;
      const values = [user_id, pw, name];

      connection.query(sql, values, (err, result) => {
          if (err) {
              // 회원가입 실패 시 오류 처리
              console.log(result)
              res.send("<script> alert('회원가입에 실패하였습니다. 다시 시도해주세요.'); location.href='/signup';</script>");
          } else {
              // 회원가입 성공 시 로그인 페이지로 리디렉션
              res.send("<script> alert('회원가입이 완료되었습니다. 로그인해주세요.'); location.href='/login';</script>");
          }
          
      })
    }
  })
})
app.post('/loginProc', (req,res) => {
  const user_id = req.body.user_id;
  const pw = req.body.pw;

  var sql = `select * from member where user_id=? and pw=? `

  var values = [user_id,pw] 

  connection.query(sql, values, function (err, result){
    if(err) throw err; 

    if(result.length == 0){
      
      res.send("<script> alert('존재하지않는 아이디입니다..'); location.href='/login';</script>"); 
    }else{
      console.log(result[0])
      req.session.member = result[0]
      res.send("<script> alert('로그인 되었습니다.'); location.href='/';</script>"); 
    } 
  })
})

app.listen(port, () => {
  console.log('HTML 서버 시작됨:' + port)
})
