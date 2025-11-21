import { CreditCosts } from './creditRules';

export function getPdfCost(pageCount: number, isPremium: boolean = false): number {
  let baseCost = 0;

  if (pageCount <= 20) {
    baseCost = CreditCosts.pdfShort;
  } else if (pageCount <= 50) {
    baseCost = CreditCosts.pdfMedium;
  } else if (pageCount <= 100) {
    baseCost = CreditCosts.pdfLong;
  } else {
    baseCost = CreditCosts.pdfXL;
  }

  if (isPremium) {
    baseCost += CreditCosts.pdfPremiumExtra;
  }

  return baseCost;
}

export function getPdfCostDescription(pageCount: number, isPremium: boolean = false): string {
  let description = '';
  
  if (pageCount <= 20) {
    description = 'PDF 1-20 pagine';
  } else if (pageCount <= 50) {
    description = 'PDF 21-50 pagine';
  } else if (pageCount <= 100) {
    description = 'PDF 51-100 pagine';
  } else {
    description = 'PDF 100+ pagine';
  }

  if (isPremium) {
    description += ' (Premium)';
  }

  return description;
}