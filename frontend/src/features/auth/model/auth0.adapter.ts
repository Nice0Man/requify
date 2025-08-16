import { User as Auth0User } from '@auth0/auth0-react';
import type { User } from '@/shared/types/user';

/**
 * Адаптер для преобразования пользователя Auth0 в локальный тип User
 */
export const adaptAuth0User = (auth0User: Auth0User): User => {
  return {
    id: parseInt(auth0User.sub?.replace('auth0|', '') || '0'), // Auth0 ID преобразуем в число
    username: auth0User.nickname || auth0User.email || '',
    email: auth0User.email || '',
    role: auth0User['https://requify.com/roles']?.[0] || 'viewer', // Custom claim для ролей
    first_name: auth0User.given_name,
    last_name: auth0User.family_name,
    created_at: auth0User.created_at || new Date().toISOString(),
    email_verified: auth0User.email_verified || false,
    email_verified_at: auth0User.email_verified ? auth0User.updated_at : undefined,
  };
};

/**
 * Типы для социальной аутентификации
 */
export type SocialProvider = 'google-oauth2' | 'github';

/**
 * Маппинг локальных провайдеров на Auth0 connections
 */
export const socialProviderMap: Record<string, SocialProvider> = {
  google: 'google-oauth2',
  github: 'github',
}; 