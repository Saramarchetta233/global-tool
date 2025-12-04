import { CreditCosts } from './creditRules';

export function getPdfCost(pageCount: number, isPremium: boolean = false): number {
  let baseCost = 0;

  if (pageCount <= 40) {
    baseCost = CreditCosts.pdfShort;
  } else if (pageCount <= 100) {
    baseCost = CreditCosts.pdfMedium;
  } else if (pageCount <= 200) {
    baseCost = CreditCosts.pdfLong;
  } else if (pageCount <= 400) {
    baseCost = CreditCosts.pdfXL;
  } else if (pageCount <= 600) {
    baseCost = CreditCosts.pdfXXL;
  } else if (pageCount <= 1000) {
    baseCost = CreditCosts.pdfHuge;
  } else {
    baseCost = CreditCosts.pdfMassive;
  }

  if (isPremium) {
    baseCost += CreditCosts.pdfPremiumExtra;
  }

  return baseCost;
}

export function getPdfCostDescription(pageCount: number, isPremium: boolean = false): string {
  let description = '';
  
  if (pageCount <= 40) {
    description = 'PDF 1-40 pagine';
  } else if (pageCount <= 100) {
    description = 'PDF 41-100 pagine';
  } else if (pageCount <= 200) {
    description = 'PDF 101-200 pagine';
  } else if (pageCount <= 400) {
    description = 'PDF 201-400 pagine';
  } else if (pageCount <= 600) {
    description = 'PDF 401-600 pagine';
  } else if (pageCount <= 1000) {
    description = 'PDF 601-1000 pagine';
  } else {
    description = 'PDF 1000+ pagine';
  }

  if (isPremium) {
    description += ' (Premium)';
  }

  return description;
}