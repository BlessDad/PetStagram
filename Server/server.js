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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 이미지 업로드 엔드포인트 추가
app.post('/api/upload', upload.single('image'), (req, res) => {
  console.log(req.file); // 업로드된 파일 정보 로그 출력
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const imageUrl = `http://192.168.35.233:${port}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// CREATE - 이미지 업로드 포함
app.post('/api/insert', async (req, res) => {
  const { title, content, imageUrl } = req.body;

  console.log('Request Body:', req.body); // 요청 본문 출력

  if (!title || !content) {
    return res.status(400).json({ error: '제목과 내용을 모두 입력해야 합니다.' });
  }

  // 데이터베이스에 저장할 데이터 출력
  console.log('Data to be inserted:', { title, content, imageUrl });

  const sqlQuery = "INSERT INTO posts (title, content, image_url) VALUES (?, ?, ?)";

  // 쿼리 실행 직전에 로그 추가
  console.log('Executing query:', sqlQuery, [title, content, imageUrl]);

  connection.query(sqlQuery, [title, content, imageUrl], (err, result) => {
    if (err) {
      console.error('Error inserting post:', err);
      res.status(500).json({ error: '게시물 추가 중 오류가 발생했습니다.' });
    } else {
      console.log('Insert result:', result); // 추가된 결과 로그 출력
      res.status(201).json({ message: '게시물이 성공적으로 추가되었습니다.', postId: result.insertId });
    }
  });
});

// READ 
app.get("/api/getPost", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  const sqlQuery = "SELECT * FROM posts";
  connection.query(sqlQuery, (err, result) => {
    if (err) {
      console.error('Error fetching posts:', err);
      res.status(500).json({ error: '게시물 불러오기 중 오류가 발생했습니다.' });
    } else {
      res.json(result);
    }
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

// UPDATE - 이미지 업로드 포함 수정
app.put("/api/updatePost/:id", upload.single('image'), (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;
  const imageUrl = req.file ? `http://192.168.35.233:${port}/uploads/${req.file.filename}` : req.body.imageUrl;

  if (!title || !content) {
    return res.status(400).json({ error: '제목과 내용을 모두 입력해야 합니다.' });
  }

  const sqlQuery = "UPDATE posts SET title = ?, content = ?, image_url = ? WHERE id = ?";

  connection.query(sqlQuery, [title, content, imageUrl, postId], (err, result) => {
    if (err) {
      console.error('Error updating post:', err);
      res.status(500).json({ error: '게시물 수정 중 오류가 발생했습니다.' });
    } else {
      console.log('게시물이 성공적으로 수정되었습니다.');
      res.status(200).json({ message: '게시물이 성공적으로 수정되었습니다.' });
    }
  });
});

// CREATE - 댓글 추가
app.post("/api/addComment", (req, res) => {
  const { postId, comment } = req.body;

  if (!comment) {
    return res.status(400).json({ error: '댓글을 입력해야 합니다.' });
  }

  const sqlQuery = "INSERT INTO comments (post_id, comment) VALUES (?, ?)";

  connection.query(sqlQuery, [postId, comment], (err, result) => {
    if (err) {
      console.error('Error inserting comment:', err);
      res.status(500).json({ error: '댓글 추가 중 오류가 발생했습니다.' });
    } else {
      console.log('댓글이 성공적으로 추가되었습니다.');
      res.status(200).json({ message: '댓글이 성공적으로 추가되었습니다.' });
    }
  });
});

// READ - 특정 게시물의 댓글 가져오기
app.get("/api/getComments/:postId", (req, res) => {
  const postId = req.params.postId;

  const sqlQuery = "SELECT * FROM comments WHERE post_id = ?";

  connection.query(sqlQuery, [postId], (err, result) => {
    if (err) {
      console.error('Error fetching comments:', err);
      res.status(500).json({ error: '댓글 불러오기 중 오류가 발생했습니다.' });
    } else {
      res.json(result);
    }
  });
})

// DELETE - 댓글 삭제
app.delete('/api/deleteComment/:id', (req, res) => {
  const commentId = req.params.id;

  const sqlQuery = 'DELETE FROM comments WHERE id = ?';
  connection.query(sqlQuery, [commentId], (err, result) => {
    if (err) {
      console.error('댓글 삭제 중 오류:', err);
      res.status(500).json({ error: '댓글 삭제 중 오류가 발생했습니다.' });
    } else {
      console.log('댓글이 성공적으로 삭제되었습니다.');
      res.status(200).json({ message: '댓글이 성공적으로 삭제되었습니다.' });
    }
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})