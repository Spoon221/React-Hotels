# Six Cities

Сервис поиска краткосрочного жилья в шести европейских городах

Демо: [ui.simakov.space](https://ui.simakov.space/)

## Запуск

```bash
npm install
cp .env.example .env.local
npm start
```

В `.env.local` укажите `VITE_API_URL` - адрес API приложения

## Проверки

```bash
npm run typecheck
npm run lint
npm test -- --run
npm run test:coverage
npm run build
```
