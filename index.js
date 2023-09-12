let express = require('express')
const ejs = require('ejs')
var bodyParser = require('body-parser')
let app = express()
let port = 3000

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

//라우팅
app.get('/',(req,res) => {
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

      res.send(result) 
    } 
  })
})

app.listen(port, () => {
  console.log('HTML 서버 시작됨:' + port)
})