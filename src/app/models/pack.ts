export class Pack{
  public id: number;
  public name: string;
  public latitude: number;
  public longitude: number;
  public createdAt: Date;
  public updatedAt: Date;


  constructor(id: number, name: string, lat: number, lng: number, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.name = name;
    this.latitude = lat;
    this.longitude = lng;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
