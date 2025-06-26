# 网球场馆预订API文档

## 概述

网球场馆预订API提供了完整的场馆信息查询功能，支持多种筛选条件和预订方式。用户可以根据城市、预订方式、营业状态等条件来查找合适的网球场馆。

## 数据库设计

### 场馆表 (t_tennis_venues)

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | INTEGER | 场馆ID（主键，自增） | 1 |
| name | VARCHAR(100) | 场馆名称 | "广州天河体育中心" |
| city | VARCHAR(50) | 所在城市（带索引） | "广州" |
| location | VARCHAR(200) | 场馆地址 | "天河区体育西路" |
| open_time | VARCHAR(50) | 营业时间 | "08:00-20:00" |
| is_open | BOOLEAN | 是否营业 | true |
| price_range | VARCHAR(50) | 价格区间 | "¥50-120/小时" |
| features | JSON | 场馆特色服务 | ["标准场地", "器材租赁"] |
| description | TEXT | 场馆描述 | "专业网球场地，设施完善" |
| image_url | VARCHAR(500) | 场馆图片URL | "https://example.com/venue.jpg" |
| sort_order | INTEGER | 排序权重 | 100 |
| created_at | DATETIME | 创建时间 | "2024-01-01 00:00:00" |
| updated_at | DATETIME | 更新时间 | "2024-01-01 00:00:00" |

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