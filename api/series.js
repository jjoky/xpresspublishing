const express = require('express');
const sqlite3 = require('sqlite3');
const issuesRouter = require('./issues');

const seriesRouter = express.Router();
const db = new sqlite3.Database(
    process.env.TEST_DATABASE || './database.sqlite'
);

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(
        `SELECT * FROM Series WHERE Series.id = ${seriesId}`,
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

seriesRouter.use('/:seriesId/issues', issuesRouter); 

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

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.json({series: req.series});
});

seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if (!name || !description) {
        res.sendStatus(400);
    } else {
        db.run(
            `INSERT INTO Series (name, description) VALUES ($name, $description)`,
            {
                $name: name,
                $description: description
            },
            function(error) {
                if (error) {
                    next(error);
                } else {
                    db.get(
                        `SELECT * FROM Series WHERE Series.id = ${this.lastID}`,
                        (error, row) => {
                            if (error) {
                                next(error);
                            } else {
                                res.status(201).send({series: row});
                            }
                        }
                    );
                }
            }
        );
    }
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if (!name || !description) {
        res.sendStatus(400);
    } else {
        db.run(
            `UPDATE Series SET name = $name, description = $description WHERE Series.id = $id`,
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
                        `SELECT * FROM Series WHERE Series.id = ${req.params.seriesId}`,
                        (error, row) => {
                            if (error) {
                                next(error);
                            } else {
                                res.status(200).json({series: row});
                            }
                        }
                    );
                }
            }
        );
    }
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
    db.get(
        `SELECT * FROM Issue WHERE Issue.series_id = ${req.params.seriesId}`,
        (error, row) => {
            if (error) {
                next(error);
            } else if (row) {
                res.sendStatus(400);
            } else {
                db.run(
                    `DELETE FROM Series WHERE Series.id = ${req.params.seriesId}`,
                    (error) => {
                        if (error) {
                            next(error);
                        } else {
                            res.sendStatus(204);
                        }
                    }
                );
            }
        }
    );
});

module.exports = seriesRouter;