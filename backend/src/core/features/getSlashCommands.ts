import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

export interface SlashCommandInfo {
  name: string;
  source: 'user' | 'project' | 'plugin' | 'skill';
}

export async function getSlashCommandsList(workingDir?: string | null): Promise<SlashCommandInfo[]> {
  const commands: SlashCommandInfo[] = [];
  const dirs: [string, 'user' | 'project'][] = [
    [join(homedir(), '.claude', 'commands'), 'user'],
  ];
  if (workingDir) {
    dirs.push([join(workingDir, '.claude', 'commands'), 'project']);
  }

  for (const [dir, source] of dirs) {
    try {
      const files = await readdir(dir);
      console.error('[node-backend]', `Scanned ${source} commands dir: ${dir}, found ${files.filter(f => f.endsWith('.md')).length} commands`);
      for (const file of files) {
        if (file.endsWith('.md')) {
          commands.push({ name: file.slice(0, -3), source });
        }
      }
    } catch {
      console.error('[node-backend]', `${source} commands dir not found: ${dir}`);
      // directory doesn't exist — skip
    }
  }

  // Scan installed plugins' commands
  const installedPluginsPath = join(homedir(), '.claude', 'plugins', 'installed_plugins.json');
  try {
    const raw = await readFile(installedPluginsPath, 'utf-8');
    const parsed = JSON.parse(raw) as {
      version: number;
      plugins: Record<string, Array<{ scope: string; installPath: string; version: string }>>;
    };
    for (const [key, entries] of Object.entries(parsed.plugins ?? {})) {
      const pluginName = key.split('@')[0];
      for (const entry of entries) {
        const commandsDir = join(entry.installPath, 'commands');
        try {
          const files = await readdir(commandsDir);
          const mdFiles = files.filter(f => f.endsWith('.md'));
          console.error('[node-backend]', `Scanned plugin commands dir: ${commandsDir}, found ${mdFiles.length} commands`);
          for (const file of mdFiles) {
            commands.push({ name: `${pluginName}:${file.slice(0, -3)}`, source: 'plugin' });
          }
        } catch {
          console.error('[node-backend]', `plugin commands dir not found: ${commandsDir}`);
          // directory doesn't exist — skip
        }
      }
    }
  } catch {
    console.error('[node-backend]', `installed_plugins.json not found or invalid: ${installedPluginsPath}`);
    // file doesn't exist or is invalid — skip
  }

  // Scan project skills
  if (workingDir) {
    const skillsDir = join(workingDir, '.claude', 'skills');
    try {
      const files = await readdir(skillsDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      console.error('[node-backend]', `Scanned project skills dir: ${skillsDir}, found ${mdFiles.length} skills`);
      for (const file of mdFiles) {
        commands.push({ name: file.slice(0, -3), source: 'skill' });
      }
    } catch {
      console.error('[node-backend]', `project skills dir not found: ${skillsDir}`);
      // directory doesn't exist — skip
    }
  }

  return commands;
}
