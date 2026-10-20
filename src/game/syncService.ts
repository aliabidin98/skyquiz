import { StudentSession, Question, StudentAnswerRecord } from '../types/game';

type StudentsListener = (students: StudentSession[]) => void;
type QuestionsListener = (questions: Question[]) => void;
type ResetListener = () => void;
type StudentResetListener = (studentId: string) => void;

class RealtimeSyncService {
  private socket: WebSocket | null = null;
  private studentsListeners: Set<StudentsListener> = new Set();
  private questionsListeners: Set<QuestionsListener> = new Set();
  private resetListeners: Set<ResetListener> = new Set();
  private studentResetListeners: Set<StudentResetListener> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private currentStudentId: string | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.currentStudentId = typeof localStorage !== 'undefined' ? localStorage.getItem('skyquiz_student_id') : null;
    this.connectWebSocket();
    this.startPollingFallback();
  }

  private getWsUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}`;
  }

  private connectWebSocket() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const wsUrl = this.getWsUrl();
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        // Connected
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'init') {
            if (data.students) {
              this.notifyStudents(data.students);
            }
            if (data.questions) {
              this.notifyQuestions(data.questions);
            }
          } else if (data.type === 'student:updated') {
            this.fetchLatestSession();
          } else if (data.type === 'student:reset') {
            if (data.studentId) {
              this.notifyStudentReset(data.studentId);
            }
            this.fetchLatestSession();
          } else if (data.type === 'session:reset') {
            this.notifyReset();
            this.notifyStudents([]);
          } else if (data.type === 'questions:updated') {
            if (data.questions) {
              this.notifyQuestions(data.questions);
            }
          } else if (data.type === 'students:list') {
            if (data.students) {
              this.notifyStudents(data.students);
            }
          }
        } catch (err) {
          console.error('WS parse error', err);
        }
      };

      ws.onclose = () => {
        this.socket = null;
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connectWebSocket();
          }, 3000);
        }
      };

      ws.onerror = () => {
        // Fallback polling will handle data sync
      };

      this.socket = ws;
    } catch {
      // WS fallback to polling
    }
  }

  // Backup polling every 3 seconds to guarantee 100% sync reliability
  private startPollingFallback() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      this.fetchLatestSession();
    }, 3000);
  }

  public async fetchLatestSession(): Promise<{ questions: Question[]; students: StudentSession[] } | null> {
    try {
      const res = await fetch('/api/session');
      if (!res.ok) return null;
      const data = await res.json();
      if (data.students) {
        this.notifyStudents(data.students);
      }
      if (data.questions) {
        this.notifyQuestions(data.questions);
      }
      return data;
    } catch {
      return null;
    }
  }

  public onStudentsUpdate(listener: StudentsListener) {
    this.studentsListeners.add(listener);
    return () => {
      this.studentsListeners.delete(listener);
    };
  }

  public onQuestionsUpdate(listener: QuestionsListener) {
    this.questionsListeners.add(listener);
    return () => {
      this.questionsListeners.delete(listener);
    };
  }

  public onSessionReset(listener: ResetListener) {
    this.resetListeners.add(listener);
    return () => {
      this.resetListeners.delete(listener);
    };
  }

  public onStudentReset(listener: StudentResetListener) {
    this.studentResetListeners.add(listener);
    return () => {
      this.studentResetListeners.delete(listener);
    };
  }

  private notifyStudents(students: StudentSession[]) {
    this.studentsListeners.forEach((l) => l(students));
  }

  private notifyQuestions(questions: Question[]) {
    this.questionsListeners.forEach((l) => l(questions));
  }

  private notifyReset() {
    this.resetListeners.forEach((l) => l());
  }

  private notifyStudentReset(studentId: string) {
    this.studentResetListeners.forEach((l) => l(studentId));
  }

  // Student Actions
  public async joinAsStudent(
    name: string,
    studentClass: string,
    aircraftType: string
  ): Promise<{ student: StudentSession; questions: Question[]; isCompleted?: boolean } | null> {
    try {
      const storedId = localStorage.getItem('skyquiz_student_id');
      const res = await fetch('/api/student/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: storedId,
          name,
          studentClass,
          aircraftType,
        }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      if (data.student?.id) {
        this.currentStudentId = data.student.id;
        localStorage.setItem('skyquiz_student_id', data.student.id);
      }
      return data;
    } catch {
      return null;
    }
  }

  public async submitAnswer(
    studentId: string,
    record: Omit<StudentAnswerRecord, 'answeredAt'>
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/student/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          ...record,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async updateProgress(
    studentId: string,
    questionIndex: number,
    score: number,
    combo: number,
    status?: 'READY' | 'PLAYING' | 'COMPLETED'
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/student/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          questionIndex,
          score,
          combo,
          status,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Teacher Actions
  public async resetStudent(accessCode: string, studentId: string): Promise<boolean> {
    try {
      const res = await fetch('/api/teacher/reset-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode, studentId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async resetSession(accessCode: string): Promise<boolean> {
    try {
      const res = await fetch('/api/teacher/reset-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async updateQuestions(accessCode: string, questions: Question[]): Promise<boolean> {
    try {
      const res = await fetch('/api/teacher/update-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode, questions }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public getCurrentStudentId(): string | null {
    return this.currentStudentId || (typeof localStorage !== 'undefined' ? localStorage.getItem('skyquiz_student_id') : null);
  }
}

export const syncService = new RealtimeSyncService();
