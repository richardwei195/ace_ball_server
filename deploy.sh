#!/bin/bash

# 服务器配置
SERVER_IP="129.204.155.94"
SERVER_USER="root"  # 请根据实际情况修改用户名
SERVER_PATH="/var/www/ace_ball_server"  # 服务器上的项目路径
PROJECT_NAME="ace_ball_server"

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
  echo -e "${GREEN}[INFO] $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}[WARNING] $1${NC}"
}

print_error() {
  echo -e "${RED}[ERROR] $1${NC}"
}

print_step() {
  echo -e "${BLUE}[STEP] $1${NC}"
}

# 错误处理
handle_error() {
  print_error "部署失败: $1"
  exit 1
}

# 检查必要的工具
check_dependencies() {
  print_step "检查必要的工具..."
  
  if ! command -v ssh &> /dev/null; then
    handle_error "SSH未安装"
  fi
  
  if ! command -v scp &> /dev/null; then
    handle_error "SCP未安装"
  fi
  
  if ! command -v yarn &> /dev/null; then
    handle_error "Yarn未安装"
  fi
  
  print_message "所有必要工具已安装"
}

# 测试服务器连接
test_server_connection() {
  print_step "测试服务器连接..."
  
  if ssh -o ConnectTimeout=10 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    print_message "服务器连接成功"
  else
    print_error "无法连接到服务器 $SERVER_IP"
    print_warning "请确保："
    print_warning "1. 服务器IP地址正确"
    print_warning "2. SSH密钥已配置或可以密码登录"
    print_warning "3. 服务器防火墙允许SSH连接"
    exit 1
  fi
}

# 本地构建
build_project() {
  print_step "开始本地构建..."
  
  # 安装依赖
  print_message "安装依赖..."
  yarn install || handle_error "依赖安装失败"
  
  # 构建项目
  print_message "构建项目..."
  yarn build || handle_error "项目构建失败"
  
  print_message "本地构建完成"
}

# 创建部署包
create_deployment_package() {
  print_step "创建部署包..."
  
  # 创建临时目录
  TEMP_DIR="./deploy_temp"
  rm -rf $TEMP_DIR
  mkdir -p $TEMP_DIR
  
  # 复制必要文件
  print_message "复制必要文件..."
  cp -r dist $TEMP_DIR/
  cp package.json $TEMP_DIR/
  cp yarn.lock $TEMP_DIR/
  cp ecosystem.config.js $TEMP_DIR/
  cp start.sh $TEMP_DIR/
  
  # 如果有环境配置文件，也复制过去
  if [ -f ".env.production" ]; then
    cp .env.production $TEMP_DIR/.env
  fi
  
  print_message "部署包创建完成"
}

# 上传到服务器
upload_to_server() {
  print_step "上传文件到服务器..."
  
  # 在服务器上创建项目目录
  ssh $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_PATH"
  
  # 上传部署包
  print_message "上传部署包..."
  scp -r ./deploy_temp/* $SERVER_USER@$SERVER_IP:$SERVER_PATH/ || handle_error "文件上传失败"
  
  print_message "文件上传完成"
}

# 在服务器上部署
deploy_on_server() {
  print_step "在服务器上部署应用..."
  
  ssh $SERVER_USER@$SERVER_IP << EOF
    cd $SERVER_PATH
    
    # 检查Node.js和yarn
    if ! command -v node &> /dev/null; then
      echo "正在安装Node.js..."
      curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
      sudo apt-get install -y nodejs
    fi
    
    if ! command -v yarn &> /dev/null; then
      echo "正在安装Yarn..."
      npm install -g yarn
    fi
    
    if ! command -v pm2 &> /dev/null; then
      echo "正在安装PM2..."
      npm install -g pm2
    fi
    
    # 安装生产依赖
    echo "安装生产依赖..."
    yarn install --production
    
    # 创建日志目录
    mkdir -p logs
    
    # 停止旧的应用实例
    echo "停止旧的应用实例..."
    pm2 delete $PROJECT_NAME 2>/dev/null || true
    
    # 启动新的应用实例
    echo "启动新的应用实例..."
    pm2 start ecosystem.config.js --env production
    
    # 保存PM2配置
    pm2 save
    pm2 startup
    
    echo "部署完成!"
    pm2 status
EOF
  
  if [ $? -eq 0 ]; then
    print_message "服务器部署完成"
  else
    handle_error "服务器部署失败"
  fi
}

# 清理临时文件
cleanup() {
  print_step "清理临时文件..."
  rm -rf ./deploy_temp
  print_message "清理完成"
}

# 显示部署信息
show_deployment_info() {
  print_step "部署信息"
  echo "=================================="
  print_message "应用名称: $PROJECT_NAME"
  print_message "服务器IP: $SERVER_IP"
  print_message "部署路径: $SERVER_PATH"
  print_message "应用端口: 3000"
  echo "=================================="
  print_message "可以通过以下命令查看应用状态:"
  echo "ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
  print_message "可以通过以下命令查看日志:"
  echo "ssh $SERVER_USER@$SERVER_IP 'pm2 logs $PROJECT_NAME'"
}

# 主函数
main() {
  echo "=================================="
  print_message "开始一键部署到服务器"
  echo "=================================="
  
  check_dependencies
  test_server_connection
  build_project
  create_deployment_package
  upload_to_server
  deploy_on_server
  cleanup
  show_deployment_info
  
  print_message "🎉 部署成功完成!"
}

# 如果脚本被直接执行，则运行主函数
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi 