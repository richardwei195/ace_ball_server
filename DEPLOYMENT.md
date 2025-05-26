# 部署说明文档

本项目提供了一套完整的自动化部署脚本，可以一键将NestJS应用部署到服务器。

## 📋 前置要求

### 本地环境
- Node.js 18+
- Yarn
- SSH客户端

### 服务器环境
- Ubuntu/CentOS Linux
- SSH访问权限
- 建议配置SSH密钥认证

## 🚀 快速开始

### 1. 配置服务器信息

编辑 `deploy.config.sh` 文件，修改服务器配置：

```bash
# 服务器基本信息
export SERVER_IP="129.204.155.94"      # 您的服务器IP
export SERVER_USER="root"              # SSH用户名
export SERVER_PATH="/var/www/ace_ball_server"  # 部署路径
```

### 2. 首次部署

使用完整部署脚本进行首次部署：

```bash
./deploy.sh
```

这个脚本会：
- ✅ 检查本地环境
- ✅ 测试服务器连接
- ✅ 构建项目
- ✅ 上传文件到服务器
- ✅ 在服务器上安装依赖和PM2
- ✅ 启动应用

### 3. 日常更新部署

后续更新可以使用快速部署脚本：

```bash
./quick-deploy.sh
```

## 🛠️ 脚本说明

### 1. `deploy.sh` - 完整部署脚本
- 适用于首次部署或服务器环境变更
- 包含完整的环境检查和配置
- 自动安装Node.js、Yarn、PM2等依赖

### 2. `quick-deploy.sh` - 快速部署脚本
- 适用于日常代码更新
- 只进行构建、上传、重启操作
- 执行速度更快

### 3. `server-manage.sh` - 服务器管理脚本
- 远程管理服务器上的应用
- 支持多种操作命令

#### 使用方法：
```bash
# 查看应用状态
./server-manage.sh status

# 查看日志
./server-manage.sh logs

# 重启应用
./server-manage.sh restart

# 停止应用
./server-manage.sh stop

# 启动应用
./server-manage.sh start

# 实时监控日志
./server-manage.sh monitor

# 连接到服务器
./server-manage.sh ssh
```

### 4. `deploy.config.sh` - 配置文件
- 集中管理所有部署配置
- 修改配置后重新运行部署脚本即可生效

## 🔧 配置SSH密钥（推荐）

为了避免每次部署都输入密码，建议配置SSH密钥：

```bash
# 生成SSH密钥（如果还没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 复制公钥到服务器
ssh-copy-id root@129.204.155.94
```

## 📁 项目结构

部署后，服务器上的项目结构：

```
/var/www/ace_ball_server/
├── dist/                 # 编译后的代码
├── node_modules/         # 生产依赖
├── logs/                 # 应用日志
├── package.json          # 项目配置
├── yarn.lock            # 依赖锁定文件
└── ecosystem.config.js   # PM2配置
```

## 🔍 故障排除

### 1. 连接失败
- 检查服务器IP是否正确
- 确认SSH端口是否开放（默认22）
- 验证用户名和密码/密钥

### 2. 构建失败
- 检查本地Node.js版本
- 确认所有依赖已安装：`yarn install`
- 查看具体错误信息

### 3. 部署失败
- 检查服务器磁盘空间
- 确认服务器上Node.js版本兼容
- 查看PM2日志：`./server-manage.sh logs`

### 4. 应用无法访问
- 检查防火墙设置
- 确认端口3000是否开放
- 查看应用状态：`./server-manage.sh status`

## 📊 监控和日志

### 查看应用状态
```bash
./server-manage.sh status
```

### 查看实时日志
```bash
./server-manage.sh monitor
```

### 查看历史日志
```bash
./server-manage.sh logs
```

## 🔄 回滚操作

如果新版本有问题，可以通过以下方式回滚：

1. 连接到服务器：
```bash
./server-manage.sh ssh
```

2. 在服务器上执行回滚：
```bash
cd /var/www/ace_ball_server
# 如果有备份，恢复备份
# 或者重新部署上一个稳定版本
```

## 🚨 安全建议

1. **使用SSH密钥**：避免密码认证
2. **限制SSH访问**：配置防火墙规则
3. **定期更新**：保持服务器系统和依赖更新
4. **备份数据**：定期备份重要数据
5. **监控日志**：定期检查应用日志

## 📞 支持

如果遇到问题，请：
1. 查看错误日志
2. 检查网络连接
3. 验证配置信息
4. 联系系统管理员

---

**注意**：首次使用前请仔细阅读并理解每个脚本的功能，确保服务器配置正确。 