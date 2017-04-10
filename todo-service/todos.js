'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  const createTodo = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      text: data.text,
      checked: false,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  };
  dynamoDB.put(createTodo, (err) => {
    if(err){
      console.error(err);
      callback(err);
      return;
    }
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Todo Item was successfully save into DB!!!',
        input: event
      })
    };

    callback(null, response);
  });

};
module.exports.list = (event, context, callback) => {
  const getAllTodos = {
    TableName: process.env.DYNAMODB_TABLE
  };
  dynamoDB.scan(getAllTodos, (err, data) => {
    if(err){
      console.error(err);
      callback(err);
      return;
    }
    const response = {
      statusCode: 200,
      body: JSON.stringify(data.Items)
    };
    callback(null, response);
  });
};

module.exports.get = (event, context, callback) => {
  const getTodoById = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id
    }
  };
  dynamoDB.get(getTodoById, (err, data) => {
    if(err){
      console.error(err);
      callback(err);
      return;
    }
    const response = {
      statusCode: 200,
      body: JSON.stringify(data.Item)
    };
    callback(null, response);
  });
};
module.exports.delete = (event, context, callback) => {
  const deleteTodo = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id
    }
  };
  dynamoDB.delete(deleteTodo, (err) => {
    if(err){
      console.error(err);
      callback(err);
      return;
    }
    const response = {
      statusCode: 200,
      body: JSON.stringify({})
    };
    callback(null, response);
  });
};

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  const updateTodo = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeNames: {
      '#todo_text': 'text',
    },
    ExpressionAttributeValues: {
      ':text': data.text,
      ':checked': data.checked,
      ':updatedAt': timestamp,
    },
    UpdateExpression: 'SET #todo_text = :text, checked = :checked, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW',
  };
  dynamoDB.update(deleteTodo, (err, result) => {
    if(err){
      console.error(err);
      callback(err);
      return;
    }
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};
