# 网球场馆预订API文档

## 概述

网球场馆预订API提供了完整的场馆信息查询功能，支持多种筛选条件和预订方式。用户可以根据城市、预订方式、营业状态、营业时间等条件来查找合适的网球场馆。

## 数据库设计

### 场馆表 (t_tennis_venues)

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | INTEGER | 场馆ID（主键，自增） | 1 |
| name | VARCHAR(100) | 场馆名称 | "广州天河体育中心" |
| city | VARCHAR(50) | 所在城市（带索引） | "广州" |
| location | VARCHAR(200) | 场馆地址 | "天河区体育西路" |
| open_start_time | INTEGER | 营业开始时间 (以分钟为单位，从00:00开始计算) | 480 (表示08:00) |
| open_end_time | INTEGER | 营业结束时间 (以分钟为单位，从00:00开始计算) | 1200 (表示20:00) |
| is_open | BOOLEAN | 是否营业 | true |
| price_range | VARCHAR(50) | 价格区间 | "¥50-120/小时" |
| features | JSON | 场馆特色服务 | ["标准场地", "器材租赁"] |
| description | TEXT | 场馆描述 | "专业网球场地，设施完善" |
| image_url | VARCHAR(500) | 场馆图片URL | "https://example.com/venue.jpg" |
| sort_order | INTEGER | 排序权重 | 100 |
| created_at | DATETIME | 创建时间 | "2024-01-01 00:00:00" |
| updated_at | DATETIME | 更新时间 | "2024-01-01 00:00:00" |

> **注意：** 
> - 营业时间在数据库中以整型分钟值存储，便于高效筛选和比较
> - 时间转换规则：`分钟值 = 小时 * 60 + 分钟`，例如：08:00 = 8*60 = 480分钟，20:30 = 20*60+30 = 1230分钟
> - API接口仍使用 HH:mm 格式，系统内部自动进行转换
> - 模型中提供虚拟字段自动格式化为用户友好的时间格式

### 预订方式表 (t_tennis_venue_booking_methods)

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | INTEGER | 预订方式ID（主键，自增） | 1 |
| venue_id | INTEGER | 场馆ID（外键） | 1 |
| type | ENUM | 预订方式类型 | "h5", "miniprogram", "phone", "app", "offline" |
| name | VARCHAR(50) | 预订方式名称 | "在线预订" |
| icon | VARCHAR(50) | 图标名称 | "internet" |
| color | VARCHAR(20) | 主题颜色 | "#4facfe" |
| url | VARCHAR(500) | H5链接或APP下载链接 | "https://example.com" |
| app_id | VARCHAR(50) | 小程序AppID | "wx1111111111" |
| path | VARCHAR(200) | 小程序页面路径 | "pages/venue/tennis" |
| phone | VARCHAR(20) | 联系电话 | "020-99999999" |
| is_enabled | BOOLEAN | 是否启用 | true |
| sort_order | INTEGER | 排序权重 | 1 |
| created_at | DATETIME | 创建时间 | "2024-01-01 00:00:00" |
| updated_at | DATETIME | 更新时间 | "2024-01-01 00:00:00" |

## API接口

### 1. 获取场馆列表

**接口地址:** `GET /tennis-analysis/venues`

**接口描述:** 分页获取网球场馆列表，支持多种筛选条件

**查询参数:**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| page | number | 否 | 页码，默认1 | 1 |
| limit | number | 否 | 每页数量，默认10，最大100 | 10 |
| city | string | 否 | 城市筛选 | "广州" |
| bookingTypes | array | 否 | 预订方式筛选 | ["h5", "miniprogram"] |
| isOpen | boolean | 否 | 是否营业 | true |
| keyword | string | 否 | 关键词搜索 | "体育中心" |
| openStartTimeBefore | string | 否 | 营业开始时间筛选 (HH:mm格式，筛选在此时间之前或等于此时间开始营业的场馆) | "08:00" |
| openEndTimeAfter | string | 否 | 营业结束时间筛选 (HH:mm格式，筛选在此时间之后或等于此时间结束营业的场馆) | "22:00" |
| features | string | 否 | 特色服务筛选 (多个特色用逗号分隔，场馆需包含所有指定的特色服务) | "风雨场,夜间照明" |

**营业时间筛选说明:**

