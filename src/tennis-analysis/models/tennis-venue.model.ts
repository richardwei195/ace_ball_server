import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';

@Table({
  tableName: 't_tennis_venues',
  underscored: true,
})
export class TennisVenue extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: '场馆名称',
  })
  declare name: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '所在城市',
  })
  declare city: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: false,
    comment: '场馆地址',
  })
  declare location: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '营业时间',
  })
  declare openTime: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '是否营业',
  })
  declare isOpen: boolean;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '价格区间',
  })
  declare priceRange: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    comment: '场馆特色服务',
  })
  declare features: string[];

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: '场馆描述',
  })
  declare description: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    comment: '场馆图片URL',
  })
  declare imageUrl: string;

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

  // 关联预订方式
  @HasMany(() => require('./tennis-venue-booking-method.model').TennisVenueBookingMethod)
  declare bookingMethods: any[];
} 