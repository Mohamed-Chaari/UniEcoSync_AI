.PHONY: dev backend frontend clean test-backend test-frontend test

dev:
	@echo "Starting backend and frontend..."
	@make backend & make frontend

backend:
	@echo "Starting backend..."
	@cd backend && docker-compose up --build

frontend:
	@echo "Starting frontend..."
	@cd frontend && npm install && npx expo start

clean:
	@echo "Cleaning up Docker containers..."
	@cd backend && docker-compose down

test-backend:
	@echo "Running backend tests..."
	@cd backend && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt && PYTHONPATH=. pytest tests/ -v

test-frontend:
	@echo "Running frontend tests..."
	@cd frontend && npx jest --coverage

test: test-backend test-frontend
