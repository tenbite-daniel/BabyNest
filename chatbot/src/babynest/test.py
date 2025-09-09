from pathlib import Path

project_root = Path(__file__).resolve().parent.parent.parent
knowledge_directory = project_root/"knowledge"
db_directory = project_root/"db"

print(project_root)
print(knowledge_directory)
print(db_directory)