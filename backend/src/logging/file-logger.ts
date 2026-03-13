import { createWriteStream, WriteStream } from 'fs';
import { mkdir, stat, readdir, unlink, rename } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const DEFAULT_LOG_DIR = join(homedir(), '.claude-code-gui', 'logs');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_TOTAL_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

export class FileLogger {
  private readonly logDir: string;
  private stream: WriteStream | null = null;
  private currentSize: number = 0;
  private isRotating: boolean = false;
  private rotationBuffer: string[] = [];

  constructor(logDir: string = DEFAULT_LOG_DIR) {
    this.logDir = logDir;
  }

  async init(): Promise<void> {
    await mkdir(this.logDir, { recursive: true });

    const logFilePath = join(this.logDir, 'server.log');
    this.stream = createWriteStream(logFilePath, { flags: 'a' });

    try {
      const fileStat = await stat(logFilePath);
      this.currentSize = fileStat.size;
    } catch {
      // 파일이 없으면 크기를 0으로 초기화
      this.currentSize = 0;
    }
  }

  write(line: string): void {
    if (this.isRotating) {
      this.rotationBuffer.push(line);
      return;
    }

    if (!this.stream) {
      return;
    }

    this.stream.write(line);
    this.currentSize += Buffer.byteLength(line, 'utf8');
    this.checkRotation();
  }

  private checkRotation(): void {
    if (this.currentSize > MAX_FILE_SIZE) {
      this.rotate().catch((err) => {
        console.error('[FileLogger] 로테이션 실패:', err);
      });
    }
  }

  private async rotate(): Promise<void> {
    if (!this.stream) {
      return;
    }

    this.isRotating = true;

    // 현재 스트림 종료 대기 (end() 호출 전에 finish 리스너 등록해야 이벤트를 놓치지 않음)
    const oldStream = this.stream;
    this.stream = null;
    await new Promise<void>((resolve) => {
      oldStream.on('finish', resolve);
      oldStream.end();
    });

    // server.log → server-{timestamp}.log 이름 변경
    const timestamp = new Date().toISOString().replace(/[:.]/g, '');
    const oldLogPath = join(this.logDir, 'server.log');
    const archivedLogPath = join(this.logDir, `server-${timestamp}.log`);

    try {
      await rename(oldLogPath, archivedLogPath);
    } catch (err) {
      console.error('[FileLogger] 로그 파일 rename 실패:', err);
    }

    // 새 server.log 스트림 열기
    const newLogPath = join(this.logDir, 'server.log');
    this.stream = createWriteStream(newLogPath, { flags: 'a' });
    this.currentSize = 0;

    // 버퍼에 쌓인 내용 새 스트림에 flush
    const buffered = this.rotationBuffer.slice();
    this.rotationBuffer = [];
    this.isRotating = false;

    for (const line of buffered) {
      this.stream.write(line);
      this.currentSize += Buffer.byteLength(line, 'utf8');
    }

    // 용량 제한 적용
    try {
      await this.enforceCapLimit();
    } catch (err) {
      console.error('[FileLogger] 용량 제한 적용 실패:', err);
    }
  }

  private async enforceCapLimit(): Promise<void> {
    const entries = await readdir(this.logDir);
    const archiveNames = entries.filter((name) => /^server-.+\.log$/.test(name));

    // 각 아카이브 파일의 크기와 이름 수집
    const archives: Array<{ name: string; size: number }> = [];
    for (const name of archiveNames) {
      try {
        const fileStat = await stat(join(this.logDir, name));
        archives.push({ name, size: fileStat.size });
      } catch {
        // stat 실패 시 건너뜀
      }
    }

    // 이름 기준 오름차순 정렬 (타임스탬프가 이름에 포함돼 있으므로 오래된 것이 앞)
    archives.sort((a, b) => a.name.localeCompare(b.name));

    let totalSize = archives.reduce((sum, f) => sum + f.size, 0);

    for (const archive of archives) {
      if (totalSize <= MAX_TOTAL_SIZE) {
        break;
      }
      try {
        await unlink(join(this.logDir, archive.name));
        totalSize -= archive.size;
      } catch (err) {
        console.error(`[FileLogger] 아카이브 삭제 실패 (${archive.name}):`, err);
      }
    }
  }

  close(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.stream) {
        resolve();
        return;
      }
      this.stream.on('finish', resolve);
      this.stream.end();
    });
  }
}
