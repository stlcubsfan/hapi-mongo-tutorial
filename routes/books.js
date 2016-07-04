'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

exports.register = function register(server, options, next) {
  const db = server.app.db;

  server.route({
    method: 'GET',
    path: '/books',
    handler: function (req, rep) {
      db.books.find((err, docs) => {
        if (err) {
          return rep(Boom.wrap(err, 'Interal Mongo Err'));
        }
        rep(docs);
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/books/{id}',
    handler: function (req, rep) {
      db.books.findOne(
        {_id: req.params.id}, (err, doc) => {
          if (err) {
            return rep(Boom.wrap(err, 'Internal Mongo Error'));
          }
          if (!doc) {
            return rep(Boom.notFound());
          }

          rep(doc);
        }
      )
    }
  });

  server.route({
    method: 'POST',
    path: '/books',
    handler: function (req, rep) {
      console.log('Payload', req.payload);
      const book = req.payload;

      book._id = uuid.v1();

      db.books.save(book, (err, result) => {
        if (err) {
          return rep(Boom.wrap(err, 'Internal Mongo Error'));
        }

        rep(book);
      });
    }, config: {
      validate: {
        payload: {
          title: Joi.string().max(300).required(),
          author: Joi.string().min(2).max(100).required(),
          isbn: Joi.number()
        }
      }
    }
  });

  server.route({
    method: 'PATCH',
    path: '/books/{id}',
    handler: function (req, rep) {
      db.books.update(
        {_id: req.params.id},
        {$set: req.payload},
        function (err, result) {
          if (err) {
            return rep(Boom.wrap('Internal Mongo Error'));
          }

          if (result.n === 0) {
            return rep(Boom.notFound());
          }

          rep().code(204);
        }
      );
    }, config: {
      validate: {
        payload: Joi.object({
          title: Joi.string().max(300).optional(),
          author: Joi.string().max(50).optional(),
          isbn: Joi.number().optional()
        }).required().min(1)
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/books/{id}',
    handler: function (req, rep) {
      db.books.remove({
        _id: req.params.id
      }, function (err, results) {
        if (err) {
          return rep(Boom.wrap(err, 'Internal Mongo Error'));
        }

        if (results.n === 0) {
          return rep(Boom.notFound());
        }

        rep().code(204);
      });
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'routes-books'
};
