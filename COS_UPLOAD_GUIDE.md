# 腾讯云COS文件上传功能使用指南

## 概述

本项目已集成腾讯云COS（对象存储）文件上传功能，支持客户端直传，提高上传效率和安全性。

## 环境配置

在 `.env` 文件中添加以下配置：

```bash
# 腾讯云配置
TENCENT_SECRET_ID=your-tencent-secret-id
TENCENT_SECRET_KEY=your-tencent-secret-key

# 腾讯云COS配置
COS_BUCKET=your-cos-bucket-name
COS_REGION=ap-guangzhou
COS_CDN_DOMAIN=https://your-cdn-domain.com
COS_ALLOW_PREFIX=tennis-uploads/*
```

## 功能特性

### 1. 临时密钥获取

- 基于用户身份生成临时访问密钥
- 密钥有效期1小时
- 支持文件类型和大小验证

### 2. 文件路径管理

- 按日期和用户ID自动分类存储
- 路径格式：`tennis-uploads/{fileType}/{year}/{month}/{day}/{userId}/`
- 确保用户数据隔离

### 3. 文件类型支持

- **视频文件**：MP4、AVI、MOV、WMV、FLV、WEBM、M4V（最大500MB）
- **图片文件**：JPG、JPEG、PNG、GIF、BMP、WEBP、SVG（最大10MB）
- **文档文件**：PDF、DOC、DOCX、XLS、XLSX、PPT、PPTX、TXT（最大50MB）

### 4. CDN加速

- 支持配置CDN域名
- 自动生成CDN访问URL
- 提高文件访问速度

## API接口

### 1. 获取上传临时密钥

```http
POST /tennis-analysis/upload/token
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "fileType": "video",
  "fileExtension": "mp4",
  "fileSize": 10485760
}
```

### 2. 上传完成回调

```http
POST /tennis-analysis/upload/complete
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "fileKey": "tennis-uploads/video/2024/01/01/user-123/1609459200-uuid.mp4",
  "fileType": "video",
  "originalName": "tennis-video.mp4",
  "fileSize": 10485760
}
```

### 3. 获取上传配置

```http
GET /tennis-analysis/upload/config
Authorization: Bearer {jwt-token}
```

## 客户端集成示例

### 微信小程序

```javascript
// 选择视频文件
wx.chooseVideo({
  sourceType: ["album", "camera"],
  maxDuration: 300, // 5分钟
  success: (res) => {
    uploadVideo(res.tempFilePath);
  },
});

// 上传视频函数
function uploadVideo(filePath) {
  const token = wx.getStorageSync("accessToken");

  // 1. 获取文件信息
  wx.getFileInfo({
    filePath: filePath,
    success: (fileInfo) => {
      // 2. 获取上传临时密钥
      wx.request({
        url: "https://your-domain.com/tennis-analysis/upload/token",
        method: "POST",
        header: { Authorization: `Bearer ${token}` },
        data: {
          fileType: "video",
          fileExtension: "mp4",
          fileSize: fileInfo.size,
        },
        success: (tokenRes) => {
          const uploadData = tokenRes.data;
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.mp4`;
          const fileKey = `${uploadData.prefix}${fileName}`;

          // 3. 直传到COS
          wx.uploadFile({
            url: `https://${uploadData.bucket}.cos.${uploadData.region}.myqcloud.com`,
            filePath: filePath,
            name: "file",
            formData: {
              key: fileKey,
              "x-cos-security-token": uploadData.sessionToken,
            },
            success: (uploadRes) => {
              // 4. 上传完成回调
              wx.request({
                url: "https://your-domain.com/tennis-analysis/upload/complete",
                method: "POST",
                header: { Authorization: `Bearer ${token}` },
                data: {
                  fileKey: fileKey,
                  fileType: "video",
                  originalName: "tennis-video.mp4",
                  fileSize: fileInfo.size,
                },
                success: (completeRes) => {
                  const videoUrl = completeRes.data.fileUrl;
                  console.log("上传成功，文件URL:", videoUrl);
                  // 可以用于视频分析
                  analyzeVideo(videoUrl);
                },
              });
            },
          });
        },
      });
    },
  });
}
```

### Web前端（使用cos-js-sdk-v5）

```javascript
// 安装：npm install cos-js-sdk-v5

import COS from "cos-js-sdk-v5";

async function uploadFile(file) {
  const token = localStorage.getItem("accessToken");

  // 1. 获取临时密钥
  const tokenResponse = await fetch("/tennis-analysis/upload/token", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileType: "video",
      fileExtension: file.name.split(".").pop(),
      fileSize: file.size,
    }),
  });

  const uploadData = await tokenResponse.json();

  // 2. 初始化COS实例
  const cos = new COS({
    SecretId: uploadData.tmpSecretId,
    SecretKey: uploadData.tmpSecretKey,
    SecurityToken: uploadData.sessionToken,
  });

  // 3. 上传文件
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${file.name.split(".").pop()}`;
  const fileKey = `${uploadData.prefix}${fileName}`;

  cos.putObject(
    {
      Bucket: uploadData.bucket,
      Region: uploadData.region,
      Key: fileKey,
      Body: file,
    },
    async (err, data) => {
      if (err) {
        console.error("上传失败:", err);
        return;
      }

      // 4. 上传完成回调
      const completeResponse = await fetch("/tennis-analysis/upload/complete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKey: fileKey,
          fileType: "video",
          originalName: file.name,
          fileSize: file.size,
        }),
      });

      const result = await completeResponse.json();
      console.log("上传成功，文件URL:", result.fileUrl);
    }
  );
}
```

## 安全考虑

1. **权限控制**：临时密钥只能访问用户自己的目录
2. **时效性**：临时密钥1小时后自动失效
3. **文件验证**：服务端验证文件类型和大小
4. **路径隔离**：不同用户的文件存储在不同路径

## 错误处理

常见错误及解决方案：

1. **403 Forbidden**：检查腾讯云密钥配置
2. **文件大小超限**：检查文件大小是否符合限制
3. **不支持的文件类型**：检查文件扩展名是否在支持列表中
4. **临时密钥过期**：重新获取临时密钥

## 性能优化建议

1. **分片上传**：大文件建议使用分片上传
2. **压缩处理**：视频文件可先压缩再上传
3. **CDN配置**：配置CDN域名提高访问速度
4. **缓存策略**：合理设置文件缓存时间

## 监控和日志

系统会记录以下信息：

- 文件上传请求日志
- 临时密钥获取记录
- 上传成功/失败统计
- 文件访问日志

可通过应用日志查看详细信息。
