import { Product } from '@/types';

function makeId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function fp(name: string, bucket: Product['bucket'], synonyms: string[] = [], feedstocks: string[] = [], producing: string[] = [], importing: string[] = []): Product {
  return {
    id: makeId(name),
    name,
    category: 'fragrance',
    bucket,
    synonyms,
    feedstocks,
    producingCountries: producing,
    importingCountries: importing,
  };
}

function flp(name: string, bucket: Product['bucket'], synonyms: string[] = [], feedstocks: string[] = [], producing: string[] = [], importing: string[] = []): Product {
  return {
    id: makeId(name),
    name,
    category: 'flavour',
    bucket,
    synonyms,
    feedstocks,
    producingCountries: producing,
    importingCountries: importing,
  };
}

export const products: Product[] = [
  // ===== FRAGRANCE - Petrochemical =====
  fp('Dipropylene Glycol', 'Petrochemical', ['DPG'], ['Propylene Oxide', 'Propylene'], ['USA', 'Germany', 'China'], ['India', 'Brazil', 'Japan']),
  fp('Verdyl Acetate', 'Petrochemical', ['Tricyclodecenyl Acetate'], ['Dicyclopentadiene'], ['Germany', 'Switzerland'], ['India', 'China', 'Japan']),
  fp('Citral', 'Petrochemical', ['Geranial', 'Neral', '3,7-Dimethyl-2,6-octadienal'], ['Isobutylene', 'Formaldehyde', 'Isoprene'], ['Germany', 'China', 'India'], ['USA', 'Japan', 'Brazil']),
  fp('Citronellol', 'Petrochemical', ['Beta-Citronellol', 'Dihydrogeraniol'], ['Citral', 'Geraniol', 'Beta-Pinene'], ['Germany', 'China', 'India'], ['USA', 'France', 'Japan']),
  fp('Alpha Isomethyl Ionone', 'Petrochemical', ['AIMI', 'Methyl Ionone Alpha Iso'], ['Citral', 'Acetone'], ['Germany', 'China'], ['India', 'USA', 'France']),
  fp('Linalool', 'Petrochemical', ['3,7-Dimethyl-1,6-octadien-3-ol', 'Linalol'], ['Beta-Pinene', 'Isoprene', 'Acetylene'], ['Germany', 'China', 'India', 'Mexico'], ['USA', 'France', 'Japan', 'Brazil']),
  fp('Tetrahydro Linalool', 'Petrochemical', ['THL', 'Dihydromyrcenol derivative'], ['Linalool'], ['Germany', 'China'], ['India', 'USA', 'France']),
  fp('Linalyl Acetate', 'Petrochemical', ['Bergamol', 'Linalool Acetate'], ['Linalool', 'Acetic Anhydride'], ['Germany', 'China', 'India'], ['USA', 'France', 'Japan']),
  fp('Coumarin', 'Petrochemical', ['2H-chromen-2-one', 'Benzopyrone'], ['Salicylaldehyde', 'Acetic Anhydride', 'o-Cresol'], ['China', 'India', 'Germany'], ['USA', 'France', 'Japan']),
  fp('Ethylene Brassylate', 'Petrochemical', ['EB', 'Musk T'], ['Brassylic Acid', 'Ethylene Glycol', 'Erucic Acid'], ['Germany', 'China'], ['India', 'USA', 'France']),
  fp('Amber Xtreme', 'Petrochemical', ['Amberxtreme'], ['Cyclododecanone'], ['Switzerland', 'Germany'], ['India', 'China', 'USA']),
  fp('Cashmeran', 'Petrochemical', ['DPMI', '6,7-Dihydro-1,1,2,3,3-pentamethyl-4(5H)-indanone'], ['Isoprene', 'Methyl Vinyl Ketone'], ['Germany', 'USA'], ['India', 'China', 'France']),
  fp('Synthetic Menthol (BASF)', 'Petrochemical', ['dl-Menthol', 'Racemic Menthol'], ['Thymol', 'meta-Cresol'], ['Germany', 'China', 'India'], ['USA', 'Japan', 'Brazil']),
  fp('Geraniol Std', 'Petrochemical', ['trans-Geraniol', '2,6-Dimethyl-2,6-octadien-8-ol'], ['Beta-Pinene', 'Linalool'], ['Germany', 'China', 'India'], ['USA', 'France', 'Japan']),
  fp('Hexyl Acetate', 'Petrochemical', ['n-Hexyl Acetate'], ['1-Hexanol', 'Acetic Acid'], ['Germany', 'China'], ['India', 'USA', 'Japan']),
  fp('Hexyl Cinnamic Aldehyde', 'Petrochemical', ['HCA', 'Alpha-Hexylcinnamaldehyde'], ['Cinnamaldehyde', 'Octanal'], ['China', 'India', 'Germany'], ['USA', 'France', 'Japan']),
  fp('Undecalactone Gamma', 'Petrochemical', ['Peach Aldehyde', 'Gamma-Undecalactone'], ['Undecylenic Acid', 'Castor Oil'], ['China', 'India'], ['USA', 'Germany', 'France']),
  fp('Dynascone', 'Petrochemical', ['2-(3,3-Dimethylcyclohexyl)-1-cyclopentanone'], ['Isophorone'], ['Switzerland', 'Germany'], ['India', 'China', 'USA']),
  fp('Cyclal C', 'Petrochemical', [], ['Cyclohexene', 'Formaldehyde'], ['Germany'], ['India', 'China', 'USA']),
  fp('Aldehyde C12 MNA', 'Petrochemical', ['2-Methylundecanal', 'Methyl Nonyl Acetaldehyde'], ['Undecanal'], ['Germany', 'China'], ['India', 'USA', 'France']),
  fp('Hexenol Cis 3', 'Petrochemical', ['Leaf Alcohol', 'cis-3-Hexen-1-ol'], ['Hex-2-enal'], ['Germany', 'Japan', 'China'], ['India', 'USA', 'France']),
  fp('Damascone Delta', 'Petrochemical', ['Delta-Damascone'], ['Cyclocitral'], ['Germany', 'Switzerland'], ['India', 'China', 'USA']),
  fp('Undecavertol', 'Petrochemical', ['4-methyl-3-decen-5-ol'], ['Heptanal'], ['Switzerland'], ['India', 'China', 'USA']),

  // ===== FRAGRANCE - Others (Aroma) =====
  fp('Benzyl Acetate', 'Others', ['Acetic Acid Benzyl Ester'], ['Benzyl Alcohol', 'Acetic Anhydride', 'Toluene'], ['China', 'India', 'Germany'], ['USA', 'France', 'Japan']),
  fp('O Tert Butyl Cyclohexyl Acetate', 'Others', ['OTBCHA'], ['Cyclohexanone', 'Isobutylene'], ['Germany', 'China'], ['India', 'USA', 'France']),
  fp('P Tert Butyl Cyclohexyl Acetate', 'Others', ['PTBCHA', 'Vertenex'], ['p-tert-Butylcyclohexanol'], ['Germany', 'China'], ['India', 'USA', 'France']),
  fp('Methyl Dihydrojasmonate', 'Others', ['MDJ', 'Hedione'], ['Cyclopentanone', 'Pentylidene'], ['Germany', 'China', 'India'], ['USA', 'France', 'Japan']),
  fp('Phenyl Ethyl Alcohol', 'Others', ['PEA', '2-Phenylethanol', 'Rose Alcohol'], ['Styrene Oxide', 'Ethylene Oxide', 'Benzene'], ['China', 'India', 'Germany'], ['USA', 'France', 'Japan']),
  fp('Habanolide', 'Others', ['Oxacyclohexadecan-2-one', 'Globalide'], ['Cyclododecanone', 'Cyclopentadecanone'], ['Switzerland', 'Germany'], ['India', 'China', 'USA']),
  fp('Ethyl Vanillin', 'Others', ['3-Ethoxy-4-hydroxybenzaldehyde'], ['Guaiacol', 'Glyoxylic Acid', 'Catechol'], ['China', 'France', 'India'], ['USA', 'Germany', 'Japan']),
  fp('Benzyl Salicylate', 'Others', ['BS'], ['Salicylic Acid', 'Benzyl Alcohol'], ['China', 'India'], ['USA', 'Germany', 'France']),
  fp('Hexenyl Salicylate Cis 3', 'Others', ['Cis-3-Hexenyl Salicylate'], ['Salicylic Acid', 'cis-3-Hexen-1-ol'], ['Germany', 'China'], ['India', 'USA', 'France']),
  fp('Hexyl Salicylate', 'Others', ['n-Hexyl Salicylate'], ['Salicylic Acid', '1-Hexanol'], ['China', 'Germany'], ['India', 'USA', 'Japan']),
  fp('Synthetic Anethole', 'Others', ['trans-Anethole', '4-Propenylanisole'], ['Anisole', 'Estragole'], ['China', 'India', 'Spain'], ['USA', 'Germany', 'France']),

  // ===== FRAGRANCE - Turpentine =====
  fp('Terpineol', 'Turpentine', ['Alpha-Terpineol'], ['Alpha-Pinene', 'Turpentine Oil'], ['China', 'India', 'Brazil'], ['USA', 'Germany', 'France']),
  fp('Terpinolene', 'Turpentine', ['Isoterpinene'], ['Alpha-Pinene', 'Turpentine Oil'], ['China', 'India'], ['USA', 'Germany', 'Japan']),
  fp('Dihydro Myrcenol', 'Turpentine', ['DHM', '2,6-Dimethyl-7-octen-2-ol'], ['Beta-Pinene', 'Myrcene'], ['China', 'India', 'Germany'], ['USA', 'France', 'Japan']),
  fp('Bangalol', 'Turpentine', [], ['Beta-Pinene', 'Campholenic Aldehyde'], ['India', 'China'], ['USA', 'Germany', 'France']),
  fp('Iso E Super', 'Turpentine', ['IES', 'Iso E Super', '7-acetyl-1,2,3,4,5,6,7,8-octahydro-1,1,6,7-tetramethylnaphthalene'], ['Myrcene', 'Campholenic Aldehyde', 'Alpha-Pinene'], ['Germany', 'China', 'India'], ['USA', 'France', 'Japan']),

  // ===== FRAGRANCE - Naturals =====
  fp('Patchouli Oil', 'Naturals', ['Pogostemon Cablin Oil'], ['Patchouli Leaves'], ['Indonesia', 'India', 'China'], ['USA', 'France', 'Germany']),
  fp('Eucalyptol', 'Naturals', ['1,8-Cineole', 'Cineole'], ['Eucalyptus Oil', 'Eucalyptus Leaves'], ['China', 'Australia', 'India'], ['USA', 'Germany', 'France']),
  fp('Spearmint Oil', 'Naturals', ['Mentha Spicata Oil'], ['Spearmint Leaves'], ['USA', 'China', 'India'], ['Germany', 'France', 'Japan']),
  fp('Anethole', 'Naturals', ['trans-Anethole Natural'], ['Star Anise Oil', 'Fennel Oil'], ['China', 'India', 'Vietnam'], ['USA', 'Germany', 'France']),
  fp('Ambrox', 'Naturals', ['Ambroxide', 'Ambrox DL'], ['Sclareol', 'Clary Sage Oil'], ['France', 'Spain', 'China'], ['USA', 'Germany', 'Japan']),
  fp('Ambrettolide', 'Naturals', ['7-Hexadecen-16-olide'], ['Ambrettolide Seed Oil'], ['India', 'China'], ['USA', 'France', 'Germany']),
  fp('Damascenone', 'Naturals', ['Beta-Damascenone'], ['Rose Oil', 'Carotenoids'], ['Turkey', 'Bulgaria', 'China'], ['USA', 'France', 'Germany']),
  fp('Ethyl Maltol', 'Naturals', ['2-Ethyl-3-hydroxy-4-pyranone'], ['Maltol', 'Koji Acid'], ['China', 'India'], ['USA', 'Germany', 'Japan']),
  fp('DMO', 'Naturals', ['Dimethyl Octanol'], ['Citronella Oil'], ['China', 'India', 'Indonesia'], ['USA', 'Germany', 'France']),
  fp('Orange Oil', 'Naturals', ['Sweet Orange Oil', 'Citrus Sinensis Oil'], ['Orange Peels'], ['Brazil', 'USA', 'Mexico', 'Italy'], ['Germany', 'France', 'UK', 'Japan']),
  fp('Eugenol', 'Naturals', ['4-Allyl-2-methoxyphenol'], ['Clove Oil', 'Clove Buds'], ['Indonesia', 'Madagascar', 'India'], ['USA', 'Germany', 'France']),

  // ===== FRAGRANCE - Others (Oral Care) =====
  fp('Peppermint Oil', 'Others', ['Mentha Piperita Oil'], ['Peppermint Leaves'], ['India', 'USA', 'China'], ['Germany', 'France', 'Japan']),
  fp('Menthone', 'Others', ['2-Isopropyl-5-methylcyclohexanone'], ['Peppermint Oil', 'Menthol'], ['India', 'China', 'USA'], ['Germany', 'Japan', 'France']),
  fp('Menthol', 'Others', ['L-Menthol', 'Natural Menthol'], ['Peppermint Oil', 'Dementholized Oil'], ['India', 'China'], ['USA', 'Germany', 'Japan']),
  fp('Methyl Salicylate', 'Others', ['Wintergreen Oil', 'Oil of Wintergreen'], ['Salicylic Acid', 'Methanol'], ['China', 'India', 'USA'], ['Germany', 'Japan', 'France']),
  fp('Menthol Racemic', 'Others', ['dl-Menthol', 'Racemic Menthol'], ['Thymol', 'meta-Cresol'], ['Germany', 'China', 'India'], ['USA', 'Japan', 'Brazil']),
  fp('Carvone', 'Others', ['L-Carvone', 'D-Carvone'], ['Spearmint Oil', 'Limonene'], ['USA', 'China', 'India'], ['Germany', 'France', 'Japan']),
  fp('Eucalyptus Globulus Oil', 'Others', ['Blue Gum Eucalyptus Oil'], ['Eucalyptus Globulus Leaves'], ['China', 'Australia', 'Portugal'], ['USA', 'Germany', 'India']),

  // ===== FRAGRANCE - Oleo Chemical =====
  fp('Aldehyde C10', 'Oleo Chemical', ['Decanal', 'Decyl Aldehyde', 'Capric Aldehyde'], ['Decanoic Acid', 'Coconut Oil', 'Palm Kernel Oil'], ['China', 'India', 'Germany'], ['USA', 'France', 'Japan']),

  // ===== FLAVOUR - Chicken / Beef / Meat =====
  flp('Yeast', 'Chicken / Beef / Meat', ['Yeast Extract', 'Autolyzed Yeast'], ['Molasses', 'Sugar'], ['China', 'France', 'Germany', 'USA'], ['India', 'Japan', 'Brazil']),
  flp('Amino Acid (L-cysteine HCl)', 'Chicken / Beef / Meat', ['L-Cysteine', 'L-Cysteine Hydrochloride'], ['Human Hair', 'Duck Feathers', 'Fermentation'], ['China', 'Japan'], ['USA', 'Germany', 'India']),
  flp('Maltodextrin', 'Chicken / Beef / Meat', ['Maltrin'], ['Corn Starch', 'Potato Starch', 'Wheat Starch'], ['USA', 'China', 'Germany'], ['India', 'Brazil', 'Japan']),

  // ===== FLAVOUR - Dairy and Cheese =====
  flp('Cheese', 'Dairy and Cheese', ['Cheese Powder', 'Cheese Flavour'], ['Milk', 'Rennet', 'Cultures'], ['USA', 'France', 'Germany', 'Italy'], ['India', 'Japan', 'Brazil']),
  flp('Whey', 'Dairy and Cheese', ['Whey Powder', 'Whey Protein', 'WPC'], ['Milk', 'Cheese Processing'], ['USA', 'Germany', 'France', 'New Zealand'], ['China', 'India', 'Japan']),

  // ===== FLAVOUR - Onion and Garlic =====
  flp('Onion', 'Onion and Garlic', ['Onion Powder', 'Dehydrated Onion', 'Onion Oil'], ['Fresh Onion'], ['India', 'China', 'USA', 'Egypt'], ['Germany', 'Japan', 'UK']),
  flp('Garlic Oil', 'Onion and Garlic', ['Garlic Essential Oil', 'Allium Sativum Oil'], ['Fresh Garlic'], ['China', 'India', 'Egypt'], ['USA', 'Germany', 'Japan']),

  // ===== FLAVOUR - Citrus =====
  flp('Lime', 'Citrus', ['Lime Oil', 'Lime Juice', 'Key Lime'], ['Fresh Lime'], ['Mexico', 'India', 'Brazil', 'Peru'], ['USA', 'Germany', 'France']),

  // ===== FLAVOUR - Fish / Seafood =====
  flp('Whitefish - Haddock >1kg - Denmark', 'Fish / Seafood', ['Haddock Denmark', 'Melanogrammus aeglefinus'], ['Haddock'], ['Denmark', 'Norway', 'Iceland'], ['France', 'UK', 'Germany']),
  flp('Whitefish - Haddock >49.5cm - UK', 'Fish / Seafood', ['Haddock UK', 'British Haddock'], ['Haddock'], ['UK', 'Norway', 'Iceland'], ['France', 'Spain', 'Italy']),
  flp('Whitefish - Plaice >1.0kg - Iceland', 'Fish / Seafood', ['Plaice Iceland', 'Pleuronectes platessa'], ['Plaice'], ['Iceland', 'Denmark', 'Netherlands'], ['UK', 'France', 'Germany']),

  // ===== FLAVOUR - Spice =====
  flp('Pepper Black Extract (Indonesia)', 'Spice', ['Black Pepper Extract Indonesia', 'Piper Nigrum Indonesia'], ['Black Peppercorns'], ['Indonesia'], ['USA', 'Germany', 'Netherlands']),
  flp('Pepper Black Extract (Vietnam)', 'Spice', ['Black Pepper Extract Vietnam', 'Piper Nigrum Vietnam'], ['Black Peppercorns'], ['Vietnam'], ['USA', 'Germany', 'UK']),
  flp('Pepper Black Extract (India)', 'Spice', ['Black Pepper Extract India', 'Piper Nigrum India'], ['Black Peppercorns'], ['India'], ['USA', 'Germany', 'UK']),

  // ===== FLAVOUR - Herbs =====
  flp('Ginger', 'Herbs', ['Ginger Oil', 'Ginger Extract', 'Zingiber Officinale'], ['Fresh Ginger Root'], ['China', 'India', 'Nigeria', 'Thailand'], ['USA', 'Japan', 'Germany']),
  flp('Spearmint', 'Herbs', ['Spearmint Oil Flavour', 'Mentha Spicata'], ['Spearmint Leaves'], ['USA', 'China', 'India'], ['Germany', 'Japan', 'France']),
];

export const fragranceBuckets: Product['bucket'][] = ['Petrochemical', 'Oleo Chemical', 'Turpentine', 'Naturals', 'Others'];
export const flavourBuckets: Product['bucket'][] = ['Chicken / Beef / Meat', 'Dairy and Cheese', 'Onion and Garlic', 'Citrus', 'Fish / Seafood', 'Spice', 'Herbs'];

export function getProductsByCategory(category: Product['category']): Product[] {
  return products.filter(p => p.category === category);
}

export function getProductsByBucket(bucket: Product['bucket']): Product[] {
  return products.filter(p => p.bucket === bucket);
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}
