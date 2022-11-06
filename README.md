# Cookies

## Production Mode

##### Prerequisite
- Place `.env` at root of `backend/`
- Modify `.env` where appropriate

#### Compiling the frontend
```console
user@userpc ~/Cookies/ $ cd frontend
user@userpc ~/Cookies/frontend $ docker build . -t frontend
```

#### Compiling the backend
```console
user@userpc ~/Cookies/ $ cd backend
user@userpc ~/Cookies/backend $ docker build . -t backend
```

#### Bringing Services Up
```console
user@userpc ~/Cookies/ $ docker-compose -f docker-compose-app.yml up -d
```

Services will now be up at http://localhost:3000



## Development Mode
`2` seperate terminal instances will be required to run backend and frontend services simultaneously

##### Prerequisite
- Place `.env` at root of `backend/`
- Modify `.env` where appropriate

#### Setting up backend

1. Install backend dependencies
```
cd backend/
npm install
```

2. Start service
```
npm start
```

3. Expected output
```
Server is up at: http://localhost:5000
Connected to database!
```

### Setting up frontend
1. Install frontend dependencies
```
cd frontend/
npm install
```

2. Start service 
```
npm start
```

3. Expected output
```
webpack compiled successfully
```
