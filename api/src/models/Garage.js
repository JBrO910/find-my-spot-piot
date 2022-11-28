export default class Garage {
  id
  name
  address
  phoneNumber
  levelDescription
  payRate
  hasToPayOnce

  constructor(name, address, phoneNumber, id, levelDescription) {
    this.id = id
    this.name = name
    this.address = address
    this.phoneNumber = phoneNumber
    this.levelDescription = levelDescription
  }

  get serialised() {
    const data = {
      name: this.name,
      address: this.address,
      phoneNumber: this.phoneNumber,
    }
    if(!!this.levelDescription) {
      data.levelDescription = this.levelDescription
    }
    return data
  }

  static fromSerialized({ id, name, address, phoneNumber, levelDescription }) {
    return new Garage(name, address, phoneNumber, id, levelDescription)
  }
}
