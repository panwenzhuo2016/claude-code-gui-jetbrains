import { access } from 'fs/promises';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);

export interface TerminalInfo {
  id: string;
  label: string;
  isDefault: boolean;
}

interface TerminalCandidate {
  id: string;
  label: string;
  appName?: string;       // macOS: /Applications/<appName>.app
  paths?: string[];       // Windows: 알려진 실행 파일 경로
  binary?: string;        // Linux: which로 탐색할 바이너리 이름
  windowsCmd?: string;    // Windows: where 명령으로 탐색할 이름
}

const MAC_CANDIDATES: TerminalCandidate[] = [
  { id: 'terminal',  label: 'Terminal',  appName: 'Terminal' },
  { id: 'iterm2',    label: 'iTerm2',    appName: 'iTerm' },
  { id: 'warp',      label: 'Warp',      appName: 'Warp' },
  { id: 'alacritty', label: 'Alacritty', appName: 'Alacritty' },
  { id: 'kitty',     label: 'Kitty',     appName: 'kitty' },
  { id: 'hyper',     label: 'Hyper',     appName: 'Hyper' },
  { id: 'wezterm',   label: 'WezTerm',   appName: 'WezTerm' },
];

const WINDOWS_CANDIDATES: TerminalCandidate[] = [
  {
    id: 'windows-terminal',
    label: 'Windows Terminal',
    paths: [
      `${process.env['LOCALAPPDATA'] ?? ''}\\Microsoft\\WindowsApps\\wt.exe`,
      `${process.env['PROGRAMFILES'] ?? ''}\\WindowsApps\\Microsoft.WindowsTerminal_1.0.0.0_x64__8wekyb3d8bbwe\\wt.exe`,
    ],
    windowsCmd: 'wt',
  },
  {
    id: 'powershell',
    label: 'PowerShell',
    paths: [
      `${process.env['SYSTEMROOT'] ?? 'C:\\Windows'}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`,
      `${process.env['PROGRAMFILES'] ?? 'C:\\Program Files'}\\PowerShell\\7\\pwsh.exe`,
    ],
    windowsCmd: 'powershell',
  },
  {
    id: 'cmd',
    label: 'Command Prompt',
    paths: [
      `${process.env['SYSTEMROOT'] ?? 'C:\\Windows'}\\System32\\cmd.exe`,
    ],
    windowsCmd: 'cmd',
  },
  {
    id: 'git-bash',
    label: 'Git Bash',
    paths: [
      `${process.env['PROGRAMFILES'] ?? 'C:\\Program Files'}\\Git\\bin\\bash.exe`,
      `${process.env['PROGRAMFILES(X86)'] ?? 'C:\\Program Files (x86)'}\\Git\\bin\\bash.exe`,
    ],
    windowsCmd: 'bash',
  },
  {
    id: 'hyper',
    label: 'Hyper',
    paths: [
      `${process.env['LOCALAPPDATA'] ?? ''}\\hyper\\Hyper.exe`,
      `${process.env['PROGRAMFILES'] ?? ''}\\Hyper\\Hyper.exe`,
    ],
    windowsCmd: 'hyper',
  },
  {
    id: 'alacritty',
    label: 'Alacritty',
    paths: [
      `${process.env['LOCALAPPDATA'] ?? ''}\\Programs\\Alacritty\\alacritty.exe`,
      `${process.env['PROGRAMFILES'] ?? ''}\\Alacritty\\alacritty.exe`,
    ],
    windowsCmd: 'alacritty',
  },
  {
    id: 'wezterm',
    label: 'WezTerm',
    paths: [
      `${process.env['LOCALAPPDATA'] ?? ''}\\Programs\\WezTerm\\wezterm.exe`,
      `${process.env['PROGRAMFILES'] ?? ''}\\WezTerm\\wezterm.exe`,
    ],
    windowsCmd: 'wezterm',
  },
  {
    id: 'conhost',
    label: 'Windows Console Host',
    paths: [
      `${process.env['SYSTEMROOT'] ?? 'C:\\Windows'}\\System32\\conhost.exe`,
    ],
    windowsCmd: 'conhost',
  },
];

