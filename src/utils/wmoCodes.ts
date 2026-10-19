import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export interface WmoInfo {
  code: number;
  label: string;
  icon: LucideIcon;
  colorClass: string;
  isRain: boolean;
  isSnow: boolean;
  isThunder: boolean;
}

export function getWmoInfo(code: number, isDay = true): WmoInfo {
  switch (code) {
    case 0:
      return {
        code,
        label: 'Cielo sereno',
        icon: isDay ? Sun : Moon,
        colorClass: isDay ? 'text-amber-400' : 'text-indigo-300',
        isRain: false,
        isSnow: false,
        isThunder: false,
      };
    case 1:
      return {
        code,
        label: 'Prevalentemente sereno',
        icon: isDay ? CloudSun : CloudMoon,
        colorClass: isDay ? 'text-amber-300' : 'text-indigo-300',
        isRain: false,
        isSnow: false,
        isThunder: false,
      };
    case 2:
      return {
        code,
        label: 'Parzialmente nuvoloso',
        icon: isDay ? CloudSun : CloudMoon,
        colorClass: 'text-sky-300',
        isRain: false,
        isSnow: false,
        isThunder: false,
      };
    case 3:
      return {
        code,
        label: 'Coperto',
        icon: Cloud,
        colorClass: 'text-slate-400',
        isRain: false,
        isSnow: false,
        isThunder: false,
      };
    case 45:
      return {
        code,
        label: 'Nebbia',
        icon: CloudFog,
        colorClass: 'text-slate-400',
        isRain: false,
        isSnow: false,
        isThunder: false,
      };
    case 48:
      return {
        code,
        label: 'Nebbia con brina',
        icon: CloudFog,
        colorClass: 'text-slate-300',
        isRain: false,
        isSnow: false,
        isThunder: false,
      };
    case 51:
      return {
        code,
        label: 'Pioviggine leggera',
        icon: CloudDrizzle,
        colorClass: 'text-cyan-400',
        isRain: true,
        isSnow: false,
        isThunder: false,
      };
    case 53:
      return {
        code,
        label: 'Pioviggine moderata',
        icon: CloudDrizzle,
        colorClass: 'text-cyan-400',
        isRain: true,
        isSnow: false,
        isThunder: false,
      };
    case 55:
      return {
        code,
        label: 'Pioviggine fitta',
        icon: CloudDrizzle,
        colorClass: 'text-cyan-500',
        isRain: true,
        isSnow: false,
        isThunder: false,
      };
    case 56:
    case 57:
      return {
        code,
        label: 'Pioviggine congelantesi',
        icon: Sparkles,
        colorClass: 'text-teal-300',
        isRain: true,
        isSnow: false,
        isThunder: false,
      };
    case 61:
      return {
        code,
        label: 'Pioggia debole',
        icon: CloudRain,
        colorClass: 'text-blue-400',
        isRain: true,
        isSnow: false,
        isThunder: false,
      };
    case 63:
      return {
        code,
        label: 'Pioggia moderata',
        icon: CloudRain,
        colorClass: 'text-blue-500',
        isRain: true,
        isSnow: false,
        isThunder: false,
      };
    case 65:
      return {
        code,
        label: 'Pioggia forte',
        icon: CloudRain,
        colorClass: 'text-blue-600',
        isRain: true,
        isSnow: false,
        isThunder: false,
      };
    case 66:
    case 67:
      return {
        code,
        label: 'Pioggia congelantesi',
        icon: Sparkles,
        colorClass: 'text-teal-400',
        isRain: true,
        isSnow: false,
        isThunder: false,
      };
    case 71:
      return {
        code,
        label: 'Neve debole',
        icon: CloudSnow,
        colorClass: 'text-sky-200',
        isSnow: true,
        isRain: false,
        isThunder: false,
      };
    case 73:
      return {
        code,
        label: 'Neve moderata',
        icon: CloudSnow,
        colorClass: 'text-sky-100',
        isSnow: true,
        isRain: false,
        isThunder: false,
      };
    case 75:
      return {
        code,
        label: 'Neve forte',
        icon: CloudSnow,
        colorClass: 'text-white',
        isSnow: true,
        isRain: false,
        isThunder: false,
      };
    case 77:
      return {
        code,
        label: 'Granuli di neve',
        icon: Sparkles,
        colorClass: 'text-slate-200',
        isSnow: true,
        isRain: false,
        isThunder: false,
      };
    case 80:
      return {
        code,
        label: 'Rovesci deboli',
        icon: CloudRain,
        colorClass: 'text-blue-400',
        isRain: true,
        isSnow: false,
        isThunder: false,
      };
    case 81:
      return {
        code,
        label: 'Rovesci moderati',
        icon: CloudRain,
        colorClass: 'text-blue-500',
        isRain: true,
        isSnow: false,
        isThunder: false,
      };
    case 82:
      return {
        code,
        label: 'Rovesci violenti',
        icon: CloudRain,
        colorClass: 'text-indigo-400',
        isRain: true,
        isSnow: false,
        isThunder: false,
      };
    case 85:
      return {
        code,
        label: 'Rovesci di neve lievi',
        icon: CloudSnow,
        colorClass: 'text-sky-200',
        isSnow: true,
        isRain: false,
        isThunder: false,
      };
    case 86:
      return {
        code,
        label: 'Rovesci di neve pesanti',
        icon: CloudSnow,
        colorClass: 'text-white',
        isSnow: true,
        isRain: false,
        isThunder: false,
      };
    case 95:
      return {
        code,
        label: 'Temporale',
        icon: CloudLightning,
        colorClass: 'text-amber-400',
        isThunder: true,
        isRain: true,
        isSnow: false,
      };
    case 96:
    case 99:
      return {
        code,
        label: 'Temporale con grandine',
        icon: CloudLightning,
        colorClass: 'text-amber-500',
        isThunder: true,
        isRain: true,
        isSnow: false,
      };
    default:
      return {
        code,
        label: 'Variabile',
        icon: Cloud,
        colorClass: 'text-slate-300',
        isRain: false,
        isSnow: false,
        isThunder: false,
      };
  }
}
