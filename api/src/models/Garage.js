export default class Garage {
  id
  name
  address
  phoneNumber

  constructor(name, address, phoneNumber, id) {
    this.id = id
    this.name = name
    this.address = address
    this.phoneNumber = phoneNumber
  }

  get serialised() {
    return {
      name: this.name,
      address: this.address,
      phoneNumber: this.phoneNumber,
    }
  }

  static fromSerialized({ id, name, address, phoneNumber }) {
    return new Garage(name, address, phoneNumber, id)
  }
}
