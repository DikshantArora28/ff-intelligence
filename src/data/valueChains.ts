import { ValueChain } from '@/types';

// Pre-defined value chains for key products
const valueChainMap: Record<string, ValueChain['steps']> = {
  'dipropylene-glycol': [
    { stage: 'Raw Material', items: ['Crude Oil', 'Natural Gas'] },
    { stage: 'Primary Processing', items: ['Propylene (from cracking)'] },
    { stage: 'Intermediate', items: ['Propylene Oxide (PO)'] },
    { stage: 'Manufacturing', items: ['Propylene Glycol + PO reaction'] },
    { stage: 'Final Product', items: ['Dipropylene Glycol (DPG)'], description: 'Solvent, fixative in fragrances' },
  ],
  'linalool': [
    { stage: 'Raw Material', items: ['Crude Oil / Turpentine'] },
    { stage: 'Primary Processing', items: ['Beta-Pinene (from turpentine)', 'Acetylene (from petrochemicals)'] },
    { stage: 'Intermediate', items: ['Myrcene', 'Dehydrolinalool'] },
    { stage: 'Manufacturing', items: ['Selective hydrogenation'] },
    { stage: 'Final Product', items: ['Linalool'], description: 'Floral/woody aroma, key fragrance ingredient' },
  ],
  'citral': [
    { stage: 'Raw Material', items: ['Crude Oil', 'Isobutylene'] },
    { stage: 'Primary Processing', items: ['Isoprene', 'Formaldehyde'] },
    { stage: 'Intermediate', items: ['Prenol', 'Prenal', 'Dehydrolinalool'] },
    { stage: 'Manufacturing', items: ['Isomerization / Oxidation'] },
    { stage: 'Final Product', items: ['Citral (Geranial + Neral)'], description: 'Lemon scent, precursor for ionones & vitamins' },
  ],
  'coumarin': [
    { stage: 'Raw Material', items: ['Coal Tar / Petroleum'] },
    { stage: 'Primary Processing', items: ['Phenol', 'o-Cresol'] },
    { stage: 'Intermediate', items: ['Salicylaldehyde', 'Acetic Anhydride'] },
    { stage: 'Manufacturing', items: ['Perkin Reaction / Knoevenagel condensation'] },
    { stage: 'Final Product', items: ['Coumarin'], description: 'Sweet hay/vanilla note in perfumery' },
  ],
  'patchouli-oil': [
    { stage: 'Raw Material', items: ['Patchouli Plant (Pogostemon cablin)'] },
    { stage: 'Cultivation', items: ['Tropical plantation (Indonesia, India)'] },
    { stage: 'Harvesting', items: ['Dried & partially fermented leaves'] },
    { stage: 'Extraction', items: ['Steam distillation'] },
    { stage: 'Final Product', items: ['Patchouli Essential Oil'], description: 'Earthy, woody, musky fragrance note' },
  ],
  'menthol': [
    { stage: 'Raw Material', items: ['Peppermint Plant (Mentha piperita)'] },
    { stage: 'Cultivation', items: ['India (Uttar Pradesh), China, USA'] },
    { stage: 'Extraction', items: ['Steam distillation → Peppermint Oil'] },
    { stage: 'Processing', items: ['Freezing/crystallization to isolate menthol'] },
    { stage: 'Final Product', items: ['Natural L-Menthol'], description: 'Cooling agent for oral care, pharma, fragrance' },
  ],
  'dihydro-myrcenol': [
    { stage: 'Raw Material', items: ['Turpentine (from pine resin)'] },
    { stage: 'Primary Processing', items: ['Beta-Pinene isolation'] },
    { stage: 'Intermediate', items: ['Myrcene (pyrolysis of beta-pinene)'] },
    { stage: 'Manufacturing', items: ['Acid-catalyzed hydration'] },
    { stage: 'Final Product', items: ['Dihydro Myrcenol (DHM)'], description: 'Fresh citrus-floral note, widely used in functional fragrance' },
  ],
  'iso-e-super': [
    { stage: 'Raw Material', items: ['Turpentine / Crude Sulfate Turpentine'] },
    { stage: 'Primary Processing', items: ['Alpha-Pinene', 'Campholenic Aldehyde'] },
    { stage: 'Intermediate', items: ['Myrcene', 'Iron-catalyzed Diels-Alder'] },
    { stage: 'Manufacturing', items: ['Cyclization + Acetylation'] },
    { stage: 'Final Product', items: ['Iso E Super'], description: 'Woody, amber, velvety note, modern perfumery staple' },
  ],
  'benzyl-acetate': [
    { stage: 'Raw Material', items: ['Toluene (from petroleum)'] },
    { stage: 'Primary Processing', items: ['Benzyl Chloride (chlorination)'] },
    { stage: 'Intermediate', items: ['Benzyl Alcohol'] },
    { stage: 'Manufacturing', items: ['Esterification with Acetic Acid/Anhydride'] },
    { stage: 'Final Product', items: ['Benzyl Acetate'], description: 'Jasmine-like floral note, major F&F ingredient' },
  ],
  'phenyl-ethyl-alcohol': [
    { stage: 'Raw Material', items: ['Petroleum / Ethylene'] },
    { stage: 'Primary Processing', items: ['Benzene', 'Ethylene Oxide'] },
    { stage: 'Intermediate', items: ['Styrene Oxide / Friedel-Crafts'] },
    { stage: 'Manufacturing', items: ['Catalytic hydrogenation or biocatalysis'] },
    { stage: 'Final Product', items: ['Phenyl Ethyl Alcohol (PEA)'], description: 'Rose-like fragrance, used in fine fragrances & cosmetics' },
  ],
  'orange-oil': [
    { stage: 'Raw Material', items: ['Orange Fruit (Citrus sinensis)'] },
    { stage: 'Cultivation', items: ['Brazil, USA (Florida), Mexico, Italy'] },
    { stage: 'Processing', items: ['Cold pressing of orange peels'] },
    { stage: 'Refining', items: ['Deterpenation (optional), Folding'] },
    { stage: 'Final Product', items: ['Orange Oil'], description: 'Citrus scent for flavour & fragrance applications' },
  ],
  'eugenol': [
    { stage: 'Raw Material', items: ['Clove Buds (Syzygium aromaticum)'] },
    { stage: 'Cultivation', items: ['Indonesia, Madagascar, India'] },
    { stage: 'Extraction', items: ['Steam distillation → Clove Oil'] },
    { stage: 'Isolation', items: ['Alkali extraction & acid precipitation'] },
    { stage: 'Final Product', items: ['Eugenol'], description: 'Spicy, clove-like note for dental, flavour & fragrance' },
  ],
  'aldehyde-c10': [
    { stage: 'Raw Material', items: ['Coconut Oil / Palm Kernel Oil'] },
    { stage: 'Primary Processing', items: ['Hydrolysis → Fatty Acids'] },
    { stage: 'Intermediate', items: ['Capric Acid (Decanoic Acid)'] },
    { stage: 'Manufacturing', items: ['Catalytic reduction / Oxidation'] },
    { stage: 'Final Product', items: ['Aldehyde C10 (Decanal)'], description: 'Orange peel, waxy floral note' },
  ],
  'yeast': [
    { stage: 'Raw Material', items: ['Molasses / Sugar'] },
    { stage: 'Fermentation', items: ['Yeast cultivation (Saccharomyces cerevisiae)'] },
    { stage: 'Processing', items: ['Autolysis / Enzymatic hydrolysis'] },
    { stage: 'Refining', items: ['Concentration, spray drying'] },
    { stage: 'Final Product', items: ['Yeast Extract'], description: 'Umami-rich flavour enhancer for meat, savoury applications' },
  ],
  'black-pepper-oil': [
    { stage: 'Raw Material', items: ['Black Peppercorns (Piper nigrum)'] },
    { stage: 'Cultivation', items: ['Vietnam, India, Brazil, Indonesia'] },
    { stage: 'Processing', items: ['Dried berries, cleaned & graded'] },
    { stage: 'Extraction', items: ['Steam distillation / CO2 extraction'] },
    { stage: 'Final Product', items: ['Black Pepper Oil / Oleoresin'], description: 'Spicy, pungent flavour for food & beverage' },
  ],
  'ginger': [
    { stage: 'Raw Material', items: ['Fresh Ginger Rhizome (Zingiber officinale)'] },
    { stage: 'Cultivation', items: ['China, India, Nigeria, Thailand'] },
    { stage: 'Processing', items: ['Washing, slicing, drying'] },
    { stage: 'Extraction', items: ['Steam distillation / Solvent extraction'] },
    { stage: 'Final Product', items: ['Ginger Oil / Extract'], description: 'Warm, spicy flavour for food, beverage & health products' },
  ],
};

export function getValueChain(productId: string): ValueChain | null {
  const steps = valueChainMap[productId];
  if (steps) {
    return { productId, steps };
  }
  // Generate a generic value chain if no specific one exists
  return null;
}

export function generateGenericValueChain(productName: string, feedstocks: string[], category: string): ValueChain {
  return {
    productId: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    steps: [
      { stage: 'Raw Material', items: feedstocks.length > 0 ? feedstocks : ['Primary raw materials'] },
      { stage: 'Primary Processing', items: ['Extraction / Synthesis of base materials'] },
      { stage: 'Intermediate', items: ['Key intermediates & chemical building blocks'] },
      { stage: 'Manufacturing', items: [category === 'fragrance' ? 'Chemical synthesis / Purification' : 'Processing / Formulation'] },
      { stage: 'Final Product', items: [productName], description: `${category === 'fragrance' ? 'Fragrance' : 'Flavour'} ingredient for F&F industry` },
    ],
  };
}
