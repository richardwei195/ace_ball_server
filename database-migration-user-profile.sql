-- 数据库迁移脚本：为用户表添加 NTRP 评分和惯用手字段
-- 执行前请备份数据库

-- 1. 为用户表添加新字段
ALTER TABLE t_tennis_users 
ADD COLUMN ntrp_rating DECIMAL(3,1) NULL COMMENT 'NTRP评分 (1.0-7.0)' AFTER language,
ADD COLUMN dominant_hand VARCHAR(20) NULL COMMENT '惯用手 (left/right/unknown)' AFTER ntrp_rating,
ADD COLUMN tennis_experience DECIMAL(4,1) NULL COMMENT '网球经验 (以0.5年为单位，如1.5表示1.5年)' AFTER dominant_hand;

-- 2. 验证字段添加结果
SELECT 
    id,
    name,
    gender,
    ntrp_rating,
    dominant_hand,
    tennis_experience,
    created_at,
    updated_at
FROM t_tennis_users
LIMIT 5;

-- 3. 添加约束确保数据完整性
ALTER TABLE t_tennis_users 
ADD CONSTRAINT chk_ntrp_rating CHECK (ntrp_rating IS NULL OR (ntrp_rating >= 1.0 AND ntrp_rating <= 7.0)),
ADD CONSTRAINT chk_dominant_hand CHECK (dominant_hand IS NULL OR dominant_hand IN ('left', 'right', 'unknown')),
ADD CONSTRAINT chk_tennis_experience CHECK (tennis_experience IS NULL OR (tennis_experience >= 0 AND tennis_experience <= 50.0 AND (tennis_experience * 2) = FLOOR(tennis_experience * 2)));

-- 4. 创建索引以优化查询
CREATE INDEX idx_tennis_users_ntrp_rating ON t_tennis_users(ntrp_rating);
CREATE INDEX idx_tennis_users_dominant_hand ON t_tennis_users(dominant_hand);
CREATE INDEX idx_tennis_users_tennis_experience ON t_tennis_users(tennis_experience);

-- 5. 验证约束和索引创建
SHOW INDEX FROM t_tennis_users WHERE Key_name IN ('idx_tennis_users_ntrp_rating', 'idx_tennis_users_dominant_hand', 'idx_tennis_users_tennis_experience');

-- 6. 检查表结构
DESCRIBE t_tennis_users; 