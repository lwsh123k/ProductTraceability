const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
var cors = express('cors')

const app = express();
app.use(cors);
app.use(express.static('public'));

// 配置文件上传中间件
const upload = multer({
  dest: path.join(__dirname,'upload'), // 指定上传文件保存的目
});

// 处理上传文件和哈希值的请求
app.post('/upload', upload.single('image'), (req, res) => {
  const file = req.file;
  // const hash = req.body.hash;
  const batchNumber = req.body.batchNumber;
  console.log(batchNumber + '.png 上传成功');
  // 将文件移动到指定目录
  const destPath = `public/images/${batchNumber}${path.extname(file.originalname)}`;
  fs.renameSync(file.path, destPath);

  // 返回上传成功的信息
  res.status(200).json({ message: 'File uploaded successfully'});
});

// 处理获取图片和哈希值的请求
app.get('/image', (req, res) => {
  const imageDir = 'public/images/';
  const imageFiles = fs.readdirSync(imageDir);
  const imageUrl = `/${imageDir}${imageFiles[0]}`;
  const hash = imageFiles[0].slice(0, -path.extname(imageFiles[0]).length);

  // 返回图片和哈希值的信息
  res.status(200).json({ imageUrl: imageUrl, hashHex: hash });
});

// 启动服务器
app.listen(3000, () => {
  console.log('服务器已在3000端口启动');
});
