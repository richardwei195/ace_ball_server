-- 网球场馆数据一键插入SQL脚本
-- 使用前请确保数据库表已创建

-- 清空现有数据（可选，如果需要重新插入）
-- DELETE FROM t_tennis_venue_booking_methods;
-- DELETE FROM t_tennis_venues;

-- 插入场馆数据
INSERT INTO t_tennis_venues (
    id, name, city, location, open_start_time, open_end_time, is_open, price_range, 
    features, description, image_url, sort_order, created_at, updated_at
) VALUES
-- 广州天河体育中心 (08:00-20:00)
(1, '广州天河体育中心', '广州', '天河区体育西路', 480, 1200, 1, '¥50-120/小时',
 JSON_ARRAY('标准场地', '器材租赁', '教练服务'),
 '广州天河体育中心网球场，设施完善，环境优美，是广州市内知名的网球运动场所。',
 'https://example.com/images/venues/tianhe-sports.jpg', 100, NOW(), NOW()),

-- 深圳湾体育中心 (06:00-22:00)
(2, '深圳湾体育中心', '深圳', '南山区深圳湾体育中心', 360, 1320, 1, '¥80-200/小时',
 JSON_ARRAY('专业场地', '夜间照明', '停车便利', '教练服务'),
 '深圳湾体育中心网球场，拥有多片标准网球场地，设施一流，交通便利。',
 'https://example.com/images/venues/shenzhen-bay.jpg', 95, NOW(), NOW()),

-- 北京朝阳公园网球中心 (07:00-21:00)
(3, '北京朝阳公园网球中心', '北京', '朝阳区朝阳公园南路8号', 420, 1260, 1, '¥60-150/小时',
 JSON_ARRAY('标准场地', '器材租赁', '教练培训', '比赛场地'),
 '北京朝阳公园网球中心，环境优美，设施专业，是北京市内热门的网球运动场所。',
 'https://example.com/images/venues/chaoyang-park.jpg', 90, NOW(), NOW()),

-- 上海徐家汇体育公园 (06:30-21:30)
(4, '上海徐家汇体育公园', '上海', '徐汇区漕溪北路1111号', 390, 1290, 1, '¥70-180/小时',
 JSON_ARRAY('标准场地', '夜间照明', '器材租赁', '教练服务', '淋浴设施'),
 '上海徐家汇体育公园网球场，地理位置优越，设施完善，是上海市内知名的网球运动场所。',
 'https://example.com/images/venues/xujiahui-sports.jpg', 85, NOW(), NOW()),

-- 杭州黄龙体育中心 (08:00-20:00)
(5, '杭州黄龙体育中心', '杭州', '西湖区曙光路黄龙体育中心', 480, 1200, 1, '¥45-100/小时',
 JSON_ARRAY('标准场地', '器材租赁', '教练服务', '停车便利'),
 '杭州黄龙体育中心网球场，历史悠久，设施完善，是杭州市内的经典网球场地。',
 'https://example.com/images/venues/huanglong-sports.jpg', 80, NOW(), NOW()),

-- 成都猛追湾游泳场网球中心 (09:00-21:00)
(6, '成都猛追湾游泳场网球中心', '成都', '成华区猛追湾街168号', 540, 1260, 1, '¥40-90/小时',
 JSON_ARRAY('标准场地', '器材租赁', '教练服务'),
 '成都猛追湾游泳场网球中心，环境舒适，价格实惠，是成都市内受欢迎的网球场地。',
 'https://example.com/images/venues/mengzhuiwan-tennis.jpg', 75, NOW(), NOW()),

-- 武汉光谷国际网球中心 (08:00-21:00)
(7, '武汉光谷国际网球中心', '武汉', '东湖新技术开发区关山大道', 480, 1260, 1, '¥55-130/小时',
 JSON_ARRAY('国际标准场地', '专业教练', '器材租赁', '比赛场地'),
 '武汉光谷国际网球中心，承办过多项国际赛事，场地标准，设施一流。',
 'https://example.com/images/venues/wuhan-optics.jpg', 88, NOW(), NOW()),

