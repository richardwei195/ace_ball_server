# Redis 配置说明

本项目已集成Redis，用于实现分布式锁和用户任务管理功能。

## 🔧 环境配置

在您的 `.env` 文件中添加以下Redis配置：

```bash
# Redis配置
REDIS_HOST=localhost          # Redis服务器地址
REDIS_PORT=6379              # Redis端口
REDIS_PASSWORD=              # Redis密码（如果有）
REDIS_DB=0                   # Redis数据库编号
```

## 🚀 Redis功能

### 1. 分布式锁
- 防止同一视频被多次同时分析
- 锁的键名格式：`video_analysis_lock:{videoUrl}`
- 默认锁定时间：30分钟

### 2. 用户任务管理
- 确保单个用户同时只能提交一个分析任务
- 任务键名格式：`user_task:{userId}`
- 默认任务超时：30分钟

## 📊 Redis键说明

| 键名模式 | 说明 | TTL |
|---------|------|-----|
| `video_analysis_lock:{videoUrl}` | 视频分析锁 | 30分钟 |
| `user_task:{userId}` | 用户任务状态 | 30分钟 |

## 🛠️ 本地开发

### 使用Docker运行Redis

```bash
# 拉取Redis镜像
docker pull redis:7-alpine

# 运行Redis容器
docker run -d \
  --name redis-server \
  -p 6379:6379 \
  redis:7-alpine

# 或者使用密码保护
docker run -d \
  --name redis-server \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --requirepass your_password
```

### 使用Homebrew安装（macOS）

```bash
# 安装Redis
brew install redis

# 启动Redis服务
brew services start redis

# 停止Redis服务
brew services stop redis
```

### 使用apt安装（Ubuntu/Debian）

```bash
# 更新包列表
sudo apt update

# 安装Redis
sudo apt install redis-server

# 启动Redis服务
sudo systemctl start redis-server

# 设置开机自启
sudo systemctl enable redis-server
```

## 🔍 Redis监控

### 查看Redis状态

```bash
# 连接到Redis CLI
redis-cli

# 查看所有键
KEYS *

# 查看特定模式的键
KEYS user_task:*
KEYS video_analysis_lock:*

# 查看键的TTL
TTL user_task:123

# 查看键的值
GET user_task:123
```

### 清理Redis数据

```bash
# 删除所有用户任务
redis-cli --scan --pattern "user_task:*" | xargs redis-cli DEL

# 删除所有分析锁
redis-cli --scan --pattern "video_analysis_lock:*" | xargs redis-cli DEL

# 清空当前数据库
redis-cli FLUSHDB
```

## 🚨 生产环境配置

### Redis配置建议

```bash
# 生产环境Redis配置
REDIS_HOST=your_redis_server_ip
REDIS_PORT=6379
REDIS_PASSWORD=your_strong_password
REDIS_DB=0
```

### 安全建议

1. **设置密码**：生产环境必须设置强密码
2. **网络隔离**：Redis服务器应在内网环境
3. **防火墙**：限制Redis端口访问
4. **监控**：设置Redis监控和告警

## 📈 性能优化

### Redis配置优化

```bash
# redis.conf 配置建议
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 连接池配置

项目已配置Redis连接池，默认参数：
- 最大连接数：10
- 连接超时：5秒
- 命令超时：3秒

## 🔧 故障排除

### 常见问题

1. **连接失败**
   - 检查Redis服务是否启动
   - 验证主机和端口配置
   - 确认防火墙设置

2. **认证失败**
   - 检查密码配置
   - 验证Redis requirepass设置

3. **内存不足**
   - 检查Redis内存使用
   - 调整maxmemory配置
   - 清理过期键

### 日志查看

```bash
# 查看应用日志中的Redis相关信息
tail -f logs/output.log | grep -i redis

# 查看Redis服务日志
sudo journalctl -u redis-server -f
```

## 🧪 测试Redis功能

### 测试分布式锁

```bash
# 手动测试锁功能
redis-cli SET "video_analysis_lock:test_video" "test_lock" NX EX 300

# 检查锁状态
redis-cli GET "video_analysis_lock:test_video"

# 释放锁
redis-cli DEL "video_analysis_lock:test_video"
```

### 测试用户任务

```bash
# 设置用户任务
redis-cli SET "user_task:123" '{"taskId":"test","startTime":"2024-01-01T00:00:00Z","status":"processing"}' NX EX 1800

# 查看用户任务
redis-cli GET "user_task:123"

# 完成用户任务
redis-cli DEL "user_task:123"
```

---

**注意**：确保Redis服务正常运行后再启动应用，否则可能导致分析功能异常。 