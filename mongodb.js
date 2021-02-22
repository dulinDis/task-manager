const {
    MongoClient,
    ObjectID
} = require('mongodb');

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

MongoClient.connect(connectionURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, (err, client) => {
    if (err) {
        return console.log('unable to conenct to the database', err);
    }
    const db = client.db(databaseName);


    // db.collection('users').updateOne({
    //     _id: new ObjectID("601fe2eaa6a85343f0eed0d9")
    // }, {
    //     $inc: {
    //         age: 1
    //     }
    // }).then((result) => {
    //     console.log(result);
    //     console.log(result.modifiedCount);
    // }).catch((error) => {
    //     console.log(error);
    // });



    // db.collection('tasks').updateMany({
    //     completed: false
    // }, {
    //     $set: {
    //         completed: true
    //     }
    // }).then((result)=>{
    //     console.log(result.modifiedCount);
    // }).catch(err=>{console.log(err);})



    // db.collection('users').deleteMany({
    //     age: {
    //         $gt: 25
    //     }
    // }).then(result => {
    //     console.log(result.deletedCount);
    // }).catch(err => console.log('error msg:', err));



    // db.collection('tasks').deleteOne({
    //     _id: new ObjectID("601fe77f6335a5662cd7223b")
    // }).then(result => {
    //     console.log(result.deletedCount);
    // }).catch(err => console.log('error msg:', err))

});