const LINUX_CANDIDATES: TerminalCandidate[] = [
  { id: 'gnome-terminal',  label: 'GNOME Terminal',   binary: 'gnome-terminal' },
  { id: 'konsole',         label: 'Konsole',           binary: 'konsole' },
  { id: 'xfce4-terminal',  label: 'XFCE Terminal',     binary: 'xfce4-terminal' },
  { id: 'alacritty',       label: 'Alacritty',         binary: 'alacritty' },
  { id: 'kitty',           label: 'Kitty',             binary: 'kitty' },
  { id: 'wezterm',         label: 'WezTerm',           binary: 'wezterm' },
  { id: 'hyper',           label: 'Hyper',             binary: 'hyper' },
  { id: 'xterm',           label: 'XTerm',             binary: 'xterm' },
  { id: 'tilix',           label: 'Tilix',             binary: 'tilix' },
];

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function detectMacOS(): Promise<TerminalInfo[]> {
  const MAC_DEFAULT_ID = 'terminal';
  const found: TerminalInfo[] = [];

  for (const candidate of MAC_CANDIDATES) {
    if (!candidate.appName) continue;
    const appPath = `/Applications/${candidate.appName}.app`;
    const exists = await pathExists(appPath);
    if (exists) {
      found.push({
        id: candidate.id,
        label: candidate.label,
        isDefault: candidate.id === MAC_DEFAULT_ID,
      });
    }
  }

  // macOS 기본 터미널(Terminal.app)이 감지되지 않더라도 항상 첫 번째에 포함
  const hasDefault = found.some((t) => t.id === MAC_DEFAULT_ID);
  if (!hasDefault) {
    const defaultCandidate = MAC_CANDIDATES.find((c) => c.id === MAC_DEFAULT_ID)!;
    found.unshift({ id: defaultCandidate.id, label: defaultCandidate.label, isDefault: true });
  } else {
    // 기본 터미널을 항상 첫 번째로 이동
    const idx = found.findIndex((t) => t.id === MAC_DEFAULT_ID);
    if (idx > 0) {
      const spliced = found.splice(idx, 1);
      if (spliced[0]) found.unshift(spliced[0]);
    }
  }

  return found;
}

async function detectWindows(): Promise<TerminalInfo[]> {
  const found: TerminalInfo[] = [];

  for (const candidate of WINDOWS_CANDIDATES) {
    let exists = false;

    // 알려진 경로로 먼저 확인
    if (candidate.paths && candidate.paths.length > 0) {
      for (const p of candidate.paths) {
        if (await pathExists(p)) {
          exists = true;
          break;
        }
      }
    }

    // 경로 확인 실패 시 where 명령으로 재시도
    if (!exists && candidate.windowsCmd) {
      try {
        await exec(`where ${candidate.windowsCmd}`);
        exists = true;
      } catch {
        exists = false;
      }
    }

    if (exists) {
      found.push({
        id: candidate.id,
        label: candidate.label,
        isDefault: false, // 나중에 결정
      });
    }
  }

  // 기본 터미널 결정: Windows Terminal 우선, 없으면 Command Prompt
  const preferredDefaultIds = ['windows-terminal', 'cmd'];
  let defaultSet = false;

  for (const preferredId of preferredDefaultIds) {
    const terminal = found.find((t) => t.id === preferredId);
    if (terminal) {
      terminal.isDefault = true;
      // 첫 번째로 이동
      const idx = found.indexOf(terminal);
      if (idx > 0) {
        found.splice(idx, 1);
        found.unshift(terminal);
      }
      defaultSet = true;
      break;
    }
  }

  // 감지된 항목이 없는 경우 Command Prompt를 기본값으로 추가
  if (!defaultSet) {
    const cmdCandidate = WINDOWS_CANDIDATES.find((c) => c.id === 'cmd')!;
    found.unshift({ id: cmdCandidate.id, label: cmdCandidate.label, isDefault: true });
  }

  return found;
}

async function detectLinux(): Promise<TerminalInfo[]> {
  const found: TerminalInfo[] = [];

  for (const candidate of LINUX_CANDIDATES) {
    if (!candidate.binary) continue;
    try {
      await exec(`which ${candidate.binary}`);
      found.push({
        id: candidate.id,
        label: candidate.label,
        isDefault: false, // 나중에 결정
      });
    } catch {
      // 바이너리 없음
    }
  }

  // 감지된 첫 번째 터미널을 기본값으로 설정
  if (found.length > 0) {
    found[0].isDefault = true;
  }

  return found;
}

export async function detectInstalledTerminals(): Promise<TerminalInfo[]> {
  const platform = process.platform;

  if (platform === 'darwin') {
    return detectMacOS();
  }

  if (platform === 'win32') {
    return detectWindows();
  }

  // linux, freebsd 등 Unix 계열
  return detectLinux();
}
