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
  gates

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
    gates,
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
    this.gates = gates ?? []
    this.phoneNumber = phoneNumber
    this.levelDescription = levelDescription
  }

  addGate(gate) {
    this.gates.push(gate)
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
      gates: this.gates,
    }
    if (!!this.levelDescription) {
      data.levelDescription = this.levelDescription
    }
    if (!!this.id) {
      data.id = this.id
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
    gates,
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
      gates,
      id,
      levelDescription,
    )
  }
}
