const express = require('express');
const sqlite3 = require('sqlite3');

const seriesRouter = express.Router();
const db = new sqlite3.Database(
    process.env.TEST_DATABASE || './database.sqlite'
);

seriesRouter.get('/', (req, res, next) => {
    db.all(
        `SELECT * FROM Series`,
        (error, rows) => {
            if (error) {
                next(error);
            } else {
                res.json({series: rows});
            }
        }
    );
});

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(
        `SELECT * FROM Series
        WHERE Series.id = ${seriesId}`,
        (error, row) => {
            if (error) {
                next(error);
            } else if (row) {
                req.series = row;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    );
});

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.json({series: req.series});
});

seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if (!name || !description) {
        res.sendStatus(400);
    }
    
    db.run(
        `INSERT INTO Series (name, description)
        VALUES ($name, $description)`,
        {
            $name: name,
            $description: description
        },
        function(error) {
            if (error) {
                next(error);
            }
            db.get(
                `SELECT * FROM Series
                WHERE Series.id = ${this.lastID}`,
                (error, row) => {
                    if (error) {
                        next(error);
                    } else {
                        res.status(201).send({series: row});
                    }
                }
            );
        }
    );
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if (!name || !description) {
        return res.sendStatus(400);
    } else {
        db.run(
            `UPDATE Series
            SET name = $name,
            description = $description
            WHERE id = $id`,
            {
                $name: name,
                $description: description,
                $id: req.params.seriesId
            },
            function(error) {
                if (error) {
                    next(error);
                } else {
                    db.get(
                        `SELECT * FROM Series
                        WHERE Series.id = ${req.params.seriesId}`,
                        (error, row) => {
                            if (error) {
                                next(error);
                            } else {
                                res.send({series: row});
                            }
                        }
                    );
                }
            }
        );
    }
});



module.exports = seriesRouter;