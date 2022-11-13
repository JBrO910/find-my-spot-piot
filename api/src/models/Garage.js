export default class Garage {
  id
  name
  address
  phoneNumber
  levelDescription

  constructor(name, address, phoneNumber, id, levelDescription) {
    this.id = id
    this.name = name
    this.address = address
    this.phoneNumber = phoneNumber
    this.levelDescription = levelDescription
  }

  get serialised() {
    return {
      name: this.name,
      address: this.address,
      phoneNumber: this.phoneNumber,
    }
  }

  static fromSerialized({ id, name, address, phoneNumber, levelDescription }) {
    return new Garage(name, address, phoneNumber, id, levelDescription)
  }
}
