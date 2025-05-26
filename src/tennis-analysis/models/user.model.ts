import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { TennisScore } from './tennis-score.model';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}


@Table({
  tableName: 't_tennis_users',
  underscored: true,
})
export class User extends Model {
  @Column({
    type: DataType.STRING,
    unique: true,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare avatar: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '性别',
  })
  declare gender: Gender;

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

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare lastLoginAt: Date;

  // 微信相关字段
  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
    comment: '微信openid',
  })
  declare openid: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '微信unionid',
  })
  declare unionid: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '微信会话密钥',
  })
  declare sessionKey: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '用户所在城市',
  })
  declare city: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '用户所在省份',
  })
  declare province: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '用户所在国家',
  })
  declare country: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '用户语言',
  })
  declare language: string;

  // 关联评分记录
  @HasMany(() => TennisScore)
  declare tennisScores: TennisScore[];

  declare isNew?: boolean;
}
