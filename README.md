# AuthTesting
i dont know what im doing

# Usage:
## Run server
```bash
server $ yarn run dev:server
```

## Run DB
```bash
db $ yarn run json:server
```

## Client commands
```bash
client $ curl http://localhost:3000/login -c cookie-file.txt -H 'Content-Type: application/json' -d '{"email":"test@test.com", "password":"password"}' -L
client $ curl -X POST http://localhost:3000/login -b cookie-file.txt -H 'Content-Type: application/json' -d '{"email":"test@test.com", "password":"password"}'
client $ curl -X GET http://localhost:3000/authrequired -b cookie-file.txt -L
```
