export default class ParkingSession {
    id
    userId
    garageId

    startTime
    endTime

    hourlyRate
    maxRate
    totalCost

    status

    constructor(userId, garageId, hourlyRate, maxRate, startTime=new Date().getTime(), endTime, status, totalCost, id) {
        this.userId = userId
        this.garageId = garageId
        this.startTime = startTime
        this.endTime = endTime
        this.hourlyRate = hourlyRate
        this.maxRate = maxRate
        this.totalCost = totalCost
        this.status = status ?? !this.endTime ? "open" : "unpaid"
        this.id = id
    }

    calculateTotalCost() {
        const timeElapsed = this.endTime - this.startTime
        const hoursElapsed = timeElapsed / 1000 / 60 / 60
        const totalCost = hoursElapsed * this.hourlyRate
        return totalCost > this.maxRate ? this.maxRate : totalCost
    }

    closeSession() {
        this.endTime = new Date().getTime()
        this.totalCost = this.calculateTotalCost()
        this.status = "unpaid"
    }

    pay() {
        this.status = "closed"
    }

    get serialised() {
        const data = { ...this }
        if(!data.id) delete data.id
        return data
    }

    static fromSerialized({endTime, hourlyRate, status, maxRate, startTime, totalCost, userId, garageId, id}) {
        return new ParkingSession(
            userId,
            garageId,
            startTime,
            endTime,
            hourlyRate,
            maxRate,
            totalCost,
            status,
            id,
        )
    }
}
