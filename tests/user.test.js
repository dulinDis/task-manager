const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const {
    userOne,
    userOneId,
    setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
    const response = await request(app).post('/users')
        .send({
            name: 'Paulina Okulska',
            email: 'paulinao@example.com',
            password: 'MyPass777!'
        })
        .expect(201);
    //assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    //assertions about the response (body)
    expect(response.body).toMatchObject({
        user: {
            name: 'Paulina Okulska',
            email: 'paulinao@example.com'
        },
        token: user.tokens[0].token
    });
    //assert that plain text password is nto saved in the database
    expect(user.password).not.toBe('MyPass777!')

});

test('Should not signup an already existing user', async () => {
    const response = await request(app).post('/users')
        .send({
            name: userOne.name,
            email: userOne.email,
            password: userOne.password
        })
        .expect(400);
});

test('Should not signup user with invalid password', async () => {
    const response = await request(app).post('/users')
        .send({
            name: 'Paulina Okulska',
            email: 'paulinao@example.com',
            password: 'password123'
        })
        .expect(400);
});

test('Should login an existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    const user = await User.findById(userOneId);
    // expect(user.tokens[0].token).not.toBeNull()
    // we check tehs econd token because whew e create him it has already one token
    expect(response.body.token).toBe(user.tokens[1].token)
});

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'idontexist@example.com',
        password: 'idontexist123!!!'
    }).expect(400)
});

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
});

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
});

test('Should delete account for user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user).toBeNull()
});

test('Should not delete account for unauthentificated  user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
});

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer))
});

test('Should update valid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Lucy'
        })
        .expect(200);
    const user = await User.findById(userOneId);
    expect(user.name).toEqual('Lucy')
});

test('Should not update invalid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Krakow'
        })
        .expect(400);
});

test('Should not update user fields  if user unauthenticated'  , async () => {
    const response = await request(app)
        .patch('/users/me')
        .send({
            password:'ichangedyourpassword123haha!'
        })
        .expect(401);
});
