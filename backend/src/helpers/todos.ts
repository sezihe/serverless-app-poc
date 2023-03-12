import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {  
    return await todosAccess.getTodoItems(userId)
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4()

    const newItem: TodoItem = {
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: null,
        ...createTodoRequest
    }

    await todosAccess.createTodoItem(newItem)

    return newItem
}

export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest) {  
    const item = await todosAccess.getTodoItem(todoId, userId)

    if (item.userId !== userId)
        throw new Error('User is not authorized to update item');

    if (!item)
        throw new Error('Item not found')

    todosAccess.updateTodoItem(todoId, updateTodoRequest, userId);
}

export async function deleteTodo(userId: string, todoId: string) {  
    const item = await todosAccess.getTodoItem(todoId, userId)

    if (item.userId !== userId)
        throw new Error('User is not authorized to delete item')

    if (!item)
        throw new Error('Item not found')

    todosAccess.deleteTodoItem(todoId, userId)
}

export async function updateTodoAttachmentUrl(userId: string, todoId: string, attachmentId: string) { 
    const attachmentUrl = await attachmentUtils.getAttachmentUrl(attachmentId)

    const item = await todosAccess.getTodoItem(todoId, userId)

    if (item.userId !== userId)
        throw new Error('User is not authorized to update item')

    if (!item)
        throw new Error('Item not found')

    await todosAccess.updateAttachmentUrl(todoId, attachmentUrl, userId)
}

export async function createAttachmentPresignedUrl(attachmentId: string): Promise<string> {
    const uploadUrl = await attachmentUtils.getUploadUrl(attachmentId)

    return uploadUrl
}