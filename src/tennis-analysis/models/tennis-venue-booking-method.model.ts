import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { TennisVenue } from './tennis-venue.model';

export enum BookingMethodType {
  H5 = 'h5',
  MINIPROGRAM = 'miniprogram',
  PHONE = 'phone',
  APP = 'app',
  OFFLINE = 'offline',
}

@Table({
  tableName: 't_tennis_venue_booking_methods',
  underscored: true,
})
export class TennisVenueBookingMethod extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => TennisVenue)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '场馆ID',
  })
  declare venueId: number;

  @BelongsTo(() => TennisVenue)
  declare venue: TennisVenue;

  @Column({
    type: DataType.ENUM(...Object.values(BookingMethodType)),
    allowNull: false,
    comment: '预订方式类型',
  })
  declare type: BookingMethodType;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '预订方式名称',
  })
  declare name: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '图标名称',
  })
  declare icon: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    comment: '主题颜色',
  })
  declare color: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    comment: 'H5链接或APP下载链接',
  })
  declare url: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: '小程序AppID',
  })
  declare appId: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    comment: '小程序页面路径',
  })
  declare path: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    comment: '联系电话',
  })
  declare phone: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '是否启用',
  })
  declare isEnabled: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序权重',
  })
  declare sortOrder: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare updatedAt: Date;
} 