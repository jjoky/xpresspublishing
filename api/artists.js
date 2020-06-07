const express = require('express');
const sqlite3 = require('sqlite3');

const artistsRouter = express.Router();
const db = new sqlite3.Database(
    process.env.TEST_DATABASE || './database.sqlite'
);

artistsRouter.get('/', (req, res, next) => {
    db.all(
        `SELECT * FROM Artist
        WHERE is_currently_employed = 1`,
        (error, rows) => {
            if (error) {
                next(error);
            } else {
                res.status(200).json({artists: rows})
            }
        }
    );
});

artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get(
        `SELECT * FROM Artist
        WHERE Artist.id = $artistId`,
        {$artistId: artistId},
        (error, row) => {
            if (error) {
                next(error);
            } else if (row) {
                req.artist = row;
                next();
            } else {
                res.status(404).send();
            }
        }
    );
});

artistsRouter.get('/:artistId', (req, res, next) => {
    res.json({artist: req.artist});
});

artistsRouter.post('/', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;

    if (!name || !dateOfBirth || !biography) {
        res.sendStatus(400);
    }
    
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

    db.run(
        `INSERT INTO Artist (
            name,
            date_of_birth,
            biography,
            is_currently_employed
        )
        VALUES (
            $name,
            $dateOfBirth,
            $biography,
            $isCurrentlyEmployed
        )`,
        {
            $name: name,
            $dateOfBirth: dateOfBirth,
            $biography: biography,
            $isCurrentlyEmployed: isCurrentlyEmployed
        },
        function(error) {
            if (error) {
                next(error);
            }
            db.get(
                `SELECT * FROM Artist
                WHERE id = ${this.lastID}`,
                (error, row) => {
                    if (error) {
                        next(error);
                    } else {
                        res.status(201).json({artist: row});
                    }
                }
            )
        }
    );

    artistsRouter.put('/:artistId', (req, res, next) => {
        const name = req.body.artist.name;
        const dateOfBirth = req.body.artist.dateOfBirth;
        const biography = req.body.artist.biography;
        const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed;

        if (!name || !dateOfBirth || !biography || !isCurrentlyEmployed) {
            res.sendStatus(400);
        }

        db.run(
            `UPDATE Artist
            SET name = $name,
            date_of_birth = $dateOfBirth,
            biography = $biography,
            is_currently_employed = $isCurrentlyEmployed
            WHERE Artist.id = $artistId`,
            {
                $name: name,
                $dateOfBirth: dateOfBirth,
                $biography: biography,
                $isCurrentlyEmployed: isCurrentlyEmployed,
                $artistId: req.params.artistId
            },
            (error) => {
                if (error) {
                    next(error);
                } else {
                    db.get(
                        `SELECT * FROM Artist
                        WHERE Artist.id = ${req.params.artistId}`,
                        (error, row) => {
                            res.json({artist: row});
                        }
                    )
                }
            }
        );
    });

    artistsRouter.delete('/:artistId', (req, res, next) => {
        db.run(
            `UPDATE Artist
            SET is_currently_employed = 0
            WHERE Artist.id = ${req.params.artistId}`,
            (error) => {
                if (error) {
                    next(error);
                } else {
                    db.get(
                        `SELECT * FROM Artist
                        WHERE Artist.id = ${req.params.artistId}`,
                        (error, row) => {
                            res.json({artist: row});
                        }
                    )
                }
            }
            
        )
    })
})

module.exports = artistsRouter;