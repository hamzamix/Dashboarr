# --- Stage 1: Build Frontend ---
# This stage uses Node.js to build the React application into static files.
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies first to leverage Docker cache
COPY package.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Run the build script defined in package.json
# This will create a 'dist' folder with the compiled frontend
RUN npm run build

# --- Stage 2: Final Production Image ---
# This stage uses Python to create a lean final image. It will copy the
# built frontend from the 'builder' stage.
FROM python:3.9-slim

# Set the working directory in the final container
WORKDIR /app

# Copy Python requirements file and install dependencies
COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code
COPY backend/ /app/backend/

# ** The Magic Step **
# Copy the built frontend from the 'builder' stage into our final image
COPY --from=builder /app/dist /app/dist/

# Expose the port the app runs on
EXPOSE 5000

# Command to run the Flask application using Gunicorn (a production server)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "backend.app:app"]
