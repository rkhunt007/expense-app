const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Expense = require('../../models/Expense');
const moment = require('moment');

// @route   POST api/expense
// @desc    Create expense
// @access  Private
router.post("/", [
    auth,
    [
        check("amount", "Amount is required").not().isEmpty(),
        check("type", "Type is required").not().isEmpty(),
        check("category", "Category is required").not().isEmpty(),
        check("description", "Description is required").not().isEmpty(),
        check("date", "Date is required").not().isEmpty()
    ]
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const newExpense = new Expense({
            amount: req.body.amount,
            type: req.body.type,
            user: req.user.id,
            category: req.body.category,
            description: req.body.description,
            date: req.body.date
        });

        const expense = await newExpense.save();
        res.json(expense);

    } catch (error) {
        console.log(error.message);
        res.status(500).json('Server Error');
    }
});

// @route   GET api/expense
// @desc    get all expense
// @access  private
router.get("/", auth, async (req, res) => {
    try {
        let expenses;
        let date = req.query.date;
        if (date) {
            const startOfMonth = moment(date).clone().startOf('month')
            const endOfMonth = moment(date).clone().endOf('month')

            expenses = await Expense.find({
                user: req.user.id,
                date: {
                    $gte: startOfMonth,
                    $lt: endOfMonth
                }
            });
        } else {
            expenses = await Expense.find({ user: req.user.id });
        }
        let onCredit = 0, upFront = 0
        expenses.forEach(expense => {
            if (expense.type === 1) {
                onCredit += expense.amount;
            } else if (expense.type === 2) {
                upFront += expense.amount;
            }
        });
        const data = {
            expenses,
            total: {
                onCredit,
                upFront
            }
        }
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

// @route   PUT api/expense/
// @desc    expense
// @access  private
router.put("/:id", [
    auth,
    [
        check("amount", "Amount is required").not().isEmpty(),
        check("type", "Type is required").not().isEmpty(),
        check("category", "Category is required").not().isEmpty(),
        check("description", "Description is required").not().isEmpty(),
        check("date", "Date is required").not().isEmpty()
    ]
], async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).send({ msg: 'Expense not found' });
        }

        if (expense.user.toString() !== req.user.id) {
            return res.status(401).send({ msg: 'User not authorized' });
        }

        expense.amount = req.body.amount;
        expense.type = req.body.type;
        expense.category = req.body.category;
        expense.description = req.body.description;
        expense.date = req.body.date;

        await expense.save();

        res.json(expense);

    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).send({ msg: 'Expense not found' });
        }
        res.status(500).send("Server error");
    }
});

// @route   DELETE api/expense/:id
// @desc    delete expense
// @access  private
router.delete("/:id", auth, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).send({ msg: 'Expense not found' });
        }

        if (expense.user.toString() !== req.user.id) {
            return res.status(401).send({ msg: 'User not authorized' });
        }

        // delete user
        await expense.remove();
        res.json({ msg: "Expense removed" });

    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).send({ msg: 'Expense not found' });
        }
        res.status(500).send("Server error");
    }
});

module.exports = router;
