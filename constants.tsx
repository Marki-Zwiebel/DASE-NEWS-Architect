
import React from 'react';
import { StyleProfile } from './types';

export const INITIAL_STYLE_PROFILE: StyleProfile = {
  summary: "Professional, yet accessible digital analytics news items. Focuses on technical updates in GA4, GTM, and BigQuery. Direct and informative style without filler text.",
  vocabulary: ["GA4", "GTM", "Server-side", "BigQuery", "Data Layer", "Event Tracking"],
  tone: "Technical, concise, and helpful.",
  structure: "Sub-heading -> 2-3 Paragraphs -> Source Link.",
  lastUpdated: new Date().toISOString()
};

export const SUPPORTED_LANGUAGES = [
  { code: 'sk', name: 'Slovenčina' },
  { code: 'en', name: 'English' },
  { code: 'cs', name: 'Čeština' }
];

export const ICONS = {
  Generate: <i className="fas fa-magic mr-2"></i>,
  Learn: <i className="fas fa-brain mr-2"></i>,
  Save: <i className="fas fa-save mr-2"></i>,
  History: <i className="fas fa-history mr-2"></i>,
  Settings: <i className="fas fa-cog mr-2"></i>,
  Language: <i className="fas fa-language mr-2"></i>,
  Edit: <i className="fas fa-edit mr-2"></i>,
  Copy: <i className="fas fa-copy mr-2"></i>
};
