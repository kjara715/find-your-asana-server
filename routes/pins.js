const express = require('express');
const ExpressError = require('../expressError');
const router = new express.Router();
const db = require('../db')

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM pins`);
        return res.json({pins: results.rows})
    } catch (e){
        return next(e)
    }
    

})

router.get('/:id', async (req, res, next) => {
    try {
    const results = await db.query(`SELECT * FROM pins WHERE username=$1`);
    if(results.rows.length ===0){
        throw new ExpressError(`Can't find pin with id of ${req.params.id}`, 404)
    }
    return res.json({pin: results.rows[0]})
    } catch(e) {
        return next(e)
    }
    
})

module.exports = router;

