import { queryOptions } from "@tanstack/react-query";
import {
  getPublicBarber,
  getPublicStats,
  listPublicGallery,
  listPublicBarbers,
  listSiteReviews,
} from "./public.functions";

export const barbersQuery = () =>
  queryOptions({
    queryKey: ["public-barbers"],
    queryFn: () => listPublicBarbers(),
  });

export const barberQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public-barber", slug],
    queryFn: () => getPublicBarber({ data: { slug } }),
  });

export const publicGalleryQuery = () =>
  queryOptions({
    queryKey: ["public-gallery"],
    queryFn: () => listPublicGallery(),
  });

export const siteReviewsQuery = () =>
  queryOptions({
    queryKey: ["site-reviews"],
    queryFn: () => listSiteReviews(),
  });

export const publicStatsQuery = () =>
  queryOptions({
    queryKey: ["public-stats"],
    queryFn: () => getPublicStats(),
  });
