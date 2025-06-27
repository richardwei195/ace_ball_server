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
    type: DataType.INTEGER,
    allowNull: false,
    comment: '营业开始时间 (以分钟为单位，从00:00开始计算，如480表示08:00)',
  })
  declare openStartTime: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '营业结束时间 (以分钟为单位，从00:00开始计算，如1200表示20:00)',
  })
  declare openEndTime: number;

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

  // 虚拟字段：将分钟转换为 HH:mm 格式
  get openStartTimeFormatted(): string {
    const hours = Math.floor(this.openStartTime / 60);
    const minutes = this.openStartTime % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  get openEndTimeFormatted(): string {
    const hours = Math.floor(this.openEndTime / 60);
    const minutes = this.openEndTime % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // 向后兼容的虚拟字段
  get openTime(): string {
    return `${this.openStartTimeFormatted}-${this.openEndTimeFormatted}`;
  }

  // 静态方法：将 HH:mm 格式转换为分钟
  static timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // 静态方法：将分钟转换为 HH:mm 格式
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
} 