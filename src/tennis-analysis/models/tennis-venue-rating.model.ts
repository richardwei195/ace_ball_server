import { Column, Model, Table, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { TennisVenue } from './tennis-venue.model';
import { User } from './user.model';

@Table({
  tableName: 't_tennis_venue_ratings',
  underscored: true,
})
export class TennisVenueRating extends Model {
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '用户ID',
  })
  declare userId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '评分 (1-5分)',
    validate: {
      min: 1,
      max: 5,
    },
  })
  declare rating: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: '评价描述',
  })
  declare description: string;

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

  // 关联场馆
  @BelongsTo(() => TennisVenue)
  declare venue: TennisVenue;

  // 关联用户
  @BelongsTo(() => User)
  declare user: User;
} 