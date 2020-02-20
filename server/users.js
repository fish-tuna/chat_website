const users = []

const addUser = (id) => {
    const user = id
    users.push(user)
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => users.find((user) => user.id === id)

/* const getUsersInRoom = (room) => users.filter((user) => user.room === room) 1 hour mark of video */

module.exports = { addUser, removeUser, getUser }