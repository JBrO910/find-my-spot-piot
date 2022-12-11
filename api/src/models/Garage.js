export default class Garage {
  id
  name
  address
  phoneNumber
  levelDescription
  openingHoursWorkdays
  openingHoursWeekend
  hourlyRate
  maxRate
  ensureUserBalance
  payOnExit

  constructor(
    name,
    address,
    phoneNumber,
    openingHoursWorkdays,
    openingHoursWeekend,
    hourlyRate,
    maxRate,
    ensureUserBalance,
    payOnExit,
    id,
    levelDescription,
  ) {
    this.id = id
    this.name = name
    this.address = address
    this.openingHoursWorkdays = openingHoursWorkdays
    this.openingHoursWeekend = openingHoursWeekend
    this.hourlyRate = hourlyRate
    this.maxRate = maxRate
    this.ensureUserBalance = ensureUserBalance
    this.payOnExit = payOnExit
    this.phoneNumber = phoneNumber
    this.levelDescription = levelDescription
  }

  get serialised() {
    const data = {
      name: this.name,
      address: this.address,
      phoneNumber: this.phoneNumber,
      hourlyRate: this.hourlyRate,
      maxRate: this.maxRate,
      ensureUserBalance: this.ensureUserBalance,
      payOnExit: this.payOnExit,
    }
    if (!!this.levelDescription) {
      data.levelDescription = this.levelDescription
    }
    if (!!this.openingHoursWorkdays) {
      data.openingHoursWorkdays = this.openingHoursWorkdays
    }
    if (!!this.openingHoursWeekend) {
      data.openingHoursWeekend = this.openingHoursWeekend
    }
    return data
  }

  static fromSerialized({
    id,
    name,
    address,
    openingHoursWorkdays,
    openingHoursWeekend,
    phoneNumber,
    hourlyRate,
    maxRate,
    ensureUserBalance,
    payOnExit,
    levelDescription,
  }) {
    return new Garage(
      name,
      address,
      phoneNumber,
      openingHoursWorkdays,
      openingHoursWeekend,
      hourlyRate,
      maxRate,
      ensureUserBalance,
      payOnExit,
      id,
      levelDescription,
    )
  }
}
