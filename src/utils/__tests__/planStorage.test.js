import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  buildSelectedPlanKey,
  getSelectedPlanForUser,
  setSelectedPlanForUser,
  migrateLegacySelectedPlanForUser,
  clearLegacySelectedPlanKey,
  markPlanStorageUser,
} from '../planStorage';

describe('planStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('construye clave compuesta por usuario', () => {
    expect(buildSelectedPlanKey('abc')).toBe('selectedPlan_abc');
    expect(buildSelectedPlanKey('  abc  ')).toBe('selectedPlan_abc');
    expect(buildSelectedPlanKey('')).toBeNull();
  });

  it('guarda y recupera plan por usuario', () => {
    const res = setSelectedPlanForUser({ userId: 'u1', planId: 'premium', ttlDays: 90 });
    expect(res.ok).toBe(true);
    expect(getSelectedPlanForUser({ userId: 'u1' })).toBe('premium');
    expect(getSelectedPlanForUser({ userId: 'u2' })).toBeNull();
  });

  it('invalida si UUID almacenado no coincide', () => {
    setSelectedPlanForUser({ userId: 'u1', planId: 'estandar', ttlDays: 90 });
    expect(getSelectedPlanForUser({ userId: 'u2' })).toBeNull();
    expect(getSelectedPlanForUser({ userId: 'u1' })).toBe('estandar');
  });

  it('expira y limpia registros antiguos', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    setSelectedPlanForUser({ userId: 'u1', planId: 'premium', ttlDays: 1 });
    expect(getSelectedPlanForUser({ userId: 'u1' })).toBe('premium');

    vi.setSystemTime(new Date('2026-01-03T00:00:00.000Z'));
    expect(getSelectedPlanForUser({ userId: 'u1' })).toBeNull();
    expect(localStorage.getItem('selectedPlan_u1')).toBeNull();
  });

  it('migra selectedPlanId legacy a clave por usuario y luego limpia legacy', () => {
    localStorage.setItem('selectedPlanId', 'premium');
    const migrated = migrateLegacySelectedPlanForUser({ userId: 'u1' });
    expect(migrated).toBe('premium');
    expect(getSelectedPlanForUser({ userId: 'u1' })).toBe('premium');
    expect(localStorage.getItem('selectedPlanId')).toBeNull();
  });

  it('borra legacy aunque sea inválido', () => {
    localStorage.setItem('selectedPlanId', 'otro');
    expect(migrateLegacySelectedPlanForUser({ userId: 'u1' })).toBeNull();
    expect(localStorage.getItem('selectedPlanId')).toBeNull();
  });

  it('usa sessionStorage como fallback si localStorage falla al escribir', () => {
    const failingStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {},
    };

    const res = setSelectedPlanForUser({
      userId: 'u1',
      planId: 'premium',
      ttlDays: 90,
      primaryStorage: failingStorage,
      fallbackStorage: window.sessionStorage,
    });
    expect(res.ok).toBe(true);
    expect(res.storage).toBe('sessionStorage');
    const raw = sessionStorage.getItem('selectedPlan_u1');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw).planId).toBe('premium');
    expect(getSelectedPlanForUser({ userId: 'u1', preferSession: true })).toBe('premium');
  });

  it('marca cambio de usuario en sesión y limpia legacy', () => {
    localStorage.setItem('selectedPlanId', 'premium');
    markPlanStorageUser('u1');
    expect(localStorage.getItem('selectedPlanId')).toBe('premium');

    markPlanStorageUser('u2');
    expect(localStorage.getItem('selectedPlanId')).toBeNull();
  });

  it('permite limpiar legacy manualmente', () => {
    localStorage.setItem('selectedPlanId', 'premium');
    clearLegacySelectedPlanKey();
    expect(localStorage.getItem('selectedPlanId')).toBeNull();
  });
});
