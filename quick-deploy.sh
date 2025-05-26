#!/bin/bash

# 快速部署脚本 - 适用于已经配置好的服务器环境

# 服务器配置
SERVER_IP="129.204.155.94"
SERVER_USER="root"
SERVER_PATH="/var/www/ace_ball_server"
PROJECT_NAME="ace_ball_server"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 开始快速部署...${NC}"

# 1. 本地构建
echo -e "${YELLOW}📦 构建项目...${NC}"
yarn build || { echo -e "${RED}❌ 构建失败${NC}"; exit 1; }

# 2. 创建部署包
echo -e "${YELLOW}📁 创建部署包...${NC}"
rm -rf deploy_temp
mkdir -p deploy_temp
cp -r dist package.json yarn.lock ecosystem.config.js deploy_temp/

# 3. 上传并部署
echo -e "${YELLOW}⬆️ 上传并部署...${NC}"
scp -r deploy_temp/* $SERVER_USER@$SERVER_IP:$SERVER_PATH/ && \
ssh $SERVER_USER@$SERVER_IP "
  cd $SERVER_PATH && \
  yarn install --production && \
  pm2 delete $PROJECT_NAME 2>/dev/null || true && \
  pm2 start ecosystem.config.js --env production && \
  pm2 save
"

# 4. 清理
rm -rf deploy_temp

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ 部署成功完成!${NC}"
  echo -e "${GREEN}🌐 应用运行在: http://$SERVER_IP:3000${NC}"
else
  echo -e "${RED}❌ 部署失败${NC}"
  exit 1
fi 