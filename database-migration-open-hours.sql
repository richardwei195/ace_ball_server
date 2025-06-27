-- 数据库迁移脚本：将营业时间字段改为整型分钟值存储
-- 执行前请备份数据库

-- 1. 添加新的营业时间字段（整型分钟）
ALTER TABLE t_tennis_venues 
ADD COLUMN open_start_time_new INTEGER COMMENT '营业开始时间 (以分钟为单位，从00:00开始计算)' AFTER location,
ADD COLUMN open_end_time_new INTEGER COMMENT '营业结束时间 (以分钟为单位，从00:00开始计算)' AFTER open_start_time_new;

-- 2. 从现有的字符串时间字段迁移数据
UPDATE t_tennis_venues 
SET 
    open_start_time_new = CASE 
        WHEN open_start_time IS NOT NULL THEN 
            HOUR(STR_TO_DATE(open_start_time, '%H:%i')) * 60 + MINUTE(STR_TO_DATE(open_start_time, '%H:%i'))
        WHEN open_time IS NOT NULL AND open_time LIKE '%-%' THEN 
            HOUR(STR_TO_DATE(SUBSTRING_INDEX(open_time, '-', 1), '%H:%i')) * 60 + 
            MINUTE(STR_TO_DATE(SUBSTRING_INDEX(open_time, '-', 1), '%H:%i'))
        ELSE NULL
    END,
    open_end_time_new = CASE 
        WHEN open_end_time IS NOT NULL THEN 
            HOUR(STR_TO_DATE(open_end_time, '%H:%i')) * 60 + MINUTE(STR_TO_DATE(open_end_time, '%H:%i'))
        WHEN open_time IS NOT NULL AND open_time LIKE '%-%' THEN 
            HOUR(STR_TO_DATE(SUBSTRING_INDEX(open_time, '-', -1), '%H:%i')) * 60 + 
            MINUTE(STR_TO_DATE(SUBSTRING_INDEX(open_time, '-', -1), '%H:%i'))
        ELSE NULL
    END
WHERE open_start_time IS NOT NULL OR open_end_time IS NOT NULL OR (open_time IS NOT NULL AND open_time LIKE '%-%');

-- 3. 验证迁移结果
SELECT 
    id,
    name,
    COALESCE(open_start_time, SUBSTRING_INDEX(open_time, '-', 1)) as old_start_time,
    COALESCE(open_end_time, SUBSTRING_INDEX(open_time, '-', -1)) as old_end_time,
    open_start_time_new,
    open_end_time_new,
    CONCAT(
        LPAD(FLOOR(open_start_time_new / 60), 2, '0'), ':', 
        LPAD(open_start_time_new % 60, 2, '0')
    ) as new_start_formatted,
    CONCAT(
        LPAD(FLOOR(open_end_time_new / 60), 2, '0'), ':', 
        LPAD(open_end_time_new % 60, 2, '0')
    ) as new_end_formatted
FROM t_tennis_venues
ORDER BY id;

-- 4. 删除旧字段并重命名新字段
ALTER TABLE t_tennis_venues 
DROP COLUMN IF EXISTS open_start_time,
DROP COLUMN IF EXISTS open_end_time;

ALTER TABLE t_tennis_venues 
CHANGE COLUMN open_start_time_new open_start_time INTEGER NOT NULL COMMENT '营业开始时间 (以分钟为单位，从00:00开始计算)',
CHANGE COLUMN open_end_time_new open_end_time INTEGER NOT NULL COMMENT '营业结束时间 (以分钟为单位，从00:00开始计算)';

-- 5. 创建索引以优化营业时间查询
CREATE INDEX idx_tennis_venues_open_hours ON t_tennis_venues(open_start_time, open_end_time);

-- 6. 验证最终结果
SELECT 
    id,
    name,
    open_start_time,
    open_end_time,
    CONCAT(
        LPAD(FLOOR(open_start_time / 60), 2, '0'), ':', 
        LPAD(open_start_time % 60, 2, '0'),
        '-',
        LPAD(FLOOR(open_end_time / 60), 2, '0'), ':', 
        LPAD(open_end_time % 60, 2, '0')
    ) as formatted_open_time
FROM t_tennis_venues
ORDER BY id;

-- 7. 验证索引创建
SHOW INDEX FROM t_tennis_venues WHERE Key_name = 'idx_tennis_venues_open_hours'; 