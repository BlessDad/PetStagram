

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());
// MySQL 연결 설정
const connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '12tkfguswns',
  database: 'csemall'
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


// READ 
app.get("/api/getPost", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    
    const sqlQuery = "SELECT * FROM posts";

    connection.query(sqlQuery, (err, result) => {
        res.send(result);
        console.log(result)
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

// CREATE

app.post("/api/insert", (req, res) => {
    const { title, content } = req.body;
  
    if (!title || !content) {
      return res.status(400).json({ error: '제목과 내용을 모두 입력해야 합니다.' });
    }
  
    const sqlQuery = "INSERT INTO posts (title, content) VALUES (?, ?)";
  
    connection.query(sqlQuery, [title, content], (err, result) => {
      if (err) {
        console.error('Error inserting post:', err);
        res.status(500).json({ error: '게시물 추가 중 오류가 발생했습니다.' });
      } else {
        res.status(201).json({ message: '게시물이 성공적으로 추가되었습니다.' });
      }
    });
  });

  // UPDATE

  app.put("/api/updatePost/:id", (req, res) => {
    const postId = req.params.id;
    const {title, content} = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: '제목과 내용을 모두 입력해야 합니다.' });
    }

    const sqlQuery = "UPDATE posts SET title = ?, content = ? WHERE id = ?";
  
    connection.query(sqlQuery, [title, content, postId], (err, result) => {
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