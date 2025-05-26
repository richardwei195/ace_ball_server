#!/bin/bash

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
  echo -e "${GREEN}$1${NC}"
}

print_warning() {
  echo -e "${YELLOW}$1${NC}"
}

# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
  print_warning "PM2未安装，正在全局安装PM2..."
  npm install -g pm2
fi

# 创建日志目录
print_message "创建日志目录..."
mkdir -p logs

# 安装依赖
print_message "安装依赖..."
yarn install

# 构建项目
print_message "构建项目..."
yarn build

# 使用PM2启动项目（开发环境）
print_message "使用PM2启动项目（开发环境）..."
yarn pm2:start:dev

# 显示PM2状态
print_message "PM2状态："
pm2 status

print_message "应用已在开发环境中启动!"
print_message "可以使用以下命令查看日志: yarn pm2:logs"
print_message "日志文件位置: ./logs/output.log 和 ./logs/error.log" 