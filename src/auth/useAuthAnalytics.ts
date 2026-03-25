import React from 'react';
import { TrackEvents } from '~/analytics';
import { analyticsService } from '~/analytics/AnalyticsService';
import { useTrackAnalyticsEvent } from '~/analytics/hooks';
import { logger } from '~/monitoring/logger';

/**
 * Provides analytics callbacks for auth events.
 * Uses useTrackAnalyticsEvent to send typed events through Segment.
 *
 * @example
 * const { onLogin, onLogout } = useAuthAnalytics();
 * onLogin(user);  // identify + track user_login
 * onLogout(user); // track user_logout + reset
 */
export const useAuthAnalytics = () => {
  const trackEvent = useTrackAnalyticsEvent();

  const onLogin = React.useCallback(() => {
    const { userId } = analyticsService.getCommonProperties();
    analyticsService.identify(userId);
    trackEvent(TrackEvents.user_login_event, { userId });
    logger.info('User Logged In');
  }, [trackEvent]);

  const onLogout = React.useCallback(() => {
    const { userId } = analyticsService.getCommonProperties();
    trackEvent(TrackEvents.user_logout_event, { userId });
    analyticsService.reset();
    logger.info('User Logged Out');
  }, [trackEvent]);

  return { onLogin, onLogout };
};