-- 南京奥体中心网球场 (07:30-20:30)
(8, '南京奥体中心网球场', '南京', '建邺区江东中路222号', 450, 1230, 1, '¥50-110/小时',
 JSON_ARRAY('标准场地', '夜间照明', '教练服务', '停车便利'),
 '南京奥体中心网球场，环境优美，交通便利，是南京市内知名的网球运动场所。',
 'https://example.com/images/venues/nanjing-olympic.jpg', 82, NOW(), NOW()),

-- 西安城市运动公园网球场 (08:30-20:00)
(9, '西安城市运动公园网球场', '西安', '未央区凤城八路与明光路交汇处', 510, 1200, 1, '¥35-85/小时',
 JSON_ARRAY('标准场地', '器材租赁', '教练服务'),
 '西安城市运动公园网球场，环境舒适，价格实惠，深受网球爱好者喜爱。',
 'https://example.com/images/venues/xian-city-park.jpg', 78, NOW(), NOW()),

-- 青岛国信体育中心 (07:00-21:00)
(10, '青岛国信体育中心', '青岛', '崂山区同安路880号', 420, 1260, 1, '¥45-105/小时',
 JSON_ARRAY('标准场地', '海景视野', '器材租赁', '教练服务'),
 '青岛国信体育中心网球场，拥有海景视野，环境独特，设施完善。',
 'https://example.com/images/venues/qingdao-guoxin.jpg', 83, NOW(), NOW());

