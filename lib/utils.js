import { isAdminEmail, hasAdminPrivilege } from '../app/constants';

// Admin authentication bypass utilities
export const AdminAuth = {
  // Check if user should bypass authentication
  shouldBypassAuth: (email) => {
    return hasAdminPrivilege(email, 'BYPASS_AUTH');
  },
  
  // Create mock admin user object for bypassing auth
  createAdminUser: (email) => {
    if (!isAdminEmail(email)) return null;
    
    return {
      email: email,
      uid: `admin_${email.replace('@', '_').replace('.', '_')}`,
      displayName: 'Admin User',
      isAdmin: true,
      subscription: {
        status: 'active',
        planType: 'premium',
        tier: 'admin',
        hasActiveSubscription: true
      }
    };
  },
  
  // Get admin user from localStorage or session
  getAdminUser: () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const adminUser = localStorage.getItem('adminUser');
      if (adminUser) {
        const parsed = JSON.parse(adminUser);
        return isAdminEmail(parsed.email) ? parsed : null;
      }
    } catch (error) {
      console.error('Error getting admin user:', error);
    }
    
    return null;
  },
  
  // Set admin user in localStorage
  setAdminUser: (email) => {
    if (!isAdminEmail(email)) return false;
    
    const adminUser = AdminAuth.createAdminUser(email);
    if (adminUser && typeof window !== 'undefined') {
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      return true;
    }
    
    return false;
  },
  
  // Check if current session has admin privileges
  hasAdminAccess: () => {
    const adminUser = AdminAuth.getAdminUser();
    return adminUser && isAdminEmail(adminUser.email);
  },
  
  // Clear admin session
  clearAdminSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminUser');
    }
  }
};

// Authentication requirement utilities
export const AuthRequirements = {
  // Check if a user requires authentication for full features
  requiresAuth: (user) => {
    if (!user) return false; // Unauthenticated users don't require auth (basic access)
    
    // Admin users always have access
    if (user.isAdmin || isAdminEmail(user.email)) {
      return false;
    }
    
    // DJs and users with active subscriptions need to maintain authentication
    const hasActiveSubscription = user.subscription?.status === 'active' || 
                                  user.subscription?.status === 'trial';
    const isDJ = user.isDJ || user.plan === 'dj' || hasActiveSubscription;
    
    return isDJ || hasActiveSubscription;
  },
  
  // Check if user has premium features access
  hasPremiumAccess: (user) => {
    if (!user) return false;
    
    // Admin users always have premium access
    if (user.isAdmin || isAdminEmail(user.email)) {
      return true;
    }
    
    // Check for active subscription
    return user.subscription?.status === 'active' || user.subscription?.status === 'trial';
  },
  
  // Check if user is a DJ (needs dashboard access)
  isDJ: (user) => {
    if (!user) return false;
    
    // Admin users are considered DJs
    if (user.isAdmin || isAdminEmail(user.email)) {
      return true;
    }
    
    // Check DJ status or active subscription
    const hasActiveSubscription = user.subscription?.status === 'active' || 
                                  user.subscription?.status === 'trial';
    return user.isDJ || user.plan === 'dj' || hasActiveSubscription;
  },
  
  // Get user access level
  getAccessLevel: (user) => {
    if (!user) return 'basic';
    
    if (user.isAdmin || isAdminEmail(user.email)) {
      return 'admin';
    }
    
    if (AuthRequirements.hasPremiumAccess(user)) {
      return 'premium';
    }
    
    if (user.subscription?.status === 'trial') {
      return 'trial';
    }
    
    return 'basic';
  }
};

export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}