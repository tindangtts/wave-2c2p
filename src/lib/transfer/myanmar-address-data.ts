export interface TownshipData {
  name: string
  wards: string[]
}

export interface StateData {
  name: string
  townships: TownshipData[]
}

export const MYANMAR_STATES: StateData[] = [
  {
    name: 'Ayeyarwady Region',
    townships: [
      { name: 'Pathein Township', wards: ['Pathein Urban', 'Shwemyay Quarter', 'Aungzeya Quarter', 'Myohaung Quarter'] },
      { name: 'Maubin Township', wards: ['Maubin Urban', 'Zeyar Thiri', 'Shwe Pyi Aye'] },
      { name: 'Myaungmya Township', wards: ['Myaungmya Urban', 'Kan Thar Yar', 'Kyun Taw'] },
    ],
  },
  {
    name: 'Bago Region',
    townships: [
      { name: 'Bago Township', wards: ['Bago Urban', 'Hanthawaddy', 'Kyauktaga', 'Shwe Nat Taw'] },
      { name: 'Taungoo Township', wards: ['Taungoo Urban', 'Myoma', 'Shwe Thida', 'Kan Gyi Daung'] },
      { name: 'Pyay Township', wards: ['Pyay Urban', 'Aung Mingalar', 'Chan Thar Gyi'] },
    ],
  },
  {
    name: 'Chin State',
    townships: [
      { name: 'Falam Township', wards: ['Falam Urban', 'Zophei', 'Ramri'] },
      { name: 'Hakha Township', wards: ['Hakha Urban', 'Phalhawk', 'Thantlang'] },
      { name: 'Mindat Township', wards: ['Mindat Urban', 'Kanpetlet', 'Matupi'] },
    ],
  },
  {
    name: 'Kachin State',
    townships: [
      { name: 'Myitkyina Township', wards: ['Myitkyina Urban', 'Aung Myay Thar Zan', 'Chan Mya Thar Zi', 'Shwe Pyi Thar'] },
      { name: 'Bhamo Township', wards: ['Bhamo Urban', 'Sinphyu Kone', 'Tarlay'] },
      { name: 'Putao Township', wards: ['Putao Urban', 'Shinbwayyan', 'Machanbaw'] },
    ],
  },
  {
    name: 'Kayah State',
    townships: [
      { name: 'Loikaw Township', wards: ['Loikaw Urban', 'Kayah', 'Bawlakhe'] },
      { name: 'Hpruso Township', wards: ['Hpruso Urban', 'Shadaw', 'Mese'] },
    ],
  },
  {
    name: 'Kayin State',
    townships: [
      { name: 'Hpa-An Township', wards: ['Hpa-An Urban', 'Aung Bar Lay', 'Kyar Inn Seikgyi', 'Hlaingbwe'] },
      { name: 'Myawaddy Township', wards: ['Myawaddy Urban', 'Waw Lay', 'Kyondoe'] },
      { name: 'Kawkareik Township', wards: ['Kawkareik Urban', 'Kyain Seikgyi', 'Payathonzu'] },
    ],
  },
  {
    name: 'Magway Region',
    townships: [
      { name: 'Magway Township', wards: ['Magway Urban', 'Aung Mingalar', 'Thitsar', 'Yadanarbon'] },
      { name: 'Pakokku Township', wards: ['Pakokku Urban', 'Nat Mauk', 'Kyaukpadaung'] },
      { name: 'Minbu Township', wards: ['Minbu Urban', 'Ngape', 'Salin'] },
    ],
  },
  {
    name: 'Mandalay Region',
    townships: [
      { name: 'Mandalay Township', wards: ['Chan Aye Thar Zan', 'Maha Aung Myay', 'Chan Mya Thar Zi', 'Amarapura', 'Patheingyi'] },
      { name: 'Pyigyitagon Township', wards: ['Pyigyitagon Urban', 'Aung Myay Thar Zan', 'Thabyegon'] },
      { name: 'Pyin Oo Lwin Township', wards: ['Pyin Oo Lwin Urban', 'Nawnghkio', 'Madaya'] },
      { name: 'Meiktila Township', wards: ['Meiktila Urban', 'Thazi', 'Wundwin'] },
    ],
  },
  {
    name: 'Mon State',
    townships: [
      { name: 'Mawlamyine Township', wards: ['Mawlamyine Urban', 'Innlay', 'Kyaikmaraw', 'Mudon'] },
      { name: 'Thaton Township', wards: ['Thaton Urban', 'Bilin', 'Kyaikhto'] },
      { name: 'Ye Township', wards: ['Ye Urban', 'Thanbyuzayat', 'Chaungzon'] },
    ],
  },
  {
    name: 'Naypyitaw Union Territory',
    townships: [
      { name: 'Zabuthiri Township', wards: ['Zabuthiri Urban', 'Ottarathiri', 'Pyinmana'] },
      { name: 'Dekkhinathiri Township', wards: ['Dekkhinathiri Urban', 'Lewe', 'Tatkon'] },
      { name: 'Pobbathiri Township', wards: ['Pobbathiri Urban', 'Zeyathiri', 'Oaktarathiri'] },
    ],
  },
  {
    name: 'Rakhine State',
    townships: [
      { name: 'Sittwe Township', wards: ['Sittwe Urban', 'Myebon', 'Pauktaw'] },
      { name: 'Kyaukpyu Township', wards: ['Kyaukpyu Urban', 'Ramree', 'An'] },
      { name: 'Thandwe Township', wards: ['Thandwe Urban', 'Toungup', 'Gwa'] },
    ],
  },
  {
    name: 'Sagaing Region',
    townships: [
      { name: 'Sagaing Township', wards: ['Sagaing Urban', 'Myinmu', 'Wetlet'] },
      { name: 'Monywa Township', wards: ['Monywa Urban', 'Budalin', 'Kani'] },
      { name: 'Shwebo Township', wards: ['Shwebo Urban', 'Khin-U', 'Wetlet'] },
    ],
  },
  {
    name: 'Shan State',
    townships: [
      { name: 'Taunggyi Township', wards: ['Taunggyi Urban', 'Hopong', 'Kalaw'] },
      { name: 'Lashio Township', wards: ['Lashio Urban', 'Namtu', 'Hsipaw'] },
      { name: 'Kengtung Township', wards: ['Kengtung Urban', 'Mongphyak', 'Mongkhet'] },
      { name: 'Loilem Township', wards: ['Loilem Urban', 'Mong Nai', 'Langkho'] },
    ],
  },
  {
    name: 'Tanintharyi Region',
    townships: [
      { name: 'Dawei Township', wards: ['Dawei Urban', 'Yebyu', 'Launglon'] },
      { name: 'Myeik Township', wards: ['Myeik Urban', 'Palaw', 'Kyunsu'] },
      { name: 'Kawthaung Township', wards: ['Kawthaung Urban', 'Bokpyin', 'Tanintharyi'] },
    ],
  },
  {
    name: 'Yangon Region',
    townships: [
      { name: 'Hlaing Township', wards: ['Hlaing Urban', 'Sanchaung', 'Kamayut'] },
      { name: 'Yankin Township', wards: ['Yankin Urban', 'Bahan', 'Mayangon'] },
      { name: 'Mingala Taung Nyunt Township', wards: ['Botahtaung', 'Pazundaung', 'Tamwe'] },
      { name: 'Dagon Township', wards: ['Dagon Urban', 'North Dagon', 'South Dagon', 'East Dagon'] },
      { name: 'Insein Township', wards: ['Insein Urban', 'Hlegu', 'Taikkyi'] },
    ],
  },
]

export function getTownships(stateName: string): TownshipData[] {
  const state = MYANMAR_STATES.find((s) => s.name === stateName)
  return state?.townships ?? []
}

export function getWards(stateName: string, townshipName: string): string[] {
  const townships = getTownships(stateName)
  const township = townships.find((t) => t.name === townshipName)
  return township?.wards ?? []
}
