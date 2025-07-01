-- 数据库迁移脚本：创建网球场馆评分表
-- 执行前请备份数据库

-- 1. 创建场馆评分表
CREATE TABLE IF NOT EXISTS t_tennis_venue_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '评分ID',
    venue_id INT NOT NULL COMMENT '场馆ID',
    user_id VARCHAR(255) NOT NULL COMMENT '用户ID',
    rating INT NOT NULL COMMENT '评分 (1-5分)',
    description TEXT NULL COMMENT '评价描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 外键约束
    FOREIGN KEY (venue_id) REFERENCES t_tennis_venues(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES t_tennis_users(id) ON DELETE CASCADE,
    
    -- 唯一约束：一个用户只能对一个场馆评分一次
    UNIQUE KEY uk_user_venue (user_id, venue_id),
    
    -- 评分范围约束
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网球场馆评分表';

-- 2. 创建索引
CREATE INDEX idx_venue_ratings_venue_id ON t_tennis_venue_ratings(venue_id);
CREATE INDEX idx_venue_ratings_user_id ON t_tennis_venue_ratings(user_id);
CREATE INDEX idx_venue_ratings_rating ON t_tennis_venue_ratings(rating);
CREATE INDEX idx_venue_ratings_created_at ON t_tennis_venue_ratings(created_at);

-- 3. 验证表结构
DESCRIBE t_tennis_venue_ratings;

-- 4. 验证索引创建
SHOW INDEX FROM t_tennis_venue_ratings;

-- 5. 验证外键约束
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 't_tennis_venue_ratings'
AND CONSTRAINT_NAME != 'PRIMARY';

-- 6. 测试插入示例数据（可选）
-- INSERT INTO t_tennis_venue_ratings (venue_id, user_id, rating, description) 
-- VALUES (1, 'test-user-id', 5, '场地环境很好，服务态度不错，推荐！');

-- 7. 测试约束（可选，这些语句应该会失败）
-- INSERT INTO t_tennis_venue_ratings (venue_id, user_id, rating, description) VALUES (1, 'test-user-id', 6, '超出范围的评分'); -- 应该失败
-- INSERT INTO t_tennis_venue_ratings (venue_id, user_id, rating, description) VALUES (1, 'test-user-id', 4, '重复评分'); -- 应该失败 