'use client';import type { Task } from '@/types/domain';import { Button } from './Button';
export function TaskStatusToggle({task,onToggle}:{task:Task;onToggle?:(task:Task)=>void}){return <Button onClick={()=>onToggle?.(task)}>{(task.status||task.state||'not_started').replaceAll('_',' ')}</Button>}
