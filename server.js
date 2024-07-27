const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

// Middleware 설정
app.use(express.static(path.join(__dirname, 'blog/build')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cors());

// View 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB 연결
const url = 'your-mongodb-connection-string';
let db;
new MongoClient(url).connect().then((client) => {
  console.log('DB 연결 성공');
  db = client.db('gdsctodo');
  app.listen(8080, () => {
    console.log('서버가 http://localhost:8080 에서 실행 중');
  });
}).catch((err) => {
  console.log('DB 연결 에러:', err);
});

// 기본 라우트
app.get('/', (req, res) => {
  res.send('환영합니다');
});

// 특정 날짜의 todo 가져오기
app.get('/detail/:date', async (req, res) => {
  try {
    let result = await db.collection('post').findOne({ date: req.params.date });
    res.json(result);
  } catch (e) {
    console.log(e);
    res.status(404).send('잘못된 URL');
  }
});

// 새로운 todo 생성
app.post('/newpost', async (req, res) => {
  try {
    if (!req.body.todo || !req.body.date) {
      res.status(400).send('내용을 입력해주세요');
    } else {
      await db.collection("post").insertOne({ date: req.body.date, todo: req.body.todo });
      res.status(200).send('저장 완료');
    }
  } catch (e) {
    console.log(e);
    res.status(500).send('서버 에러');
  }
});

// 기타 라우트 설정
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '/react-project/build/index.html'));
});
