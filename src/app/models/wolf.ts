import {Gender} from './gender.enum';

export class Wolf{
  public id: number;
  public name: string;
  public gender: Gender;
  public birthday: Date;
  public createdAt: Date;
  public updatedAt: Date;


  constructor(id: number, name: string, gender: Gender, birthday: Date, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.name = name;
    this.gender = gender;
    this.birthday = birthday;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