- `openStartTimeBefore`: 筛选营业开始时间 ≤ 指定时间的场馆（适用于查找早开门的场馆）
- `openEndTimeAfter`: 筛选营业结束时间 ≥ 指定时间的场馆（适用于查找晚关门的场馆）
- 时间格式严格要求为 HH:mm（24小时制），如 "08:00", "22:30"
- 两个参数可以组合使用，例如：`openStartTimeBefore=08:00&openEndTimeAfter=22:00` 表示查找 8点前开门且 22点后关门的场馆

**特色服务筛选说明:**

- `features`: 根据场馆特色服务进行筛选，支持传入多个特色服务（用逗号分隔）
- 筛选逻辑：场馆必须包含**所有**指定的特色服务才会被返回（AND逻辑）
- 格式：多个特色用英文逗号分隔，如 `风雨场,夜间照明,教练服务`
- 常见特色服务包括：
  - "风雨场" - 室内或有遮挡的场地，不受天气影响
  - "夜间照明" - 支持夜间打球的照明设施
  - "器材租赁" - 提供球拍、网球等器材租赁服务
  - "教练服务" - 提供专业教练指导服务
  - "标准场地" - 符合国际标准的网球场地
  - "室内场地" - 完全室内的网球场地
  - "停车便利" - 提供充足的停车位
  - "淋浴设施" - 提供更衣和淋浴设施
  - "比赛场地" - 可承办正式比赛的专业场地
  - "专业场地" - 高标准的专业级场地

**筛选示例:**

1. 查找早上8点前开门的场馆：`?openStartTimeBefore=08:00`
2. 查找晚上10点后关门的场馆：`?openEndTimeAfter=22:00`
3. 查找早开晚关的场馆：`?openStartTimeBefore=08:00&openEndTimeAfter=22:00`
4. 组合城市和营业时间筛选：`?city=广州&openStartTimeBefore=07:00&openEndTimeAfter=21:00`
5. 查找有风雨场的场馆：`?features=风雨场`
6. 查找同时有风雨场和夜间照明的场馆：`?features=风雨场,夜间照明`
7. 查找室内场地且有教练服务的场馆：`?features=室内场地,教练服务`
8. 综合筛选（城市+特色+时间）：`?city=深圳&features=风雨场,夜间照明&openEndTimeAfter=21:00`

**响应示例:**

```json
{
  "code": 200,
  "message": "获取场馆列表成功",
  "data": {
    "data": [
      {
        "id": 6,
        "city": "广州",
        "name": "广州天河体育中心",
        "location": "天河区体育西路",
        "openStartTime": "08:00",
        "openEndTime": "20:00",
        "openTime": "08:00-20:00",
        "isOpen": true,
        "priceRange": "¥50-120/小时",
        "features": ["标准场地", "器材租赁", "教练服务"],
        "description": "专业网球场地，设施完善",
        "imageUrl": "https://example.com/venue.jpg",
        "bookingMethods": [
          {
            "type": "h5",
            "name": "在线预订",
            "icon": "internet",
            "color": "#4facfe",
            "url": "https://tianhe-sports.gov.cn"
          },
          {
            "type": "miniprogram",
            "name": "体育通",
            "icon": "app",
            "color": "#07c160",
            "appId": "wx1111111111",
            "path": "pages/venue/tennis"
          },
          {
            "type": "phone",
            "name": "服务热线",
            "icon": "call",
            "color": "#fa709a",
            "phone": "020-99999999"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "availableCities": ["广州", "深圳", "北京", "上海", "杭州", "成都"]
  }
}
```

### 2. 获取场馆详情

**接口地址:** `GET /tennis-analysis/venues/:id`

**接口描述:** 根据场馆ID获取详细信息

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 场馆ID |

**响应示例:**

