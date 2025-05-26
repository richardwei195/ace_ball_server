# 网球视频分析模块

## 功能描述

该模块提供网球视频分析功能，使用通义千问大模型对网球视频进行分析，并根据NTRP（National Tennis Rating Program）标准对球员技术水平进行评分。

## 环境配置

在使用前，请确保在 `.env` 文件中配置以下环境变量：

```bash
# 通义千问API配置
DASHSCOPE_API_KEY=sk-your-dashscope-api-key-here

# 微信小程序配置
WECHAT_APPID=your-wechat-appid
WECHAT_APP_SECRET=your-wechat-app-secret

# 腾讯云配置
TENCENT_SECRET_ID=your-tencent-secret-id
TENCENT_SECRET_KEY=your-tencent-secret-key

# 腾讯云COS配置
COS_BUCKET=your-cos-bucket-name
COS_REGION=ap-guangzhou
COS_CDN_DOMAIN=https://your-cdn-domain.com
COS_ALLOW_PREFIX=tennis-uploads/*

# JWT配置
JWT_SECRET=your-jwt-secret-key
```

## API接口

### 微信小程序授权接口

#### POST /tennis-analysis/auth/login

微信小程序登录接口。

**请求参数：**

```json
{
  "code": "081Kq4Ga1rXXXX",
  "nickName": "网球爱好者",
  "avatarUrl": "https://wx.qlogo.cn/mmopen/xxx"
}
```

**响应格式：**

```json
{
  "openid": "oGZUI0egBJY1zhBYw2KhdUfwVJJE",
  "unionid": "o6_bmjrPTlm6_2sgVt7hMZOPfL2M",
  "sessionKey": "tiihtNczf5v6AKRyjwEUhQ==",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "nickName": "网球爱好者",
  "avatarUrl": "https://wx.qlogo.cn/mmopen/xxx"
}
```

#### POST /tennis-analysis/auth/user-info

获取用户详细信息（解密微信用户数据）。

**请求参数：**

```json
{
  "encryptedData": "CiyLU1Aw2KjvrjMdj8YKliAjtP4gsMZM...",
  "iv": "r7BXXsRzlf6H2bnfTuDxwg==",
  "code": "081Kq4Ga1rXXXX"
}
```

#### GET /tennis-analysis/auth/profile

获取当前用户信息（需要JWT认证）。

**请求头：**

```
Authorization: Bearer your-jwt-token
```

#### POST /tennis-analysis/auth/refresh-token

刷新访问令牌。

**请求参数：**

```json
{
  "token": "old-jwt-token"
}
```

### 网球视频分析接口

#### POST /tennis-analysis/analyze-video

分析网球视频并返回NTRP评分结果。

**请求参数：**

```json
{
  "videoUrl": "https://example.com/tennis-video.mp4"
}
```

**响应格式：**

```json
{
  "overallRating": 4.0,
  "serve": {
    "score": 4.5,
    "reason": "发球动作基本正确，但力量控制需要改进"
  },
  "forehand": {
    "score": 4.2,
    "reason": "正手击球稳定性较好，但缺乏变化"
  },
  "backhand": {
    "score": 3.8,
    "reason": "反手击球技术有待提高，建议加强练习"
  },
  "movement": {
    "score": 4.0,
    "reason": "移动步伐基本合理，但反应速度可以更快"
  },
  "netPlay": {
    "score": 3.5,
    "reason": "网前技术需要加强，截击动作不够熟练"
  },
  "improvements": [
    "加强发球力量训练",
    "改善反手击球稳定性",
    "提高移动速度",
    "练习网前截击技术"
  ]
}
```

### 文件上传接口

#### POST /tennis-analysis/upload/token

获取腾讯云COS上传临时密钥，用于客户端直传文件。

**请求参数：**

```json
{
  "fileType": "video",
  "fileExtension": "mp4",
  "fileSize": 10485760
}
```

**响应格式：**

