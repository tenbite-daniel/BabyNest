FROM python:3.11.8-slim

WORKDIR /app

COPY pyproject.toml .
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONPATH=/app

COPY . .

EXPOSE 8000

CMD ["uvicorn", "babynest.app:app", "--host", "0.0.0.0", "--port", "8000"]