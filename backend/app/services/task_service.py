from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate

class TaskService:
    @staticmethod
    def get_tasks(
        db: Session,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[Task]:
        query = db.query(Task)
        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if category:
            query = query.filter(Task.category == category)
        return query.order_by(Task.due_date.asc().nullslast(), Task.id.desc()).all()

    @staticmethod
    def get_task_by_id(db: Session, task_id: int) -> Optional[Task]:
        return db.query(Task).filter(Task.id == task_id).first()

    @staticmethod
    def create_task(db: Session, task_in: TaskCreate) -> Task:
        db_task = Task(
            title=task_in.title,
            description=task_in.description,
            priority=task_in.priority.value if hasattr(task_in.priority, "value") else str(task_in.priority),
            category=task_in.category,
            due_date=task_in.due_date,
            status="todo",
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def update_task(db: Session, task: Task, task_in: TaskUpdate) -> Task:
        update_data = task_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None and hasattr(value, "value"):
                setattr(task, field, value.value)
            else:
                setattr(task, field, value)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def delete_task(db: Session, task: Task) -> None:
        db.delete(task)
        db.commit()
