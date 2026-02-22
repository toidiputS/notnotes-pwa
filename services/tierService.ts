import { SubscriptionTier } from '../types';

export const tierService = {
    // Mock current tier - in reality this would fetch from Supabase User Auth/Stripe
    getCurrentTier: (): SubscriptionTier => {
        const override = localStorage.getItem('mock_tier') as SubscriptionTier;
        return override || SubscriptionTier.NODE;
    },

    setMockTier: (tier: SubscriptionTier) => {
        localStorage.setItem('mock_tier', tier);
    },

    hasNotNotesAccess: (tier: SubscriptionTier): boolean => {
        // Only Node, Squad+, and Platoon tiers have NotNotes access
        return [
            SubscriptionTier.NODE,
            SubscriptionTier.SQUAD_PLUS,
            SubscriptionTier.PLATOON
        ].includes(tier);
    },

    hasOracleAccess: (tier: SubscriptionTier): boolean => {
        // Only Platoon has Oracle AI Assistant
        return tier === SubscriptionTier.PLATOON;
    }
};
