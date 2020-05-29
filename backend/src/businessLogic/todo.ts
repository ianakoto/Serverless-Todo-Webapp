import {TodoAccess } from './../dataLayer/todoAccess';
import { getUserId } from '../auth/utils';
import { TodoItem } from '../models/TodoItem';
import {  APIGatewayProxyEvent } from 'aws-lambda';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import * as uuid from 'uuid';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';



const todoAccess= new TodoAccess()


export async function getUserTodos(event:APIGatewayProxyEvent): Promise<TodoItem[]> {

    const userId = getUserId(event)
    
    return todoAccess.getUserTodo(userId)
}


export async function createUserTodo(event:APIGatewayProxyEvent): Promise<TodoItem> {

    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const todoId = uuid.v4();
    const userId = getUserId(event);
    const createdAt= new Date().toISOString()
  
    const newTodoWithAdditionalInfo = {
        userId: userId,
        todoId: todoId,
        createdAt:createdAt,
        ...newTodo
    } as TodoItem

    return todoAccess.createUserTodo(newTodoWithAdditionalInfo)
}


export async function deleteUserTodo(event: APIGatewayProxyEvent) {
   
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event);
    return todoAccess.deleteUserTodo(userId,todoId)
}


export async function updateUserTodo(event: APIGatewayProxyEvent) {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event);


    return todoAccess.updateUserTodo(userId,todoId,updatedTodo)
}

export async function generateUserUploadUrl(event: APIGatewayProxyEvent) {
   
    const todoId = event.pathParameters.todoId
    const attachmentId = uuid.v4();
    const userId = getUserId(event);
  
   
   
    return todoAccess.generateUserUploadUrl(userId,todoId,attachmentId)
}