```json
{
  "tmpSecretId": "AKIDxxxxxxxx",
  "tmpSecretKey": "xxxxxxxx",
  "sessionToken": "xxxxxxxx",
  "startTime": 1609459200,
  "expiredTime": 1609462800,
  "bucket": "tennis-videos-1234567890",
  "region": "ap-guangzhou",
  "prefix": "tennis-uploads/video/2024/01/01/user-123/",
  "cdnDomain": "https://cdn.example.com"
}
```

#### POST /tennis-analysis/upload/complete

文件上传完成后的回调接口，获取文件访问URL。

**请求参数：**

```json
{
  "fileKey": "tennis-uploads/video/2024/01/01/user-123/1609459200-uuid.mp4",
  "fileType": "video",
  "originalName": "tennis-video.mp4",
  "fileSize": 10485760
}
```

**响应格式：**

```json
{
  "fileUrl": "https://cdn.example.com/tennis-uploads/video/2024/01/01/user-123/1609459200-uuid.mp4",
  "fileKey": "tennis-uploads/video/2024/01/01/user-123/1609459200-uuid.mp4",
  "fileType": "video",
  "uploadTime": "2024-01-01T00:00:00.000Z"
}
```

#### GET /tennis-analysis/upload/config

获取文件上传配置信息，包括支持的文件类型和大小限制。

**响应格式：**

```json
{
  "supportedTypes": {
    "video": ["mp4", "avi", "mov", "wmv", "flv", "webm", "m4v"],
    "image": ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"],
    "document": ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"]
  },
  "sizeLimits": {
    "video": 524288000,
    "image": 10485760,
    "document": 52428800
  }
}
```

### 评分记录管理接口

#### GET /tennis-analysis/scores

获取用户评分记录列表（支持分页和过滤）。

**查询参数：**

- `page`: 页码（默认1）
- `limit`: 每页数量（默认10）
- `minRating`: 最小评分
- `maxRating`: 最大评分
- `startDate`: 开始日期
- `endDate`: 结束日期

#### GET /tennis-analysis/scores/:id

获取指定ID的评分记录详情。

#### GET /tennis-analysis/scores/stats/summary

获取用户评分统计信息。

#### DELETE /tennis-analysis/scores/:id

删除指定ID的评分记录。

## 评分标准

- **1.0-1.5**: 初学者水平
- **2.0-2.5**: 初级水平
- **3.0-3.5**: 中级水平
- **4.0-4.5**: 中高级水平
- **5.0-5.5**: 高级水平
- **6.0-6.5**: 专业水平
- **7.0**: 世界级水平

## 使用示例

### 微信小程序端使用

