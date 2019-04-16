use admin
db.createUser(
  {
    user: "admin",
    pwd: "UevKCJHxcXcJ7BYA",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
  }
)