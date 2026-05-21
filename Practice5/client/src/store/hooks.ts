import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/* ──────────────────────────────────────────────
 *  Типізовані хуки для Redux
 *
 *  Замість стандартних useDispatch / useSelector
 *  використовуємо withTypes() для автоматичної типізації.
 *  Це забезпечує коректний TypeScript type inference
 *  у всіх компонентах без додаткових анотацій.
 * ────────────────────────────────────────────── */

/** Типізований dispatch — підтримує async thunks */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/** Типізований selector — знає структуру RootState */
export const useAppSelector = useSelector.withTypes<RootState>();
