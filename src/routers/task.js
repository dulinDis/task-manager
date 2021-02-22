const express = require('express');
const Task = require('../models/task');
const User = require('../models/user');

const auth = require('../middleware/authentication');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        //this will copy ll properties form body to this object, later we are adding on the owner property and set ti to authentificated user
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e)
    }
});

//get tasks GET /tasks?completed=false
// get /tasks?limit=10&skip=10
//GET tasks/sortBy=createdAt_asc desc   creaed:asc field and order
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};
    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    };
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send('error:', e)
    };
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    if (_id.length < 24) {
        return res.status(404).send();
    };

    try {
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404).send();
        };
        res.send(task)

    } catch (e) {
        res.status(500).send({
            error: e
        });
    }

});

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(404).send({
            error: 'the parameter you try to modify does not exist or you dont have persmision to alter it'
        })
    };

    if (req.params.id.length < 24) {
        return res.status(404).send({
            error: 'the id is incorrect'
        })
    };

    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404).send({
                error: "no task found"
            });
        };

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();

        res.send(task);

    } catch (e) {
        res.status(400).send(e)
    };
})

router.delete('/tasks/:id', auth, async (req, res) => {
    if (req.params.id.length < 24) {
        return res.status(400).send({
            error: "incorrect id number"
        })
    };

    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404).send({
                error: "no task matching the criteria found"
            })
        };
        res.status(200).send(task);
    } catch (e) {
        return res.status(500).send(e)
    }
})

module.exports = router;