```javascript
// 1. 微信小程序登录
wx.login({
  success: (res) => {
    if (res.code) {
      // 发送登录请求
      wx.request({
        url: "https://your-domain.com/tennis-analysis/auth/login",
        method: "POST",
        data: {
          code: res.code,
          nickName: "网球爱好者",
          avatarUrl: "https://wx.qlogo.cn/mmopen/xxx",
        },
        success: (loginRes) => {
          // 保存token
          wx.setStorageSync("accessToken", loginRes.data.accessToken);
        },
      });
    }
  },
});

// 2. 获取用户详细信息
wx.getUserProfile({
  desc: "用于完善用户资料",
  success: (res) => {
    wx.request({
      url: "https://your-domain.com/tennis-analysis/auth/user-info",
      method: "POST",
      data: {
        encryptedData: res.encryptedData,
        iv: res.iv,
        code: "your-code",
      },
    });
  },
});

// 3. 上传视频文件
function uploadVideo(filePath) {
  const token = wx.getStorageSync("accessToken");

  // 获取文件信息
  wx.getFileInfo({
    filePath: filePath,
    success: (fileInfo) => {
      // 获取上传临时密钥
      wx.request({
        url: "https://your-domain.com/tennis-analysis/upload/token",
        method: "POST",
        header: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          fileType: "video",
          fileExtension: "mp4",
          fileSize: fileInfo.size,
        },
        success: (tokenRes) => {
          const uploadData = tokenRes.data;
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.mp4`;
          const fileKey = `${uploadData.prefix}${fileName}`;

          // 使用临时密钥上传文件到COS
          wx.uploadFile({
            url: `https://${uploadData.bucket}.cos.${uploadData.region}.myqcloud.com`,
            filePath: filePath,
            name: "file",
            formData: {
              key: fileKey,
              "x-cos-security-token": uploadData.sessionToken,
              "x-cos-meta-filename": fileName,
            },
            header: {
              Authorization: `q-sign-algorithm=sha1&q-ak=${uploadData.tmpSecretId}&q-sign-time=${uploadData.startTime};${uploadData.expiredTime}&q-key-time=${uploadData.startTime};${uploadData.expiredTime}&q-header-list=&q-url-param-list=&q-signature=xxx`,
            },
            success: (uploadRes) => {
              // 上传完成回调
              wx.request({
                url: "https://your-domain.com/tennis-analysis/upload/complete",
                method: "POST",
                header: {
                  Authorization: `Bearer ${token}`,
                },
                data: {
                  fileKey: fileKey,
                  fileType: "video",
                  originalName: "tennis-video.mp4",
                  fileSize: fileInfo.size,
                },
                success: (completeRes) => {
                  const videoUrl = completeRes.data.fileUrl;
                  // 使用上传后的URL进行视频分析
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

// 4. 分析网球视频
function analyzeVideo(videoUrl) {
  const token = wx.getStorageSync("accessToken");
  wx.request({
    url: "https://your-domain.com/tennis-analysis/analyze-video",
    method: "POST",
    header: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      videoUrl: videoUrl,
    },
    success: (res) => {
      console.log("分析结果:", res.data);
    },
  });
}
```

### 服务端API调用

```bash
# 微信小程序登录
curl -X POST http://localhost:3000/tennis-analysis/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "code": "081Kq4Ga1rXXXX",
    "nickName": "网球爱好者",
    "avatarUrl": "https://wx.qlogo.cn/mmopen/xxx"
  }'

# 获取上传临时密钥
curl -X POST http://localhost:3000/tennis-analysis/upload/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "fileType": "video",
    "fileExtension": "mp4",
    "fileSize": 10485760
  }'

# 上传完成回调
curl -X POST http://localhost:3000/tennis-analysis/upload/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "fileKey": "tennis-uploads/video/2024/01/01/user-123/1609459200-uuid.mp4",
    "fileType": "video",
    "originalName": "tennis-video.mp4",
    "fileSize": 10485760
  }'

# 分析网球视频
curl -X POST http://localhost:3000/tennis-analysis/analyze-video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "videoUrl": "https://cdn.example.com/tennis-uploads/video/2024/01/01/user-123/1609459200-uuid.mp4"
  }'

# 获取评分记录列表
curl -X GET "http://localhost:3000/tennis-analysis/scores?page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token"

# 获取评分统计
curl -X GET http://localhost:3000/tennis-analysis/scores/stats/summary \
  -H "Authorization: Bearer your-jwt-token"
```

## 注意事项

### 文件上传相关

1. **文件大小限制**：

   - 视频文件：最大500MB
   - 图片文件：最大10MB
   - 文档文件：最大50MB

2. **支持的文件格式**：

   - 视频：MP4、AVI、MOV、WMV、FLV、WEBM、M4V
   - 图片：JPG、JPEG、PNG、GIF、BMP、WEBP、SVG
   - 文档：PDF、DOC、DOCX、XLS、XLSX、PPT、PPTX、TXT

3. **上传流程**：
   - 先调用获取临时密钥接口
   - 使用临时密钥直传文件到腾讯云COS
   - 上传完成后调用回调接口获取文件URL

### 视频分析相关

1. 视频URL必须是可公开访问的链接
2. 建议视频时长在1-5分钟之间，包含多种技术动作
3. 视频质量越高，分析结果越准确
4. 确保视频中球员动作清晰可见

### 安全相关

1. 所有接口都需要JWT认证（除登录接口外）
2. 临时密钥有效期为1小时
3. 文件上传路径按用户ID隔离，确保数据安全
4. 支持CDN加速访问，提高文件访问速度
