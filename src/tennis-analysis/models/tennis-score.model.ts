import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 't_tennis_scores',
  underscored: true,
})
export class TennisScore extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '用户ID',
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '视频URL',
  })
  declare videoUrl: string;

  @Column({
    type: DataType.DECIMAL(3, 1),
    allowNull: false,
    comment: 'NTRP整体评分 (1.0-7.0)',
  })
  declare overallRating: number;

  @Column({
    type: DataType.DECIMAL(3, 1),
    allowNull: false,
    comment: '发球技术评分 (1-7)',
  })
  declare serveScore: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: '发球技术评分原因',
  })
  declare serveReason: string;

  @Column({
    type: DataType.DECIMAL(3, 1),
    allowNull: false,
    comment: '正手击球评分 (1-7)',
  })
  declare forehandScore: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: '正手击球评分原因',
  })
  declare forehandReason: string;

  @Column({
    type: DataType.DECIMAL(3, 1),
    allowNull: false,
    comment: '反手击球评分 (1-7)',
  })
  declare backhandScore: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: '反手击球评分原因',
  })
  declare backhandReason: string;

  @Column({
    type: DataType.DECIMAL(3, 1),
    allowNull: false,
    comment: '移动步伐评分 (1-7)',
  })
  declare movementScore: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: '移动步伐评分原因',
  })
  declare movementReason: string;

  @Column({
    type: DataType.DECIMAL(3, 1),
    allowNull: false,
    comment: '网前技术评分 (1-7)',
  })
  declare netPlayScore: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: '网前技术评分原因',
  })
  declare netPlayReason: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    comment: '改进建议列表',
  })
  declare improvements: string[];

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'AI分析原始响应',
  })
  declare rawResponse: string;

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