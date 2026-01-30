
import { NewsletterDraft, StyleProfile, StorageConfig } from "../types";

export class StorageService {
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  // Pomocná funkcia pre Firebase REST API formát
  private getUrl(path: string): string {
    if (!this.config.apiUrl) return "";
    let base = this.config.apiUrl.endsWith('/') 
      ? this.config.apiUrl.slice(0, -1) 
      : this.config.apiUrl;
    
    // Firebase vyžaduje .json na konci
    return `${base}/${path}.json${this.config.apiKey ? `?auth=${this.config.apiKey}` : ''}`;
  }

  async saveHistory(history: NewsletterDraft[]): Promise<void> {
    if (this.config.type === 'remote' && this.config.apiUrl) {
      try {
        await fetch(this.getUrl('history'), {
          method: 'PUT', // Firebase PUT prepíše celú vetvu
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(history)
        });
      } catch (e) {
        console.error("Remote save failed", e);
        localStorage.setItem('newsletterHistory', JSON.stringify(history));
      }
    } else {
      localStorage.setItem('newsletterHistory', JSON.stringify(history));
    }
  }

  async loadHistory(): Promise<NewsletterDraft[]> {
    if (this.config.type === 'remote' && this.config.apiUrl) {
      try {
        const res = await fetch(this.getUrl('history'));
        const data = await res.json();
        return data || [];
      } catch (e) {
        console.warn("Remote load failed, using local");
      }
    }
    const local = localStorage.getItem('newsletterHistory');
    return local ? JSON.parse(local) : [];
  }

  async saveProfile(profile: StyleProfile): Promise<void> {
    if (this.config.type === 'remote' && this.config.apiUrl) {
      try {
        await fetch(this.getUrl('profile'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
      } catch (e) {
        localStorage.setItem('styleProfile', JSON.stringify(profile));
      }
    } else {
      localStorage.setItem('styleProfile', JSON.stringify(profile));
    }
  }

  async loadProfile(): Promise<StyleProfile | null> {
    if (this.config.type === 'remote' && this.config.apiUrl) {
      try {
        const res = await fetch(this.getUrl('profile'));
        return await res.json();
      } catch (e) {}
    }
    const local = localStorage.getItem('styleProfile');
    return local ? JSON.parse(local) : null;
  }
}
