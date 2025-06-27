import { TennisVenue } from '../models/tennis-venue.model';
import { TennisVenueBookingMethod, BookingMethodType } from '../models/tennis-venue-booking-method.model';

export const tennisVenueSeeds = [
  {
    id: 1,
    name: '广州天河体育中心',
    city: '广州',
    location: '天河区体育西路',
    openStartTime: 480, // 08:00 = 8*60 = 480分钟
    openEndTime: 1200,  // 20:00 = 20*60 = 1200分钟
    isOpen: true,
    priceRange: '¥50-120/小时',
    features: ['标准场地', '器材租赁', '教练服务'],
    description: '广州天河体育中心网球场，设施完善，环境优美，是广州市内知名的网球运动场所。',
    imageUrl: 'https://example.com/images/venues/tianhe-sports.jpg',
    sortOrder: 100,
    bookingMethods: [
      {
        type: BookingMethodType.H5,
        name: '在线预订',
        icon: 'internet',
        color: '#4facfe',
        url: 'https://tianhe-sports.gov.cn',
        isEnabled: true,
        sortOrder: 1,
      },
      {
        type: BookingMethodType.MINIPROGRAM,
        name: '体育通',
        icon: 'app',
        color: '#07c160',
        appId: 'wx1111111111',
        path: 'pages/venue/tennis',
        isEnabled: true,
        sortOrder: 2,
      },
      {
        type: BookingMethodType.PHONE,
        name: '服务热线',
        icon: 'call',
        color: '#fa709a',
        phone: '020-99999999',
        isEnabled: true,
        sortOrder: 3,
      }
    ]
  },
  {
    id: 2,
    name: '深圳湾体育中心',
    city: '深圳',
    location: '南山区深圳湾体育中心',
    openStartTime: 360,  // 06:00 = 6*60 = 360分钟
    openEndTime: 1320,   // 22:00 = 22*60 = 1320分钟
    isOpen: true,
    priceRange: '¥80-200/小时',
    features: ['专业场地', '夜间照明', '停车便利', '教练服务'],
    description: '深圳湾体育中心网球场，拥有多片标准网球场地，设施一流，交通便利。',
    imageUrl: 'https://example.com/images/venues/shenzhen-bay.jpg',
    sortOrder: 95,
    bookingMethods: [
      {
        type: BookingMethodType.H5,
        name: '官方预订',
        icon: 'internet',
        color: '#4facfe',
        url: 'https://szb-sports.com',
        isEnabled: true,
        sortOrder: 1,
      },
      {
        type: BookingMethodType.MINIPROGRAM,
        name: '深圳体育',
        icon: 'app',
        color: '#07c160',
        appId: 'wx2222222222',
        path: 'pages/booking/tennis',
        isEnabled: true,
        sortOrder: 2,
      },
      {
        type: BookingMethodType.PHONE,
        name: '预订热线',
        icon: 'call',
        color: '#fa709a',
        phone: '0755-88888888',
        isEnabled: true,
        sortOrder: 3,
      }
    ]
  },
  {
    id: 3,
    name: '北京朝阳公园网球中心',
    city: '北京',
    location: '朝阳区朝阳公园南路8号',
    openStartTime: 420,  // 07:00 = 7*60 = 420分钟
    openEndTime: 1260,   // 21:00 = 21*60 = 1260分钟
    isOpen: true,
    priceRange: '¥60-150/小时',
    features: ['标准场地', '器材租赁', '教练培训', '比赛场地'],
    description: '北京朝阳公园网球中心，环境优美，设施专业，是北京市内热门的网球运动场所。',
    imageUrl: 'https://example.com/images/venues/chaoyang-park.jpg',
    sortOrder: 90,
    bookingMethods: [
      {
        type: BookingMethodType.H5,
        name: '在线预订',
        icon: 'internet',
        color: '#4facfe',
        url: 'https://chaoyang-tennis.com',
        isEnabled: true,
        sortOrder: 1,
      },
      {
        type: BookingMethodType.PHONE,
        name: '预订电话',
        icon: 'call',
        color: '#fa709a',
        phone: '010-77777777',
        isEnabled: true,
        sortOrder: 2,
      },
      {
        type: BookingMethodType.OFFLINE,
        name: '现场预订',
        icon: 'location',
        color: '#ff6b6b',
        isEnabled: true,
        sortOrder: 3,
      }
    ]
  },
  {
    id: 4,
    name: '上海徐家汇体育公园',
    city: '上海',
    location: '徐汇区漕溪北路1111号',
    openStartTime: 390,  // 06:30 = 6*60+30 = 390分钟
    openEndTime: 1290,   // 21:30 = 21*60+30 = 1290分钟
    isOpen: true,
    priceRange: '¥70-180/小时',
    features: ['标准场地', '夜间照明', '器材租赁', '教练服务', '淋浴设施'],
    description: '上海徐家汇体育公园网球场，地理位置优越，设施完善，是上海市内知名的网球运动场所。',
    imageUrl: 'https://example.com/images/venues/xujiahui-sports.jpg',
    sortOrder: 85,
    bookingMethods: [
      {
        type: BookingMethodType.H5,
        name: '官方预订',
        icon: 'internet',
        color: '#4facfe',
        url: 'https://xjh-sports.com',
        isEnabled: true,
        sortOrder: 1,
      },
      {
        type: BookingMethodType.MINIPROGRAM,
        name: '运动上海',
        icon: 'app',
        color: '#07c160',
        appId: 'wx3333333333',
        path: 'pages/venue/tennis',
        isEnabled: true,
        sortOrder: 2,
      },
      {
        type: BookingMethodType.PHONE,
        name: '客服热线',
        icon: 'call',
        color: '#fa709a',
        phone: '021-66666666',
        isEnabled: true,
        sortOrder: 3,
      }
    ]
  },
  {
    id: 5,
    name: '杭州黄龙体育中心',
    city: '杭州',
    location: '西湖区曙光路黄龙体育中心',
    openStartTime: 480,  // 08:00 = 8*60 = 480分钟
    openEndTime: 1200,   // 20:00 = 20*60 = 1200分钟
    isOpen: true,
    priceRange: '¥45-100/小时',
    features: ['标准场地', '器材租赁', '教练服务', '停车便利'],
    description: '杭州黄龙体育中心网球场，历史悠久，设施完善，是杭州市内的经典网球场地。',
    imageUrl: 'https://example.com/images/venues/huanglong-sports.jpg',
    sortOrder: 80,
    bookingMethods: [
      {
        type: BookingMethodType.H5,
        name: '在线预订',
        icon: 'internet',
        color: '#4facfe',
        url: 'https://huanglong-sports.com',
        isEnabled: true,
        sortOrder: 1,
      },
      {
        type: BookingMethodType.PHONE,
        name: '预订电话',
        icon: 'call',
        color: '#fa709a',
        phone: '0571-55555555',
        isEnabled: true,
        sortOrder: 2,
      }
    ]
  },
  {
    id: 6,
    name: '成都猛追湾游泳场网球中心',
    city: '成都',
    location: '成华区猛追湾街168号',
    openStartTime: 540,  // 09:00 = 9*60 = 540分钟
    openEndTime: 1260,   // 21:00 = 21*60 = 1260分钟
    isOpen: true,
    priceRange: '¥40-90/小时',
    features: ['标准场地', '器材租赁', '教练服务'],
    description: '成都猛追湾游泳场网球中心，环境舒适，价格实惠，是成都市内受欢迎的网球场地。',
    imageUrl: 'https://example.com/images/venues/mengzhuiwan-tennis.jpg',
    sortOrder: 75,
    bookingMethods: [
      {
        type: BookingMethodType.PHONE,
        name: '预订电话',
        icon: 'call',
        color: '#fa709a',
        phone: '028-44444444',
        isEnabled: true,
        sortOrder: 1,
      },
      {
        type: BookingMethodType.OFFLINE,
        name: '现场预订',
        icon: 'location',
        color: '#ff6b6b',
        isEnabled: true,
        sortOrder: 2,
      }
    ]
  }
];

export async function seedTennisVenues() {
  try {
    console.log('开始创建网球场馆种子数据...');

    for (const venueData of tennisVenueSeeds) {
      const { bookingMethods, ...venueInfo } = venueData;

      // 创建或更新场馆
      const [venue, created] = await TennisVenue.findOrCreate({
        where: { id: venueInfo.id },
        defaults: venueInfo,
      });

      if (!created) {
        await venue.update(venueInfo);
      }

      // 创建预订方式
      for (const methodData of bookingMethods) {
        await TennisVenueBookingMethod.findOrCreate({
          where: {
            venueId: venue.id,
            type: methodData.type,
          },
          defaults: {
            ...methodData,
            venueId: venue.id,
          },
        });
      }

      console.log(`场馆 "${venue.name}" 创建/更新成功`);
    }

    console.log('网球场馆种子数据创建完成！');
  } catch (error) {
    console.error('创建种子数据失败:', error);
    throw error;
  }
} 