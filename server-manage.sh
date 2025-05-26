#!/bin/bash

# 服务器管理脚本

# 服务器配置
SERVER_IP="129.204.155.94"
SERVER_USER="root"
SERVER_PATH="/var/www/ace_ball_server"
PROJECT_NAME="ace_ball_server"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 显示帮助信息
show_help() {
  echo -e "${BLUE}服务器管理脚本${NC}"
  echo "用法: $0 [命令]"
  echo ""
  echo "可用命令:"
  echo "  status    - 查看应用状态"
  echo "  logs      - 查看应用日志"
  echo "  restart   - 重启应用"
  echo "  stop      - 停止应用"
  echo "  start     - 启动应用"
  echo "  monitor   - 实时监控日志"
  echo "  ssh       - 连接到服务器"
  echo "  help      - 显示此帮助信息"
}

# 执行远程命令
run_remote_cmd() {
  ssh $SERVER_USER@$SERVER_IP "$1"
}

# 查看应用状态
check_status() {
  echo -e "${YELLOW}📊 查看应用状态...${NC}"
  run_remote_cmd "pm2 status"
}

# 查看日志
view_logs() {
  echo -e "${YELLOW}📋 查看应用日志...${NC}"
  run_remote_cmd "pm2 logs $PROJECT_NAME --lines 50"
}

# 重启应用
restart_app() {
  echo -e "${YELLOW}🔄 重启应用...${NC}"
  run_remote_cmd "cd $SERVER_PATH && pm2 restart $PROJECT_NAME"
  echo -e "${GREEN}✅ 应用已重启${NC}"
}

# 停止应用
stop_app() {
  echo -e "${YELLOW}⏹️ 停止应用...${NC}"
  run_remote_cmd "pm2 stop $PROJECT_NAME"
  echo -e "${GREEN}✅ 应用已停止${NC}"
}

# 启动应用
start_app() {
  echo -e "${YELLOW}▶️ 启动应用...${NC}"
  run_remote_cmd "cd $SERVER_PATH && pm2 start ecosystem.config.js --env production"
  echo -e "${GREEN}✅ 应用已启动${NC}"
}

# 实时监控日志
monitor_logs() {
  echo -e "${YELLOW}👀 实时监控日志 (按 Ctrl+C 退出)...${NC}"
  ssh $SERVER_USER@$SERVER_IP "pm2 logs $PROJECT_NAME --follow"
}

# 连接到服务器
connect_ssh() {
  echo -e "${YELLOW}🔗 连接到服务器...${NC}"
  ssh $SERVER_USER@$SERVER_IP
}

# 主逻辑
case "$1" in
  "status")
    check_status
    ;;
  "logs")
    view_logs
    ;;
  "restart")
    restart_app
    ;;
  "stop")
    stop_app
    ;;
  "start")
    start_app
    ;;
  "monitor")
    monitor_logs
    ;;
  "ssh")
    connect_ssh
    ;;
  "help"|"")
    show_help
    ;;
  *)
    echo -e "${RED}❌ 未知命令: $1${NC}"
    show_help
    exit 1
    ;;
esac 