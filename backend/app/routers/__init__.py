from app.routers.tasks import router as tasks_router
from app.routers.journal import router as journal_router
from app.routers.technologies import router as technologies_router
from app.routers.attachments import router as attachments_router
from app.routers.projects import router as projects_router
from app.routers.hackathons import router as hackathons_router

__all__ = [
    "tasks_router",
    "journal_router",
    "technologies_router",
    "attachments_router",
    "projects_router",
    "hackathons_router",
]
