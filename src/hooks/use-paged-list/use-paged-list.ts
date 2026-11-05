import {useEffect, useMemo, useRef, useState} from 'react';

export function usePagedList<T>(items: readonly T[], pageSize: number, resetKey: string) {
  const [pagination, setPagination] = useState({page: 1, resetKey});
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const page = pagination.resetKey === resetKey ? pagination.page : 1;
  const visibleItems = useMemo(() => items.slice(0, page * pageSize), [items, page, pageSize]);
  const hasMore = visibleItems.length < items.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setPagination((currentPagination) => currentPagination.resetKey === resetKey
          ? {...currentPagination, page: currentPagination.page + 1}
          : {page: 2, resetKey});
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, resetKey]);

  return {hasMore, sentinelRef, visibleItems};
}
