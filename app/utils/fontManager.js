// Font Manager Utility
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export class FontManager {
  constructor() {
    this.loadedFonts = new Set();
    this.availableFonts = [
      { name: 'Default', value: 'default', family: '"Inter", "Segoe UI", system-ui, sans-serif' },
      { name: 'Hugh is Life', value: 'hugh-is-life', family: '"Hugh is Life", "Inter", system-ui, sans-serif' },
      { name: 'Kamryn 3D Italic', value: 'kamryn-3d-italic', family: '"Kamryn 3D Italic D", "Inter", system-ui, sans-serif' },
    ];
    this.customFonts = [];
    this.subscriptionStatus = null;
    
    // Auto-load built-in fonts on initialization
    this.loadBuiltInFonts();
  }

  // Load built-in fonts from public/fonts directory
  async loadBuiltInFonts() {
    try {
      // Load Hugh is Life font
      await this.loadFontFromPublic('hugh-is-life.ttf', 'Hugh is Life');
      
      // Load Kamryn 3D Italic font
      await this.loadFontFromPublic('Kamryn 3D Italic D.otf', 'Kamryn 3D Italic D');
    } catch (error) {
      console.log('Error loading built-in fonts:', error);
    }
  }

  // Load a font from the public/fonts directory
  async loadFontFromPublic(fontFile, fontName) {
    try {
      const fontPath = `/fonts/${fontFile}`;
      
      // Check if font file exists
      const response = await fetch(fontPath, { method: 'HEAD' });
      if (!response.ok) {
        console.log(`Font file not found: ${fontPath}`);
        return false;
      }

      // Create font face if not already loaded
      if (!this.loadedFonts.has(fontName)) {
        const fontFace = new FontFace(fontName, `url(${fontPath})`);
        await fontFace.load();
        document.fonts.add(fontFace);
        this.loadedFonts.add(fontName);
        console.log(`Successfully loaded built-in font: ${fontName}`);
        return true;
      }
    } catch (error) {
      console.log(`Error loading font ${fontFile}:`, error);
      return false;
    }
  }

  // Check if user has active subscription
  async checkSubscriptionStatus() {
    try {
      // First check for admin access
      const { AdminAuth } = await import('../lib/utils');
      const adminUser = AdminAuth.getAdminUser();
      
      if (adminUser) {
        this.subscriptionStatus = { 
          hasActiveSubscription: true, 
          tier: 'admin',
          status: 'active',
          provider: 'admin',
          reason: 'Admin access - unlimited features' 
        };
        return this.subscriptionStatus;
      }
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        this.subscriptionStatus = { hasActiveSubscription: false, reason: 'Not authenticated' };
        return this.subscriptionStatus;
      }

      // Check if current user is admin
      const { isAdminEmail } = await import('../app/constants');
      if (isAdminEmail(user.email)) {
        this.subscriptionStatus = { 
          hasActiveSubscription: true, 
          tier: 'admin',
          status: 'active',
          provider: 'admin',
          reason: 'Admin user - unlimited features' 
        };
        return this.subscriptionStatus;
      }

      const userDocRef = doc(db, 'users', user.email);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        this.subscriptionStatus = { hasActiveSubscription: false, reason: 'No user profile found' };
        return this.subscriptionStatus;
      }

      const userData = userDoc.data();
      const subscription = userData.subscription;

      if (!subscription) {
        this.subscriptionStatus = { hasActiveSubscription: false, reason: 'No subscription found' };
        return this.subscriptionStatus;
      }

      // Check if subscription is active
      const isActive = subscription.status === 'active';
      const tier = subscription.tier || 'basic';

      this.subscriptionStatus = {
        hasActiveSubscription: isActive,
        tier: tier,
        status: subscription.status,
        provider: subscription.provider,
        reason: isActive ? 'Active subscription' : `Subscription status: ${subscription.status}`
      };

      return this.subscriptionStatus;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      this.subscriptionStatus = { hasActiveSubscription: false, reason: 'Error checking subscription' };
      return this.subscriptionStatus;
    }
  }

  // Load custom fonts from the public/fonts/custom directory (only for subscribed users)
  async loadCustomFonts() {
    try {
      // Check subscription status first
      const subscriptionStatus = await this.checkSubscriptionStatus();
      
      if (!subscriptionStatus.hasActiveSubscription) {
        console.log(`Custom fonts not available: ${subscriptionStatus.reason}`);
        return [];
      }

      console.log(`Loading custom fonts for ${subscriptionStatus.tier} subscriber`);

      // In a real app, you'd scan the directory server-side
      // For now, we'll check for known fonts and load them dynamically
      const customFontList = [
        'Komigo3D-Regular.ttf',
        // Add more fonts here as they're added to the folder
      ];

      const loadedFonts = [];
      for (const fontFile of customFontList) {
        const success = await this.loadCustomFont(fontFile);
        if (success) {
          loadedFonts.push(fontFile);
        }
      }

      return loadedFonts;
    } catch (error) {
      console.log('Error loading custom fonts:', error);
      return [];
    }
  }

  // Load a specific custom font (only for subscribed users)
  async loadCustomFont(fontFile) {
    try {
      // Double-check subscription status
      if (!this.subscriptionStatus?.hasActiveSubscription) {
        const subscriptionStatus = await this.checkSubscriptionStatus();
        if (!subscriptionStatus.hasActiveSubscription) {
          console.log(`Custom font access denied: ${subscriptionStatus.reason}`);
          return false;
        }
      }

      const fontName = fontFile.replace(/\.(ttf|otf|woff|woff2)$/i, '');
      const fontPath = `/fonts/custom/${fontFile}`;
      
      // Check if font file exists
      const response = await fetch(fontPath, { method: 'HEAD' });
      if (!response.ok) {
        console.log(`Font file not found: ${fontPath}`);
        return false;
      }

      // Create font face if not already loaded
      if (!this.loadedFonts.has(fontName)) {
        const fontFace = new FontFace(fontName, `url(${fontPath})`);
        await fontFace.load();
        document.fonts.add(fontFace);
        this.loadedFonts.add(fontName);

        // Add to available fonts list
        this.customFonts.push({
          name: fontName,
          value: fontName.toLowerCase().replace(/\s+/g, '-'),
          family: `"${fontName}", "Inter", system-ui, sans-serif`,
          isCustom: true,
          requiresSubscription: true
        });

        console.log(`Successfully loaded custom font: ${fontName} for ${this.subscriptionStatus.tier} subscriber`);
        return true;
      }
    } catch (error) {
      console.log(`Error loading font ${fontFile}:`, error);
      return false;
    }
  }

  // Get all available fonts (built-in + custom for subscribed users)
  async getAllFonts() {
    const subscriptionStatus = await this.checkSubscriptionStatus();
    
    if (subscriptionStatus.hasActiveSubscription) {
      // Load custom fonts if user has subscription
      await this.loadCustomFonts();
      return [...this.availableFonts, ...this.customFonts];
    } else {
      // Only return built-in fonts for non-subscribers
      return this.availableFonts;
    }
  }

  // Get available fonts with subscription info
  async getAvailableFontsWithSubscriptionInfo() {
    const subscriptionStatus = await this.checkSubscriptionStatus();
    const allFonts = await this.getAllFonts();
    
    return {
      fonts: allFonts,
      subscriptionStatus: subscriptionStatus,
      hasCustomFonts: subscriptionStatus.hasActiveSubscription && this.customFonts.length > 0
    };
  }

  // Get font family string by font value
  getFontFamily(fontValue) {
    const allFonts = [...this.availableFonts, ...this.customFonts];
    const font = allFonts.find(f => f.value === fontValue);
    return font ? font.family : this.availableFonts[0].family;
  }

  // Save selected font to localStorage (with subscription check for custom fonts)
  async saveSelectedFont(fontValue) {
    try {
      // Check if it's a custom font
      const customFont = this.customFonts.find(f => f.value === fontValue);
      
      if (customFont) {
        // Verify subscription status before saving custom font
        const subscriptionStatus = await this.checkSubscriptionStatus();
        if (!subscriptionStatus.hasActiveSubscription) {
          console.warn('Cannot save custom font: No active subscription');
          return false;
        }
      }

      localStorage.setItem('dj-contract-selected-font', fontValue);
      return true;
    } catch (error) {
      console.error('Error saving font selection:', error);
      return false;
    }
  }

  // Get saved font from localStorage (with subscription validation)
  async getSavedFont() {
    try {
      const savedFont = localStorage.getItem('dj-contract-selected-font') || 'default';
      
      // If it's a custom font, verify subscription status
      const customFont = this.customFonts.find(f => f.value === savedFont);
      if (customFont) {
        const subscriptionStatus = await this.checkSubscriptionStatus();
        if (!subscriptionStatus.hasActiveSubscription) {
          console.log('Saved custom font no longer available: Subscription inactive');
          // Reset to default font
          localStorage.setItem('dj-contract-selected-font', 'default');
          return 'default';
        }
      }
      
      return savedFont;
    } catch (error) {
      console.error('Error loading saved font:', error);
      return 'default';
    }
  }

  // Get subscription upgrade message for non-subscribers
  getSubscriptionUpgradeMessage() {
    return {
      title: 'Custom Fonts - Premium Feature',
      message: 'Custom fonts are available for Standard and Premium subscribers. Upgrade your plan to access custom fonts and enhance your contract branding.',
      upgradeUrl: '/subscription'
    };
  }
}

// Create singleton instance
export const fontManager = new FontManager(); 