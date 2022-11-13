export default class User {
  id
  username
  password
  isAdmin

  constructor(username, password, isAdmin=false, id) {
    this.id = id
    this.username = username
    this.password = password
    this.isAdmin = isAdmin
  }

  get serialised() {
    return {
      id: this.id,
      username: this.username,
      password: this.password,
      isAdmin: this.isAdmin,
    }
  }

  static fromSerialized({username, password, isAdmin=false, id}) {
    return new User(username, password, isAdmin, id)
  }
}
