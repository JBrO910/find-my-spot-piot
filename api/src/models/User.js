export default class User {
  id
  username
  password
  isAdmin
  cardID
  balance

  constructor(username, password, isAdmin=false, cardID='no-card', balance=0, id) {
    this.id = id
    this.username = username
    this.password = password
    this.isAdmin = isAdmin
    this.cardID = cardID
    this.balance = balance
  }

  get me() {
    return {
        id: this.id,
        username: this.username,
        isAdmin: this.isAdmin,
        cardID: this.cardID,
        balance: this.balance,
    }
  }

  get serialised() {
    return {
      username: this.username,
      password: this.password,
      isAdmin: this.isAdmin,
      cardID: this.cardID,
      balance: this.balance,
    }
  }

  static fromSerialized({username, password, isAdmin=false, cardID='no-card', balance=0, id}) {
    return new User(username, password, isAdmin, cardID, balance, id)
  }
}
