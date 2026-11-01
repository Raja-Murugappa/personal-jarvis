from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskRead, TaskPriority, TaskStatus
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=List[TaskRead], status_code=status.HTTP_200_OK)
def list_tasks(
    status_filter: Optional[TaskStatus] = Query(None, alias="status"),
    priority_filter: Optional[TaskPriority] = Query(None, alias="priority"),
    category_filter: Optional[str] = Query(None, alias="category"),
    db: Session = Depends(get_db),
):
    status_val = status_filter.value if status_filter else None
    priority_val = priority_filter.value if priority_filter else None
    return TaskService.get_tasks(
        db=db,
        status=status_val,
        priority=priority_val,
        category=category_filter,
    )

@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
):
    return TaskService.create_task(db=db, task_in=task_in)

@router.put("/{task_id}", response_model=TaskRead, status_code=status.HTTP_200_OK)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
):
    task = TaskService.get_task_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with id {task_id} not found")
    return TaskService.update_task(db=db, task=task, task_in=task_in)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    task = TaskService.get_task_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with id {task_id} not found")
    TaskService.delete_task(db=db, task=task)
    return None
