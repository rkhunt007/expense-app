const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Income = require('../../models/Income');
const moment = require('moment');

// @route   POST api/income
// @desc    Create income
// @access  Private
router.post("/", [
    auth,
    [
        check("amount", "Amount is required").not().isEmpty(),
        check("category", "Category is required").not().isEmpty(),
        check("date", "Date is required").not().isEmpty()
    ]
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const newIncome = new Income({
            amount: req.body.amount,
            user: req.user.id,
            category: req.body.category,
            date: req.body.date
        });

        const income = await newIncome.save();
        res.json(income);

    } catch (error) {
        res.status(500).json('Server Error');
    }
});

// @route   GET api/income
// @desc    get all income
// @access  private
router.get("/", auth, async (req, res) => {
    try {
        let incomes;
        let date = req.query.date;
        if (date) {
            const startOfMonth = moment(date).clone().startOf('month');
            const endOfMonth = moment(date).clone().endOf('month');
            incomes = await Income.find({
                user: req.user.id,
                date: {
                    $gte: startOfMonth,
                    $lt: endOfMonth
                }
            });
        } else {
            incomes = await Income.find({ user: req.user.id });
        }
        let totalIncome = 0;
        incomes.forEach(income => {
            totalIncome += income.amount;
        });
        const data = {
            incomes,
            total: {
                income: totalIncome
            }
        }
        res.json(data);
    } catch (error) {
        res.status(500).send("Server error");
    }
});

// @route   PUT api/income/
// @desc    income
// @access  private
router.put("/:id", [
    auth,
    [
        check("amount", "Amount is required").not().isEmpty(),
        check("category", "Category is required").not().isEmpty(),
        check("date", "Date is required").not().isEmpty()
    ]
], async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const income = await Income.findById(req.params.id);

        if (!income) {
            return res.status(404).send({ msg: 'Income not found' });
        }

        if (income.user.toString() !== req.user.id) {
            return res.status(401).send({ msg: 'User not authorized' });
        }

        income.amount = req.body.amount;
        income.category = req.body.category;
        income.date = req.body.date;

        await income.save();

        res.json(income);

    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).send({ msg: 'Income not found' });
        }
        res.status(500).send("Server error");
    }
});

// @route   DELETE api/income/:id
// @desc    delete income
// @access  private
router.delete("/:id", auth, async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);

        if (!income) {
            return res.status(404).send({ msg: 'Income not found' });
        }

        if (income.user.toString() !== req.user.id) {
            return res.status(401).send({ msg: 'User not authorized' });
        }

        await income.remove();
        res.json({ msg: "Income removed" });

    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).send({ msg: 'Income not found' });
        }
        res.status(500).send("Server error");
    }
});

module.exports = router;