-- 插入预订方式数据
INSERT INTO t_tennis_venue_booking_methods (
    venue_id, type, name, icon, color, url, app_id, path, phone, 
    is_enabled, sort_order, created_at, updated_at
) VALUES
-- 广州天河体育中心的预订方式
(1, 'h5', '在线预订', 'internet', '#4facfe', 'https://tianhe-sports.gov.cn', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
(1, 'miniprogram', '体育通', 'app', '#07c160', NULL, 'wx1111111111', 'pages/venue/tennis', NULL, 1, 2, NOW(), NOW()),
(1, 'phone', '服务热线', 'call', '#fa709a', NULL, NULL, NULL, '020-99999999', 1, 3, NOW(), NOW()),

-- 深圳湾体育中心的预订方式
(2, 'h5', '官方预订', 'internet', '#4facfe', 'https://szb-sports.com', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
(2, 'miniprogram', '深圳体育', 'app', '#07c160', NULL, 'wx2222222222', 'pages/booking/tennis', NULL, 1, 2, NOW(), NOW()),
(2, 'phone', '预订热线', 'call', '#fa709a', NULL, NULL, NULL, '0755-88888888', 1, 3, NOW(), NOW()),

-- 北京朝阳公园网球中心的预订方式
(3, 'h5', '在线预订', 'internet', '#4facfe', 'https://chaoyang-tennis.com', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
(3, 'phone', '预订电话', 'call', '#fa709a', NULL, NULL, NULL, '010-77777777', 1, 2, NOW(), NOW()),
(3, 'offline', '现场预订', 'location', '#ff6b6b', NULL, NULL, NULL, NULL, 1, 3, NOW(), NOW()),

-- 上海徐家汇体育公园的预订方式
(4, 'h5', '官方预订', 'internet', '#4facfe', 'https://xjh-sports.com', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
(4, 'miniprogram', '运动上海', 'app', '#07c160', NULL, 'wx3333333333', 'pages/venue/tennis', NULL, 1, 2, NOW(), NOW()),
(4, 'phone', '客服热线', 'call', '#fa709a', NULL, NULL, NULL, '021-66666666', 1, 3, NOW(), NOW()),

-- 杭州黄龙体育中心的预订方式
(5, 'h5', '在线预订', 'internet', '#4facfe', 'https://huanglong-sports.com', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
(5, 'phone', '预订电话', 'call', '#fa709a', NULL, NULL, NULL, '0571-55555555', 1, 2, NOW(), NOW()),

-- 成都猛追湾游泳场网球中心的预订方式
(6, 'phone', '预订电话', 'call', '#fa709a', NULL, NULL, NULL, '028-44444444', 1, 1, NOW(), NOW()),
(6, 'offline', '现场预订', 'location', '#ff6b6b', NULL, NULL, NULL, NULL, 1, 2, NOW(), NOW()),

-- 武汉光谷国际网球中心的预订方式
(7, 'h5', '官方预订', 'internet', '#4facfe', 'https://wuhan-optics-tennis.com', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
(7, 'miniprogram', '光谷体育', 'app', '#07c160', NULL, 'wx4444444444', 'pages/tennis/booking', NULL, 1, 2, NOW(), NOW()),
(7, 'phone', '预订热线', 'call', '#fa709a', NULL, NULL, NULL, '027-88888888', 1, 3, NOW(), NOW()),

-- 南京奥体中心网球场的预订方式
(8, 'h5', '在线预订', 'internet', '#4facfe', 'https://nj-olympic.com', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
(8, 'phone', '预订电话', 'call', '#fa709a', NULL, NULL, NULL, '025-77777777', 1, 2, NOW(), NOW()),
(8, 'offline', '现场预订', 'location', '#ff6b6b', NULL, NULL, NULL, NULL, 1, 3, NOW(), NOW()),

-- 西安城市运动公园网球场的预订方式
(9, 'phone', '预订电话', 'call', '#fa709a', NULL, NULL, NULL, '029-66666666', 1, 1, NOW(), NOW()),
(9, 'offline', '现场预订', 'location', '#ff6b6b', NULL, NULL, NULL, NULL, 1, 2, NOW(), NOW()),

-- 青岛国信体育中心的预订方式
(10, 'h5', '官方预订', 'internet', '#4facfe', 'https://qd-guoxin.com', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
(10, 'miniprogram', '青岛体育', 'app', '#07c160', NULL, 'wx5555555555', 'pages/venue/book', NULL, 1, 2, NOW(), NOW()),
(10, 'phone', '客服热线', 'call', '#fa709a', NULL, NULL, NULL, '0532-88888888', 1, 3, NOW(), NOW());

-- 查询插入结果并显示时间格式
SELECT 
    v.id,
    v.name,
    v.city,
    v.open_start_time,
    v.open_end_time,
    CONCAT(
        LPAD(FLOOR(v.open_start_time / 60), 2, '0'), ':', 
        LPAD(v.open_start_time % 60, 2, '0')
    ) as open_start_formatted,
    CONCAT(
        LPAD(FLOOR(v.open_end_time / 60), 2, '0'), ':', 
        LPAD(v.open_end_time % 60, 2, '0')
    ) as open_end_formatted,
    CONCAT(
        LPAD(FLOOR(v.open_start_time / 60), 2, '0'), ':', 
        LPAD(v.open_start_time % 60, 2, '0'),
        '-',
        LPAD(FLOOR(v.open_end_time / 60), 2, '0'), ':', 
        LPAD(v.open_end_time % 60, 2, '0')
    ) as open_time_formatted,
    v.price_range,
    COUNT(bm.id) as booking_methods_count
FROM t_tennis_venues v
LEFT JOIN t_tennis_venue_booking_methods bm ON v.id = bm.venue_id
GROUP BY v.id, v.name, v.city, v.open_start_time, v.open_end_time, v.price_range
ORDER BY v.sort_order DESC;

-- 查询各城市场馆数量
SELECT 
    city,
    COUNT(*) as venue_count,
    GROUP_CONCAT(name SEPARATOR ', ') as venues
FROM t_tennis_venues
WHERE is_open = 1
GROUP BY city
ORDER BY venue_count DESC;

-- 查询各种预订方式的使用情况
SELECT 
    type,
    COUNT(*) as method_count,
    GROUP_CONCAT(DISTINCT name SEPARATOR ', ') as method_names
FROM t_tennis_venue_booking_methods
WHERE is_enabled = 1
GROUP BY type
ORDER BY method_count DESC;

-- 查询营业时间统计（整型分钟）
SELECT 
    MIN(open_start_time) as earliest_start_minutes,
    MAX(open_end_time) as latest_end_minutes,
    CONCAT(
        LPAD(FLOOR(MIN(open_start_time) / 60), 2, '0'), ':', 
        LPAD(MIN(open_start_time) % 60, 2, '0')
    ) as earliest_start_time,
    CONCAT(
        LPAD(FLOOR(MAX(open_end_time) / 60), 2, '0'), ':', 
        LPAD(MAX(open_end_time) % 60, 2, '0')
    ) as latest_end_time,
    ROUND(AVG(open_end_time - open_start_time) / 60, 2) as avg_open_hours
FROM t_tennis_venues
WHERE is_open = 1; 