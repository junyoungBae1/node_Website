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
  values('${name}','${phone}','${email}','${memo}',now() )`
  var a = `안녕하세요 ${name},${phone}`
  connection.query(sql, function (err, result){
    if(err) throw err; 
    console.log('자료 1개를 삽입하였습니다.');
    res.send("<script> alert('문의사항이 등록되었습니다.'); location.href='/';</script>"); 
  })
  res.send(a);
})


app.listen(port, () => {
  console.log('HTML 서버 시작됨:' + port)
})