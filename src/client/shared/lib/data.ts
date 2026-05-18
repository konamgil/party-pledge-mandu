import type { PartyId, PositionTab } from "./types";

export const PARTY_CODE_TO_ID: Record<string, PartyId> = {
  democratic: "democratic",
  ppp: "ppp",
  rebuilding: "rebuilding",
  reform: "reform",
};

export const PARTY_COLORS: Record<PartyId, string> = {
  democratic: "#004EA2",
  ppp: "#E61E2B",
  rebuilding: "#1B3A6B",
  reform: "#FF6B00",
};

export const PARTY_SHORT_NAMES: Record<PartyId, string> = {
  democratic: "민주",
  ppp: "국힘",
  rebuilding: "조국",
  reform: "개혁",
};

export const PARTY_INITIALS: Record<PartyId, string> = {
  democratic: "민",
  ppp: "국",
  rebuilding: "혁",
  reform: "개",
};

export const regions = [
  "전체",
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

export const subRegions: Record<string, string[]> = {
  "서울": ["강남구","서초구","송파구","강동구","마포구","영등포구","용산구","종로구","중구","성동구","광진구","동대문구","중랑구","성북구","강북구","도봉구","노원구","은평구","서대문구","양천구","강서구","구로구","금천구","동작구","관악구"],
  "경기": ["수원시","성남시","고양시","용인시","부천시","안산시","안양시","남양주시","화성시","평택시","의정부시","시흥시","파주시","김포시","광명시","광주시","군포시","하남시","오산시","이천시","양주시","구리시","안성시","포천시","의왕시","여주시","동두천시"],
  "부산": ["해운대구","부산진구","남구","동래구","수영구","사하구","금정구","연제구","북구","사상구","기장군","중구","서구","동구","영도구","강서구"],
  "인천": ["남동구","부평구","계양구","서구","연수구","중구","미추홀구","동구","강화군","옹진군"],
  "대구": ["중구","동구","서구","남구","북구","수성구","달서구","달성군","군위군"],
  "광주": ["동구","서구","남구","북구","광산구"],
  "대전": ["동구","중구","서구","유성구","대덕구"],
  "울산": ["중구","남구","동구","북구","울주군"],
  "세종": ["세종시"],
  "강원": ["춘천시","원주시","강릉시","동해시","태백시","속초시","삼척시","홍천군","횡성군","영월군","평창군","정선군","철원군","화천군","양구군","인제군","고성군","양양군"],
  "충북": ["청주시","충주시","제천시","보은군","옥천군","영동군","증평군","진천군","괴산군","음성군","단양군"],
  "충남": ["천안시","공주시","보령시","아산시","서산시","논산시","계룡시","당진시","금산군","부여군","서천군","청양군","홍성군","예산군","태안군"],
  "전북": ["전주시","군산시","익산시","정읍시","남원시","김제시","완주군","진안군","무주군","장수군","임실군","순창군","고창군","부안군"],
  "전남": ["목포시","여수시","순천시","나주시","광양시","담양군","곡성군","구례군","고흥군","보성군","화순군","장흥군","강진군","해남군","영암군","무안군","함평군","영광군","장성군","완도군","진도군","신안군"],
  "경북": ["포항시","경주시","김천시","안동시","구미시","영주시","영천시","상주시","문경시","경산시","의성군","청송군","영양군","영덕군","청도군","고령군","성주군","칠곡군","예천군","봉화군","울진군","울릉군"],
  "경남": ["창원시","진주시","통영시","사천시","김해시","밀양시","거제시","양산시","의령군","함안군","창녕군","고성군","남해군","하동군","산청군","함양군","거창군","합천군"],
  "제주": ["제주시","서귀포시"],
};

export const categories = ["전체", "경제", "복지", "교육", "환경", "안보", "문화", "주거", "노동", "행정"];

type MetroType = "특별시" | "광역시" | "특별자치시" | "특별자치도" | "도";

const regionMeta: Record<string, { fullName: string; type: MetroType; headTitle: string }> = {
  "서울": { fullName: "서울특별시", type: "특별시", headTitle: "서울시장" },
  "경기": { fullName: "경기도", type: "도", headTitle: "경기도지사" },
  "인천": { fullName: "인천광역시", type: "광역시", headTitle: "인천시장" },
  "부산": { fullName: "부산광역시", type: "광역시", headTitle: "부산시장" },
  "대구": { fullName: "대구광역시", type: "광역시", headTitle: "대구시장" },
  "광주": { fullName: "광주광역시", type: "광역시", headTitle: "광주시장" },
  "대전": { fullName: "대전광역시", type: "광역시", headTitle: "대전시장" },
  "울산": { fullName: "울산광역시", type: "광역시", headTitle: "울산시장" },
  "세종": { fullName: "세종특별자치시", type: "특별자치시", headTitle: "세종시장" },
  "강원": { fullName: "강원특별자치도", type: "특별자치도", headTitle: "강원도지사" },
  "충북": { fullName: "충청북도", type: "도", headTitle: "충북도지사" },
  "충남": { fullName: "충청남도", type: "도", headTitle: "충남도지사" },
  "전북": { fullName: "전라북도", type: "도", headTitle: "전북도지사" },
  "전남": { fullName: "전라남도", type: "도", headTitle: "전남도지사" },
  "경북": { fullName: "경상북도", type: "도", headTitle: "경북도지사" },
  "경남": { fullName: "경상남도", type: "도", headTitle: "경남도지사" },
  "제주": { fullName: "제주특별자치도", type: "특별자치도", headTitle: "제주도지사" },
};

function getSubRegionHeadTitle(subRegion: string): string {
  if (subRegion.endsWith("구")) return `${subRegion}청장`;
  if (subRegion.endsWith("군")) return `${subRegion}수`;
  if (subRegion.endsWith("시")) return `${subRegion}장`;
  return `${subRegion}장`;
}

function getMetroCouncilName(region: string, subRegion?: string): string {
  const meta = regionMeta[region];
  if (!meta) return `${region} 의원`;
  return subRegion ? `${meta.fullName}의원(${subRegion})` : `${meta.fullName}의원`;
}

function getLocalCouncilName(subRegion: string): string {
  return `${subRegion}의원`;
}

export function getPositionTabs(region: string, subRegion?: string): PositionTab[] {
  const meta = regionMeta[region];
  if (!meta) return [];

  const tabs: PositionTab[] = [
    { key: meta.headTitle, label: `${meta.headTitle} 후보`, level: "metro_head" },
  ];

  if (subRegion && subRegion !== "" && region !== "세종") {
    const headTitle = getSubRegionHeadTitle(subRegion);
    tabs.push({ key: headTitle, label: `${headTitle} 후보`, level: "local_head" });
  }

  const metroCouncil = getMetroCouncilName(region, subRegion);
  tabs.push({ key: metroCouncil, label: `${metroCouncil} 후보`, level: "metro_council" });

  if (subRegion && subRegion !== "" && region !== "세종") {
    const localCouncil = getLocalCouncilName(subRegion);
    tabs.push({ key: localCouncil, label: `${localCouncil} 후보`, level: "local_council" });
  }

  return tabs;
}

export function getRegionFullName(region: string): string {
  return regionMeta[region]?.fullName || region;
}

export const REGION_FULL_NAME_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(regionMeta).map(([k, v]) => [k, v.fullName]),
);
