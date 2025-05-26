#!/bin/bash

# 部署配置文件
# 在这里修改服务器配置信息

# 服务器基本信息
export SERVER_IP="129.204.155.94"
export SERVER_USER="root"  # 请根据实际情况修改用户名
export SERVER_PORT="22"    # SSH端口，默认22

# 项目配置
export PROJECT_NAME="ace_ball_server"
export SERVER_PATH="/var/www/ace_ball_server"  # 服务器上的项目路径
export APP_PORT="3001"     # 应用运行端口

# 部署配置
export NODE_VERSION="18"   # Node.js版本
export PM2_INSTANCES="max" # PM2实例数量

# 备份配置
export BACKUP_ENABLED="true"
export BACKUP_PATH="/var/backups/ace_ball_server"
export BACKUP_KEEP_DAYS="7"

# 环境配置
export DEPLOY_ENV="production"  # 部署环境: development, staging, production

# 通知配置（可选）
export SLACK_WEBHOOK=""     # Slack通知webhook
export EMAIL_NOTIFY=""      # 邮件通知地址

# 颜色配置
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export RED='\033[0;31m'
export BLUE='\033[0;34m'
export NC='\033[0m'

# 打印配置信息
print_config() {
  echo -e "${BLUE}当前部署配置:${NC}"
  echo "=================================="
  echo "服务器IP: $SERVER_IP"
  echo "服务器用户: $SERVER_USER"
  echo "项目名称: $PROJECT_NAME"
  echo "部署路径: $SERVER_PATH"
  echo "应用端口: $APP_PORT"
  echo "部署环境: $DEPLOY_ENV"
  echo "=================================="
} 