```json
{
  "code": 200,
  "message": "获取场馆详情成功",
  "data": {
    "id": 6,
    "city": "广州",
    "name": "广州天河体育中心",
    "location": "天河区体育西路",
    "openTime": "08:00-20:00",
    "isOpen": true,
    "priceRange": "¥50-120/小时",
    "features": ["标准场地", "器材租赁", "教练服务"],
    "description": "专业网球场地，设施完善",
    "imageUrl": "https://example.com/venue.jpg",
    "bookingMethods": [
      {
        "type": "h5",
        "name": "在线预订",
        "icon": "internet",
        "color": "#4facfe",
        "url": "https://tianhe-sports.gov.cn"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 获取热门场馆

**接口地址:** `GET /tennis-analysis/venues/popular/list`

**接口描述:** 获取热门推荐的网球场馆列表

**查询参数:**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| limit | number | 否 | 限制数量，默认10 | 10 |

**响应示例:**

```json
{
  "code": 200,
  "message": "获取热门场馆成功",
  "data": [
    {
      "id": 6,
      "city": "广州",
      "name": "广州天河体育中心",
      "location": "天河区体育西路",
      "openTime": "08:00-20:00",
      "isOpen": true,
      "priceRange": "¥50-120/小时",
      "features": ["标准场地", "器材租赁", "教练服务"],
      "bookingMethods": [...]
    }
  ]
}
```

### 4. 搜索场馆

**接口地址:** `GET /tennis-analysis/venues/search/keyword`

**接口描述:** 根据关键词搜索网球场馆

**查询参数:**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| keyword | string | 是 | 搜索关键词 | "体育中心" |
| limit | number | 否 | 限制数量，默认20 | 20 |

**响应示例:**

```json
{
  "code": 200,
  "message": "搜索场馆成功",
  "data": [
    {
      "id": 6,
      "city": "广州",
      "name": "广州天河体育中心",
      "location": "天河区体育西路",
      "openTime": "08:00-20:00",
      "isOpen": true,
      "priceRange": "¥50-120/小时",
      "features": ["标准场地", "器材租赁", "教练服务"],
      "bookingMethods": [...]
    }
  ]
}
```

### 5. 获取可用城市列表

**接口地址:** `GET /tennis-analysis/venues/cities/available`

**接口描述:** 获取有场馆的城市列表

**响应示例:**

```json
{
  "code": 200,
  "message": "获取城市列表成功",
  "data": ["广州", "深圳", "北京", "上海", "杭州", "成都"]
}
```

## 预订方式类型说明

| 类型 | 说明 | 必需字段 |
|------|------|----------|
| h5 | H5网页预订 | url |
| miniprogram | 小程序预订 | appId, path |
| phone | 电话预订 | phone |
| app | APP预订 | url |
| offline | 线下预订 | 无 |

## 使用示例

### 前端调用示例

```javascript
// 获取广州地区支持H5预订的场馆
const response = await fetch('/tennis-analysis/venues?city=广州&bookingTypes[]=h5&page=1&limit=10');
const result = await response.json();

if (result.code === 200) {
  const venues = result.data.data;
  const totalPages = result.data.totalPages;
  const availableCities = result.data.availableCities;
  
  // 处理场馆列表
  venues.forEach(venue => {
    console.log(`场馆：${venue.name}`);
    console.log(`地址：${venue.location}`);
    console.log(`价格：${venue.priceRange}`);
    
    // 处理预订方式
    venue.bookingMethods.forEach(method => {
      switch (method.type) {
        case 'h5':
          console.log(`H5预订：${method.url}`);
          break;
        case 'miniprogram':
          console.log(`小程序预订：${method.appId}/${method.path}`);
          break;
        case 'phone':
          console.log(`电话预订：${method.phone}`);
          break;
      }
    });
  });
}
```

### 小程序调用示例

```javascript
// 在小程序中获取场馆列表
wx.request({
  url: 'https://your-api-domain.com/tennis-analysis/venues',
  method: 'GET',
  data: {
    city: '广州',
    bookingTypes: ['h5', 'miniprogram'],
    page: 1,
    limit: 10
  },
  success: (res) => {
    if (res.data.code === 200) {
      const venues = res.data.data.data;
      // 更新页面数据
      this.setData({
        venues: venues,
        totalPages: res.data.data.totalPages
      });
    }
  }
});
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 场馆不存在 |
| 500 | 服务器内部错误 |

## 注意事项

1. **分页限制**: 每页最多返回100条记录
2. **搜索性能**: 关键词搜索支持场馆名称、城市、地址、描述等字段
3. **缓存策略**: 城市列表和热门场馆建议客户端缓存，减少请求频率
4. **预订方式**: 不同预订方式需要的参数不同，请根据type字段判断
5. **排序规则**: 默认按sortOrder权重降序，再按创建时间降序排列
6. **数据更新**: 场馆信息和预订方式可能会定期更新，建议定期刷新数据 