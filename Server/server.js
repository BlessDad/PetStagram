const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'madbrootpw',
  database: 'pet'
});

// MySQL 연결
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        process.exit(1); // 연결 실패 시 서버 종료
    }
    console.log('Connected to MySQL server');
});

// JSON 파싱을 위한 미들웨어 등록
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일명을 현재 시간으로 설정하여 고유하게 만듦
  }
});

const upload = multer({ storage: storage });

// 정적 파일 제공 (이미지 접근을 위해)
app.use('/uploads', express.static('uploads'));

// 이미지 업로드 엔드포인트 추가
app.post('/api/upload', upload.single('image'), (req, res) => {
  console.log(req.file); // 업로드된 파일 정보 로그 출력
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const imageUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});


// CREATE - 이미지 업로드 포함
app.post('/api/insert', upload.single('image'), async (req, res) => {
  const { title, content } = req.body; // image는 클라이언트에서 전달된 URL
  const imageUrl = req.file ? `http://localhost:${port}/uploads/${req.file.filename}` : req.body.image;

  console.log('Request Body:', req.body); // 요청 본문 출력
  console.log('Uploaded File:', req.file); // 업로드된 파일 정보 출력
  console.log('Image URL:', imageUrl); // 이미지 URL 출력

  if (!title || !content) {
    return res.status(400).json({ error: '제목과 내용을 모두 입력해야 합니다.' });
  }

  // 데이터베이스에 저장할 데이터 출력
  console.log('Data to be inserted:', { title, content, imageUrl });

  const sqlQuery = "INSERT INTO posts (title, content, image) VALUES (?, ?, ?)";

  // 쿼리 실행 직전에 로그 추가
  console.log('Executing query:', sqlQuery, [title, content, imageUrl]);

  connection.query(sqlQuery, [title, content, imageUrl], (err, result) => {
    if (err) {
      console.error('Error inserting post:', err);
      res.status(500).json({ error: '게시물 추가 중 오류가 발생했습니다.' });
    } else {
      res.status(201).json({ message: '게시물이 성공적으로 추가되었습니다.' });
    }
  });
});

// READ 
app.get("/api/getPost", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  const sqlQuery = "SELECT * FROM posts";

  connection.query(sqlQuery, (err, result) => {
    res.send(result);
    console.log(result);
  });
});

// DELETE
app.delete('/api/deletePost/:id', (req, res) => {
  const postId = req.params.id;

  const sqlQuery = 'DELETE FROM posts WHERE id = ?';
  connection.query(sqlQuery, [postId], (err, result) => {
    if (err) {
      console.error('게시물 삭제 중 오류:', err);
      res.status(500).json({ error: '게시물 삭제 중 오류가 발생했습니다.' });
    } else {
      console.log('게시물이 성공적으로 삭제되었습니다.');
      res.status(200).json({ message: '게시물이 성공적으로 삭제되었습니다.' });
    }
  });
});

// UPDATE - 이미지 업로드 포함
app.put("/api/updatePost/:id", upload.single('image'), (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;
  const image = req.file ? `http://localhost:${port}/uploads/${req.file.filename}` : req.body.image;

  if (!title || !content) {
    return res.status(400).json({ error: '제목과 내용을 모두 입력해야 합니다.' });
  }

  const sqlQuery = "UPDATE posts SET title = ?, content = ?, image = ? WHERE id = ?";

  connection.query(sqlQuery, [title, content, image, postId], (err, result) => {
    if (err) {
      console.error('Error updating post:', err);
      res.status(500).json({ error: '게시물 수정 중 오류가 발생했습니다.' });
    } else {
      console.log('게시물이 성공적으로 수정되었습니다.');
      res.status(200).json({ message: '게시물이 성공적으로 수정되었습니다.' });
    }
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});