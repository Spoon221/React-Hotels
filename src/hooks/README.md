# Хуки проекта

| Хук | Назначение |
| --- | --- |
| `useDebouncedValue` | Отложенная фильтрация поиска с cleanup таймера. |
| `useDebouncedCallback` | Стабильный отложенный callback с отменой предыдущего таймера. |
| `useOutsideClick` | Закрытие меню по клику вне элемента. |
| `useKeydown` | Подписка на клавишу с корректным cleanup. |
| `useUrlState` | Хранение фильтра в URL и поддержка навигации назад/вперёд. |
| `usePersistentState` | Черновик в `localStorage`, синхронизируемый между вкладками. |
| `useMediaQuery` | Условный рендер для мобильного списка/карты через `useSyncExternalStore`. |
| `useOfferLoader` | Загрузка предложения с отменой устаревшего запроса и повтором после ошибки. |
| `usePagedList` | Постраничная выдача через `IntersectionObserver`. |
| `useScrollRestoration` | Возврат к сохранённой позиции списка. |
| `useOptimisticFavorite` | Мгновенное переключение избранного с откатом при ошибке. |
| `useRecentlyViewed` | Последние открытые предложения в `localStorage`. |
| `useOnlineStatus` | Состояние сети через `useSyncExternalStore`. |
| `useReviewForm` | Состояние формы отзыва на `useReducer`; редьюсер лежит отдельно. |
